import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('login_history')
export class LoginHistoryEntiry {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  loginId!: string;

  @Column()
  isSuccess!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  createdBy!: number;
}