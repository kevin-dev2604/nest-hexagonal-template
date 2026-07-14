interface TodoProps {
  id?: number;
  userId: number;
  title: string;
  description?: string;
  isComplete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Todo {
  public readonly id?: number;
  public readonly userId: number;

  private title: string;
  private description?: string;

  private isComplete?: boolean;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: TodoProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.description = props.description;
    this.isComplete = props.isComplete || false;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // getters
  get getTitle() {
    return this.title;
  }

  get getDescription() {
    return this.description;
  }

  get getIsComplete() {
    return this.isComplete;
  }

  check() {
    this.isComplete = !this.isComplete;
  }

  modify(title: string, description?: string, isComplete?: boolean) {
    this.title = title;
    this.description = description;
    this.isComplete = isComplete || false;
  }

}