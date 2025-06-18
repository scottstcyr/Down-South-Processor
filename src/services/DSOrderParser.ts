import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import { logger } from '../utils/logger';
import { DSOrder } from '../entities/DSOrder';
import { DSOrderDetail } from '../entities/DSOrderDetail';

export interface ParsedOrderData {
    order: DSOrder;
    orderDetails: DSOrderDetail[];
}

export class DSOrderParser {
    /**
     * Parse HTML file and extract order information
     */
    public static async parseOrderFile(filePath: string): Promise<ParsedOrderData> {
        try {
            const htmlContent = fs.readFileSync(filePath, 'utf-8');
            const dom = new JSDOM(htmlContent);
            const document = dom.window.document;

            // Extract order header information
            const order = this.extractOrderHeader(document);
            
            // Extract order line items
            const orderDetails = this.extractOrderDetails(document, order.OrderNumber);

            // Calculate totals
            order.NumberOfLineItems = orderDetails.length;
            order.ItemsCount = orderDetails.reduce((sum, detail) => sum + detail.Quantity, 0);
            order.SubtotalPrice = orderDetails.reduce((sum, detail) => sum + detail.Subtotal, 0);

            return { order, orderDetails };
        } catch (error) {
            logger.error(`Error parsing order file ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Extract order header information from HTML document
     */
    private static extractOrderHeader(document: Document): DSOrder {
        const order = new DSOrder();

        try {
            // Extract order number from title or specific elements
            const orderNumberElement = this.findElementByText(document, 'Order #') || 
                                     this.findElementByText(document, '#');
            if (orderNumberElement) {
                const orderNumberText = orderNumberElement.textContent || '';
                const orderNumberMatch = orderNumberText.match(/[A-Z0-9]{10,}/);
                order.OrderNumber = orderNumberMatch ? orderNumberMatch[0] : '';
            }

            // Extract dates
            const orderDateElement = this.findElementByText(document, 'Order Date');
            if (orderDateElement) {
                const dateText = this.getNextSiblingText(orderDateElement);
                order.OrderDate = this.parseDate(dateText);
            }

            const shipDateElement = this.findElementByText(document, 'Ship Date');
            if (shipDateElement) {
                const dateText = this.getNextSiblingText(shipDateElement);
                order.ShipByDate = this.parseDate(dateText);
            }

            // Extract "From" company
            const fromElement = this.findElementByText(document, 'From');
            if (fromElement) {
                const fromText = this.getNextSiblingText(fromElement);
                order.FromCompany = fromText || 'Down South Designer Customs';
            } else {
                order.FromCompany = 'Down South Designer Customs';
            }

            // Extract "Ship To" information
            const shipToElement = this.findElementByText(document, 'Ship To');
            if (shipToElement) {
                const shipToSection = shipToElement.closest('div') || shipToElement.parentElement;
                if (shipToSection) {
                    const shipToLines = this.extractTextLines(shipToSection);
                    this.parseShipToAddress(shipToLines, order);
                }
            }

            return order;
        } catch (error) {
            logger.error('Error extracting order header:', error);
            throw error;
        }
    }

    /**
     * Extract order details/line items from HTML document
     */
    private static extractOrderDetails(document: Document, orderNumber: string): DSOrderDetail[] {
        const orderDetails: DSOrderDetail[] = [];

        try {
            // Find the items table
            const tables = document.querySelectorAll('table');
            let itemsTable: Element | null = null;

            // Look for table with SKU, Item, Qty headers
            for (const table of tables) {
                const headerText = table.textContent || '';
                if (headerText.includes('SKU') && headerText.includes('Item') && headerText.includes('Qty')) {
                    itemsTable = table;
                    break;
                }
            }

            if (!itemsTable) {
                throw new Error('Could not find items table in HTML');
            }

            // Extract table rows (skip header and total rows)
            const rows = itemsTable.querySelectorAll('tr');
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (!row) continue;
                
                const cellsText = row.textContent || '';
                
                // Skip header rows and total rows
                if (cellsText.includes('SKU') || 
                    cellsText.includes('Item Subtotals') || 
                    cellsText.includes('Subtotal') ||
                    !cellsText.trim()) {
                    continue;
                }

                const cells = row.querySelectorAll('td, th');
                if (cells.length >= 5) {
                    const detail = this.parseOrderDetailRow(cells, orderNumber);
                    if (detail) {
                        orderDetails.push(detail);
                    }
                }
            }

            return orderDetails;
        } catch (error) {
            logger.error('Error extracting order details:', error);
            throw error;
        }
    }

    /**
     * Parse individual order detail row
     */
    private static parseOrderDetailRow(cells: NodeListOf<Element>, orderNumber: string): DSOrderDetail | null {
        try {
            const detail = new DSOrderDetail();
            detail.OrderNumber = orderNumber;

            // Extract SKU (first column, may be empty)
            detail.SKU = this.cleanText(cells[0]?.textContent || '');

            // Extract Item description (second column)
            detail.Item = this.cleanText(cells[1]?.textContent || '');

            // Extract Quantity (third column)
            const qtyText = this.cleanText(cells[2]?.textContent || '');
            detail.Quantity = parseInt(qtyText) || 0;

            // Extract WSP (fourth column)
            const wspText = this.cleanText(cells[3]?.textContent || '');
            detail.Price = this.parsePrice(wspText);

            // Extract SRP (from WSP column description or fifth column if separate)
            const srpMatch = wspText.match(/SRP \$?([\d,]+\.?\d*)/);
            if (srpMatch && srpMatch[1]) {
                detail.SuggestedPrice = parseFloat(srpMatch[1].replace(/[,$]/g, ''));
            } else if (cells.length > 5 && cells[4]) {
                detail.SuggestedPrice = this.parsePrice(cells[4]?.textContent || '');
            } else {
                detail.SuggestedPrice = detail.Price * 2; // Default assumption
            }

            // Extract Subtotal (last column)
            const lastCell = cells[cells.length - 1];
            const subtotalText = this.cleanText(lastCell?.textContent || '');
            detail.Subtotal = this.parsePrice(subtotalText);

            // Validate required fields
            if (!detail.Item || detail.Quantity <= 0 || detail.Price <= 0) {
                return null;
            }

            return detail;
        } catch (error) {
            logger.error('Error parsing order detail row:', error);
            return null;
        }
    }

    /**
     * Parse ship-to address information
     */
    private static parseShipToAddress(lines: string[], order: DSOrder): void {
        const cleanLines = lines.filter(line => line.trim()).map(line => line.trim());
        
        if (cleanLines.length >= 3) {
            // Company name (first non-empty line after "Ship To")
            order.ShipToCompany = cleanLines[0] || '';
            
            // Contact name (second line)
            order.ShipToName = cleanLines[1] || '';
            
            // Address (third line)
            order.ShipToAddress = cleanLines[2] || '';
            
            // City, State, ZIP (fourth line)
            if (cleanLines[3]) {
                const addressMatch = cleanLines[3].match(/^(.*?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/);
                if (addressMatch) {
                    order.ShipToCity = addressMatch[1] || '';
                    order.ShipToState = addressMatch[2] || '';
                    order.ShipToZip = addressMatch[3] || '';
                }
            }
            
            // Country (fifth line)
            order.ShipToCountry = cleanLines[4] || 'United States of America';
            
            // Phone (sixth line)
            if (cleanLines[5] && cleanLines[5].includes('Tel:')) {
                order.ShipToPhone = cleanLines[5].replace('Tel:', '').trim();
            }
        }
    }

    /**
     * Helper methods
     */
    private static findElementByText(document: Document, text: string): Element | null {
        const walker = document.createTreeWalker(
            document.body,
            4 // NodeFilter.SHOW_TEXT
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.textContent && node.textContent.includes(text)) {
                return node.parentElement;
            }
        }
        return null;
    }

    private static getNextSiblingText(element: Element): string {
        let nextElement = element.nextElementSibling;
        while (nextElement) {
            const text = nextElement.textContent?.trim();
            if (text) {
                return text;
            }
            nextElement = nextElement.nextElementSibling;
        }
        return '';
    }

    private static extractTextLines(element: Element): string[] {
        const text = element.textContent || '';
        return text.split('\n').map(line => line.trim()).filter(line => line);
    }

    private static parseDate(dateStr: string): Date {
        // Handle formats like "Jun 4, 2025"
        const cleaned = dateStr.replace(/[^\w\s,]/g, '').trim();
        const date = new Date(cleaned);
        return isNaN(date.getTime()) ? new Date() : date;
    }

    private static parsePrice(priceStr: string): number {
        const cleaned = priceStr.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    }

    private static cleanText(text: string): string {
        return text.replace(/\s+/g, ' ').trim();
    }
}
