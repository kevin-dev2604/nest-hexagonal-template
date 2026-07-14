import { Todo } from "../../domain/todo.model";

export abstract class TodoRepositoryPort {
  abstract createTodo(todo: Todo): Promise<number>;
  abstract getAllTodo(userId: number): Promise<Todo[]>;
  abstract getTodo(id: number): Promise<Todo | null>;
  abstract saveTodo(todo: Todo): Promise<void>;
  abstract deleteTodo(id: number): Promise<void>;
}