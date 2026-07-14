import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserInfoEntity } from "../../../auth/adapters/outbound/orm/user-info-orm.entity";

@Entity('todo')
export class TodoEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number; // 👈 이 속성을 추가합니다!

  @ManyToOne(() => UserInfoEntity, (userInfo) => userInfo.todos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // DB 테이블 상의 외래키 컬럼 이름 지정
  user!: UserInfoEntity;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  isComplete!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}