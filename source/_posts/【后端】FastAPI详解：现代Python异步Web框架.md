---
title: FastAPI详解：现代Python异步Web框架
categories: 后端
tags:
  - FastAPI
  - Python
  - 异步编程
  - REST API
  - 微服务
  - 框架
description: 全面深入解析FastAPI现代Python异步Web框架，从基础概念到高级特性，涵盖异步编程模式、RESTful API设计、数据验证与序列化、用户认证授权、数据库集成、WebSocket实时通信、性能优化、安全防护、测试策略、容器化部署等核心技术，助力开发者构建高性能、可扩展的现代Web应用和微服务架构
keywords: FastAPI, Python异步框架, REST API开发, Pydantic数据验证, 异步编程, 微服务架构, OpenAPI文档, JWT认证, SQLAlchemy ORM, WebSocket, 性能优化, 容器化部署
---

# 前言

FastAPI是由Sebastian Ramirez于2018年创建的现代Python Web框架，专为构建高性能API而设计。作为新一代的Python Web框架，FastAPI结合了现代Python特性（如类型提示、异步编程）和最佳实践，为开发者提供了一个既强大又易用的API开发解决方案。

## 为什么选择FastAPI？

- **卓越性能**：基于Starlette和Pydantic构建，性能可媲美NodeJS和Go语言
- **开发效率**：通过类型提示和自动化功能，减少约40%的开发错误
- **现代化设计**：原生支持Python 3.6+的异步编程特性
- **标准兼容**：完全兼容OpenAPI（Swagger）和JSON Schema标准
- **自动文档**：零配置自动生成交互式API文档
- **类型安全**：基于Python类型提示，提供完整的IDE支持和代码补全
- **生产就绪**：内置数据验证、序列化、认证等企业级功能

## 核心技术优势

- **异步优先**：原生支持async/await，充分利用Python异步编程能力
- **数据验证**：集成Pydantic，提供强大的数据验证和序列化功能
- **自动文档生成**：基于代码自动生成Swagger UI和ReDoc文档
- **依赖注入**：优雅的依赖注入系统，支持复杂的业务逻辑组织
- **中间件支持**：灵活的中间件机制，易于扩展和定制
- **WebSocket支持**：内置WebSocket支持，轻松构建实时应用
- **测试友好**：基于Starlette的测试客户端，简化API测试

## 适用场景

- **RESTful API开发**：构建标准的REST API服务
- **微服务架构**：作为微服务架构中的服务节点
- **数据科学API**：为机器学习模型提供API接口
- **实时应用**：利用WebSocket构建实时通信应用
- **企业级应用**：需要高性能和可靠性的企业级API服务

## 本文内容概览

本文将全面介绍FastAPI框架的核心概念和实践应用，包括：
- **基础入门**：FastAPI安装配置、项目结构和基本概念
- **路径操作详解**：路由定义、参数处理和请求响应模式
- **数据模型与验证**：Pydantic模型设计和数据验证策略
- **异步编程实践**：异步路由、数据库操作和并发处理
- **数据库集成**：SQLAlchemy ORM集成和数据库操作最佳实践
- **用户认证授权**：JWT认证、OAuth2集成和权限管理
- **高级特性应用**：中间件、依赖注入、WebSocket和后台任务
- **API文档与测试**：自动文档生成和测试策略
- **性能优化**：缓存策略、数据库优化和并发调优
- **安全防护**：CORS配置、输入验证和安全最佳实践
- **部署与运维**：容器化部署、监控和日志管理

# 一、FastAPI基础

## （一）安装与配置

### 1. 环境准备
```bash
# 创建虚拟环境
python -m venv fastapi_env
source fastapi_env/bin/activate  # Linux/Mac
# fastapi_env\Scripts\activate  # Windows

# 安装FastAPI和ASGI服务器
pip install fastapi[all]
pip install uvicorn[standard]

# 或者分别安装
pip install fastapi
pip install uvicorn
pip install python-multipart  # 表单和文件上传
pip install python-jose[cryptography]  # JWT
pip install passlib[bcrypt]  # 密码哈希
```

### 2. 第一个FastAPI应用
```python
# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="我的API",
    description="这是一个示例API",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc"  # ReDoc
)

class Item(BaseModel):
    name: str
    price: float
    is_offer: Optional[bool] = None

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
    return {"item_id": item_id, "q": q}

@app.post("/items/")
def create_item(item: Item):
    return item

# 启动服务器
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 3. 运行应用
```bash
# 开发模式
uvicorn main:app --reload

# 生产模式
uvicorn main:app --host 0.0.0.0 --port 8000

# 访问API文档
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)
```

## （二）路径操作与参数

### 1. 路径参数
```python
from enum import Enum
from fastapi import FastAPI, HTTPException

app = FastAPI()

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"

@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    if model_name == ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}
    
    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}
    
    return {"model_name": model_name, "message": "Have some residuals"}

@app.get("/files/{file_path:path}")
async def read_file(file_path: str):
    return {"file_path": file_path}

@app.get("/users/{user_id}")
async def read_user(user_id: int):
    if user_id < 1:
        raise HTTPException(status_code=400, detail="用户ID必须大于0")
    return {"user_id": user_id}
```

### 2. 查询参数
```python
from typing import Optional, List
from fastapi import Query

@app.get("/items/")
async def read_items(
    skip: int = 0,
    limit: int = 10,
    q: Optional[str] = Query(
        None, 
        min_length=3, 
        max_length=50,
        regex="^[a-zA-Z0-9\s]+$",
        description="搜索查询字符串",
        example="python"
    ),
    tags: List[str] = Query([], description="标签列表")
):
    results = {"skip": skip, "limit": limit}
    if q:
        results["q"] = q
    if tags:
        results["tags"] = tags
    return results

# 必需查询参数
@app.get("/items-required/")
async def read_items_required(
    q: str = Query(..., min_length=3, description="必需的查询参数")
):
    return {"q": q}
```

### 3. 请求体
```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="用户名")
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$', description="邮箱")
    age: Optional[int] = Field(None, ge=0, le=120, description="年龄")
    is_active: bool = Field(True, description="是否激活")
    
    @validator('email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('邮箱格式不正确')
        return v.lower()

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="价格必须大于0")
    tax: Optional[float] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)

class UserItem(BaseModel):
    user: User
    item: Item
    quantity: int = Field(..., ge=1, description="数量")

@app.post("/users/")
async def create_user(user: User):
    return {"message": f"用户 {user.name} 创建成功", "user": user}

@app.post("/items/")
async def create_item(item: Item):
    item_dict = item.dict()
    if item.tax:
        price_with_tax = item.price + item.tax
        item_dict.update({"price_with_tax": price_with_tax})
    return item_dict

@app.put("/items/{item_id}")
async def update_item(
    item_id: int, 
    item: Item, 
    q: Optional[str] = None,
    timestamp: datetime = Field(default_factory=datetime.now)
):
    result = {"item_id": item_id, "item": item, "timestamp": timestamp}
    if q:
        result.update({"q": q})
    return result
```

# 二、异步编程与数据库

## （一）异步编程基础

### 1. 异步路径操作
```python
import asyncio
import aiohttp
from fastapi import FastAPI
from typing import List

app = FastAPI()

# 异步函数
@app.get("/async-example")
async def async_example():
    # 模拟异步操作
    await asyncio.sleep(1)
    return {"message": "这是一个异步操作"}

# 并发处理
@app.get("/fetch-urls")
async def fetch_multiple_urls(urls: List[str]):
    async def fetch_url(session, url):
        try:
            async with session.get(url) as response:
                return {
                    "url": url,
                    "status": response.status,
                    "content_length": len(await response.text())
                }
        except Exception as e:
            return {"url": url, "error": str(e)}
    
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
    
    return {"results": results}

# 异步生成器
@app.get("/stream-data")
async def stream_data():
    async def generate_data():
        for i in range(10):
            await asyncio.sleep(0.1)
            yield f"data chunk {i}\n"
    
    return StreamingResponse(
        generate_data(), 
        media_type="text/plain"
    )
```

### 2. 后台任务
```python
from fastapi import BackgroundTasks
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(email: str, message: str):
    """发送邮件的后台任务"""
    # 这里是发送邮件的逻辑
    print(f"发送邮件到 {email}: {message}")
    # 实际的邮件发送代码...

def write_log(message: str):
    """写入日志的后台任务"""
    with open("log.txt", "a") as log_file:
        log_file.write(f"{datetime.now()}: {message}\n")

@app.post("/send-notification/")
async def send_notification(
    email: str, 
    message: str, 
    background_tasks: BackgroundTasks
):
    # 添加后台任务
    background_tasks.add_task(send_email, email, message)
    background_tasks.add_task(write_log, f"邮件发送到 {email}")
    
    return {"message": "邮件将在后台发送"}
```

## （二）数据库集成

### 1. SQLAlchemy配置
```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

# 同步数据库
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}  # 仅SQLite需要
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 异步数据库
ASYNC_SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./test.db"
# ASYNC_SQLALCHEMY_DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"

async_engine = create_async_engine(ASYNC_SQLALCHEMY_DATABASE_URL)
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

# 依赖注入
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session
```

### 2. 数据模型
```python
# models.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    items = relationship("Item", back_populates="owner")
    posts = relationship("Post", back_populates="author")

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    is_available = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship("User", back_populates="items")

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    published = Column(Boolean, default=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    author = relationship("User", back_populates="posts")
```

### 3. Pydantic模式
```python
# schemas.py
from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional
from datetime import datetime

# 基础模式
class ItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    is_available: bool = True
    
    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('价格必须大于0')
        return v

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_available: Optional[bool] = None

class Item(ItemBase):
    id: int
    owner_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# 用户模式
class UserBase(BaseModel):
    email: EmailStr
    username: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('密码至少需要8个字符')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    is_superuser: bool
    created_at: datetime
    items: List[Item] = []
    
    class Config:
        orm_mode = True

class UserInDB(User):
    hashed_password: str

# 认证模式
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str
```

### 4. CRUD操作
```python
# crud.py
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from passlib.context import CryptContext
from typing import List, Optional
import models
import schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# 用户CRUD
class UserCRUD:
    @staticmethod
    def get_user(db: Session, user_id: int) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.email == email).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.username == username).first()
    
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
        return db.query(models.User).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_user(db: Session, user: schemas.UserCreate) -> models.User:
        hashed_password = get_password_hash(user.password)
        db_user = models.User(
            email=user.email,
            username=user.username,
            hashed_password=hashed_password,
            is_active=user.is_active
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not db_user:
            return None
        
        update_data = user_update.dict(exclude_unset=True)
        if 'password' in update_data:
            update_data['hashed_password'] = get_password_hash(update_data.pop('password'))
        
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if db_user:
            db.delete(db_user)
            db.commit()
            return True
        return False

# 异步用户CRUD
class AsyncUserCRUD:
    @staticmethod
    async def get_user(db: AsyncSession, user_id: int) -> Optional[models.User]:
        result = await db.execute(select(models.User).where(models.User.id == user_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_by_username(db: AsyncSession, username: str) -> Optional[models.User]:
        result = await db.execute(select(models.User).where(models.User.username == username))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_user(db: AsyncSession, user: schemas.UserCreate) -> models.User:
        hashed_password = get_password_hash(user.password)
        db_user = models.User(
            email=user.email,
            username=user.username,
            hashed_password=hashed_password,
            is_active=user.is_active
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

# 商品CRUD
class ItemCRUD:
    @staticmethod
    def get_items(db: Session, skip: int = 0, limit: int = 100) -> List[models.Item]:
        return db.query(models.Item).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_item(db: Session, item_id: int) -> Optional[models.Item]:
        return db.query(models.Item).filter(models.Item.id == item_id).first()
    
    @staticmethod
    def create_user_item(db: Session, item: schemas.ItemCreate, user_id: int) -> models.Item:
        db_item = models.Item(**item.dict(), owner_id=user_id)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def update_item(db: Session, item_id: int, item_update: schemas.ItemUpdate) -> Optional[models.Item]:
        db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
        if not db_item:
            return None
        
        update_data = item_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        
        db.commit()
        db.refresh(db_item)
        return db_item
```

# 三、认证与授权

## （一）JWT认证

### 1. JWT配置
```python
# auth.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import crud
import schemas
from database import get_db

# 配置
SECRET_KEY = "your-secret-key-here"  # 在生产环境中使用环境变量
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str):
    user = crud.UserCRUD.get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = crud.UserCRUD.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: schemas.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_superuser(current_user: schemas.User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user
```

### 2. 认证路由
```python
# routers/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import crud
import schemas
from database import get_db
from auth import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["认证"])

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 检查用户是否已存在
    db_user = crud.UserCRUD.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400, 
            detail="邮箱已被注册"
        )
    
    db_user = crud.UserCRUD.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=400, 
            detail="用户名已被使用"
        )
    
    return crud.UserCRUD.create_user(db=db, user=user)

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=schemas.User)
def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.UserCRUD.update_user(db, current_user.id, user_update)
```

## （二）权限控制

### 1. 基于角色的权限
```python
# permissions.py
from enum import Enum
from typing import List
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
import models
from auth import get_current_active_user
from database import get_db

class Permission(str, Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"

class Role(str, Enum):
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"
    SUPERUSER = "superuser"

# 角色权限映射
ROLE_PERMISSIONS = {
    Role.USER: [Permission.READ],
    Role.MODERATOR: [Permission.READ, Permission.WRITE],
    Role.ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE],
    Role.SUPERUSER: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN]
}

def require_permissions(required_permissions: List[Permission]):
    def permission_checker(
        current_user: models.User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
    ):
        # 超级用户拥有所有权限
        if current_user.is_superuser:
            return current_user
        
        # 检查用户角色权限
        user_role = getattr(current_user, 'role', Role.USER)
        user_permissions = ROLE_PERMISSIONS.get(user_role, [])
        
        for permission in required_permissions:
            if permission not in user_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"需要 {permission.value} 权限"
                )
        
        return current_user
    
    return permission_checker

def require_owner_or_admin(resource_owner_id: int):
    def owner_checker(
        current_user: models.User = Depends(get_current_active_user)
    ):
        if current_user.is_superuser or current_user.id == resource_owner_id:
            return current_user
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只能操作自己的资源"
        )
    
    return owner_checker

# 使用示例
@app.get("/admin/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permissions([Permission.ADMIN]))
):
    return crud.UserCRUD.get_users(db)

@app.delete("/items/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    item = crud.ItemCRUD.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    # 检查是否为所有者或管理员
    require_owner_or_admin(item.owner_id)(current_user)
    
    # 删除逻辑...
    return {"message": "删除成功"}
```

# 四、API路由与中间件

## （一）路由组织

### 1. 路由模块化
```python
# routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
from auth import get_current_active_user, get_current_superuser

router = APIRouter(
    prefix="/users",
    tags=["用户管理"],
    dependencies=[Depends(get_current_active_user)]
)

@router.get("/", response_model=List[schemas.User])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_superuser)
):
    users = crud.UserCRUD.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    # 用户只能查看自己的信息，除非是超级用户
    if user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有权限查看其他用户信息"
        )
    
    db_user = crud.UserCRUD.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    return db_user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    # 用户只能更新自己的信息，除非是超级用户
    if user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有权限修改其他用户信息"
        )
    
    db_user = crud.UserCRUD.update_user(db, user_id, user_update)
    if db_user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    return db_user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_superuser)
):
    success = crud.UserCRUD.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="用户不存在")
    return {"message": "用户删除成功"}
```

```python
# routers/items.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import crud
import schemas
from database import get_db
from auth import get_current_active_user

router = APIRouter(prefix="/items", tags=["商品管理"])

@router.get("/", response_model=List[schemas.Item])
def read_items(
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回的记录数"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    db: Session = Depends(get_db)
):
    items = crud.ItemCRUD.get_items(db, skip=skip, limit=limit)
    return items

@router.get("/{item_id}", response_model=schemas.Item)
def read_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.ItemCRUD.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="商品不存在")
    return db_item

@router.post("/", response_model=schemas.Item, status_code=status.HTTP_201_CREATED)
def create_item(
    item: schemas.ItemCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    return crud.ItemCRUD.create_user_item(db=db, item=item, user_id=current_user.id)

@router.put("/{item_id}", response_model=schemas.Item)
def update_item(
    item_id: int,
    item_update: schemas.ItemUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    # 检查商品是否存在
    db_item = crud.ItemCRUD.get_item(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    # 检查权限
    if db_item.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只能修改自己的商品"
        )
    
    updated_item = crud.ItemCRUD.update_item(db, item_id, item_update)
    return updated_item
```

### 2. 主应用配置
```python
# main.py
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import time
import logging

# 导入路由
from routers import auth, users, items
from database import engine
import models

# 创建数据库表
models.Base.metadata.create_all(bind=engine)

# 创建FastAPI应用
app = FastAPI(
    title="我的API应用",
    description="这是一个完整的FastAPI应用示例",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 信任的主机
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "*.yourdomain.com"]
)

# 包含路由
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(items.router)

# 全局异常处理
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "message": "请求数据验证失败",
            "details": exc.errors()
        }
    )

# 请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logging.info(
        f"{request.method} {request.url} - {response.status_code} - {process_time:.4f}s"
    )
    
    return response

# 健康检查
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": time.time()}

# 根路径
@app.get("/")
def read_root():
    return {
        "message": "欢迎使用我的API",
        "docs": "/docs",
        "redoc": "/redoc"
    }
```

## （二）中间件

### 1. 自定义中间件
```python
# middleware.py
import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import logging

class RequestIDMiddleware(BaseHTTPMiddleware):
    """为每个请求添加唯一ID"""
    
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        return response

class TimingMiddleware(BaseHTTPMiddleware):
    """记录请求处理时间"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """简单的速率限制中间件"""
    
    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients = {}
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = time.time()
        
        # 清理过期记录
        if client_ip in self.clients:
            self.clients[client_ip] = [
                timestamp for timestamp in self.clients[client_ip]
                if current_time - timestamp < self.period
            ]
        else:
            self.clients[client_ip] = []
        
        # 检查速率限制
        if len(self.clients[client_ip]) >= self.calls:
            return JSONResponse(
                status_code=429,
                content={"message": "请求过于频繁，请稍后再试"}
            )
        
        # 记录请求时间
        self.clients[client_ip].append(current_time)
        
        response = await call_next(request)
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """添加安全头"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

# 在main.py中使用
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, calls=100, period=60)
app.add_middleware(TimingMiddleware)
app.add_middleware(RequestIDMiddleware)
```

# 五、文件处理与WebSocket

## （一）文件上传与下载

### 1. 文件上传
```python
# routers/files.py
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Form
from fastapi.responses import FileResponse
from typing import List, Optional
import os
import shutil
import uuid
from pathlib import Path
import aiofiles
from PIL import Image
import magic

router = APIRouter(prefix="/files", tags=["文件管理"])

# 配置
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".pdf", ".txt", ".docx"}
ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/gif",
    "application/pdf", "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

def validate_file(file: UploadFile) -> bool:
    """验证文件"""
    # 检查文件扩展名
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    
    # 检查MIME类型
    if file.content_type not in ALLOWED_MIME_TYPES:
        return False
    
    return True

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None)
):
    # 验证文件
    if not validate_file(file):
        raise HTTPException(
            status_code=400,
            detail="不支持的文件类型"
        )
    
    # 检查文件大小
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"文件大小不能超过 {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # 生成唯一文件名
    file_ext = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # 保存文件
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(file_content)
    
    # 如果是图片，生成缩略图
    if file.content_type.startswith('image/'):
        try:
            thumbnail_path = UPLOAD_DIR / f"thumb_{unique_filename}"
            with Image.open(file_path) as img:
                img.thumbnail((200, 200))
                img.save(thumbnail_path)
        except Exception as e:
            logging.warning(f"生成缩略图失败: {e}")
    
    return {
        "filename": unique_filename,
        "original_filename": file.filename,
        "size": len(file_content),
        "content_type": file.content_type,
        "description": description
    }

@router.post("/upload-multiple")
async def upload_multiple_files(
    files: List[UploadFile] = File(...)
):
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="一次最多上传10个文件"
        )
    
    results = []
    for file in files:
        try:
            result = await upload_file(file)
            results.append({"success": True, "data": result})
        except HTTPException as e:
            results.append({
                "success": False, 
                "filename": file.filename,
                "error": e.detail
            })
    
    return {"results": results}

@router.get("/download/{filename}")
async def download_file(filename: str):
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/octet-stream'
    )

@router.get("/thumbnail/{filename}")
async def get_thumbnail(filename: str):
    thumbnail_path = UPLOAD_DIR / f"thumb_{filename}"
    
    if not thumbnail_path.exists():
        # 如果缩略图不存在，返回原图
        original_path = UPLOAD_DIR / filename
        if not original_path.exists():
            raise HTTPException(status_code=404, detail="文件不存在")
        return FileResponse(path=original_path)
    
    return FileResponse(path=thumbnail_path)

@router.delete("/delete/{filename}")
async def delete_file(filename: str):
    file_path = UPLOAD_DIR / filename
    thumbnail_path = UPLOAD_DIR / f"thumb_{filename}"
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")
    
    # 删除原文件
    os.remove(file_path)
    
    # 删除缩略图（如果存在）
    if thumbnail_path.exists():
        os.remove(thumbnail_path)
    
    return {"message": "文件删除成功"}
```

## （二）WebSocket实时通信

### 1. WebSocket基础
```python
# routers/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict
import json
import asyncio
from datetime import datetime

router = APIRouter()

class ConnectionManager:
    """WebSocket连接管理器"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if user_id:
            self.user_connections[user_id] = websocket
    
    def disconnect(self, websocket: WebSocket, user_id: str = None):
        self.active_connections.remove(websocket)
        if user_id and user_id in self.user_connections:
            del self.user_connections[user_id]
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def send_to_user(self, message: str, user_id: str):
        if user_id in self.user_connections:
            websocket = self.user_connections[user_id]
            await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # 连接已断开，移除它
                self.active_connections.remove(connection)

manager = ConnectionManager()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # 处理不同类型的消息
            if message_data["type"] == "chat":
                # 聊天消息
                chat_message = {
                    "type": "chat",
                    "user_id": client_id,
                    "message": message_data["message"],
                    "timestamp": datetime.now().isoformat()
                }
                await manager.broadcast(json.dumps(chat_message))
            
            elif message_data["type"] == "private":
                # 私人消息
                target_user = message_data["target_user"]
                private_message = {
                    "type": "private",
                    "from_user": client_id,
                    "message": message_data["message"],
                    "timestamp": datetime.now().isoformat()
                }
                await manager.send_to_user(json.dumps(private_message), target_user)
            
            elif message_data["type"] == "ping":
                # 心跳检测
                pong_message = {
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                }
                await manager.send_personal_message(json.dumps(pong_message), websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
        disconnect_message = {
            "type": "user_disconnect",
            "user_id": client_id,
            "timestamp": datetime.now().isoformat()
        }
        await manager.broadcast(json.dumps(disconnect_message))

# 聊天室示例
class ChatRoom:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.connections: Dict[str, WebSocket] = {}
        self.messages: List[Dict] = []
    
    async def add_user(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.connections[user_id] = websocket
        
        # 发送历史消息
        for message in self.messages[-50:]:  # 最近50条消息
            await websocket.send_text(json.dumps(message))
        
        # 通知其他用户
        join_message = {
            "type": "user_join",
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(json.dumps(join_message), exclude_user=user_id)
    
    def remove_user(self, user_id: str):
        if user_id in self.connections:
            del self.connections[user_id]
    
    async def broadcast(self, message: str, exclude_user: str = None):
        for user_id, websocket in self.connections.items():
            if user_id != exclude_user:
                try:
                    await websocket.send_text(message)
                except:
                    # 连接已断开
                    pass
    
    async def add_message(self, user_id: str, message: str):
        message_data = {
            "type": "message",
            "user_id": user_id,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        self.messages.append(message_data)
        await self.broadcast(json.dumps(message_data))

# 聊天室管理
chat_rooms: Dict[str, ChatRoom] = {}

@router.websocket("/chat/{room_id}/{user_id}")
async def chat_websocket(websocket: WebSocket, room_id: str, user_id: str):
    # 创建或获取聊天室
    if room_id not in chat_rooms:
        chat_rooms[room_id] = ChatRoom(room_id)
    
    room = chat_rooms[room_id]
    await room.add_user(user_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data["type"] == "message":
                await room.add_message(user_id, message_data["content"])
    
    except WebSocketDisconnect:
        room.remove_user(user_id)
        leave_message = {
            "type": "user_leave",
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        }
        await room.broadcast(json.dumps(leave_message))

# 实时通知系统
@router.websocket("/notifications/{user_id}")
async def notification_websocket(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # 保持连接活跃
            await asyncio.sleep(30)
            ping_message = {
                "type": "ping",
                "timestamp": datetime.now().isoformat()
            }
            await websocket.send_text(json.dumps(ping_message))
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

# 发送通知的API端点
@router.post("/send-notification")
async def send_notification(user_id: str, message: str, notification_type: str = "info"):
    notification = {
        "type": "notification",
        "notification_type": notification_type,
        "message": message,
        "timestamp": datetime.now().isoformat()
    }
    await manager.send_to_user(json.dumps(notification), user_id)
    return {"message": "通知发送成功"}

# 六、缓存与性能优化

## （一）Redis缓存

### 1. Redis配置
```python
# cache.py
import redis.asyncio as redis
import json
from typing import Optional, Any
from datetime import timedelta
import pickle

class RedisCache:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.from_url(redis_url, decode_responses=False)
    
    async def get(self, key: str) -> Optional[Any]:
        """获取缓存值"""
        try:
            value = await self.redis.get(key)
            if value:
                return pickle.loads(value)
            return None
        except Exception as e:
            print(f"缓存获取失败: {e}")
            return None
    
    async def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """设置缓存值"""
        try:
            serialized_value = pickle.dumps(value)
            await self.redis.set(key, serialized_value, ex=expire)
            return True
        except Exception as e:
            print(f"缓存设置失败: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """删除缓存"""
        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            print(f"缓存删除失败: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """检查键是否存在"""
        return await self.redis.exists(key)
    
    async def expire(self, key: str, seconds: int) -> bool:
        """设置过期时间"""
        return await self.redis.expire(key, seconds)
    
    async def clear_pattern(self, pattern: str) -> int:
        """清除匹配模式的键"""
        keys = await self.redis.keys(pattern)
        if keys:
            return await self.redis.delete(*keys)
        return 0

# 全局缓存实例
cache = RedisCache()

# 缓存装饰器
from functools import wraps
import hashlib

def cache_result(expire: int = 3600, key_prefix: str = ""):
    """缓存函数结果的装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 生成缓存键
            cache_key = f"{key_prefix}:{func.__name__}:"
            key_data = str(args) + str(sorted(kwargs.items()))
            cache_key += hashlib.md5(key_data.encode()).hexdigest()
            
            # 尝试从缓存获取
            cached_result = await cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # 执行函数并缓存结果
            result = await func(*args, **kwargs)
            await cache.set(cache_key, result, expire)
            return result
        
        return wrapper
    return decorator
```

### 2. 缓存使用示例
```python
# 在路由中使用缓存
from cache import cache, cache_result

@router.get("/items/", response_model=List[schemas.Item])
@cache_result(expire=300, key_prefix="items")
async def get_cached_items(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return crud.ItemCRUD.get_items(db, skip=skip, limit=limit)

@router.get("/users/{user_id}", response_model=schemas.User)
async def get_user_with_cache(
    user_id: int, 
    db: Session = Depends(get_db)
):
    # 手动缓存控制
    cache_key = f"user:{user_id}"
    
    # 尝试从缓存获取
    cached_user = await cache.get(cache_key)
    if cached_user:
        return cached_user
    
    # 从数据库获取
    db_user = crud.UserCRUD.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 缓存用户数据
    user_data = schemas.User.from_orm(db_user)
    await cache.set(cache_key, user_data.dict(), expire=1800)
    
    return user_data

# 缓存失效
@router.put("/users/{user_id}", response_model=schemas.User)
async def update_user_with_cache_invalidation(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db)
):
    # 更新用户
    updated_user = crud.UserCRUD.update_user(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 清除相关缓存
    await cache.delete(f"user:{user_id}")
    await cache.clear_pattern(f"users:*")
    
    return updated_user
```

## （二）数据库优化

### 1. 连接池配置
```python
# database.py (优化版)
from sqlalchemy import create_engine, event
from sqlalchemy.pool import QueuePool
from sqlalchemy.ext.asyncio import create_async_engine

# 同步引擎配置
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,          # 连接池大小
    max_overflow=30,       # 最大溢出连接数
    pool_pre_ping=True,    # 连接前检查
    pool_recycle=3600,     # 连接回收时间
    echo=False             # 生产环境关闭SQL日志
)

# 异步引擎配置
async_engine = create_async_engine(
    ASYNC_SQLALCHEMY_DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600
)

# 数据库事件监听
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if 'sqlite' in SQLALCHEMY_DATABASE_URL:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA cache_size=10000")
        cursor.close()
```

### 2. 查询优化
```python
# crud.py (优化版)
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import func, and_, or_

class OptimizedUserCRUD:
    @staticmethod
    def get_user_with_items(db: Session, user_id: int):
        """使用预加载获取用户及其商品"""
        return db.query(models.User).options(
            selectinload(models.User.items)
        ).filter(models.User.id == user_id).first()
    
    @staticmethod
    def get_users_with_pagination(db: Session, page: int = 1, per_page: int = 20):
        """分页查询用户"""
        offset = (page - 1) * per_page
        
        users = db.query(models.User).offset(offset).limit(per_page).all()
        total = db.query(func.count(models.User.id)).scalar()
        
        return {
            "users": users,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page
        }
    
    @staticmethod
    def search_users(db: Session, search_term: str, skip: int = 0, limit: int = 100):
        """搜索用户"""
        return db.query(models.User).filter(
            or_(
                models.User.username.ilike(f"%{search_term}%"),
                models.User.email.ilike(f"%{search_term}%")
            )
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_active_users_count(db: Session):
        """获取活跃用户数量"""
        return db.query(func.count(models.User.id)).filter(
            models.User.is_active == True
        ).scalar()

# 批量操作
class BatchOperations:
    @staticmethod
    def bulk_create_items(db: Session, items_data: List[dict], user_id: int):
        """批量创建商品"""
        items = [models.Item(**item_data, owner_id=user_id) for item_data in items_data]
        db.bulk_save_objects(items)
        db.commit()
        return len(items)
    
    @staticmethod
    def bulk_update_items(db: Session, updates: List[dict]):
        """批量更新商品"""
        db.bulk_update_mappings(models.Item, updates)
        db.commit()
```

# 七、测试

## （一）单元测试

### 1. 测试配置
```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import get_db, Base
import models

# 测试数据库
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session):
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "hashed_password": "hashedpassword",
        "is_active": True
    }
    user = models.User(**user_data)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
```

### 2. API测试
```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient

def test_read_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_create_user(client: TestClient):
    user_data = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "password123",
        "is_active": True
    }
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == user_data["username"]
    assert data["email"] == user_data["email"]
    assert "id" in data

def test_login(client: TestClient, test_user):
    login_data = {
        "username": "testuser",
        "password": "password123"
    }
    response = client.post("/auth/token", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_protected_route(client: TestClient, test_user):
    # 先登录获取token
    login_data = {
        "username": "testuser",
        "password": "password123"
    }
    login_response = client.post("/auth/token", data=login_data)
    token = login_response.json()["access_token"]
    
    # 使用token访问受保护的路由
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"

def test_create_item(client: TestClient, test_user):
    # 登录获取token
    login_data = {
        "username": "testuser",
        "password": "password123"
    }
    login_response = client.post("/auth/token", data=login_data)
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 创建商品
    item_data = {
        "title": "测试商品",
        "description": "这是一个测试商品",
        "price": 99.99,
        "is_available": True
    }
    response = client.post("/items/", json=item_data, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == item_data["title"]
    assert data["price"] == item_data["price"]

def test_validation_error(client: TestClient):
    # 测试数据验证错误
    invalid_user_data = {
        "username": "",  # 空用户名
        "email": "invalid-email",  # 无效邮箱
        "password": "123"  # 密码太短
    }
    response = client.post("/auth/register", json=invalid_user_data)
    assert response.status_code == 422
```

## （二）异步测试

### 1. 异步测试配置
```python
# tests/test_async.py
import pytest
import asyncio
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_async_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_websocket():
    from fastapi.testclient import TestClient
    
    client = TestClient(app)
    with client.websocket_connect("/ws/test_client") as websocket:
        # 发送消息
        test_message = {
            "type": "chat",
            "message": "Hello WebSocket!"
        }
        websocket.send_json(test_message)
        
        # 接收响应
        data = websocket.receive_json()
        assert data["type"] == "chat"
        assert data["user_id"] == "test_client"
        assert data["message"] == "Hello WebSocket!"

@pytest.mark.asyncio
async def test_background_task():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/send-notification/", params={
            "email": "test@example.com",
            "message": "Test notification"
        })
    assert response.status_code == 200
    assert "邮件将在后台发送" in response.json()["message"]
```

# 八、部署与配置

## （一）Docker部署

### 1. Dockerfile
```dockerfile
# Dockerfile
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建非root用户
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. docker-compose.yml
```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/fastapi_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=fastapi_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web

volumes:
  postgres_data:
  redis_data:
```

### 3. 生产环境配置
```python
# config.py
from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # 应用配置
    app_name: str = "FastAPI应用"
    debug: bool = False
    version: str = "1.0.0"
    
    # 数据库配置
    database_url: str
    async_database_url: Optional[str] = None
    
    # Redis配置
    redis_url: str = "redis://localhost:6379"
    
    # JWT配置
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # 邮件配置
    smtp_server: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    
    # 文件上传配置
    upload_dir: str = "uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    
    # CORS配置
    allowed_origins: list = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## （二）性能监控

### 1. 监控中间件
```python
# monitoring.py
import time
import psutil
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import logging

# Prometheus指标
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Active connections')
MEMORY_USAGE = Gauge('memory_usage_bytes', 'Memory usage in bytes')
CPU_USAGE = Gauge('cpu_usage_percent', 'CPU usage percentage')

class MonitoringMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # 增加活跃连接数
        ACTIVE_CONNECTIONS.inc()
        
        try:
            response = await call_next(request)
            
            # 记录指标
            duration = time.time() - start_time
            REQUEST_DURATION.observe(duration)
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.url.path,
                status=response.status_code
            ).inc()
            
            return response
        
        finally:
            # 减少活跃连接数
            ACTIVE_CONNECTIONS.dec()

# 系统指标收集
async def collect_system_metrics():
    while True:
        # 内存使用
        memory = psutil.virtual_memory()
        MEMORY_USAGE.set(memory.used)
        
        # CPU使用
        cpu_percent = psutil.cpu_percent(interval=1)
        CPU_USAGE.set(cpu_percent)
        
        await asyncio.sleep(10)

# 指标端点
@app.get("/metrics")
def get_metrics():
    return Response(generate_latest(), media_type="text/plain")
```

# 九、最佳实践与总结

## （一）最佳实践

### 1. 项目结构
```
fastapi_project/
├── app/
│   ├── __init__.py
│   ├── main.py              # 应用入口
│   ├── config.py            # 配置文件
│   ├── database.py          # 数据库配置
│   ├── models/              # 数据模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── item.py
│   ├── schemas/             # Pydantic模式
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── item.py
│   ├── crud/                # CRUD操作
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── item.py
│   ├── routers/             # 路由模块
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   └── items.py
│   ├── middleware/          # 中间件
│   │   ├── __init__.py
│   │   └── auth.py
│   ├── utils/               # 工具函数
│   │   ├── __init__.py
│   │   ├── security.py
│   │   └── email.py
│   └── tests/               # 测试文件
│       ├── __init__.py
│       ├── conftest.py
│       └── test_api.py
├── requirements.txt         # 依赖文件
├── Dockerfile              # Docker配置
├── docker-compose.yml      # Docker Compose配置
├── .env                    # 环境变量
├── .gitignore             # Git忽略文件
└── README.md              # 项目说明
```

### 2. 代码质量
```python
# 使用类型提示
from typing import List, Optional, Union

def get_users(skip: int = 0, limit: int = 100) -> List[User]:
    pass

# 使用Pydantic进行数据验证
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)

# 错误处理
try:
    result = await some_async_operation()
except SpecificException as e:
    logger.error(f"操作失败: {e}")
    raise HTTPException(status_code=500, detail="内部服务器错误")

# 使用依赖注入
def get_current_user(token: str = Depends(oauth2_scheme)):
    # 验证逻辑
    pass

@app.get("/protected")
def protected_route(current_user: User = Depends(get_current_user)):
    return {"user": current_user}
```

### 3. 安全实践
```python
# 环境变量管理
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

# 输入验证
from pydantic import validator

class UserInput(BaseModel):
    username: str
    
    @validator('username')
    def validate_username(cls, v):
        if not v.isalnum():
            raise ValueError('用户名只能包含字母和数字')
        return v

# SQL注入防护（使用ORM）
# 好的做法
user = db.query(User).filter(User.id == user_id).first()

# 避免的做法
# query = f"SELECT * FROM users WHERE id = {user_id}"  # 危险！

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # 具体域名
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # 具体方法
    allow_headers=["*"],
)
```

## （二）总结

FastAPI是一个功能强大、性能优异的现代Python Web框架，具有以下优势：

### 主要特点
1. **高性能**：基于Starlette和Pydantic，性能接近NodeJS和Go
2. **快速开发**：自动API文档生成，减少开发时间
3. **类型安全**：基于Python类型提示，提供完整的IDE支持
4. **异步支持**：原生支持async/await，适合高并发场景
5. **标准化**：遵循OpenAPI和JSON Schema标准

### 适用场景
- **API开发**：RESTful API、GraphQL API
- **微服务**：轻量级、高性能的微服务架构
- **实时应用**：WebSocket支持，适合聊天、通知等实时功能
- **数据处理**：异步处理大量数据请求
- **原型开发**：快速构建MVP和原型

### 学习建议
1. **基础知识**：掌握Python异步编程、HTTP协议、REST API设计
2. **实践项目**：从简单的CRUD应用开始，逐步增加复杂功能
3. **生态系统**：学习SQLAlchemy、Pydantic、Starlette等相关技术
4. **部署运维**：掌握Docker、Nginx、监控等部署技术
5. **最佳实践**：关注代码质量、安全性、性能优化

FastAPI为Python Web开发带来了新的可能性，其现代化的设计理念和优秀的性能表现，使其成为构建现代Web应用的理想选择。通过合理的架构设计和最佳实践，可以构建出高质量、可维护的Web应用。