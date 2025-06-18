import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { DSOrder } from "./DSOrder";

@Entity("DSOrderDetails")
export class DSOrderDetail {
    @PrimaryGeneratedColumn()
    Id!: number;

    @Column({ type: "varchar", length: 50 })
    OrderNumber!: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    SKU!: string;

    @Column({ type: "varchar", length: 500 })
    Item!: string;

    @Column({ type: "int" })
    Quantity!: number;

    @Column({ type: "decimal", precision: 9, scale: 4 })
    Price!: number; // WSP (Wholesale Price)

    @Column({ type: "decimal", precision: 9, scale: 4 })
    SuggestedPrice!: number; // SRP (Suggested Retail Price)

    @Column({ type: "decimal", precision: 9, scale: 4 })
    Subtotal!: number;

    @CreateDateColumn({ type: "datetime2" })
    CreatedAt!: Date;

    @UpdateDateColumn({ type: "datetime2" })
    UpdatedAt!: Date;

    @ManyToOne(() => DSOrder, order => order.orderDetails)
    @JoinColumn({ name: "OrderNumber" })
    order!: DSOrder;
}
