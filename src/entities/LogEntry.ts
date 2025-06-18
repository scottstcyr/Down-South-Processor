import { ILogEntry } from '../utils/logger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ELogEntry')
export class LogEntry implements ILogEntry {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 10 })
  level!: string;

  @Column({ type: 'text' })
  message!: string;

  @CreateDateColumn()
  timestamp!: Date;
}
