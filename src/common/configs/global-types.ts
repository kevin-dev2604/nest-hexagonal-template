export interface ServerConfig {
  port: number;
}

export interface DbConfig {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
}

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
}