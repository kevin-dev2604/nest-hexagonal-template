import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TodoEntity } from "../../../../todo/adapters/outbound/todo-orm.entity";

@Entity('user_info')
export class UserInfoEntity {
  @PrimaryGeneratedColumn()
  userId!: number;

  @Column({ unique: true })
  loginId!: string;

  @Column()
  loginPw!: string;

  @Column()
  username!: string;

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  picture?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => TodoEntity, (todo) => todo.user)
  todos!: TodoEntity[];
}