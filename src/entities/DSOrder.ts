import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { DSOrderDetail } from "./DSOrderDetail";

@Entity("DSOrders")
export class DSOrder {
    @PrimaryColumn({ type: "varchar", length: 50 })
    OrderNumber!: string;

    @Column({ type: "datetime2" })
    OrderDate!: Date;

    @Column({ type: "datetime2" })
    ShipByDate!: Date;

    @Column({ type: "varchar", length: 100 })
    FromCompany!: string;

    @Column({ type: "varchar", length: 100 })
    ShipToCompany!: string;

    @Column({ type: "varchar", length: 100 })
    ShipToName!: string;

    @Column({ type: "varchar", length: 200 })
    ShipToAddress!: string;

    @Column({ type: "varchar", length: 50 })
    ShipToCity!: string;

    @Column({ type: "varchar", length: 10 })
    ShipToState!: string;

    @Column({ type: "varchar", length: 20 })
    ShipToZip!: string;

    @Column({ type: "varchar", length: 50 })
    ShipToCountry!: string;

    @Column({ type: "varchar", length: 20 })
    ShipToPhone!: string;

    @Column({ type: "int" })
    NumberOfLineItems!: number;

    @Column({ type: "int" })
    ItemsCount!: number;

    @Column({ type: "decimal", precision: 9, scale: 4 })
    SubtotalPrice!: number;

    @CreateDateColumn({ type: "datetime2" })
    CreatedAt!: Date;

    @UpdateDateColumn({ type: "datetime2" })
    UpdatedAt!: Date;

    @OneToMany(() => DSOrderDetail, orderDetail => orderDetail.order, { cascade: true })
    orderDetails!: DSOrderDetail[];
}
