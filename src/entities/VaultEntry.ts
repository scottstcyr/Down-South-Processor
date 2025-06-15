import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity('Vault')
export class VaultEntry {
    @PrimaryColumn({ length: 255 })
    key!: string;

    @Column({ length: "max" })
    value?: string;
}
