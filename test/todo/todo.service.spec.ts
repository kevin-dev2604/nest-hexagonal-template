import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException, PreconditionFailedException, UnauthorizedException } from '@nestjs/common';
import { TodoService } from '../../src/todo/todo.service';
import { TodoRepositoryPort } from '../../src/todo/ports/outbound/todo-repository.port';
import { UserInfoRepositoryPort } from '../../src/auth/ports/outbound/user-info-repository.port';
import { CreateTodoDto } from '../../src/todo/adapters/inbound/dto/create-todo.dto';
import { Todo } from '../../src/todo/domain/todo.model';
import { ModifyTodoDto } from '../../src/todo/adapters/inbound/dto/modify-todo.dto';
import { CreateTodoResultDto } from '../../src/todo/adapters/inbound/dto/create-todo-result.dto';

describe('TodoService (단위 테스트)', () => {
  let todoService: TodoService;
  let userInfoRepositoryPort: UserInfoRepositoryPort;
  let todoRepositoryPort: TodoRepositoryPort;

  // 1. 가짜 레포지토리 포트(Mock) 정의
  const mockUserInfoRepositoryPort = {
    createUser: jest.fn(),
    getUserInfo: jest.fn(),
    getSocialUserInfo: jest.fn(),
    getUserInfoByUserId: jest.fn(),
    updateUserInfo: jest.fn(),
  }

  const mockTodoRepositoryPort = {
    createTodo: jest.fn(),
    getAllTodo: jest.fn(),
    getTodo: jest.fn(),
    saveTodo: jest.fn(),
    deleteTodo: jest.fn(),
  }

  beforeEach(async () => {
    // 2. Nest.js 테스트 컨테이너 세팅
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          // 💡 인터페이스/추상클래스 토큰에 가짜 객체를 바인딩
          provide: UserInfoRepositoryPort,
          useValue: mockUserInfoRepositoryPort,
        },
        {
          // 💡 인터페이스/추상클래스 토큰에 가짜 객체를 바인딩
          provide: TodoRepositoryPort,
          useValue: mockTodoRepositoryPort,
        },
      ],
    }).compile();

    // 3. 테스트에 사용할 인스턴스 확보
    todoService = module.get<TodoService>(TodoService);
    userInfoRepositoryPort = module.get<UserInfoRepositoryPort>(UserInfoRepositoryPort);
    todoRepositoryPort = module.get<TodoRepositoryPort>(TodoRepositoryPort);
  });

  // 매 테스트 종료 후 가짜 함수의 기록 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });


  it('Success: create todos', async () => {
    // given (상황 설정)
    const userId = 1;
    const title = "new todo list";
    const isComplete = false;
    const createTodoDto = new CreateTodoDto(title);

    userInfoRepositoryPort.getUserInfoByUserId = jest.fn().mockResolvedValue({
      userId,
      loginId: "test-id",
      loginPw: "test-pw",
      username: "tester"
    });

    todoRepositoryPort.createTodo = jest.fn().mockResolvedValue(1);

    // when (행위)
    const result = await todoService.createTodo(userId, createTodoDto);

    // then (검증)
    const todo = new Todo({ userId, title, isComplete });
    expect(userInfoRepositoryPort.getUserInfoByUserId).toHaveBeenCalledWith(userId);
    expect(todoRepositoryPort.createTodo).toHaveBeenCalledWith(todo);
    expect(result).toEqual({ todoId: 1 });
  });

  it('Fail: fails to create todo if using not exists user-id', async () => {
    // given (상황 설정)
    const userId = 2;
    const title = "new todo list";
    const isComplete = false;
    const createTodoDto = new CreateTodoDto(title);

    userInfoRepositoryPort.getUserInfoByUserId = jest.fn().mockResolvedValue(null);

    todoRepositoryPort.createTodo = jest.fn().mockResolvedValue(1);

    // when & then (행위 및 검증을 동시에 처리)
    await expect(
      todoService.createTodo(userId, createTodoDto)
    ).rejects.toThrow(UnauthorizedException);

    // then (검증)
    expect(todoRepositoryPort.createTodo).not.toHaveBeenCalled();
  });

  it('Fail: fails to create todo if title has empty values', async () => {
    // given (상황 설정)
    const userId = 1;
    const title = "";
    const createTodoDto = new CreateTodoDto(title);

    userInfoRepositoryPort.getUserInfoByUserId = jest.fn().mockResolvedValue({
      userId,
      loginId: "test-id",
      loginPw: "test-pw",
      username: "tester"
    });

    todoRepositoryPort.createTodo = jest.fn().mockResolvedValue(1);

    // when & then (행위 및 검증을 동시에 처리)
    await expect(
      todoService.createTodo(userId, createTodoDto)
    ).rejects.toThrow(PreconditionFailedException);

    // then (검증)
    expect(todoRepositoryPort.createTodo).not.toHaveBeenCalled();
  });

  it('Success: update todos', async () => {
    // given (상황 설정)
    const userId = 1;
    const todoId = 100;
    const title = "new todo list";
    const description = "is done bla bla~";
    const isComplete = true;
    const modifyTodoDto = new ModifyTodoDto(
      todoId,
      title,
      description,
      isComplete
    );

    userInfoRepositoryPort.getUserInfoByUserId = jest.fn().mockResolvedValue({
      userId,
      loginId: "test-id",
      loginPw: "test-pw",
      username: "tester"
    });

    todoRepositoryPort.getTodo = jest.fn().mockResolvedValue(new Todo({
      id: todoId,
      userId,
      title: "todo #1"
    }));

    todoRepositoryPort.saveTodo = jest.fn().mockImplementation(() => Promise.resolve());

    // when (행위)
    await todoService.modifyTodo(userId, modifyTodoDto);

    // then (검증)
    expect(userInfoRepositoryPort.getUserInfoByUserId).toHaveBeenCalledWith(userId);
    expect(todoRepositoryPort.getTodo).toHaveBeenCalledWith(todoId);
    expect(todoRepositoryPort.saveTodo).toHaveBeenCalledWith(new Todo({
      id: todoId,
      userId,
      title,
      description,
      isComplete
    }));
  });

  it('Fail: fails to update todo if using not exists todo id', async () => {
    // given (상황 설정)
    const userId = 1;
    const todoId = 101;
    const title = "new todo list";
    const description = "is done bla bla~";
    const isComplete = true;
    const modifyTodoDto = new ModifyTodoDto(
      todoId,
      title,
      description,
      isComplete
    );

    userInfoRepositoryPort.getUserInfoByUserId = jest.fn().mockResolvedValue({
      userId,
      loginId: "test-id",
      loginPw: "test-pw",
      username: "tester"
    });

    todoRepositoryPort.getTodo = jest.fn().mockResolvedValue(null);

    todoRepositoryPort.saveTodo = jest.fn().mockImplementation(() => Promise.resolve());

    // when & then (행위 및 검증을 동시에 처리)
    await expect(
      todoService.modifyTodo(userId, modifyTodoDto)
    ).rejects.toThrow(NotFoundException);

    // then (검증)
    expect(userInfoRepositoryPort.getUserInfoByUserId).toHaveBeenCalledWith(userId);
    expect(todoRepositoryPort.getTodo).toHaveBeenCalledWith(todoId);
    expect(todoRepositoryPort.saveTodo).not.toHaveBeenCalled();
  });

  it('Fail: fails to update todo if another user has it', async () => {
    // given (상황 설정)
    const userId = 1;
    const todoId = 101;
    const title = "new todo list";
    const description = "is done bla bla~";
    const isComplete = true;
    const modifyTodoDto = new ModifyTodoDto(
      todoId,
      title,
      description,
      isComplete
    );

    userInfoRepositoryPort.getUserInfoByUserId = jest.fn().mockResolvedValue({
      userId,
      loginId: "test-id",
      loginPw: "test-pw",
      username: "tester"
    });

    todoRepositoryPort.getTodo = jest.fn().mockResolvedValue(new Todo({
      id: todoId,
      userId: 2,
      title: "todo #1"
    }));

    todoRepositoryPort.saveTodo = jest.fn().mockImplementation(() => Promise.resolve());

    // when & then (행위 및 검증을 동시에 처리)
    await expect(
      todoService.modifyTodo(userId, modifyTodoDto)
    ).rejects.toThrow(ForbiddenException);

    // then (검증)
    expect(userInfoRepositoryPort.getUserInfoByUserId).toHaveBeenCalledWith(userId);
    expect(todoRepositoryPort.getTodo).toHaveBeenCalledWith(todoId);
    expect(todoRepositoryPort.saveTodo).not.toHaveBeenCalled();
  });

  it('Success: delete todos', async () => {
    // given (상황 설정)
    const userId = 1;
    const todoId = 100;
    const title = "todo list";
    const todo = new Todo({
      id: todoId,
      userId,
      title
    });

    userInfoRepositoryPort.getUserInfoByUserId = jest.fn().mockResolvedValue({
      userId,
      loginId: "test-id",
      loginPw: "test-pw",
      username: "tester"
    });

    todoRepositoryPort.getTodo = jest.fn().mockResolvedValue(todo);

    todoRepositoryPort.deleteTodo = jest.fn().mockImplementation(() => Promise.resolve());

    // when (행위)
    await todoService.deleteTodo(userId, todoId);

    // then (검증)
    expect(userInfoRepositoryPort.getUserInfoByUserId).toHaveBeenCalledWith(userId);
    expect(todoRepositoryPort.getTodo).toHaveBeenCalledWith(todoId);
    expect(todoRepositoryPort.deleteTodo).toHaveBeenCalledWith(todoId);
  });

  it('Fail: fails to delete todo if using not exists todo id', async () => {
    // given (상황 설정)
    const userId = 1;
    const todoId = 100;
    const title = "todo list";
    const todo = new Todo({
      id: 101,
      userId,
      title
    });

    userInfoRepositoryPort.getUserInfoByUserId = jest.fn().mockResolvedValue({
      userId,
      loginId: "test-id",
      loginPw: "test-pw",
      username: "tester"
    });

    todoRepositoryPort.getTodo = jest.fn().mockResolvedValue(null);

    todoRepositoryPort.deleteTodo = jest.fn().mockImplementation(() => Promise.resolve());

    // when & then (행위 및 검증을 동시에 처리)
    await expect(
      todoService.deleteTodo(userId, todoId)
    ).rejects.toThrow(NotFoundException);

    // then (검증)
    expect(userInfoRepositoryPort.getUserInfoByUserId).toHaveBeenCalledWith(userId);
    expect(todoRepositoryPort.getTodo).toHaveBeenCalledWith(todoId);
    expect(todoRepositoryPort.saveTodo).not.toHaveBeenCalled();
  });

  it('Fail: fails to delete todo if another user has it', async () => {
    // given (상황 설정)
    const userId = 1;
    const todoId = 100;
    const title = "todo list";
    const todo = new Todo({
      id: todoId,
      userId: 2,
      title
    });

    userInfoRepositoryPort.getUserInfoByUserId = jest.fn().mockResolvedValue({
      userId,
      loginId: "test-id",
      loginPw: "test-pw",
      username: "tester"
    });

    todoRepositoryPort.getTodo = jest.fn().mockResolvedValue(todo);

    todoRepositoryPort.deleteTodo = jest.fn().mockImplementation(() => Promise.resolve());

    // when & then (행위 및 검증을 동시에 처리)
    await expect(
      todoService.deleteTodo(userId, todoId)
    ).rejects.toThrow(ForbiddenException);

    // then (검증)
    expect(userInfoRepositoryPort.getUserInfoByUserId).toHaveBeenCalledWith(userId);
    expect(todoRepositoryPort.getTodo).toHaveBeenCalledWith(todoId);
    expect(todoRepositoryPort.saveTodo).not.toHaveBeenCalled();
  });

  it('Success: get todo list of user', async () => {
    // given (상황 설정)
    const userId = 1;

    userInfoRepositoryPort.getUserInfoByUserId = jest.fn().mockResolvedValue({
      userId,
      loginId: "test-id",
      loginPw: "test-pw",
      username: "tester"
    });

    todoRepositoryPort.getAllTodo = jest.fn().mockResolvedValue([]);

    // when (행위)
    const result = await todoService.showAllTodos(userId);

    // then (검증)
    expect(userInfoRepositoryPort.getUserInfoByUserId).toHaveBeenCalledWith(userId);
    expect(todoRepositoryPort.getAllTodo).toHaveBeenCalledWith(userId);
    expect(result).toEqual([]);
  });
})