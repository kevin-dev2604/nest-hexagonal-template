import { IsDecimal, IsNotEmpty, IsNumber } from "class-validator";

export class ModifyTodoDto {
  public readonly id!: number;
  @IsNotEmpty()
  public readonly title!: string;
  public readonly description?: string;
  public readonly isComplete?: boolean;

  constructor(id: number, title: string, description?: string, isComplete?: boolean) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.isComplete = isComplete;
  }
}