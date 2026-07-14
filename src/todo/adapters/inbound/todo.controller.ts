import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TodoUseCase } from "../../ports/inbound/todo.usecase";
import { JwtAccessGuard } from "../../../auth/adapters/inbound/guards/jwt-access.guard";
import { GetUser } from "../../../common/decorators/user.decorator";
import { Todo } from "../../domain/todo.model";
import { CreateTodoDto } from "./dto/create-todo.dto";
import { CreateTodoResultDto } from "./dto/create-todo-result.dto";
import { ModifyTodoDto } from "./dto/modify-todo.dto";

@ApiTags('예제: Todo List API') // Swagger UI에서 그룹핑할 태그명
@ApiBearerAuth('access-token')
@Controller('todo')
export class TodoController {
  constructor(
    private readonly todoUseCase: TodoUseCase
  ) { }

  @Get('/list')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: 'Todo list 조회', description: '유저의 todo 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 유저 토큰' })
  async getTodolist(
    @GetUser() user: { userId: number }
  ): Promise<Todo[]> {
    return await this.todoUseCase.showAllTodos(user.userId);
  }

  @Get('/:id')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: 'Todo 조회', description: '특정 todo 한 개를 조회합니다.' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 유저 토큰' })
  @ApiResponse({ status: 403, description: '타 user의 todo에 접근' })
  @ApiResponse({ status: 404, description: 'todo 없음' })
  async getTodo(
    @GetUser() user: { userId: number },
    @Param('id') id: number
  ): Promise<Todo> {
    return await this.todoUseCase.getTodo(user.userId, id);
  }

  @Post('/create')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: 'Todo 생성', description: 'todo를 생성합니다.' })
  @ApiResponse({ status: 200, description: '생성 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 유저 토큰' })
  @ApiResponse({ status: 412, description: 'title 미입력' })
  async createTodo(
    @GetUser() user: { userId: number },
    @Body() createTodoDto: CreateTodoDto
  ): Promise<CreateTodoResultDto> {
    return await this.todoUseCase.createTodo(user.userId, createTodoDto);
  }

  @Post('/modify')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: 'Todo 수정', description: 'todo를 수정합니다.' })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 유저 토큰' })
  @ApiResponse({ status: 403, description: '타 user의 todo에 접근' })
  @ApiResponse({ status: 404, description: 'todo 없음' })
  @ApiResponse({ status: 412, description: '수정할 title 미입력' })
  async modifyTodo(
    @GetUser() user: { userId: number },
    @Body() modifyTodoDto: ModifyTodoDto
  ): Promise<void> {
    await this.todoUseCase.modifyTodo(user.userId, modifyTodoDto);
  }

  @Delete('/:id')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: 'Todo 삭제', description: 'todo를 삭제합니다.' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 유저 토큰' })
  @ApiResponse({ status: 403, description: '타 user의 todo에 접근' })
  @ApiResponse({ status: 404, description: 'todo 없음' })
  async deleteTodo(
    @GetUser() user: { userId: number },
    @Param('id') id: number
  ): Promise<void> {
    await this.todoUseCase.deleteTodo(user.userId, id);
  }
}