import { DataSource } from "typeorm";
import { TodoRepositoryPort } from "../../ports/outbound/todo-repository.port";
import { Injectable } from "@nestjs/common";
import { Todo } from "../../domain/todo.model";
import { TodoEntity } from "./todo-orm.entity";
import { UserInfoEntity } from "../../../auth/adapters/outbound/orm/user-info-orm.entity";

@Injectable()
export class TodoRepositoryAdapter implements TodoRepositoryPort {
  constructor(
    private readonly dataSource: DataSource
  ) { }

  async createTodo(todo: Todo): Promise<number> {
    const result = await this.dataSource.transaction<number>(async (manager) => {
      const todoEntity = manager.create(TodoEntity, {
        userId: todo.userId,
        title: todo.getTitle,
        description: todo.getDescription,
        isComplete: todo.getIsComplete
      });

      await manager.save(todoEntity);

      return todoEntity.id;
    });

    return result;
  }

  async getAllTodo(userId: number): Promise<Todo[]> {
    const result = await this.dataSource.transaction<Todo[]>(async (manager) => {
      const entityList = await manager.findBy(TodoEntity, { userId });

      return entityList.map((entity) => new Todo({
        id: entity.id,
        userId,
        title: entity.title,
        description: entity.description,
        isComplete: entity.isComplete,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt
      }))
    });

    return result;
  }

  async getTodo(id: number): Promise<Todo | null> {
    const result = await this.dataSource.transaction<Todo | null>(async (manager) => {
      const entity = await manager.findOneBy(TodoEntity, { id });

      if (!entity) {
        return null;

      } else {
        return new Todo({
          id: entity.id,
          userId: entity.userId,
          title: entity.title,
          description: entity.description,
          isComplete: entity.isComplete,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt
        });
      }

    });

    return result;
  }

  async saveTodo(todo: Todo): Promise<void> {
    await this.dataSource.transaction<void>(async (manager) => {
      const todoEntity = manager.create(TodoEntity, {
        id: todo.id,
        userId: todo.userId,
        title: todo.getTitle,
        description: todo.getDescription,
        isComplete: todo.getIsComplete
      });

      await manager.save(todoEntity);
    });
  }

  async deleteTodo(id: number): Promise<void> {
    await this.dataSource.transaction<void>(async (manager) => {
      const todoEntity = manager.findOneBy(TodoEntity, { id });

      await manager.delete(TodoEntity, todoEntity);
    });
  }

}