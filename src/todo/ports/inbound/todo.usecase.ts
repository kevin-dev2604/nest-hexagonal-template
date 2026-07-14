import { CreateTodoResultDto } from "../../adapters/inbound/dto/create-todo-result.dto";
import { CreateTodoDto } from "../../adapters/inbound/dto/create-todo.dto";
import { ModifyTodoDto } from "../../adapters/inbound/dto/modify-todo.dto";
import { Todo } from "../../domain/todo.model";

export abstract class TodoUseCase {
  abstract createTodo(userId: number, createTodoDto: CreateTodoDto): Promise<CreateTodoResultDto>;
  abstract showAllTodos(userId: number): Promise<Todo[]>;
  abstract getTodo(userId: number, id: number): Promise<Todo>;
  abstract modifyTodo(userId: number, modifyTodoDto: ModifyTodoDto): Promise<void>;
  abstract checkTodo(userId: number, id: number): Promise<void>;
  abstract deleteTodo(userId: number, id: number): Promise<void>;
}