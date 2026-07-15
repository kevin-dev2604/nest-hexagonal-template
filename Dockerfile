# ==========================================
# 1. 빌드 스테이지 (의존성 설치 및 빌드)
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

# 패키지 파일만 먼저 복사하여 캐싱 활용
COPY package*.json ./

# 빌드 및 개발용 의존성까지 모두 설치
RUN npm ci

# 소스코드 전체 복사 후 빌드 진행
COPY . .
RUN npm run build

# 프로덕션용 패키지만 남기기 위해 node_modules 정리
RUN npm prune --production

# ==========================================
# 2. 실행 스테이지 (경량화 및 보안 적용)
# ==========================================
FROM node:24-alpine AS runner

WORKDIR /usr/src/app

# 보안을 위해 Node 실행 환경 설정
ENV NODE_ENV=production

# 빌드 스테이지에서 생성된 산출물과 프로덕션용 패키지만 복사
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# ⭐️ [수정] YAML 설정 파일이 들어있는 config 폴더도 빌드 스테이지에서 가져옵니다!
COPY --from=builder /usr/src/app/config ./config

# Non-root 계정(node)을 사용하여 보안 강화
USER node

# Render가 주입하는 동적 포트를 수신하기 위해 포트 노출 (기본값 10000)
EXPOSE 10000

# 서버 실행 명령
CMD ["node", "dist/main.js"]