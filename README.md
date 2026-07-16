# 🛡️ Nest.js 헥사고날 아키텍처 템플릿 (Nest.js Hexagonal Architecture Template)

> **상용 서비스 수준의 아키텍처와 핵심 기능이 내장된 프로덕션 준비 완료(Production-Ready) 백엔드 보일러플레이트**  
> A production-ready backend boilerplate featuring enterprise-grade architecture and essential features built-in.

---

## 🌐 데모 사이트 링크

* 🔗https://nest-hexagonal-template.onrender.com/api-docs
* 데모 사이트의 도메인(`https://nest-hexagonal-template.onrender.com`)으로 Postman 등의 API 플랫폼에서 테스트 가능합니다.  
  You can test on API platforms such as Postman using the demo site's domain (`https://nest-hexagonal-template.onrender.com`).

---

## 💡 프로젝트를 통해 증명하고자 하는 것 (What this project demonstrates)

* **실무 중심의 기술적 깊이 (Production-Grade Technical Depth)**
  * 단순한 CRUD 예제를 넘어 OAuth2 소셜 연동, <!-- FCM 비동기 푸시 처리, -->Upstash Redis를 활용한 RTR(Refresh Token Rotation) 등 실제 서비스 환경에서 마주하는 까다로운 도전 과제들을 해결하고 반영했습니다.  
  *Beyond simple CRUD examples, this project tackles and implements real-world production challenges such as secure OAuth2 integration,<!-- asynchronous FCM push events--> and Upstash Redis-backed RTR (Refresh Token Rotation).*

* **프레임워크에 종속되지 않는 독립적 설계 (Framework-Agnostic Core Design)**
  * 헥사고날 아키텍처(포트 앤 어댑터)를 엄격히 준수하여, 핵심 비즈니스 로직(Domain, UseCase)을 웹 프레임워크(NestJS)나 데이터베이스 기술(TypeORM)로부터 철저하게 격리했습니다.  
  *By strictly adhering to Hexagonal Architecture (Ports and Adapters), the core business logic (Domain, UseCase) is completely isolated from the web framework (NestJS) and database technologies (TypeORM).*

* **재현 및 배포 가능한 클라우드 인프라 표준화 (Reproducible & Deployable Infrastructure)**
  * 로컬 환경과 클라우드 배포(Render.com) 환경의 일관성을 위해 멀티 스테이지 Docker 빌드를 표준화했으며, Supabase(PostgreSQL) 및 Upstash Redis 환경에서도 즉시 구동됩니다.  
  *To ensure consistency between local and cloud deployment (Render.com), we standardized a multi-stage Docker build that runs out-of-the-box with Supabase (PostgreSQL) and Upstash Redis.*

---

## 🛠️ 기술 스택 (Tech Stack)

* **Backend Framework:** Nest.js 11+, TypeScript 6+
* **Database & ORM:** Supabase (PostgreSQL), TypeORM 1.0+
* **Caching & Session:** Upstash Redis (ioredis)
* **Authentication:** Passport.js, JWT (Access/Refresh Token Guard 분리)
* **API Documentation:** Swagger (@nestjs/swagger CLI 플러그인 자동 추론)
* **DevOps:** Docker (Multi-stage build), Docker Compose, Render.com (CI/CD)
* **Testing:** Jest (Unit/Integration Tests)

---

## 🏗️ 아키텍처 및 폴더 구조 (Architecture & Folder Structure)

본 프로젝트는 의존성의 방향이 안쪽(Domain)으로만 흐르도록 설계되었습니다. 각 비즈니스 모듈(예: `auth`, `todo`)은 아래와 같이 헥사고날 레이어로 엄격히 격리되어 있습니다.  
*This project is designed so that dependency flow always points inward (Domain). Each business module (e.g., `auth`, `todo`) is strictly isolated into hexagonal layers as follows:*

### 아키텍쳐 다이어그램 (Architecture Diagram)
![alt text](image.png)

### 프로젝트 파일 & 폴더 구조 (Project File & Folder Structure)
```text
nest-cli.json                # Nest.js CLI 설정 파일 (Nest.js CLI configuration file)
tsconfig.json                # Typescript 설정 파일 (Typescript configuration file)
tsconfig.build.json          # Typescript 빌드 설정 파일 (Typescript build configuration file)
package.json                 # Node.js 설정 파일 (Node.js configuration file)
Dockerfile                   # 클라우드 배포용 Docker 스크립트 (Docker scripts for cloud deployment)
Dockerfile.dev               # 로컬 Docker 배포용 Docker 스크립트 (Docker script for local Docker deployment)
docker-componse.yml          # 로컬 Docker 배포 설정 (Local Docker Deployment Setup)
config/
├── config.local.yml         # local 스테이지 환경 변수 (local stage environment variables)
├── config.development.yml   # development 스테이지 환경 변수 (development stage environment variables)
└── config.production.yml    # production 스테이지 환경 변수 (production stage environment variables)
src/
├── common/                  # 공통 모듈 및 횡단 관심사 (Common modules & cross-cutting concerns)
│   ├── config/              # YAML 기반 스테이지별 환경 설정 (YAML-based stage configuration)
│   ├── decorators/          # 공통 파라미터 데코레이터 (Common parameter decorators)
│   ├── infrestructure/      # 외부 인프라 접근 설정 (External infrastructure connection settings)
│   │   └── redis/           # 전역 Redis 모듈 (Global Redis Module)
│   └── strategies/          # DB 네이밍 등 정책 설정 (Policy settings such as DB naming)
│
├── auth/                    # 사용자 인증 비즈니스 도메인 모듈 (Auth Domain Module)
│   ├── domain/              # [인사이드] 순수 도메인 모델 (Pure domain models)
│   ├── port/                # [인사이드] 인바운드/아웃바운드 포트 (Inbound/Outbound Ports)
│   │   ├── inbound/         # UseCase 인터페이스 (UseCase Interfaces)
│   │   └── outbound/        # Repository 포트 추상 클래스 (Repository Port Abstract Classes)
│   ├── adapter/             # [아웃사이드] 기술 구현부 (Technology Adapters)
│   │   ├── inbound/         # Controller (REST API), Guard, Strategy
│   │   └── outbound/        # TypeORM Repository Adapter, External API Clients
│   ├── auth.service.ts      # 실제 비즈니스 로직 구현 클래스 (Service Class that implements usecase)
│   └── auth.module.ts       # NestJS 의존성 주입 바인딩 (NestJS DI binding)
│
├── user/                    # 사용자 관리 비즈니스 도메인 모듈 (User Management Domain Module)
│   ├── port/                
│   │   ├── inbound/         
│   ├── adapter/             
│   │   ├── inbound/         
│   ├── user.service.ts      
│   └── user.module.ts    
│   
└── todo/                    # Todo List 비즈니스 도메인 모듈 (Todo Domain Module)
    ├── domain/                           
    ├── port/                
    │   ├── inbound/         
    │   └── outbound/        
    ├── adapter/             
    │   ├── inbound/         
    │   └── outbound/        
    ├── todo.service.ts      
    └── todo.module.ts       
```

--- 

## ✨ 핵심 기능 (Key Features)

1. 헥사고날 아키텍처 기반 의존성 주입 (Hexagonal DI)
NestJS DI의 특성을 활용하여 추상 클래스(Abstract Class)를 포트(Port)로 정의하고 어댑터(Adapter)를 바인딩함으로써, 컴파일 단계의 정적 분석과 런타임의 완전한 인터페이스 결합을 동시에 만족합니다.  
Leveraging NestJS DI, we define Ports as Abstract Classes and bind Adapters to them, satisfying both static analysis at compile-time and loose coupling at runtime.

2. 하이브리드 토큰 보안 및 RTR (Secure Auth & Refresh Token Rotation)
Access Token과 Refresh Token의 Guard 및 Strategy를 완전히 분리했습니다. Refresh Token은 무상태(Stateless) 검증 후 Upstash Redis에 보관된 실제 토큰 값과 대조하는 RTR 기법을 적용하여 토큰 탈취 위험을 원천 차단합니다.  
Strictly separated guards and strategies for Access and Refresh tokens. Refresh tokens undergo stateless verification before being cross-referenced with the active token stored in Upstash Redis, applying RTR to prevent token hijacking.

3. 멀티 프로바이더 소셜 로그인 (Multi-Provider OAuth2)
Google 및 GitHub 소셜 로그인을 통합 구현했습니다. 외부 연동 시 발생할 수 있는 이메일 비공개(Private) 이슈 및 프로필 파싱 예외 처리를 완벽하게 대응합니다.  
Fully integrated Google and GitHub OAuth2 social logins. Handled edge cases such as private email profiles and API parser errors during external handshakes.

<!-- 4. 비동기 FCM 푸시 이벤트 처리 (Async FCM Push Notifications)
프론트엔드와 유기적으로 연동하여 Firebase Cloud Messaging(FCM) 기기 토큰을 수집하고, 시스템 내부 이벤트를 비동기적으로 소모(Consume)하여 안정적으로 알림을 푸시합니다.  
Seamlessly collects client FCM device tokens and asynchronously consumes internal events to safely dispatch push notifications to end-users. -->

--- 

## 🚀 시작하기 (Getting Started)

### 사전 요구사항 (Prerequisites)

* Node.js v24+ / npm
* Docker & Docker Compose
* Supabase Account & Upstash Redis Instance

### 1. 환경 변수 설정 (Environment Variables)

프로젝트 루트에 .env 파일을 생성하고 다음 값을 채워 넣습니다.  
Create a .env file in the root directory and populate the variables:

```properties
# Database (In Local docker)
DOCKER_DB_HOST=postgres-container-name
DOCKER_DB_PORT=5432
DOCKER_DB_USERNAME=postgres
DOCKER_DB_PASSWORD=your-password
DOCKER_DB_NAME=postgres

# Database (Supabase)
SUPABASE_DB_HOST=your-supabase-connection-pooler-host
SUPABASE_DB_PORT=5432 # Pooler Port
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=your-password
SUPABASE_DB_NAME=postgres

# Redis (In Local docker)
DOCKER_REDIS_HOST=redis-container-name
DOCKER_REDIS_PORT=6379

# Redis (Upstash)
UPSTASH_REDIS_URL=rediss://default:your-token@your-upstash-redis.io:6379

# OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 2. 로컬 실행 (Run Locally)

```Bash
# 의존성 설치 (Install Dependencies)
$ npm install

# 개발 서버 실행 (Run Development Server)
$ npm run start:dev
```

### 3. Docker로 실행하기 (Run via Docker)

```Bash
# 도커 컴포즈로 컨테이너 빌드 및 백그라운드 실행 (Build & run via Docker Compose)
$ docker-compose up --build -d
```

### 4. 테스트 실행 (Run Tests)
```Bash
# 단위 테스트 실행 (Run Unit Tests)
$ npm run test

# 테스트 커버리지 확인 (Run Test Coverage)
$ npm run test:cov
```

#### 📝 API 문서 (API Documentation)
서버 구동 후 브라우저에서 아래 경로를 통해 Swagger UI로 자동 생성된 인터페이스 스펙을 확인할 수 있습니다. @nestjs/swagger CLI 플러그인을 활성화하여 별도의 보일러플레이트 코드 없이 DTO 타입 정보를 자동으로 추론합니다.  
Once the server is live, you can inspect and test the API specs via Swagger UI at the path below. Powered by the @nestjs/swagger CLI plugin to automatically infer DTO interfaces.

* Swagger URL: http://localhost:3000/api-docs

---
<!-- 
## 💡 README 작성을 위한 꿀팁 및 조언

1. **아키텍처 다이어그램 추가**: 만약 여유가 되신다면, NestJS에서 헥사고날 아키텍처가 어떻게 동작하는지 (Controller ➡️ Inbound Port ➡️ UseCase ➡️ Outbound Port ➡️ Database Adapter) 가벼운 다이어그램(Mermaid.js나 Excalidraw 활용)을 `## 아키텍처 및 폴더 구조` 섹션에 한 장 첨부해 두면 개발자들의 몰입도가 200% 증가합니다.
2. **배포처 링크 제공**: 프로젝트 상단에 Render.com 등으로 배포된 **실제 Swagger API 주소**나 **데모 사이트 링크**를 뱃지(Badge) 형태로 달아두면 신뢰도가 대폭 상승합니다.
3. **이슈 해결기 링크 연결**: 앞서 작성 가이드를 드렸던 "인디 해커/디스콰이엇 후기 글"의 링크를 README 하단에 `## 📖 개발 스토리 / 메이커로그 (Maker Log)` 같은 섹션으로 달아두세요. README를 보러 온 사람들이 후기 글까지 읽으며 메이커님의 기술적 집념과 팬덤에 매료될 것입니다.
 -->
