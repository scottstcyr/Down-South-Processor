export interface ShopifyAmount {
  amount: string;
}

export interface ShopifyPresentmentMoney {
  amount: string;
}

export interface ShopifyNetPaymentSet {
  presentmentMoney: ShopifyPresentmentMoney;
}

export interface ShopifyPaymentTerms {
  paymentTermsName: string;
  dueInDays: number;
}

export interface ShopifyCompany {
  name: string;
}

export interface ShopifyCompanyContactProfile {
  company: ShopifyCompany;
}

export interface ShopifyCustomer {
  displayName: string;
  companyContactProfiles: ShopifyCompanyContactProfile[];
}

export interface ShopifyTenderTransactionCreditCardDetails {
  creditCardCompany: string;
  creditCardNumber: string;
}

export interface ShopifyTransactionDetails {
  creditCardCompany?: string;
  creditCardNumber?: string;
}

export interface ShopifyOrder {
  id: string;
  name: string;
  displayFinancialStatus: string;
  customer?: ShopifyCustomer;
  netPaymentSet: ShopifyNetPaymentSet;
  paymentGatewayNames: string[];
  paymentTerms?: ShopifyPaymentTerms;
  poNumber?: string;
}

export interface ShopifyTenderTransaction {
  id: string;
  processedAt: string;
  paymentMethod: string;
  remoteReference?: string;
  amount: ShopifyAmount;
  transactionDetails?: ShopifyTransactionDetails;
  order: ShopifyOrder;
}

export interface ShopifyTenderTransactionEdge {
  cursor: string;
  node: ShopifyTenderTransaction;
}

export interface ShopifyPageInfo {
  hasNextPage: boolean;
  endCursor: string;
}

export interface ShopifyTenderTransactionsResponse {
  tenderTransactions: {
    edges: ShopifyTenderTransactionEdge[];
    pageInfo: ShopifyPageInfo;
  };
}

export interface ShopifyGraphQLResponse {
  data: ShopifyTenderTransactionsResponse;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

export enum PaymentMethod {
  SHOPIFY_PAY = 'shopify_pay',
  PAYPAL = 'paypal',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CHECK = 'check',
  OTHER = 'other'
}

export enum FinancialStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  VOIDED = 'voided'
}
