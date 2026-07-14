import { IsNotEmpty } from "class-validator";

export class CreateTodoDto {
  @IsNotEmpty()
  public readonly title!: string;
  public readonly description?: string;
  public readonly isComplete?: boolean;

  constructor(title: string, description?: string, isComplete?: boolean) {
    this.title = title;
    this.description = description;
    this.isComplete = isComplete;
  }
}