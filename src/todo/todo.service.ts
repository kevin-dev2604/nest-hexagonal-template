import { ForbiddenException, Injectable, NotFoundException, PreconditionFailedException, UnauthorizedException } from "@nestjs/common";
import { TodoUseCase } from "./ports/inbound/todo.usecase";
import { TodoRepositoryPort } from "./ports/outbound/todo-repository.port";
import { CreateTodoDto } from "./adapters/inbound/dto/create-todo.dto";
import { Todo } from "./domain/todo.model";
import { ModifyTodoDto } from "./adapters/inbound/dto/modify-todo.dto";
import { UserInfoRepositoryPort } from "../auth/ports/outbound/user-info-repository.port";
import { CreateTodoResultDto } from "./adapters/inbound/dto/create-todo-result.dto";

@Injectable()
export class TodoService implements TodoUseCase {
  constructor(
    private readonly userInfoRepositoryPort: UserInfoRepositoryPort,
    private readonly todoRepositoryPort: TodoRepositoryPort
  ) { }

  async createTodo(userId: number, createTodoDto: CreateTodoDto): Promise<CreateTodoResultDto> {
    await this.checkUserIsValid(userId);

    const { title, description, isComplete } = createTodoDto;

    if (!title) {
      throw new PreconditionFailedException("title is empty");
    }

    const todo = new Todo({ userId, title, description, isComplete });

    const todoId = await this.todoRepositoryPort.createTodo(todo);

    return new CreateTodoResultDto(todoId);
  }

  async showAllTodos(userId: number): Promise<Todo[]> {
    await this.checkUserIsValid(userId);

    const result = await this.todoRepositoryPort.getAllTodo(userId);
    return result;
  }

  async getTodo(userId: number, id: number): Promise<Todo> {
    await this.checkUserIsValid(userId);

    const todo = await this.todoRepositoryPort.getTodo(id);

    if (!todo) {
      throw new NotFoundException(`Todo id ${id} is not found.`); // with 

    } else if (userId !== todo.userId) {
      throw new ForbiddenException(`User with id ${userId} cannot access to Todo id ${id}`)
    }

    return todo;
  }

  async modifyTodo(userId: number, modifyTodoDto: ModifyTodoDto): Promise<void> {
    await this.checkUserIsValid(userId);

    const { id, title, description, isComplete } = modifyTodoDto;

    if (!title) {
      throw new PreconditionFailedException("title is empty");
    }

    const todo = await this.getTodo(userId, id);

    todo.modify(title, description, isComplete);
    await this.todoRepositoryPort.saveTodo(todo);
  }

  async checkTodo(userId: number, id: number): Promise<void> {
    await this.checkUserIsValid(userId);

    const todo = await this.getTodo(userId, id);

    todo.check();
    await this.todoRepositoryPort.saveTodo(todo);
  }

  async deleteTodo(userId: number, id: number): Promise<void> {
    await this.checkUserIsValid(userId);

    const todo = await this.getTodo(userId, id);
    await this.todoRepositoryPort.deleteTodo(todo.id!);
  }

  private async checkUserIsValid(userId: number): Promise<void> {
    const user = await this.userInfoRepositoryPort.getUserInfoByUserId(userId);
    if (!user) {
      throw new UnauthorizedException(`User with id ${userId} is not found`);
    }
  }
}