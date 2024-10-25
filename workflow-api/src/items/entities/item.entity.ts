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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0.0000,
    nullable: false
  })
  amount: number;

  @Column()
  quantity: number;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    nullable: false,
    default: ItemStatus.PENDING
  })
  status: ItemStatus;
}
