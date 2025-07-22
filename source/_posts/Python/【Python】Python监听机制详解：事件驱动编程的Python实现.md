---
title: 【Python】Python监听机制详解：事件驱动编程的Python实现
categories: Python
date: 2025-01-22
tags:
  - Python
  - 监听器
  - 事件驱动
  - 观察者模式
  - 异步编程
  - 装饰器
---

# 前言

Python作为一门灵活的动态语言，提供了多种实现监听机制的方式。从传统的观察者模式到现代的异步事件处理，Python的监听机制在Web开发、GUI编程、数据处理等领域都有广泛应用。本文将深入探讨Python中实现监听的各种方法，包括装饰器、描述符、异步编程等Python特有的实现方式。

监听机制让我们能够在特定事件发生时自动执行相应的处理函数，这种解耦的设计模式使得代码更加模块化和可维护。Python的动态特性为实现监听机制提供了更多的可能性和灵活性。

> **相关文章导航**：
> - [Java监听机制详解：事件驱动编程的核心实现](./【Java】Java监听机制详解：事件驱动编程的核心实现.md)
> - [Python装饰器深度解析：从基础到高级应用](./【Python】Python装饰器深度解析：从基础到高级应用.md)
> - [Python异步编程详解：asyncio与并发处理](./【Python】Python异步编程详解：asyncio与并发处理.md)

# 一、Python监听机制基础

## （一）监听机制的核心概念

在Python中，监听机制通常包含以下组件：

- **事件源（Event Source）**：触发事件的对象
- **事件（Event）**：描述发生了什么的数据结构
- **监听器（Listener）**：处理事件的函数或对象
- **事件管理器（Event Manager）**：管理监听器注册和事件分发

## （二）Python实现监听的优势

- **动态性**：可以在运行时动态添加和移除监听器
- **装饰器支持**：使用装饰器简化监听器注册
- **函数式编程**：支持函数作为一等公民
- **异步支持**：内置异步编程支持
- **元编程**：利用元类和描述符实现高级功能

# 二、基础观察者模式实现

## （一）简单观察者模式

```python
from typing import List, Callable, Any
from abc import ABC, abstractmethod

class Observer(ABC):
    """观察者抽象基类"""
    
    @abstractmethod
    def update(self, event_data: Any) -> None:
        """处理事件更新"""
        pass

class Subject:
    """被观察者（事件源）"""
    
    def __init__(self):
        self._observers: List[Observer] = []
        self._state = None
    
    def attach(self, observer: Observer) -> None:
        """添加观察者"""
        if observer not in self._observers:
            self._observers.append(observer)
            print(f"观察者 {observer.__class__.__name__} 已添加")
    
    def detach(self, observer: Observer) -> None:
        """移除观察者"""
        if observer in self._observers:
            self._observers.remove(observer)
            print(f"观察者 {observer.__class__.__name__} 已移除")
    
    def notify(self, event_data: Any = None) -> None:
        """通知所有观察者"""
        print(f"通知 {len(self._observers)} 个观察者")
        for observer in self._observers:
            observer.update(event_data or self._state)
    
    def set_state(self, state: Any) -> None:
        """设置状态并通知观察者"""
        print(f"状态从 {self._state} 变更为 {state}")
        self._state = state
        self.notify()
    
    @property
    def state(self) -> Any:
        return self._state

# 具体观察者实现
class ConcreteObserver(Observer):
    def __init__(self, name: str):
        self.name = name
    
    def update(self, event_data: Any) -> None:
        print(f"{self.name} 收到更新: {event_data}")

class LogObserver(Observer):
    def update(self, event_data: Any) -> None:
        print(f"[LOG] 记录状态变更: {event_data}")

class EmailObserver(Observer):
    def update(self, event_data: Any) -> None:
        print(f"[EMAIL] 发送邮件通知: {event_data}")

# 使用示例
def basic_observer_demo():
    # 创建被观察者
    subject = Subject()
    
    # 创建观察者
    observer1 = ConcreteObserver("观察者1")
    observer2 = ConcreteObserver("观察者2")
    log_observer = LogObserver()
    email_observer = EmailObserver()
    
    # 注册观察者
    subject.attach(observer1)
    subject.attach(observer2)
    subject.attach(log_observer)
    subject.attach(email_observer)
    
    # 触发状态变更
    subject.set_state("运行中")
    subject.set_state("已停止")
    
    # 移除观察者
    subject.detach(observer1)
    subject.set_state("重新启动")

if __name__ == "__main__":
    basic_observer_demo()
```

## （二）函数式观察者模式

Python的函数式特性让我们可以用更简洁的方式实现观察者模式：

```python
from typing import List, Callable, Any, Dict
from collections import defaultdict

class FunctionalEventManager:
    """函数式事件管理器"""
    
    def __init__(self):
        self._listeners: Dict[str, List[Callable]] = defaultdict(list)
    
    def on(self, event_type: str, callback: Callable) -> None:
        """注册事件监听器"""
        self._listeners[event_type].append(callback)
        print(f"监听器已注册到事件: {event_type}")
    
    def off(self, event_type: str, callback: Callable) -> None:
        """移除事件监听器"""
        if callback in self._listeners[event_type]:
            self._listeners[event_type].remove(callback)
            print(f"监听器已从事件 {event_type} 移除")
    
    def emit(self, event_type: str, *args, **kwargs) -> None:
        """触发事件"""
        listeners = self._listeners.get(event_type, [])
        print(f"触发事件 {event_type}，通知 {len(listeners)} 个监听器")
        
        for listener in listeners:
            try:
                listener(*args, **kwargs)
            except Exception as e:
                print(f"监听器执行错误: {e}")
    
    def once(self, event_type: str, callback: Callable) -> None:
        """注册一次性监听器"""
        def wrapper(*args, **kwargs):
            callback(*args, **kwargs)
            self.off(event_type, wrapper)
        
        self.on(event_type, wrapper)

# 使用示例
def functional_observer_demo():
    event_manager = FunctionalEventManager()
    
    # 使用lambda表达式注册监听器
    event_manager.on('user_login', lambda user: print(f"用户 {user} 已登录"))
    event_manager.on('user_login', lambda user: print(f"记录登录日志: {user}"))
    
    # 使用普通函数注册监听器
    def send_welcome_email(user):
        print(f"发送欢迎邮件给: {user}")
    
    def update_last_login(user):
        print(f"更新用户 {user} 的最后登录时间")
    
    event_manager.on('user_login', send_welcome_email)
    event_manager.on('user_login', update_last_login)
    
    # 注册一次性监听器
    event_manager.once('user_login', lambda user: print(f"首次登录奖励发放给: {user}"))
    
    # 触发事件
    event_manager.emit('user_login', '张三')
    print("\n--- 第二次登录 ---")
    event_manager.emit('user_login', '张三')  # 一次性监听器不会再执行

if __name__ == "__main__":
    functional_observer_demo()
```

# 三、装饰器实现监听机制

## （一）基于装饰器的事件监听

Python的装饰器为实现监听机制提供了优雅的语法：

```python
from functools import wraps
from typing import Dict, List, Callable, Any
import inspect

class EventDecorator:
    """基于装饰器的事件系统"""
    
    def __init__(self):
        self._listeners: Dict[str, List[Callable]] = defaultdict(list)
        self._event_data: Dict[str, Any] = {}
    
    def listen(self, event_type: str):
        """监听器装饰器"""
        def decorator(func: Callable) -> Callable:
            self._listeners[event_type].append(func)
            
            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            
            # 为函数添加事件类型属性
            wrapper._event_type = event_type
            return wrapper
        
        return decorator
    
    def trigger(self, event_type: str, *args, **kwargs) -> List[Any]:
        """触发事件"""
        results = []
        listeners = self._listeners.get(event_type, [])
        
        print(f"触发事件: {event_type}")
        for listener in listeners:
            try:
                result = listener(*args, **kwargs)
                results.append(result)
            except Exception as e:
                print(f"监听器 {listener.__name__} 执行失败: {e}")
        
        return results
    
    def before(self, func_name: str):
        """方法执行前的监听器"""
        return self.listen(f"before_{func_name}")
    
    def after(self, func_name: str):
        """方法执行后的监听器"""
        return self.listen(f"after_{func_name}")

# 全局事件管理器
events = EventDecorator()

# 使用装饰器注册监听器
@events.listen('user_created')
def log_user_creation(user_data):
    print(f"[LOG] 用户创建: {user_data['name']}")

@events.listen('user_created')
def send_welcome_email(user_data):
    print(f"[EMAIL] 发送欢迎邮件到: {user_data['email']}")

@events.listen('user_created')
def setup_user_profile(user_data):
    print(f"[PROFILE] 为用户 {user_data['name']} 创建默认配置")

@events.before('process_order')
def validate_order(order_data):
    print(f"[VALIDATION] 验证订单: {order_data['order_id']}")

@events.after('process_order')
def send_confirmation(order_data):
    print(f"[CONFIRMATION] 发送订单确认: {order_data['order_id']}")

# 业务逻辑类
class UserService:
    def create_user(self, name: str, email: str) -> dict:
        user_data = {'name': name, 'email': email, 'id': 12345}
        print(f"创建用户: {name}")
        
        # 触发用户创建事件
        events.trigger('user_created', user_data)
        
        return user_data

class OrderService:
    def process_order(self, order_id: str, amount: float) -> dict:
        order_data = {'order_id': order_id, 'amount': amount}
        
        # 触发前置事件
        events.trigger('before_process_order', order_data)
        
        # 处理订单逻辑
        print(f"处理订单: {order_id}, 金额: {amount}")
        
        # 触发后置事件
        events.trigger('after_process_order', order_data)
        
        return order_data

# 使用示例
def decorator_demo():
    user_service = UserService()
    order_service = OrderService()
    
    # 创建用户，触发相关事件
    user_service.create_user("张三", "zhangsan@example.com")
    
    print("\n" + "="*50 + "\n")
    
    # 处理订单，触发前后事件
    order_service.process_order("ORDER001", 299.99)

if __name__ == "__main__":
    decorator_demo()
```

## （二）方法监听装饰器

创建可以监听特定方法调用的装饰器：

```python
from functools import wraps
from typing import Callable, Any, Dict
import time

class MethodListener:
    """方法监听器"""
    
    def __init__(self):
        self._method_listeners: Dict[str, List[Callable]] = defaultdict(list)
    
    def on_method_call(self, method_name: str):
        """注册方法调用监听器"""
        def decorator(listener_func: Callable) -> Callable:
            self._method_listeners[method_name].append(listener_func)
            return listener_func
        return decorator
    
    def monitored_method(self, func: Callable) -> Callable:
        """被监控的方法装饰器"""
        @wraps(func)
        def wrapper(*args, **kwargs):
            method_name = func.__name__
            
            # 执行前监听
            self._notify_listeners(f"before_{method_name}", func, args, kwargs)
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                
                # 执行后监听
                self._notify_listeners(f"after_{method_name}", func, args, kwargs, 
                                     result=result, execution_time=execution_time)
                return result
            
            except Exception as e:
                execution_time = time.time() - start_time
                # 异常监听
                self._notify_listeners(f"error_{method_name}", func, args, kwargs, 
                                     error=e, execution_time=execution_time)
                raise
        
        return wrapper
    
    def _notify_listeners(self, event_type: str, func: Callable, args: tuple, 
                         kwargs: dict, **extra_data):
        """通知监听器"""
        listeners = self._method_listeners.get(event_type, [])
        for listener in listeners:
            try:
                listener(func, args, kwargs, **extra_data)
            except Exception as e:
                print(f"监听器执行错误: {e}")

# 创建全局监听器
method_listener = MethodListener()

# 注册监听器
@method_listener.on_method_call('before_calculate')
def log_calculation_start(func, args, kwargs):
    print(f"[LOG] 开始计算: {func.__name__}, 参数: {args}")

@method_listener.on_method_call('after_calculate')
def log_calculation_end(func, args, kwargs, result=None, execution_time=None):
    print(f"[LOG] 计算完成: 结果={result}, 耗时={execution_time:.4f}秒")

@method_listener.on_method_call('error_calculate')
def log_calculation_error(func, args, kwargs, error=None, execution_time=None):
    print(f"[ERROR] 计算失败: {error}, 耗时={execution_time:.4f}秒")

@method_listener.on_method_call('before_save_data')
def validate_data(func, args, kwargs):
    print(f"[VALIDATION] 验证数据: {args[1] if len(args) > 1 else 'N/A'}")

@method_listener.on_method_call('after_save_data')
def backup_data(func, args, kwargs, result=None, execution_time=None):
    print(f"[BACKUP] 备份数据完成")

# 业务类
class Calculator:
    @method_listener.monitored_method
    def calculate(self, expression: str) -> float:
        """计算表达式"""
        print(f"正在计算: {expression}")
        # 模拟计算过程
        time.sleep(0.1)
        
        if "error" in expression:
            raise ValueError("计算错误")
        
        return eval(expression)  # 注意：实际项目中不要使用eval

class DataService:
    @method_listener.monitored_method
    def save_data(self, data: dict) -> bool:
        """保存数据"""
        print(f"保存数据: {data}")
        time.sleep(0.05)
        return True

# 使用示例
def method_listener_demo():
    calc = Calculator()
    data_service = DataService()
    
    # 正常计算
    result = calc.calculate("2 + 3 * 4")
    print(f"计算结果: {result}\n")
    
    # 保存数据
    data_service.save_data({"name": "test", "value": 123})
    print()
    
    # 错误计算
    try:
        calc.calculate("error + 1")
    except ValueError:
        print("捕获到计算错误\n")

if __name__ == "__main__":
    method_listener_demo()

# 四、描述符实现属性监听

## （一）属性变更监听

使用Python的描述符协议可以实现属性变更的监听：

```python
from typing import Any, Callable, List, Dict

class ObservableProperty:
    """可观察的属性描述符"""

    def __init__(self, initial_value: Any = None):
        self.initial_value = initial_value
        self.listeners: List[Callable] = []
        self.name = None

    def __set_name__(self, owner, name):
        self.name = name
        self.private_name = f'_{name}'

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name, self.initial_value)

    def __set__(self, obj, value):
        old_value = getattr(obj, self.private_name, self.initial_value)
        setattr(obj, self.private_name, value)

        # 通知所有监听器
        for listener in self.listeners:
            try:
                listener(obj, self.name, old_value, value)
            except Exception as e:
                print(f"属性监听器执行错误: {e}")

    def add_listener(self, listener: Callable):
        """添加属性变更监听器"""
        self.listeners.append(listener)

    def remove_listener(self, listener: Callable):
        """移除属性变更监听器"""
        if listener in self.listeners:
            self.listeners.remove(listener)

class ObservableObject:
    """可观察对象基类"""

    def __init__(self):
        self._property_listeners: Dict[str, List[Callable]] = defaultdict(list)

    def add_property_listener(self, property_name: str, listener: Callable):
        """为特定属性添加监听器"""
        prop = getattr(self.__class__, property_name, None)
        if isinstance(prop, ObservableProperty):
            prop.add_listener(listener)
        else:
            print(f"属性 {property_name} 不是可观察属性")

    def remove_property_listener(self, property_name: str, listener: Callable):
        """移除特定属性的监听器"""
        prop = getattr(self.__class__, property_name, None)
        if isinstance(prop, ObservableProperty):
            prop.remove_listener(listener)

# 使用示例
class User(ObservableObject):
    name = ObservableProperty("")
    age = ObservableProperty(0)
    email = ObservableProperty("")

    def __init__(self, name: str = "", age: int = 0, email: str = ""):
        super().__init__()
        self.name = name
        self.age = age
        self.email = email

# 监听器函数
def log_property_change(obj, prop_name, old_value, new_value):
    print(f"[LOG] {obj.__class__.__name__}.{prop_name}: {old_value} -> {new_value}")

def validate_age(obj, prop_name, old_value, new_value):
    if prop_name == 'age' and new_value < 0:
        print(f"[WARNING] 年龄不能为负数: {new_value}")

def send_email_notification(obj, prop_name, old_value, new_value):
    if prop_name == 'email' and old_value != new_value:
        print(f"[EMAIL] 邮箱变更通知发送到: {new_value}")

# 使用示例
def property_listener_demo():
    user = User("张三", 25, "zhangsan@example.com")

    # 添加监听器
    user.add_property_listener('name', log_property_change)
    user.add_property_listener('age', log_property_change)
    user.add_property_listener('age', validate_age)
    user.add_property_listener('email', log_property_change)
    user.add_property_listener('email', send_email_notification)

    print("=== 属性变更测试 ===")
    user.name = "李四"
    user.age = 30
    user.age = -5  # 触发验证警告
    user.email = "lisi@example.com"

if __name__ == "__main__":
    property_listener_demo()
```

## （二）类级别的属性监听

实现更高级的类级别属性监听：

```python
class PropertyChangeEvent:
    """属性变更事件"""

    def __init__(self, obj, property_name: str, old_value: Any, new_value: Any):
        self.obj = obj
        self.property_name = property_name
        self.old_value = old_value
        self.new_value = new_value
        self.timestamp = time.time()

class ObservableMeta(type):
    """可观察对象的元类"""

    def __new__(mcs, name, bases, namespace):
        # 收集所有ObservableProperty
        observable_props = {}
        for key, value in namespace.items():
            if isinstance(value, ObservableProperty):
                observable_props[key] = value

        cls = super().__new__(mcs, name, bases, namespace)
        cls._observable_properties = observable_props
        cls._class_listeners = defaultdict(list)

        return cls

    def add_class_listener(cls, property_name: str, listener: Callable):
        """为类的所有实例添加属性监听器"""
        cls._class_listeners[property_name].append(listener)

        # 为已存在的属性添加监听器
        if property_name in cls._observable_properties:
            cls._observable_properties[property_name].add_listener(
                lambda obj, prop, old, new: listener(PropertyChangeEvent(obj, prop, old, new))
            )

class AdvancedObservableObject(metaclass=ObservableMeta):
    """高级可观察对象"""

    def __init__(self):
        self._instance_listeners: Dict[str, List[Callable]] = defaultdict(list)

    def add_listener(self, property_name: str, listener: Callable):
        """为实例添加属性监听器"""
        self._instance_listeners[property_name].append(listener)

        prop = getattr(self.__class__, property_name, None)
        if isinstance(prop, ObservableProperty):
            prop.add_listener(
                lambda obj, prop, old, new: listener(PropertyChangeEvent(obj, prop, old, new))
            )

# 使用示例
class Product(AdvancedObservableObject):
    name = ObservableProperty("")
    price = ObservableProperty(0.0)
    stock = ObservableProperty(0)

    def __init__(self, name: str, price: float, stock: int):
        super().__init__()
        self.name = name
        self.price = price
        self.stock = stock

# 类级别监听器
def log_price_change(event: PropertyChangeEvent):
    print(f"[PRICE LOG] 产品 {event.obj.name} 价格变更: {event.old_value} -> {event.new_value}")

def stock_alert(event: PropertyChangeEvent):
    if event.new_value < 10:
        print(f"[ALERT] 产品 {event.obj.name} 库存不足: {event.new_value}")

# 注册类级别监听器
Product.add_class_listener('price', log_price_change)
Product.add_class_listener('stock', stock_alert)

def advanced_property_demo():
    product1 = Product("笔记本电脑", 5999.0, 50)
    product2 = Product("鼠标", 99.0, 5)

    print("=== 类级别监听器测试 ===")
    product1.price = 5499.0  # 触发价格变更日志
    product2.stock = 3       # 触发库存警告

    # 实例级别监听器
    def custom_listener(event: PropertyChangeEvent):
        print(f"[CUSTOM] {event.obj.name} 的 {event.property_name} 变更了")

    product1.add_listener('name', custom_listener)
    product1.name = "游戏笔记本"

if __name__ == "__main__":
    advanced_property_demo()
```

# 五、异步事件处理

## （一）基于asyncio的异步监听

Python的异步编程为事件处理提供了强大的支持：

```python
import asyncio
from typing import List, Callable, Awaitable, Union
from collections import defaultdict
import time

class AsyncEventManager:
    """异步事件管理器"""

    def __init__(self):
        self._listeners: Dict[str, List[Union[Callable, Awaitable]]] = defaultdict(list)
        self._running = False
        self._event_queue = asyncio.Queue()

    def on(self, event_type: str, callback: Union[Callable, Awaitable]):
        """注册异步监听器"""
        self._listeners[event_type].append(callback)

    async def emit(self, event_type: str, *args, **kwargs):
        """异步触发事件"""
        listeners = self._listeners.get(event_type, [])

        if not listeners:
            return

        print(f"异步触发事件: {event_type}")

        # 创建所有监听器的任务
        tasks = []
        for listener in listeners:
            if asyncio.iscoroutinefunction(listener):
                task = asyncio.create_task(listener(*args, **kwargs))
            else:
                # 将同步函数包装为异步
                task = asyncio.create_task(self._run_sync_in_executor(listener, *args, **kwargs))
            tasks.append(task)

        # 等待所有任务完成
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 处理异常
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"监听器 {i} 执行失败: {result}")

        return results

    async def _run_sync_in_executor(self, func: Callable, *args, **kwargs):
        """在执行器中运行同步函数"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: func(*args, **kwargs))

    async def emit_and_wait(self, event_type: str, timeout: float = None, *args, **kwargs):
        """触发事件并等待完成，支持超时"""
        try:
            return await asyncio.wait_for(
                self.emit(event_type, *args, **kwargs),
                timeout=timeout
            )
        except asyncio.TimeoutError:
            print(f"事件 {event_type} 处理超时")
            return None

# 异步监听器示例
async def async_log_handler(message: str):
    """异步日志处理器"""
    await asyncio.sleep(0.1)  # 模拟异步I/O操作
    print(f"[ASYNC LOG] {message}")

async def async_email_handler(message: str):
    """异步邮件处理器"""
    await asyncio.sleep(0.2)  # 模拟发送邮件
    print(f"[ASYNC EMAIL] 发送邮件: {message}")

def sync_cache_handler(message: str):
    """同步缓存处理器"""
    time.sleep(0.05)  # 模拟缓存操作
    print(f"[SYNC CACHE] 更新缓存: {message}")

async def async_database_handler(message: str):
    """异步数据库处理器"""
    await asyncio.sleep(0.15)  # 模拟数据库操作
    print(f"[ASYNC DB] 保存到数据库: {message}")

# 使用示例
async def async_event_demo():
    event_manager = AsyncEventManager()

    # 注册各种类型的监听器
    event_manager.on('user_action', async_log_handler)
    event_manager.on('user_action', async_email_handler)
    event_manager.on('user_action', sync_cache_handler)
    event_manager.on('user_action', async_database_handler)

    print("=== 异步事件处理测试 ===")
    start_time = time.time()

    # 触发事件
    await event_manager.emit('user_action', "用户登录")

    end_time = time.time()
    print(f"总耗时: {end_time - start_time:.3f}秒")

    print("\n=== 超时测试 ===")

    # 添加一个耗时的监听器
    async def slow_handler(message: str):
        await asyncio.sleep(2)
        print(f"[SLOW] 慢处理器: {message}")

    event_manager.on('slow_event', slow_handler)

    # 测试超时
    await event_manager.emit_and_wait('slow_event', timeout=1.0, message="超时测试")

if __name__ == "__main__":
    asyncio.run(async_event_demo())
```

## （二）事件队列和批处理

实现事件队列和批处理机制：

```python
import asyncio
from dataclasses import dataclass
from typing import List, Dict, Any
from datetime import datetime
import json

@dataclass
class Event:
    """事件数据类"""
    type: str
    data: Dict[str, Any]
    timestamp: datetime
    id: str = None

    def __post_init__(self):
        if self.id is None:
            self.id = f"{self.type}_{int(self.timestamp.timestamp() * 1000)}"

class EventQueue:
    """事件队列处理器"""

    def __init__(self, batch_size: int = 10, batch_timeout: float = 1.0):
        self.batch_size = batch_size
        self.batch_timeout = batch_timeout
        self._queue = asyncio.Queue()
        self._listeners: Dict[str, List[Callable]] = defaultdict(list)
        self._running = False
        self._batch_task = None

    def add_listener(self, event_type: str, handler: Callable):
        """添加事件监听器"""
        self._listeners[event_type].append(handler)

    async def put(self, event: Event):
        """添加事件到队列"""
        await self._queue.put(event)

    async def start(self):
        """启动事件处理"""
        if self._running:
            return

        self._running = True
        self._batch_task = asyncio.create_task(self._process_batch())
        print("事件队列处理器已启动")

    async def stop(self):
        """停止事件处理"""
        self._running = False
        if self._batch_task:
            self._batch_task.cancel()
            try:
                await self._batch_task
            except asyncio.CancelledError:
                pass
        print("事件队列处理器已停止")

    async def _process_batch(self):
        """批处理事件"""
        while self._running:
            batch = []

            try:
                # 收集批次事件
                end_time = asyncio.get_event_loop().time() + self.batch_timeout

                while len(batch) < self.batch_size and asyncio.get_event_loop().time() < end_time:
                    try:
                        remaining_time = end_time - asyncio.get_event_loop().time()
                        if remaining_time <= 0:
                            break

                        event = await asyncio.wait_for(self._queue.get(), timeout=remaining_time)
                        batch.append(event)
                    except asyncio.TimeoutError:
                        break

                if batch:
                    await self._handle_batch(batch)

            except Exception as e:
                print(f"批处理错误: {e}")

    async def _handle_batch(self, events: List[Event]):
        """处理事件批次"""
        print(f"处理事件批次: {len(events)} 个事件")

        # 按事件类型分组
        events_by_type = defaultdict(list)
        for event in events:
            events_by_type[event.type].append(event)

        # 并发处理不同类型的事件
        tasks = []
        for event_type, type_events in events_by_type.items():
            listeners = self._listeners.get(event_type, [])
            for listener in listeners:
                task = asyncio.create_task(self._handle_events(listener, type_events))
                tasks.append(task)

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    async def _handle_events(self, handler: Callable, events: List[Event]):
        """处理特定监听器的事件"""
        try:
            if asyncio.iscoroutinefunction(handler):
                await handler(events)
            else:
                # 在执行器中运行同步函数
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(None, handler, events)
        except Exception as e:
            print(f"事件处理器执行失败: {e}")

# 事件处理器示例
async def batch_log_handler(events: List[Event]):
    """批量日志处理器"""
    print(f"[BATCH LOG] 处理 {len(events)} 个日志事件")
    for event in events:
        print(f"  - {event.type}: {event.data}")

async def batch_analytics_handler(events: List[Event]):
    """批量分析处理器"""
    await asyncio.sleep(0.1)  # 模拟分析处理
    user_actions = [e for e in events if e.type == 'user_action']
    system_events = [e for e in events if e.type == 'system_event']

    print(f"[ANALYTICS] 用户行为: {len(user_actions)}, 系统事件: {len(system_events)}")

def batch_database_handler(events: List[Event]):
    """批量数据库处理器（同步）"""
    print(f"[DATABASE] 批量保存 {len(events)} 个事件到数据库")
    # 模拟批量插入
    time.sleep(0.05)

# 使用示例
async def event_queue_demo():
    queue = EventQueue(batch_size=5, batch_timeout=2.0)

    # 注册处理器
    queue.add_listener('user_action', batch_log_handler)
    queue.add_listener('user_action', batch_analytics_handler)
    queue.add_listener('system_event', batch_log_handler)
    queue.add_listener('user_action', batch_database_handler)
    queue.add_listener('system_event', batch_database_handler)

    # 启动队列处理
    await queue.start()

    # 模拟事件产生
    print("=== 生成事件 ===")
    for i in range(12):
        event_type = 'user_action' if i % 2 == 0 else 'system_event'
        event = Event(
            type=event_type,
            data={'action': f'action_{i}', 'user_id': f'user_{i % 3}'},
            timestamp=datetime.now()
        )
        await queue.put(event)
        await asyncio.sleep(0.1)

    # 等待处理完成
    await asyncio.sleep(3)

    # 停止队列处理
    await queue.stop()

if __name__ == "__main__":
    asyncio.run(event_queue_demo())

# 六、实际应用案例

## （一）Web应用中的用户行为监听

```python
from flask import Flask, request, jsonify
from datetime import datetime
import threading
from typing import Dict, Any

# 用户行为事件系统
class UserBehaviorTracker:
    """用户行为跟踪器"""

    def __init__(self):
        self.event_manager = FunctionalEventManager()
        self._setup_listeners()

    def _setup_listeners(self):
        """设置监听器"""
        self.event_manager.on('user_login', self._log_login)
        self.event_manager.on('user_login', self._update_last_login)
        self.event_manager.on('user_login', self._send_login_notification)

        self.event_manager.on('user_logout', self._log_logout)
        self.event_manager.on('user_logout', self._update_session_duration)

        self.event_manager.on('page_view', self._track_page_view)
        self.event_manager.on('page_view', self._update_analytics)

    def track_login(self, user_id: str, ip_address: str):
        """跟踪用户登录"""
        self.event_manager.emit('user_login', {
            'user_id': user_id,
            'ip_address': ip_address,
            'timestamp': datetime.now(),
            'user_agent': request.headers.get('User-Agent', '')
        })

    def track_logout(self, user_id: str):
        """跟踪用户登出"""
        self.event_manager.emit('user_logout', {
            'user_id': user_id,
            'timestamp': datetime.now()
        })

    def track_page_view(self, user_id: str, page: str):
        """跟踪页面访问"""
        self.event_manager.emit('page_view', {
            'user_id': user_id,
            'page': page,
            'timestamp': datetime.now(),
            'referrer': request.headers.get('Referer', ''),
            'ip_address': request.remote_addr
        })

    def _log_login(self, data: Dict[str, Any]):
        """记录登录日志"""
        print(f"[LOGIN LOG] 用户 {data['user_id']} 从 {data['ip_address']} 登录")

    def _update_last_login(self, data: Dict[str, Any]):
        """更新最后登录时间"""
        print(f"[DB UPDATE] 更新用户 {data['user_id']} 最后登录时间")

    def _send_login_notification(self, data: Dict[str, Any]):
        """发送登录通知"""
        print(f"[NOTIFICATION] 向用户 {data['user_id']} 发送登录通知")

    def _log_logout(self, data: Dict[str, Any]):
        """记录登出日志"""
        print(f"[LOGOUT LOG] 用户 {data['user_id']} 登出")

    def _update_session_duration(self, data: Dict[str, Any]):
        """更新会话时长"""
        print(f"[SESSION] 计算用户 {data['user_id']} 会话时长")

    def _track_page_view(self, data: Dict[str, Any]):
        """跟踪页面访问"""
        print(f"[PAGE VIEW] 用户 {data['user_id']} 访问页面 {data['page']}")

    def _update_analytics(self, data: Dict[str, Any]):
        """更新分析数据"""
        print(f"[ANALYTICS] 更新页面 {data['page']} 的访问统计")

# Flask应用示例
app = Flask(__name__)
tracker = UserBehaviorTracker()

@app.route('/login', methods=['POST'])
def login():
    user_id = request.json.get('user_id')
    # 模拟登录逻辑
    tracker.track_login(user_id, request.remote_addr)
    return jsonify({'status': 'success', 'message': '登录成功'})

@app.route('/logout', methods=['POST'])
def logout():
    user_id = request.json.get('user_id')
    tracker.track_logout(user_id)
    return jsonify({'status': 'success', 'message': '登出成功'})

@app.route('/page/<path:page>')
def page_view(page):
    user_id = request.args.get('user_id', 'anonymous')
    tracker.track_page_view(user_id, page)
    return jsonify({'page': page, 'status': 'tracked'})
```

## （二）数据处理管道监听

```python
import json
from enum import Enum
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional

class PipelineStage(Enum):
    """管道阶段枚举"""
    EXTRACT = "extract"
    TRANSFORM = "transform"
    VALIDATE = "validate"
    LOAD = "load"
    COMPLETE = "complete"
    ERROR = "error"

@dataclass
class PipelineEvent:
    """管道事件"""
    stage: PipelineStage
    data: Dict[str, Any]
    pipeline_id: str
    timestamp: datetime
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DataPipeline:
    """数据处理管道"""

    def __init__(self, pipeline_id: str):
        self.pipeline_id = pipeline_id
        self.event_manager = FunctionalEventManager()
        self._setup_monitoring()

    def _setup_monitoring(self):
        """设置监控监听器"""
        self.event_manager.on('stage_start', self._log_stage_start)
        self.event_manager.on('stage_complete', self._log_stage_complete)
        self.event_manager.on('stage_error', self._log_stage_error)
        self.event_manager.on('pipeline_complete', self._log_pipeline_complete)

        # 性能监控
        self.event_manager.on('stage_complete', self._track_performance)

        # 数据质量监控
        self.event_manager.on('validate', self._check_data_quality)

    async def process(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """处理数据管道"""
        try:
            # 提取阶段
            extracted_data = await self._execute_stage(
                PipelineStage.EXTRACT, raw_data, self._extract_data
            )

            # 转换阶段
            transformed_data = await self._execute_stage(
                PipelineStage.TRANSFORM, extracted_data, self._transform_data
            )

            # 验证阶段
            validated_data = await self._execute_stage(
                PipelineStage.VALIDATE, transformed_data, self._validate_data
            )

            # 加载阶段
            result = await self._execute_stage(
                PipelineStage.LOAD, validated_data, self._load_data
            )

            # 完成事件
            self.event_manager.emit('pipeline_complete', {
                'pipeline_id': self.pipeline_id,
                'result': result,
                'timestamp': datetime.now()
            })

            return result

        except Exception as e:
            self.event_manager.emit('stage_error', {
                'pipeline_id': self.pipeline_id,
                'stage': 'pipeline',
                'error': str(e),
                'timestamp': datetime.now()
            })
            raise

    async def _execute_stage(self, stage: PipelineStage, data: Dict[str, Any],
                           processor: Callable) -> Dict[str, Any]:
        """执行管道阶段"""
        start_time = time.time()

        # 阶段开始事件
        self.event_manager.emit('stage_start', {
            'pipeline_id': self.pipeline_id,
            'stage': stage.value,
            'timestamp': datetime.now()
        })

        try:
            result = await processor(data)
            execution_time = time.time() - start_time

            # 阶段完成事件
            self.event_manager.emit('stage_complete', {
                'pipeline_id': self.pipeline_id,
                'stage': stage.value,
                'execution_time': execution_time,
                'data_size': len(str(result)),
                'timestamp': datetime.now()
            })

            return result

        except Exception as e:
            execution_time = time.time() - start_time

            # 阶段错误事件
            self.event_manager.emit('stage_error', {
                'pipeline_id': self.pipeline_id,
                'stage': stage.value,
                'error': str(e),
                'execution_time': execution_time,
                'timestamp': datetime.now()
            })
            raise

    async def _extract_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """数据提取"""
        await asyncio.sleep(0.1)  # 模拟提取过程
        return {'extracted': raw_data, 'extract_time': datetime.now().isoformat()}

    async def _transform_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """数据转换"""
        await asyncio.sleep(0.15)  # 模拟转换过程
        transformed = data.copy()
        transformed['transformed'] = True
        transformed['transform_time'] = datetime.now().isoformat()
        return transformed

    async def _validate_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """数据验证"""
        await asyncio.sleep(0.05)  # 模拟验证过程

        # 触发验证事件
        self.event_manager.emit('validate', {
            'pipeline_id': self.pipeline_id,
            'data': data,
            'timestamp': datetime.now()
        })

        validated = data.copy()
        validated['validated'] = True
        validated['validate_time'] = datetime.now().isoformat()
        return validated

    async def _load_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """数据加载"""
        await asyncio.sleep(0.2)  # 模拟加载过程
        result = data.copy()
        result['loaded'] = True
        result['load_time'] = datetime.now().isoformat()
        return result

    # 监听器方法
    def _log_stage_start(self, event_data: Dict[str, Any]):
        print(f"[PIPELINE] 开始执行阶段: {event_data['stage']}")

    def _log_stage_complete(self, event_data: Dict[str, Any]):
        print(f"[PIPELINE] 阶段完成: {event_data['stage']}, "
              f"耗时: {event_data['execution_time']:.3f}秒")

    def _log_stage_error(self, event_data: Dict[str, Any]):
        print(f"[ERROR] 阶段失败: {event_data['stage']}, "
              f"错误: {event_data['error']}")

    def _log_pipeline_complete(self, event_data: Dict[str, Any]):
        print(f"[PIPELINE] 管道 {event_data['pipeline_id']} 处理完成")

    def _track_performance(self, event_data: Dict[str, Any]):
        """性能跟踪"""
        if event_data['execution_time'] > 0.5:
            print(f"[PERFORMANCE] 警告: 阶段 {event_data['stage']} "
                  f"执行时间过长: {event_data['execution_time']:.3f}秒")

    def _check_data_quality(self, event_data: Dict[str, Any]):
        """数据质量检查"""
        data = event_data['data']
        if not data.get('extracted'):
            print("[QUALITY] 警告: 数据未正确提取")
        if not data.get('transformed'):
            print("[QUALITY] 警告: 数据未正确转换")

# 使用示例
async def pipeline_demo():
    pipeline = DataPipeline("data_pipeline_001")

    # 模拟原始数据
    raw_data = {
        'id': 1,
        'name': '测试数据',
        'value': 100,
        'source': 'api'
    }

    print("=== 数据管道处理 ===")
    result = await pipeline.process(raw_data)
    print(f"最终结果: {json.dumps(result, indent=2, ensure_ascii=False)}")

if __name__ == "__main__":
    asyncio.run(pipeline_demo())
```

# 七、性能优化与最佳实践

## （一）内存管理和弱引用

```python
import weakref
from typing import WeakSet, WeakKeyDictionary

class WeakEventManager:
    """使用弱引用的事件管理器，避免内存泄漏"""

    def __init__(self):
        self._listeners: Dict[str, WeakSet] = defaultdict(lambda: weakref.WeakSet())
        self._object_listeners: WeakKeyDictionary = weakref.WeakKeyDictionary()

    def add_listener(self, event_type: str, listener: Callable):
        """添加监听器（使用弱引用）"""
        self._listeners[event_type].add(listener)

    def add_object_listener(self, obj: Any, event_type: str, method_name: str):
        """为对象添加方法监听器"""
        if obj not in self._object_listeners:
            self._object_listeners[obj] = defaultdict(list)
        self._object_listeners[obj][event_type].append(method_name)

    def emit(self, event_type: str, *args, **kwargs):
        """触发事件"""
        # 函数监听器
        listeners = list(self._listeners[event_type])  # 创建副本避免迭代时修改
        for listener in listeners:
            try:
                listener(*args, **kwargs)
            except Exception as e:
                print(f"监听器执行错误: {e}")

        # 对象方法监听器
        for obj, event_methods in list(self._object_listeners.items()):
            methods = event_methods.get(event_type, [])
            for method_name in methods:
                try:
                    method = getattr(obj, method_name, None)
                    if method:
                        method(*args, **kwargs)
                except Exception as e:
                    print(f"对象方法监听器执行错误: {e}")

    def cleanup(self):
        """清理已失效的弱引用"""
        # WeakSet 和 WeakKeyDictionary 会自动清理
        pass

# 使用示例
class EventHandler:
    def __init__(self, name: str):
        self.name = name

    def handle_event(self, message: str):
        print(f"{self.name} 处理事件: {message}")

def weak_reference_demo():
    manager = WeakEventManager()

    # 创建处理器对象
    handler1 = EventHandler("处理器1")
    handler2 = EventHandler("处理器2")

    # 添加对象方法监听器
    manager.add_object_listener(handler1, 'test_event', 'handle_event')
    manager.add_object_listener(handler2, 'test_event', 'handle_event')

    # 触发事件
    manager.emit('test_event', "测试消息")

    # 删除一个处理器
    del handler1

    print("\n删除handler1后:")
    manager.emit('test_event', "第二次测试")

if __name__ == "__main__":
    weak_reference_demo()
```

## （二）线程安全的事件管理

```python
import threading
from concurrent.futures import ThreadPoolExecutor
from queue import Queue, Empty

class ThreadSafeEventManager:
    """线程安全的事件管理器"""

    def __init__(self, max_workers: int = 4):
        self._listeners: Dict[str, List[Callable]] = defaultdict(list)
        self._lock = threading.RLock()
        self._executor = ThreadPoolExecutor(max_workers=max_workers)
        self._event_queue = Queue()
        self._processing = False
        self._worker_thread = None

    def add_listener(self, event_type: str, listener: Callable):
        """线程安全地添加监听器"""
        with self._lock:
            self._listeners[event_type].append(listener)

    def remove_listener(self, event_type: str, listener: Callable):
        """线程安全地移除监听器"""
        with self._lock:
            if listener in self._listeners[event_type]:
                self._listeners[event_type].remove(listener)

    def emit(self, event_type: str, *args, **kwargs):
        """线程安全地触发事件"""
        with self._lock:
            listeners = self._listeners[event_type].copy()

        # 在线程池中执行监听器
        futures = []
        for listener in listeners:
            future = self._executor.submit(self._safe_execute, listener, *args, **kwargs)
            futures.append(future)

        return futures

    def emit_sync(self, event_type: str, *args, **kwargs):
        """同步触发事件"""
        with self._lock:
            listeners = self._listeners[event_type].copy()

        for listener in listeners:
            self._safe_execute(listener, *args, **kwargs)

    def _safe_execute(self, listener: Callable, *args, **kwargs):
        """安全执行监听器"""
        try:
            return listener(*args, **kwargs)
        except Exception as e:
            print(f"监听器执行错误: {e}")
            return None

    def start_async_processing(self):
        """启动异步事件处理"""
        if self._processing:
            return

        self._processing = True
        self._worker_thread = threading.Thread(target=self._process_events, daemon=True)
        self._worker_thread.start()

    def stop_async_processing(self):
        """停止异步事件处理"""
        self._processing = False
        if self._worker_thread:
            self._worker_thread.join(timeout=1.0)

    def emit_async(self, event_type: str, *args, **kwargs):
        """异步触发事件（放入队列）"""
        self._event_queue.put((event_type, args, kwargs))

    def _process_events(self):
        """处理事件队列"""
        while self._processing:
            try:
                event_type, args, kwargs = self._event_queue.get(timeout=0.1)
                self.emit_sync(event_type, *args, **kwargs)
                self._event_queue.task_done()
            except Empty:
                continue
            except Exception as e:
                print(f"事件处理错误: {e}")

    def shutdown(self):
        """关闭事件管理器"""
        self.stop_async_processing()
        self._executor.shutdown(wait=True)

# 使用示例
def thread_safe_demo():
    manager = ThreadSafeEventManager()

    # 添加监听器
    def worker_listener(worker_id: int, message: str):
        print(f"工作线程 {worker_id} 处理: {message}")
        time.sleep(0.1)  # 模拟处理时间

    def logger_listener(worker_id: int, message: str):
        print(f"[LOG] 工作线程 {worker_id}: {message}")

    manager.add_listener('work_event', worker_listener)
    manager.add_listener('work_event', logger_listener)

    # 启动异步处理
    manager.start_async_processing()

    # 多线程触发事件
    def trigger_events():
        for i in range(5):
            manager.emit_async('work_event', threading.current_thread().ident, f"消息 {i}")
            time.sleep(0.05)

    threads = []
    for i in range(3):
        thread = threading.Thread(target=trigger_events)
        threads.append(thread)
        thread.start()

    # 等待所有线程完成
    for thread in threads:
        thread.join()

    # 等待队列处理完成
    time.sleep(1)

    # 关闭管理器
    manager.shutdown()

if __name__ == "__main__":
    thread_safe_demo()
```

# 八、总结与最佳实践

## （一）Python监听机制选择指南

1. **简单场景**：使用函数式事件管理器或基础观察者模式
2. **属性监听**：使用描述符或`__setattr__`重写
3. **异步场景**：使用asyncio事件管理器
4. **装饰器风格**：使用装饰器注册监听器
5. **高性能要求**：考虑线程池和事件队列
6. **Web应用**：集成Flask/Django的信号系统

## （二）设计原则

- **松耦合**：事件源和监听器之间避免直接依赖
- **异常隔离**：一个监听器的异常不应影响其他监听器
- **内存管理**：使用弱引用避免内存泄漏
- **线程安全**：多线程环境下确保线程安全
- **性能考虑**：对于高频事件使用异步处理

## （三）注意事项

- 避免循环引用导致的内存泄漏
- 合理使用异步处理，避免阻塞主线程
- 做好异常处理和日志记录
- 注意监听器的执行顺序
- 及时清理不需要的监听器

## （四）与其他语言的对比

相比Java的监听机制，Python具有以下特点：

- **更灵活**：动态语言特性提供更多实现方式
- **更简洁**：装饰器和函数式编程简化代码
- **更强大**：内置异步支持和元编程能力
- **更易用**：语法简洁，学习成本低

Python的监听机制为事件驱动编程提供了强大而灵活的支持，通过合理选择实现方式，可以构建出高效、可维护的事件驱动系统。

---

## 参考资料

1. **官方文档**
   - Python官方文档 - 描述符协议
   - asyncio官方文档 - 异步编程
   - threading模块文档 - 线程安全

2. **设计模式相关**
   - 《Python设计模式》- 观察者模式
   - 《流畅的Python》- 元编程和描述符

3. **技术文章**
   - Python事件驱动编程最佳实践
   - asyncio异步事件处理详解
   - Python装饰器高级应用

4. **开源项目**
   - Django Signals - Django信号系统
   - Flask-Signals - Flask信号扩展
   - PyQt/PySide - GUI事件系统
```
```
