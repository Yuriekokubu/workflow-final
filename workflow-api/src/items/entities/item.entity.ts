// item.entiry.ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum ItemStatus {
  PENDING = 'PENDING', APPROVED = 'APPROVED', REJECTED = 'REJECTED'
}

@Entity()
export class Item {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  amount: number;

  @Column()
  quantity: number;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    nullable: false,
    default: ItemStatus.PENDING
  })
  status: ItemStatus
}
