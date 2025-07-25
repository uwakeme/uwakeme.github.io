---
title: 【Node.js】NestJS详解：企业级Node.js框架
date: 2025-07-04
tags: 
  - 后端开发, 
  - Node.js, 
  - NestJS, 
  - TypeScript, 
  - 框架
categories: Node.js
description: 深入解析NestJS框架，包括依赖注入、装饰器、模块系统、控制器、服务、管道、守卫、拦截器、微服务等核心概念和企业级应用实践
---

# 引言

NestJS是一个用于构建高效、可扩展的Node.js服务器端应用程序的框架。它使用TypeScript构建，结合了OOP（面向对象编程）、FP（函数式编程）和FRP（函数响应式编程）的元素。NestJS深受Angular启发，提供了开箱即用的应用程序架构。

## 核心特性
- **TypeScript优先**：完全支持TypeScript，提供强类型检查
- **装饰器模式**：广泛使用装饰器来定义元数据
- **依赖注入**：强大的依赖注入系统
- **模块化架构**：清晰的模块化组织结构
- **微服务支持**：内置微服务架构支持
- **GraphQL集成**：原生GraphQL支持
- **WebSocket支持**：实时通信功能
- **测试友好**：内置测试工具和模拟功能

# 一、安装与项目初始化

## （一）CLI安装与项目创建

```bash
# 安装NestJS CLI
npm install -g @nestjs/cli

# 创建新项目
nest new nest-app

# 进入项目目录
cd nest-app

# 启动开发服务器
npm run start:dev
```

## （二）项目结构

```
nest-app/
├── src/
│   ├── app.controller.ts      # 应用控制器
│   ├── app.controller.spec.ts # 控制器测试
│   ├── app.module.ts          # 根模块
│   ├── app.service.ts         # 应用服务
│   └── main.ts                # 应用入口
├── test/                      # 端到端测试
├── nest-cli.json             # NestJS CLI配置
├── package.json
├── tsconfig.json             # TypeScript配置
└── tsconfig.build.json       # 构建配置
```

## （三）数据库迁移

```typescript
// src/database/migrations/1640000000000-CreateUsersTable.ts
import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateUsersTable1640000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '30',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'full_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'birth_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'user', 'moderator'],
            default: "'user'",
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'avatar_url',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_email_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 创建索引
    await queryRunner.createIndex(
      'users',
      new Index({
        name: 'IDX_USERS_EMAIL',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new Index({
        name: 'IDX_USERS_USERNAME',
        columnNames: ['username'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

# 六、认证与授权

## （一）JWT认证策略

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: userId } = payload;
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('用户已被禁用');
    }

    return user;
  }
}
```

```typescript
// src/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('认证失败');
    }
    return user;
  }
}
```

## （二）角色权限控制

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
```

```typescript
// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

```typescript
// src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

## （三）认证服务

```typescript
// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthResponse } from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, username, password } = registerDto;

    // 检查用户是否已存在
    const existingUser = await this.usersService.findByEmailOrUsername(
      email,
      username,
    );
    if (existingUser) {
      throw new BadRequestException('用户已存在');
    }

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // 生成令牌
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // 验证用户
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 更新最后登录时间
    await this.usersService.updateLastLogin(user.id);

    // 生成令牌
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async generateTokens(userId: number, email: string) {
    const payload: JwtPayload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const tokens = await this.generateTokens(user.id, user.email);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('刷新令牌无效');
    }
  }
}
```

# 七、微服务架构

## （一）微服务配置

```typescript
// src/microservices/user-microservice.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UserMicroserviceModule } from './user-microservice.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserMicroserviceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 3001,
      },
    },
  );

  await app.listen();
  console.log('用户微服务已启动在端口 3001');
}
bootstrap();
```

```typescript
// src/microservices/user-microservice.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Controller()
export class UserMicroserviceController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern({ cmd: 'find_user_by_id' })
  async findUserById(@Payload() id: number) {
    return this.usersService.findById(id);
  }

  @MessagePattern({ cmd: 'find_user_by_email' })
  async findUserByEmail(@Payload() email: string) {
    return this.usersService.findByEmail(email);
  }

  @MessagePattern({ cmd: 'update_user' })
  async updateUser(@Payload() data: { id: number; updateUserDto: UpdateUserDto }) {
    return this.usersService.update(data.id, data.updateUserDto);
  }

  @MessagePattern({ cmd: 'delete_user' })
  async deleteUser(@Payload() id: number) {
    return this.usersService.remove(id);
  }

  @MessagePattern({ cmd: 'get_users_list' })
  async getUsersList(@Payload() query: any) {
    return this.usersService.findAll(query);
  }
}
```

## （二）消息队列集成

```typescript
// src/queue/user-queue.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Processor('user-queue')
export class UserQueueProcessor {
  private readonly logger = new Logger(UserQueueProcessor.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  @Process('send-welcome-email')
  async handleSendWelcomeEmail(job: Job<{ userId: number }>) {
    this.logger.debug('开始处理欢迎邮件发送任务');
    
    const { userId } = job.data;
    const user = await this.usersService.findById(userId);
    
    if (user) {
      await this.emailService.sendWelcomeEmail(user.email, user.fullName);
      this.logger.debug(`欢迎邮件已发送给用户: ${user.email}`);
    }
  }

  @Process('send-verification-email')
  async handleSendVerificationEmail(job: Job<{ userId: number; token: string }>) {
    this.logger.debug('开始处理邮箱验证邮件发送任务');
    
    const { userId, token } = job.data;
    const user = await this.usersService.findById(userId);
    
    if (user) {
      await this.emailService.sendVerificationEmail(user.email, token);
      this.logger.debug(`验证邮件已发送给用户: ${user.email}`);
    }
  }

  @Process('update-user-stats')
  async handleUpdateUserStats(job: Job<{ userId: number }>) {
    this.logger.debug('开始处理用户统计更新任务');
    
    const { userId } = job.data;
    // 更新用户统计信息的逻辑
    await this.usersService.updateUserStats(userId);
    
    this.logger.debug(`用户统计已更新: ${userId}`);
  }
}
```

# 八、部署与运维

## （一）Docker配置

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 生产环境镜像
FROM node:18-alpine AS production

WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 复制package文件
COPY package*.json ./
COPY yarn.lock ./

# 安装生产依赖
RUN yarn install --frozen-lockfile --production && yarn cache clean

# 复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# 切换到非root用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 启动应用
CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/nestjs_app
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
    depends_on:
      - db
      - redis
    restart: unless-stopped
    volumes:
      - ./uploads:/app/uploads
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=nestjs_app
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - '5432:5432'
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

## （二）Kubernetes部署

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-app
  labels:
    app: nestjs-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nestjs-app
  template:
    metadata:
      labels:
        app: nestjs-app
    spec:
      containers:
      - name: nestjs-app
        image: your-registry/nestjs-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: nestjs-app-service
spec:
  selector:
    app: nestjs-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

# 九、性能优化与监控

## （一）性能优化

```typescript
// src/common/interceptors/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '../decorators/cache.decorator';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const cacheTTL = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const fullCacheKey = `${cacheKey}:${JSON.stringify(request.query)}`;

    // 尝试从缓存获取
    const cachedResult = await this.cacheService.get(fullCacheKey);
    if (cachedResult) {
      return new Observable((observer) => {
        observer.next(cachedResult);
        observer.complete();
      });
    }

    // 执行原方法并缓存结果
    return next.handle().pipe(
      tap(async (result) => {
        await this.cacheService.set(fullCacheKey, result, cacheTTL || 300);
      }),
    );
  }
}
```

## （二）监控配置

```typescript
// src/monitoring/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }
}
```

# 十、总结

NestJS作为企业级Node.js框架，提供了完整的开发解决方案：

## 核心优势

1. **TypeScript原生支持**：提供强类型检查和更好的开发体验
2. **模块化架构**：清晰的代码组织和依赖管理
3. **装饰器模式**：简洁的元数据定义和功能扩展
4. **依赖注入**：松耦合的组件设计和测试友好
5. **丰富的生态**：完善的工具链和第三方集成

## 适用场景

- **企业级Web应用**：复杂的业务逻辑和数据处理
- **RESTful API服务**：标准化的接口设计和文档生成
- **微服务架构**：分布式系统和服务间通信
- **实时应用**：WebSocket和事件驱动架构
- **GraphQL服务**：现代化的数据查询接口

## 最佳实践

1. **合理的模块划分**：按业务领域组织代码结构
2. **统一的错误处理**：全局异常过滤器和错误响应
3. **完善的测试覆盖**：单元测试、集成测试和E2E测试
4. **性能优化**：缓存策略、数据库优化和监控告警
5. **安全防护**：认证授权、数据验证和安全头设置

NestJS为现代Web开发提供了强大而灵活的解决方案，是构建可扩展、可维护企业级应用的理想选择。）基础配置

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 全局前缀
  app.setGlobalPrefix('api');
  
  // API版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  
  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );
  
  // CORS配置
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  // Swagger文档配置
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NestJS API')
      .setDescription('NestJS应用程序API文档')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation: ${await app.getUrl()}/api/docs`);
}

bootstrap();
```

# 二、模块系统

## （一）根模块

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { DatabaseConfig } from './config/database.config';
import { RedisConfig } from './config/redis.config';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [DatabaseConfig, RedisConfig],
    }),
    
    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
      }),
      inject: [ConfigService],
    }),
    
    // 缓存模块
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: 'redis',
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        password: configService.get('redis.password'),
        db: configService.get('redis.db'),
        ttl: 300, // 5分钟
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    
    // 限流模块
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    
    // 定时任务模块
    ScheduleModule.forRoot(),
    
    // 事件发射器模块
    EventEmitterModule.forRoot(),
    
    // 业务模块
    AuthModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## （二）功能模块

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UsersRepository } from './repositories/users.repository';
import { EmailService } from '../common/services/email.service';
import { FileUploadService } from '../common/services/file-upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    EmailService,
    FileUploadService,
  ],
  exports: [
    UsersService,
    UsersRepository,
  ],
})
export class UsersModule {}
```

## （三）共享模块

```typescript
// src/common/common.module.ts
import { Global, Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { FileUploadService } from './services/file-upload.service';
import { CryptoService } from './services/crypto.service';
import { LoggerService } from './services/logger.service';

@Global()
@Module({
  providers: [
    EmailService,
    FileUploadService,
    CryptoService,
    LoggerService,
  ],
  exports: [
    EmailService,
    FileUploadService,
    CryptoService,
    LoggerService,
  ],
})
export class CommonModule {}
```

# 三、控制器与路由

## （一）基础控制器

```typescript
// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  ValidationPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { Role } from '../auth/enums/role.enum';

@ApiTags('用户管理')
@Controller({ path: 'users', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({
    status: 201,
    description: '用户创建成功',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  @ApiResponse({
    status: 409,
    description: '用户已存在',
  })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiResponse({
    status: 200,
    description: '获取用户列表成功',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户资料' })
  @ApiResponse({
    status: 200,
    description: '获取用户资料成功',
    type: User,
  })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findById(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户' })
  @ApiParam({ name: 'id', type: 'number', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '获取用户成功',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiParam({ name: 'id', type: 'number', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '用户更新成功',
    type: User,
  })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'id', type: 'number', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '用户删除成功',
  })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @Post(':id/avatar')
  @ApiOperation({ summary: '上传用户头像' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: 'number', description: '用户ID' })
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(id, file);
  }
}
```

## （二）DTO（数据传输对象）

```typescript
// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  IsPhoneNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Role } from '../../auth/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: '用户名',
    example: 'john_doe',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(30, { message: '用户名不能超过30个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '用户名只能包含字母、数字和下划线',
  })
  @Transform(({ value }) => value.toLowerCase())
  username: string;

  @ApiProperty({
    description: '邮箱地址',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description: '密码',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: '密码至少8个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '密码必须包含大小写字母、数字和特殊字符',
  })
  password: string;

  @ApiPropertyOptional({
    description: '姓名',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '姓名不能超过100个字符' })
  fullName?: string;

  @ApiPropertyOptional({
    description: '手机号码',
    example: '+86 138 0013 8000',
  })
  @IsOptional()
  @IsPhoneNumber('CN', { message: '请输入有效的手机号码' })
  phone?: string;

  @ApiPropertyOptional({
    description: '生日',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: '请输入有效的日期格式' })
  birthDate?: string;

  @ApiPropertyOptional({
    description: '用户角色',
    enum: Role,
    default: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role, { message: '无效的用户角色' })
  role?: Role;

  @ApiPropertyOptional({
    description: '个人简介',
    example: '这是一个简介',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '个人简介不能超过500个字符' })
  bio?: string;
}
```

```typescript
// src/users/dto/user-query.dto.ts
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../auth/enums/role.enum';

export class UserQueryDto {
  @ApiPropertyOptional({
    description: '页码',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能超过100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '搜索关键词',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: '用户角色筛选',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role, { message: '无效的用户角色' })
  role?: Role;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: '排序方向',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: '排序方向只能是ASC或DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
```

# 四、服务与依赖注入

## （一）用户服务

```typescript
// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { CryptoService } from '../common/services/crypto.service';
import { FileUploadService } from '../common/services/file-upload.service';
import { UserCreatedEvent } from './events/user-created.event';
import { UserUpdatedEvent } from './events/user-updated.event';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
    private readonly fileUploadService: FileUploadService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await this.cryptoService.hashPassword(
      createUserDto.password,
    );

    // 创建用户
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // 发布用户创建事件
    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(savedUser.id, savedUser.email),
    );

    return savedUser;
  }

  async findAll(query: UserQueryDto) {
    const { page, limit, search, role, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const whereConditions: any = {};

    // 搜索条件
    if (search) {
      whereConditions.username = Like(`%${search}%`);
    }

    // 角色筛选
    if (role) {
      whereConditions.role = role;
    }

    const findOptions: FindManyOptions<User> = {
      where: whereConditions,
      take: limit,
      skip,
      order: {
        [sortBy]: sortOrder,
      },
      relations: ['profile'],
    };

    const [users, total] = await this.userRepository.findAndCount(findOptions);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['profile'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // 如果更新邮箱或用户名，检查是否已存在
    if (updateUserDto.email || updateUserDto.username) {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: updateUserDto.email },
          { username: updateUserDto.username },
        ],
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('用户名或邮箱已存在');
      }
    }

    // 如果更新密码，进行加密
    if (updateUserDto.password) {
      updateUserDto.password = await this.cryptoService.hashPassword(
        updateUserDto.password,
      );
    }

    // 更新用户
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // 发布用户更新事件
    this.eventEmitter.emit(
      'user.updated',
      new UserUpdatedEvent(updatedUser.id, updateUserDto),
    );

    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async uploadAvatar(id: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const user = await this.findById(id);

    // 上传文件
    const uploadResult = await this.fileUploadService.uploadImage(
      file,
      'avatars',
    );

    // 更新用户头像
    user.avatar = uploadResult.url;
    await this.userRepository.save(user);

    return {
      message: '头像上传成功',
      avatar: uploadResult.url,
    };
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return this.cryptoService.comparePassword(password, user.password);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async getUserStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });
    const adminUsers = await this.userRepository.count({
      where: { role: 'admin' },
    });

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      inactiveUsers: totalUsers - activeUsers,
    };
  }
}
```

## （二）实体定义

```typescript
// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../auth/enums/role.enum';
import { UserProfile } from './user-profile.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('users')
@Index(['email'])
@Index(['username'])
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @Column({ unique: true, length: 30 })
  username: string;

  @ApiProperty({ description: '邮箱地址', example: 'john@example.com' })
  @Column({ unique: true, length: 100 })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @Column({ nullable: true })
  avatar?: string;

  @ApiProperty({ description: '用户角色', enum: Role })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @ApiProperty({ description: '是否激活', default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: '是否验证邮箱', default: false })
  @Column({ default: false })
  isEmailVerified: boolean;

  @ApiPropertyOptional({ description: '最后登录时间' })
  @Column({ nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @OneToOne(() => UserProfile, (profile) => profile.user, {
    cascade: true,
    eager: false,
  })
  profile: UserProfile;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  // 虚拟属性
  @ApiProperty({ description: '用户全名' })
  get fullName(): string {
    return this.profile?.fullName || this.username;
  }

  @ApiProperty({ description: '是否为管理员' })
  get isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }
}
```

```typescript
// src/users/entities/user-profile.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '姓名' })
  @Column({ nullable: true, length: 100 })
  fullName?: string;

  @ApiPropertyOptional({ description: '手机号码' })
  @Column({ nullable: true, length: 20 })
  phone?: string;

  @ApiPropertyOptional({ description: '生日' })
  @Column({ nullable: true })
  birthDate?: Date;

  @ApiPropertyOptional({ description: '性别' })
  @Column({ nullable: true, length: 10 })
  gender?: string;

  @ApiPropertyOptional({ description: '地址' })
  @Column({ nullable: true, length: 200 })
  address?: string;

  @ApiPropertyOptional({ description: '个人简介' })
  @Column({ nullable: true, length: 500 })
  bio?: string;

  @ApiPropertyOptional({ description: '网站URL' })
  @Column({ nullable: true, length: 200 })
  website?: string;

  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
```

# 五、守卫与认证

## （一）JWT认证守卫

```typescript
// src/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('访问令牌无效或已过期');
    }
    return user;
  }
}
```

## （二）角色守卫

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
```

## （三）自定义装饰器

```typescript
// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

```typescript
// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

```typescript
// src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

# 六、管道与验证

## （一）自定义验证管道

```typescript
// src/common/pipes/parse-int.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('参数必须是数字');
    }
    return val;
  }
}
```

## （二）文件验证管道

```typescript
// src/common/pipes/file-validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

export interface FileValidationOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  required?: boolean;
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private options: FileValidationOptions = {}) {}

  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!file && this.options.required) {
      throw new BadRequestException('文件是必需的');
    }

    if (!file) {
      return file;
    }

    // 检查文件大小
    if (this.options.maxSize && file.size > this.options.maxSize) {
      throw new BadRequestException(
        `文件大小不能超过 ${this.options.maxSize / 1024 / 1024}MB`,
      );
    }

    // 检查文件类型
    if (
      this.options.allowedMimeTypes &&
      !this.options.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `不支持的文件类型，支持的类型: ${this.options.allowedMimeTypes.join(', ')}`,
      );
    }

    return file;
  }
}
```

# 七、拦截器与中间件

## （一）响应转换拦截器

```typescript
// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: '操作成功',
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
```

## （二）日志拦截器

```typescript
// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    this.logger.log(
      `${method} ${url} - ${ip} - ${userAgent} - 开始处理请求`,
    );

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const { statusCode } = response;

        this.logger.log(
          `${method} ${url} - ${ip} - ${statusCode} - ${duration}ms - 请求完成`,
        );
      }),
    );
  }
}
```

## （三）缓存拦截器

```typescript
// src/common/interceptors/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '@nestjs/cache-manager';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheManager: any,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    
    const cacheTTL = this.reflector.get(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const key = `${cacheKey}:${JSON.stringify(request.query)}`;

    // 尝试从缓存获取数据
    const cachedData = await this.cacheManager.get(key);
    if (cachedData) {
      return of(cachedData);
    }

    // 如果缓存中没有数据，执行原始方法并缓存结果
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(key, data, cacheTTL || 300);
      }),
    );
  }
}
```

# 八、异常处理

## （一）全局异常过滤器

```typescript
// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let errors: any = null;

    // 处理HTTP异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors || null;
      }
    }
    // 处理数据库查询错误
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = '数据库查询错误';
      
      // 处理唯一约束违反
      if ((exception as any).code === '23505') {
        message = '数据已存在，请检查唯一字段';
      }
      // 处理外键约束违反
      else if ((exception as any).code === '23503') {
        message = '关联数据不存在';
      }
    }
    // 处理其他错误
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    const errorResponse = {
      code: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(errors && { errors }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    response.status(status).json(errorResponse);
  }
}
```

## （二）自定义业务异常

```typescript
// src/common/exceptions/business.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    code: string = 'BUSINESS_ERROR',
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        message,
        code,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

export class UserNotFoundException extends BusinessException {
  constructor(identifier: string) {
    super(`用户 ${identifier} 不存在`, 'USER_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}

export class EmailAlreadyExistsException extends BusinessException {
  constructor(email: string) {
    super(
      `邮箱 ${email} 已被使用`,
      'EMAIL_ALREADY_EXISTS',
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super('用户名或密码错误', 'INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
  }
}
```

# 九、测试

## （一）单元测试

```typescript
// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CryptoService } from '../common/services/crypto.service';
import { FileUploadService } from '../common/services/file-upload.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../auth/enums/role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let cryptoService: CryptoService;
  let fileUploadService: FileUploadService;
  let eventEmitter: EventEmitter2;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: Role.USER,
    isActive: true,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: null,
    posts: [],
    fullName: 'testuser',
    isAdmin: false,
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  const mockCryptoService = {
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
  };

  const mockFileUploadService = {
    uploadImage: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    cryptoService = module.get<CryptoService>(CryptoService);
    fileUploadService = module.get<FileUploadService>(FileUploadService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      fullName: 'New User',
    };

    it('should create a new user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockCryptoService.hashPassword.mockResolvedValue('hashedpassword');
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      });
      expect(mockCryptoService.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedpassword',
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.created',
        expect.any(Object),
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      });
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['profile'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const queryDto = {
      page: 1,
      limit: 10,
      search: 'test',
      role: Role.USER,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
    };

    it('should return paginated users', async () => {
      const users = [mockUser];
      const total = 1;
      mockUserRepository.findAndCount.mockResolvedValue([users, total]);

      const result = await service.findAll(queryDto);

      expect(result).toEqual({
        data: users,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      mockCryptoService.comparePassword.mockResolvedValue(true);

      const result = await service.validatePassword(mockUser, 'password123');

      expect(mockCryptoService.comparePassword).toHaveBeenCalledWith(
        'password123',
        mockUser.password,
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      mockCryptoService.comparePassword.mockResolvedValue(false);

      const result = await service.validatePassword(mockUser, 'wrongpassword');

      expect(result).toBe(false);
    });
  });
});
```

## （二）控制器测试

```typescript
// src/users/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: Role.USER,
    isActive: true,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: null,
    posts: [],
    fullName: 'Test User',
    isAdmin: false,
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    uploadAvatar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      fullName: 'New User',
    };

    it('should create a new user', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    const queryDto = {
      page: 1,
      limit: 10,
      search: 'test',
      role: Role.USER,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
    };

    it('should return paginated users', async () => {
      const expectedResult = {
        data: [mockUser],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };
      mockUsersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      fullName: 'Updated User',
    };

    it('should update a user', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
```

# 五、实体定义与数据库操作

## （一）实体定义

```typescript
// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../auth/enums/role.enum';
import { UserProfile } from './user-profile.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @Column({ unique: true, length: 30 })
  @Index()
  username: string;

  @ApiProperty({ description: '邮箱地址', example: 'john@example.com' })
  @Column({ unique: true, length: 100 })
  @Index()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @ApiPropertyOptional({ description: '姓名', example: 'John Doe' })
  @Column({ name: 'full_name', nullable: true, length: 100 })
  fullName?: string;

  @ApiPropertyOptional({ description: '手机号码' })
  @Column({ nullable: true, length: 20 })
  phone?: string;

  @ApiPropertyOptional({ description: '生日' })
  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate?: Date;

  @ApiProperty({ description: '用户角色', enum: Role })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @ApiPropertyOptional({ description: '个人简介' })
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @ApiProperty({ description: '头像URL' })
  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @ApiProperty({ description: '是否激活', default: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ description: '邮箱是否验证', default: false })
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @ApiProperty({ description: '最后登录时间' })
  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关联关系
  @OneToOne(() => UserProfile, (profile) => profile.user, {
    cascade: true,
    eager: false,
  })
  profile: UserProfile;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  // 计算属性
  @Transform(({ obj }) => obj.role === Role.ADMIN)
  get isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }

  // 生命周期钩子
  @BeforeInsert()
  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  normalizeEmail() {
    this.email = this.email.toLowerCase();
    this.username = this.username.toLowerCase();
  }
}
```

```typescript
// src/users/entities/user-profile.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @ApiProperty({ description: '资料ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiPropertyOptional({ description: '公司' })
  @Column({ nullable: true, length: 100 })
  company?: string;

  @ApiPropertyOptional({ description: '职位' })
  @Column({ nullable: true, length: 100 })
  position?: string;

  @ApiPropertyOptional({ description: '网站' })
  @Column({ nullable: true, length: 200 })
  website?: string;

  @ApiPropertyOptional({ description: '地址' })
  @Column({ nullable: true, length: 200 })
  address?: string;

  @ApiPropertyOptional({ description: '社交媒体链接' })
  @Column({ name: 'social_links', type: 'json', nullable: true })
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional({ description: '技能标签' })
  @Column({ type: 'simple-array', nullable: true })
  skills?: string[];

  @ApiPropertyOptional({ description: '兴趣爱好' })
  @Column({ type: 'simple-array', nullable: true })
  interests?: string[];

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关联关系
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

## （二）数据库仓库

```typescript
// src/users/repositories/users.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserQueryDto } from '../dto/user-query.dto';
import { Role } from '../../auth/enums/role.enum';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['profile'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({
      where: { username: username.toLowerCase() },
      relations: ['profile'],
    });
  }

  async findWithPagination(query: UserQueryDto) {
    const { page, limit, search, role, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.createQueryBuilder();

    // 搜索条件
    if (search) {
      queryBuilder.andWhere(
        '(user.username ILIKE :search OR user.fullName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 角色筛选
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // 只查询激活用户
    queryBuilder.andWhere('user.isActive = :isActive', { isActive: true });

    // 排序
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // 分页
    queryBuilder.skip(skip).take(limit);

    // 关联查询
    queryBuilder.leftJoinAndSelect('user.profile', 'profile');

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async countByRole(role: Role): Promise<number> {
    return this.repository.count({ where: { role } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['profile'],
    });
  }

  async findRecentUsers(limit: number = 10): Promise<User[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['profile'],
    });
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.repository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async verifyEmail(id: number): Promise<void> {
    await this.repository.update(id, {
      isEmailVerified: true,
    });
  }

  async deactivateUser(id: number): Promise<void> {
    await this.repository.update(id, {
      isActive: false,
    });
  }

  private createQueryBuilder(): SelectQueryBuilder<User> {
    return this.repository.createQueryBuilder('user');
  }
}
```

## 总结

NestJS作为一个现代化的Node.js框架，为企业级应用开发提供了完整的解决方案。通过本文的详细介绍，我们了解了：

### 核心优势

1. **TypeScript原生支持**：提供强类型检查和更好的开发体验
2. **模块化架构**：清晰的代码组织和依赖管理
3. **装饰器模式**：简洁优雅的元数据定义方式
4. **依赖注入**：松耦合的组件设计
5. **丰富的生态系统**：完善的第三方库支持

### 适用场景

- **企业级Web应用**：复杂的业务逻辑和数据处理
- **RESTful API服务**：标准化的接口设计
- **微服务架构**：分布式系统构建
- **实时应用**：WebSocket和事件驱动
- **GraphQL服务**：现代化的数据查询接口

### 最佳实践

1. **合理的模块划分**：按功能域组织代码
2. **统一的错误处理**：全局异常过滤器
3. **数据验证**：使用DTO和验证管道
4. **安全防护**：认证授权和数据保护
5. **性能优化**：缓存、限流和监控
6. **测试覆盖**：单元测试和集成测试
7. **文档维护**：API文档和代码注释

NestJS为现代Web开发提供了强大而灵活的解决方案，是构建可扩展、可维护企业级应用的理想选择。