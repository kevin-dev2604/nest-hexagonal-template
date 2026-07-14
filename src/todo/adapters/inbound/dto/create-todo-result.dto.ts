
export class CreateTodoResultDto {
  public readonly todoId: number;

  constructor(todoId: number) {
    this.todoId = todoId;
  }
}