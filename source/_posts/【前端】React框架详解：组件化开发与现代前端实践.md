---
title: 【前端】React框架详解：组件化开发与现代前端实践
categories: 前端
tags:
  - React
  - JavaScript
  - 前端框架
  - 组件化
  - JSX
  - Hooks
---

# 前言

React是由Facebook（现Meta）开发的用于构建用户界面的JavaScript库，自2013年开源以来，已经成为最受欢迎的前端框架之一。React引入了组件化开发、虚拟DOM、单向数据流等革命性概念，彻底改变了前端开发的方式。本文将深入介绍React的核心概念、特性、最佳实践以及生态系统，帮助开发者全面掌握React开发技能。

# 一、React基础概念

## （一）React的设计理念

### 1. 组件化思想

React将UI拆分为独立、可复用的组件，每个组件管理自己的状态和逻辑。

```jsx
// 简单的组件示例
function Welcome(props) {
    return <h1>Hello, {props.name}!</h1>;
}

// 使用组件
function App() {
    return (
        <div>
            <Welcome name="Alice" />
            <Welcome name="Bob" />
            <Welcome name="Charlie" />
        </div>
    );
}
```

### 2. 声明式编程

React采用声明式编程范式，开发者只需描述UI应该是什么样子，而不需要关心如何操作DOM。

```jsx
// 声明式：描述UI状态
function TodoList({ todos }) {
    return (
        <ul>
            {todos.map(todo => (
                <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                    {todo.text}
                </li>
            ))}
        </ul>
    );
}
```

### 3. 单向数据流

数据从父组件流向子组件，通过props传递，保证了数据流的可预测性。

```jsx
// 父组件
function Parent() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <Child count={count} onIncrement={() => setCount(count + 1)} />
        </div>
    );
}

// 子组件
function Child({ count, onIncrement }) {
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={onIncrement}>Increment</button>
        </div>
    );
}
```

## （二）虚拟DOM

### 1. 虚拟DOM概念

虚拟DOM是React在内存中维护的一个轻量级的DOM表示，用于提高渲染性能。

```jsx
// JSX会被转换为虚拟DOM对象
const element = <h1>Hello, World!</h1>;

// 等价于
const element = React.createElement(
    'h1',
    null,
    'Hello, World!'
);

// 生成的虚拟DOM对象
{
    type: 'h1',
    props: {
        children: 'Hello, World!'
    }
}
```

### 2. Diff算法

React使用高效的Diff算法比较新旧虚拟DOM树，只更新发生变化的部分。

```jsx
// React会智能地只更新变化的部分
function Timer() {
    const [time, setTime] = useState(new Date());
    
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date()); // 只有时间文本会更新
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);
    
    return (
        <div>
            <h1>Current Time</h1> {/* 这部分不会重新渲染 */}
            <p>{time.toLocaleTimeString()}</p> {/* 只有这部分会更新 */}
        </div>
    );
}
```

## （三）JSX语法

### 1. JSX基础

JSX是JavaScript的语法扩展，允许在JavaScript中编写类似HTML的代码。

```jsx
// JSX基本语法
function MyComponent() {
    const name = 'React';
    const isLoggedIn = true;
    
    return (
        <div className="container">
            <h1>Welcome to {name}!</h1>
            {isLoggedIn ? (
                <p>You are logged in.</p>
            ) : (
                <p>Please log in.</p>
            )}
        </div>
    );
}
```

### 2. JSX表达式

```jsx
function ExpressionExample() {
    const user = {
        firstName: 'John',
        lastName: 'Doe'
    };
    
    const numbers = [1, 2, 3, 4, 5];
    
    return (
        <div>
            {/* 对象属性访问 */}
            <h1>Hello, {user.firstName} {user.lastName}!</h1>
            
            {/* 函数调用 */}
            <p>Current time: {new Date().toLocaleString()}</p>
            
            {/* 数组渲染 */}
            <ul>
                {numbers.map(number => (
                    <li key={number}>{number * 2}</li>
                ))}
            </ul>
            
            {/* 条件渲染 */}
            {user.firstName && <p>First name exists!</p>}
        </div>
    );
}
```

### 3. JSX属性

```jsx
function AttributeExample() {
    const imageUrl = 'https://example.com/image.jpg';
    const altText = 'Example image';
    const isDisabled = false;
    
    return (
        <div>
            {/* 字符串属性 */}
            <img src={imageUrl} alt={altText} />
            
            {/* 布尔属性 */}
            <button disabled={isDisabled}>Click me</button>
            
            {/* 事件处理 */}
            <button onClick={() => alert('Clicked!')}>Alert</button>
            
            {/* CSS类名 */}
            <div className="my-class">Styled div</div>
            
            {/* 内联样式 */}
            <p style={{ color: 'red', fontSize: '16px' }}>Red text</p>
        </div>
    );
}
```

# 二、React组件

## （一）函数组件

### 1. 基本函数组件

```jsx
// 简单函数组件
function Greeting(props) {
    return <h1>Hello, {props.name}!</h1>;
}

// 使用解构赋值
function Greeting({ name, age }) {
    return (
        <div>
            <h1>Hello, {name}!</h1>
            <p>You are {age} years old.</p>
        </div>
    );
}

// 箭头函数组件
const Greeting = ({ name, age }) => (
    <div>
        <h1>Hello, {name}!</h1>
        <p>You are {age} years old.</p>
    </div>
);
```

### 2. 带默认参数的组件

```jsx
function Button({ text = 'Click me', onClick, disabled = false, variant = 'primary' }) {
    const className = `btn btn-${variant} ${disabled ? 'disabled' : ''}`;
    
    return (
        <button 
            className={className}
            onClick={onClick}
            disabled={disabled}
        >
            {text}
        </button>
    );
}

// 使用组件
function App() {
    return (
        <div>
            <Button text="Save" onClick={() => console.log('Saved')} />
            <Button text="Cancel" variant="secondary" />
            <Button disabled={true} />
        </div>
    );
}
```

## （二）类组件（传统方式）

### 1. 基本类组件

```jsx
import React, { Component } from 'react';

class Welcome extends Component {
    render() {
        return <h1>Hello, {this.props.name}!</h1>;
    }
}

// 带状态的类组件
class Counter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        };
    }
    
    increment = () => {
        this.setState({ count: this.state.count + 1 });
    }
    
    render() {
        return (
            <div>
                <p>Count: {this.state.count}</p>
                <button onClick={this.increment}>Increment</button>
            </div>
        );
    }
}
```

### 2. 生命周期方法

```jsx
class LifecycleExample extends Component {
    constructor(props) {
        super(props);
        this.state = { data: null };
        console.log('Constructor called');
    }
    
    componentDidMount() {
        console.log('Component mounted');
        // 组件挂载后执行，适合进行API调用
        this.fetchData();
    }
    
    componentDidUpdate(prevProps, prevState) {
        console.log('Component updated');
        // 组件更新后执行
        if (prevProps.userId !== this.props.userId) {
            this.fetchData();
        }
    }
    
    componentWillUnmount() {
        console.log('Component will unmount');
        // 组件卸载前执行，适合清理工作
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    
    fetchData = async () => {
        try {
            const response = await fetch(`/api/users/${this.props.userId}`);
            const data = await response.json();
            this.setState({ data });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    
    render() {
        console.log('Render called');
        return (
            <div>
                {this.state.data ? (
                    <p>Data: {JSON.stringify(this.state.data)}</p>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        );
    }
}
```

## （三）组件通信

### 1. Props传递

```jsx
// 父组件向子组件传递数据
function Parent() {
    const user = {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://example.com/avatar.jpg'
    };
    
    const handleUserUpdate = (updatedUser) => {
        console.log('User updated:', updatedUser);
    };
    
    return (
        <div>
            <UserProfile 
                user={user} 
                onUpdate={handleUserUpdate}
                isEditable={true}
            />
        </div>
    );
}

// 子组件接收props
function UserProfile({ user, onUpdate, isEditable }) {
    const [isEditing, setIsEditing] = useState(false);
    
    const handleSave = (newData) => {
        onUpdate({ ...user, ...newData });
        setIsEditing(false);
    };
    
    return (
        <div className="user-profile">
            <img src={user.avatar} alt={user.name} />
            {isEditing ? (
                <EditForm user={user} onSave={handleSave} />
            ) : (
                <div>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    {isEditable && (
                        <button onClick={() => setIsEditing(true)}>Edit</button>
                    )}
                </div>
            )}
        </div>
    );
}
```

### 2. Context API

```jsx
import React, { createContext, useContext, useState } from 'react';

// 创建Context
const ThemeContext = createContext();
const UserContext = createContext();

// Provider组件
function AppProvider({ children }) {
    const [theme, setTheme] = useState('light');
    const [user, setUser] = useState(null);
    
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };
    
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <UserContext.Provider value={{ user, setUser }}>
                {children}
            </UserContext.Provider>
        </ThemeContext.Provider>
    );
}

// 自定义Hook
function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

// 使用Context的组件
function Header() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useUser();
    
    return (
        <header className={`header ${theme}`}>
            <h1>My App</h1>
            <div>
                {user && <span>Welcome, {user.name}!</span>}
                <button onClick={toggleTheme}>
                    Switch to {theme === 'light' ? 'dark' : 'light'} mode
                </button>
            </div>
        </header>
    );
}

// 应用根组件
function App() {
    return (
        <AppProvider>
            <Header />
            {/* ... other components */}
        </AppProvider>
    );
}

# 三、React Hooks

## （一）常用Hooks

### 1. useState

```jsx
import React, { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(prevCount => prevCount - 1)}>Decrement</button>
        </div>
    );
}
```

### 2. useEffect

```jsx
import React, { useState, useEffect } from 'react';

function Timer() {
    const [time, setTime] = useState(new Date());
    
    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);
        
        // 清理函数
        return () => {
            clearInterval(timerId);
        };
    }, []); // 空依赖数组，只在挂载和卸载时执行
    
    return <p>Current time: {time.toLocaleTimeString()}</p>;
}
```

### 3. useContext

```jsx
// (参见上面的Context API示例)
```

### 4. useReducer

```jsx
import React, { useReducer } from 'react';

const initialState = { count: 0 };

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return { count: state.count + 1 };
        case 'decrement':
            return { count: state.count - 1 };
        case 'reset':
            return { count: action.payload };
        default:
            throw new Error();
    }
}

function Counter() {
    const [state, dispatch] = useReducer(reducer, initialState);
    
    return (
        <div>
            <p>Count: {state.count}</p>
            <button onClick={() => dispatch({ type: 'increment' })}>+</button>
            <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
            <button onClick={() => dispatch({ type: 'reset', payload: 0 })}>Reset</button>
        </div>
    );
}
```

## （二）自定义Hooks

### 1. useFetch

```jsx
import { useState, useEffect } from 'react';

function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [url]);
    
    return { data, loading, error };
}

// 使用自定义Hook
function UserProfile({ userId }) {
    const { data: user, loading, error } = useFetch(`/api/users/${userId}`);
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    
    return <div>{user.name}</div>;
}
```

### 2. useLocalStorage

```jsx
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });
    
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error('Error setting localStorage:', error);
        }
    }, [key, storedValue]);
    
    return [storedValue, setStoredValue];
}

// 使用自定义Hook
function Settings() {
    const [theme, setTheme] = useLocalStorage('theme', 'light');
    
    return (
        <div className={`app ${theme}`}>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                Toggle Theme
            </button>
        </div>
    );
}
```

# 四、状态管理

## （一）Redux

### 1. Redux核心概念

- **Store**: 全局状态容器
- **Action**: 描述状态变化的对象
- **Reducer**: 根据action更新状态的纯函数

### 2. Redux Toolkit示例

```javascript
// store.js
import { configureStore, createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 },
    reducers: {
        increment: state => { state.value += 1; },
        decrement: state => { state.value -= 1; }
    }
});

export const { increment, decrement } = counterSlice.actions;

export const store = configureStore({
    reducer: {
        counter: counterSlice.reducer
    }
});
```

```jsx
// Counter.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './store';

function Counter() {
    const count = useSelector(state => state.counter.value);
    const dispatch = useDispatch();
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => dispatch(increment())}>+</button>
            <button onClick={() => dispatch(decrement())}>-</button>
        </div>
    );
}
```

## （二）Zustand

```javascript
// store.js
import create from 'zustand';

const useStore = create(set => ({
    count: 0,
    increment: () => set(state => ({ count: state.count + 1 })),
    decrement: () => set(state => ({ count: state.count - 1 }))
}));

export default useStore;
```

```jsx
// Counter.js
import React from 'react';
import useStore from './store';

function Counter() {
    const { count, increment, decrement } = useStore();
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
        </div>
    );
}
```

# 五、路由管理 (React Router)

```jsx
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';

function App() {
    return (
        <Router>
            <nav>
                <Link to="/">Home</Link> | <Link to="/about">About</Link> | <Link to="/users/1">User 1</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/users/:userId" element={<UserProfile />} />
            </Routes>
        </Router>
    );
}

function UserProfile() {
    const { userId } = useParams();
    return <h2>User ID: {userId}</h2>;
}
```

# 六、性能优化

## （一）React.memo

```jsx
const MyComponent = React.memo(function MyComponent(props) {
    // 只有在props变化时才会重新渲染
    return <div>{props.data}</div>;
});
```

## （二）useMemo 和 useCallback

```jsx
function Parent() {
    const [count, setCount] = useState(0);
    
    const expensiveValue = useMemo(() => {
        // 只有在依赖项变化时才重新计算
        return computeExpensiveValue(count);
    }, [count]);
    
    const handleClick = useCallback(() => {
        // 只有在依赖项变化时才重新创建函数
        console.log('Button clicked');
    }, []);
    
    return <Child value={expensiveValue} onClick={handleClick} />;
}
```

# 七、测试

## （一）Jest 和 React Testing Library

```jsx
// Counter.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('increments counter', () => {
    render(<Counter />);
    const button = screen.getByText(/increment/i);
    fireEvent.click(button);
    expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
});
```

# 八、总结

React以其组件化、声明式和高效的特性，成为现代前端开发的主流选择。掌握React的核心概念、Hooks、状态管理和生态工具，将极大地提升开发效率和应用质量。

# 九、参考资料

- [React官方文档](https://react.dev/)
- [Redux Toolkit官方文档](https://redux-toolkit.js.org/)
- [React Router官方文档](https://reactrouter.com/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)

function App() {
    return (
        <AppProvider>
            <div className="app">
                <Header />
                <main>
                    {/* 其他组件 */}
                </main>
            </div>
        </AppProvider>
    );
}
```

# 三、React Hooks

## （一）基础Hooks

### 1. useState Hook

```jsx
import React, { useState } from 'react';

// 基本用法
function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>+</button>
            <button onClick={() => setCount(count - 1)}>-</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    );
}

// 复杂状态管理
function UserForm() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        age: 0
    });
    
    const handleInputChange = (field, value) => {
        setUser(prevUser => ({
            ...prevUser,
            [field]: value
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('User data:', user);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Name"
                value={user.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
            />
            <input
                type="number"
                placeholder="Age"
                value={user.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
            />
            <button type="submit">Submit</button>
        </form>
    );
}
```

### 2. useEffect Hook

```jsx
import React, { useState, useEffect } from 'react';

// 基本用法
function DocumentTitle() {
    const [count, setCount] = useState(0);
    
    // 每次渲染后执行
    useEffect(() => {
        document.title = `Count: ${count}`;
    });
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
}

// 带依赖数组的useEffect
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        let isCancelled = false;
        
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch(`/api/users/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                
                const userData = await response.json();
                
                if (!isCancelled) {
                    setUser(userData);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err.message);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };
        
        fetchUser();
        
        // 清理函数
        return () => {
            isCancelled = true;
        };
    }, [userId]); // 依赖数组
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!user) return <div>User not found</div>;
    
    return (
        <div>
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
        </div>
    );
}

// 定时器示例
function Timer() {
    const [time, setTime] = useState(new Date());
    
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        
        // 清理函数
        return () => clearInterval(timer);
    }, []); // 空依赖数组，只在挂载时执行
    
    return (
        <div>
            <h2>Current Time</h2>
            <p>{time.toLocaleTimeString()}</p>
        </div>
    );
}
```

### 3. useContext Hook

```jsx
import React, { createContext, useContext, useState } from 'react';

// 创建多个Context
const AuthContext = createContext();
const SettingsContext = createContext();

// AuthProvider
function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    const login = async (credentials) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setIsAuthenticated(true);
                return { success: true };
            } else {
                return { success: false, error: 'Invalid credentials' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };
    
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };
    
    const value = {
        user,
        isAuthenticated,
        login,
        logout
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// 自定义Hook
function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// 使用Context的组件
function LoginForm() {
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(credentials);
        if (!result.success) {
            setError(result.error);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}
            <input
                type="text"
                placeholder="Username"
                value={credentials.username}
                onChange={(e) => setCredentials({
                    ...credentials,
                    username: e.target.value
                })}
            />
            <input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({
                    ...credentials,
                    password: e.target.value
                })}
            />
            <button type="submit">Login</button>
        </form>
    );
}

function UserProfile() {
    const { user, logout } = useAuth();
    
    return (
        <div>
            <h2>Welcome, {user.name}!</h2>
            <p>Email: {user.email}</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
}
```

## （二）高级Hooks

### 1. useReducer Hook

```jsx
import React, { useReducer } from 'react';

// 定义reducer
function todoReducer(state, action) {
    switch (action.type) {
        case 'ADD_TODO':
            return {
                ...state,
                todos: [
                    ...state.todos,
                    {
                        id: Date.now(),
                        text: action.payload,
                        completed: false
                    }
                ]
            };
        case 'TOGGLE_TODO':
            return {
                ...state,
                todos: state.todos.map(todo =>
                    todo.id === action.payload
                        ? { ...todo, completed: !todo.completed }
                        : todo
                )
            };
        case 'DELETE_TODO':
            return {
                ...state,
                todos: state.todos.filter(todo => todo.id !== action.payload)
            };
        case 'SET_FILTER':
            return {
                ...state,
                filter: action.payload
            };
        default:
            return state;
    }
}

// 初始状态
const initialState = {
    todos: [],
    filter: 'all' // all, active, completed
};

// TodoApp组件
function TodoApp() {
    const [state, dispatch] = useReducer(todoReducer, initialState);
    const [inputValue, setInputValue] = useState('');
    
    const addTodo = () => {
        if (inputValue.trim()) {
            dispatch({ type: 'ADD_TODO', payload: inputValue.trim() });
            setInputValue('');
        }
    };
    
    const toggleTodo = (id) => {
        dispatch({ type: 'TOGGLE_TODO', payload: id });
    };
    
    const deleteTodo = (id) => {
        dispatch({ type: 'DELETE_TODO', payload: id });
    };
    
    const setFilter = (filter) => {
        dispatch({ type: 'SET_FILTER', payload: filter });
    };
    
    // 过滤todos
    const filteredTodos = state.todos.filter(todo => {
        switch (state.filter) {
            case 'active':
                return !todo.completed;
            case 'completed':
                return todo.completed;
            default:
                return true;
        }
    });
    
    return (
        <div className="todo-app">
            <h1>Todo App</h1>
            
            {/* 添加todo */}
            <div className="add-todo">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="Add a new todo..."
                />
                <button onClick={addTodo}>Add</button>
            </div>
            
            {/* 过滤器 */}
            <div className="filters">
                <button 
                    className={state.filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button 
                    className={state.filter === 'active' ? 'active' : ''}
                    onClick={() => setFilter('active')}
                >
                    Active
                </button>
                <button 
                    className={state.filter === 'completed' ? 'active' : ''}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </button>
            </div>
            
            {/* Todo列表 */}
            <ul className="todo-list">
                {filteredTodos.map(todo => (
                    <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                        />
                        <span>{todo.text}</span>
                        <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            
            {/* 统计信息 */}
            <div className="stats">
                <p>Total: {state.todos.length}</p>
                <p>Active: {state.todos.filter(t => !t.completed).length}</p>
                <p>Completed: {state.todos.filter(t => t.completed).length}</p>
            </div>
        </div>
    );
}
```

### 2. useMemo Hook

```jsx
import React, { useState, useMemo } from 'react';

// 昂贵的计算函数
function expensiveCalculation(num) {
    console.log('Performing expensive calculation...');
    let result = 0;
    for (let i = 0; i < num * 1000000; i++) {
        result += i;
    }
    return result;
}

function ExpensiveComponent() {
    const [count, setCount] = useState(1);
    const [other, setOther] = useState(0);
    
    // 使用useMemo缓存计算结果
    const expensiveValue = useMemo(() => {
        return expensiveCalculation(count);
    }, [count]); // 只有count变化时才重新计算
    
    return (
        <div>
            <h2>Expensive Calculation Example</h2>
            <p>Count: {count}</p>
            <p>Expensive Value: {expensiveValue}</p>
            <p>Other: {other}</p>
            
            <button onClick={() => setCount(count + 1)}>Increment Count</button>
            <button onClick={() => setOther(other + 1)}>Increment Other</button>
        </div>
    );
}

// 复杂数据处理示例
function DataProcessor({ data, filters }) {
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    
    // 使用useMemo优化数据处理
    const processedData = useMemo(() => {
        console.log('Processing data...');
        
        // 过滤数据
        let filtered = data.filter(item => {
            return Object.keys(filters).every(key => {
                if (!filters[key]) return true;
                return item[key].toLowerCase().includes(filters[key].toLowerCase());
            });
        });
        
        // 排序数据
        filtered.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        return filtered;
    }, [data, filters, sortBy, sortOrder]);
    
    return (
        <div>
            <div className="controls">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="name">Name</option>
                    <option value="age">Age</option>
                    <option value="email">Email</option>
                </select>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
            
            <div className="data-list">
                {processedData.map(item => (
                    <div key={item.id} className="data-item">
                        <h3>{item.name}</h3>
                        <p>Age: {item.age}</p>
                        <p>Email: {item.email}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

### 3. useCallback Hook

```jsx
import React, { useState, useCallback, memo } from 'react';

// 子组件（使用memo优化）
const ChildComponent = memo(({ onButtonClick, value }) => {
    console.log('ChildComponent rendered');
    
    return (
        <div>
            <p>Value: {value}</p>
            <button onClick={onButtonClick}>Click me</button>
        </div>
    );
});

// 父组件
function ParentComponent() {
    const [count, setCount] = useState(0);
    const [other, setOther] = useState(0);
    
    // 使用useCallback缓存函数
    const handleButtonClick = useCallback(() => {
        console.log('Button clicked!');
        setCount(prevCount => prevCount + 1);
    }, []); // 空依赖数组，函数永远不会重新创建
    
    // 带依赖的useCallback
    const handleSpecialClick = useCallback(() => {
        console.log(`Special click with count: ${count}`);
    }, [count]); // 只有count变化时才重新创建函数
    
    return (
        <div>
            <h2>useCallback Example</h2>
            <p>Count: {count}</p>
            <p>Other: {other}</p>
            
            <button onClick={() => setOther(other + 1)}>Increment Other</button>
            
            {/* 子组件不会因为other的变化而重新渲染 */}
            <ChildComponent 
                onButtonClick={handleButtonClick} 
                value={count}
            />
            
            <button onClick={handleSpecialClick}>Special Click</button>
        </div>
    );
}

// 复杂示例：表单处理
function FormWithCallback() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    
    // 使用useCallback优化输入处理函数
    const handleInputChange = useCallback((field) => {
        return (event) => {
            setFormData(prevData => ({
                ...prevData,
                [field]: event.target.value
            }));
        };
    }, []);
    
    // 提交处理函数
    const handleSubmit = useCallback((event) => {
        event.preventDefault();
        console.log('Form submitted:', formData);
        // 这里可以发送数据到服务器
    }, [formData]);
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange('name')}
            />
            <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange('email')}
            />
            <textarea
                placeholder="Message"
                value={formData.message}
                onChange={handleInputChange('message')}
            />
            <button type="submit">Submit</button>
        </form>
    );
}
```

## （三）自定义Hooks

### 1. 基本自定义Hook

```jsx
import { useState, useEffect } from 'react';

// 自定义Hook：本地存储
function useLocalStorage(key, initialValue) {
    // 获取初始值
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });
    
    // 设置值的函数
    const setValue = (value) => {
        try {
            // 允许value是一个函数，用于函数式更新
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };
    
    return [storedValue, setValue];
}

// 使用自定义Hook
function Settings() {
    const [theme, setTheme] = useLocalStorage('theme', 'light');
    const [language, setLanguage] = useLocalStorage('language', 'en');
    
    return (
        <div>
            <h2>Settings</h2>
            <div>
                <label>
                    Theme:
                    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </label>
            </div>
            <div>
                <label>
                    Language:
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                        <option value="es">Español</option>
                    </select>
                </label>
            </div>
        </div>
    );
}
```

### 2. 数据获取Hook

```jsx
import { useState, useEffect, useCallback } from 'react';

// 自定义Hook：数据获取
function useFetch(url, options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [url, JSON.stringify(options)]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);
    
    return { data, loading, error, refetch };
}

// 使用数据获取Hook
function UserList() {
    const { data: users, loading, error, refetch } = useFetch('/api/users');
    
    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div>
            <h2>Users</h2>
            <button onClick={refetch}>Refresh</button>
            <ul>
                {users?.map(user => (
                    <li key={user.id}>
                        {user.name} - {user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// 带参数的数据获取Hook
function useUser(userId) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        if (!userId) {
            setUser(null);
            return;
        }
        
        let isCancelled = false;
        
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch(`/api/users/${userId}`);
                
                if (!response.ok) {
                    throw new Error('User not found');
                }
                
                const userData = await response.json();
                
                if (!isCancelled) {
                    setUser(userData);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err.message);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };
        
        fetchUser();
        
        return () => {
            isCancelled = true;
        };
    }, [userId]);
    
    return { user, loading, error };
}
```

### 3. 表单处理Hook

```jsx
import { useState, useCallback } from 'react';

// 自定义Hook：表单处理
function useForm(initialValues, validationRules = {}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    
    // 验证单个字段
    const validateField = useCallback((name, value) => {
        const rules = validationRules[name];
        if (!rules) return '';
        
        for (const rule of rules) {
            const error = rule(value, values);
            if (error) return error;
        }
        
        return '';
    }, [validationRules, values]);
    
    // 验证所有字段
    const validateAll = useCallback(() => {
        const newErrors = {};
        
        Object.keys(validationRules).forEach(name => {
            const error = validateField(name, values[name]);
            if (error) {
                newErrors[name] = error;
            }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [validationRules, values, validateField]);
    
    // 处理输入变化
    const handleChange = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        // 如果字段已经被触摸过，立即验证
        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    }, [touched, validateField]);
    
    // 处理字段失焦
    const handleBlur = useCallback((name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        
        const error = validateField(name, values[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
    }, [values, validateField]);
    
    // 重置表单
    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);
    
    // 提交表单
    const handleSubmit = useCallback((onSubmit) => {
        return (event) => {
            event.preventDefault();
            
            // 标记所有字段为已触摸
            const allTouched = Object.keys(validationRules).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setTouched(allTouched);
            
            // 验证所有字段
            if (validateAll()) {
                onSubmit(values);
            }
        };
    }, [values, validationRules, validateAll]);
    
    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        isValid: Object.keys(errors).length === 0
    };
}

// 验证规则
const required = (message = 'This field is required') => (value) => {
    return !value || value.trim() === '' ? message : '';
};

const email = (message = 'Invalid email format') => (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? message : '';
};

const minLength = (min, message) => (value) => {
    return value && value.length < min ? message || `Minimum length is ${min}` : '';
};

// 使用表单Hook
function ContactForm() {
    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        isValid
    } = useForm(
        {
            name: '',
            email: '',
            message: ''
        },
        {
            name: [required('Name is required')],
            email: [
                required('Email is required'),
                email('Please enter a valid email')
            ],
            message: [
                required('Message is required'),
                minLength(10, 'Message must be at least 10 characters')
            ]
        }
    );
    
    const onSubmit = (formData) => {
        console.log('Form submitted:', formData);
        // 这里可以发送数据到服务器
        reset();
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                    id="name"
                    type="text"
                    value={values.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className={errors.name && touched.name ? 'error' : ''}
                />
                {errors.name && touched.name && (
                    <span className="error-message">{errors.name}</span>
                )}
            </div>
            
            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={errors.email && touched.email ? 'error' : ''}
                />
                {errors.email && touched.email && (
                    <span className="error-message">{errors.email}</span>
                )}
            </div>
            
            <div className="form-group">
                <label htmlFor="message">Message:</label>
                <textarea
                    id="message"
                    value={values.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                    className={errors.message && touched.message ? 'error' : ''}
                />
                {errors.message && touched.message && (
                    <span className="error-message">{errors.message}</span>
                )}
            </div>
            
            <div className="form-actions">
                <button type="submit" disabled={!isValid}>Submit</button>
                <button type="button" onClick={reset}>Reset</button>
            </div>
        </form>
    );
}
```

# 四、状态管理

## （一）React内置状态管理

### 1. 组件状态提升

```jsx
import React, { useState } from 'react';

// 子组件
function ProductCard({ product, onAddToCart, onRemoveFromCart, cartQuantity }) {
    return (
        <div className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <div className="cart-controls">
                <button 
                    onClick={() => onRemoveFromCart(product.id)}
                    disabled={cartQuantity === 0}
                >
                    -
                </button>
                <span>Quantity: {cartQuantity}</span>
                <button onClick={() => onAddToCart(product.id)}>+</button>
            </div>
        </div>
    );
}

// 购物车组件
function ShoppingCart({ cartItems, products, onUpdateQuantity, onRemoveItem }) {
    const total = cartItems.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product.price * item.quantity);
    }, 0);
    
    return (
        <div className="shopping-cart">
            <h2>Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <>
                    {cartItems.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                            <div key={item.productId} className="cart-item">
                                <span>{product.name}</span>
                                <span>${product.price} x {item.quantity}</span>
                                <button onClick={() => onRemoveItem(item.productId)}>
                                    Remove
                                </button>
                            </div>
                        );
                    })}
                    <div className="cart-total">
                        <strong>Total: ${total.toFixed(2)}</strong>
                    </div>
                </>  
            )}
        </div>
    );
}

// 主应用组件（状态提升到这里）
function ShoppingApp() {
    const [products] = useState([
        { id: 1, name: 'Laptop', price: 999.99, image: '/laptop.jpg' },
        { id: 2, name: 'Phone', price: 599.99, image: '/phone.jpg' },
        { id: 3, name: 'Tablet', price: 399.99, image: '/tablet.jpg' }
    ]);
    
    const [cartItems, setCartItems] = useState([]);
    
    // 添加到购物车
    const addToCart = (productId) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.productId === productId);
            
            if (existingItem) {
                return prevItems.map(item =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevItems, { productId, quantity: 1 }];
            }
        });
    };
    
    // 从购物车移除
    const removeFromCart = (productId) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.productId === productId);
            
            if (existingItem && existingItem.quantity > 1) {
                return prevItems.map(item =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            } else {
                return prevItems.filter(item => item.productId !== productId);
            }
        });
    };
    
    // 完全移除商品
    const removeItem = (productId) => {
        setCartItems(prevItems => 
            prevItems.filter(item => item.productId !== productId)
        );
    };
    
    // 获取商品在购物车中的数量
    const getCartQuantity = (productId) => {
        const item = cartItems.find(item => item.productId === productId);
        return item ? item.quantity : 0;
    };
    
    return (
        <div className="shopping-app">
            <h1>Online Store</h1>
            
            <div className="app-layout">
                <div className="products-section">
                    <h2>Products</h2>
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={addToCart}
                                onRemoveFromCart={removeFromCart}
                                cartQuantity={getCartQuantity(product.id)}
                            />
                        ))}
                    </div>
                </div>
                
                <div className="cart-section">
                    <ShoppingCart
                        cartItems={cartItems}
                        products={products}
                        onRemoveItem={removeItem}
                    />
                </div>
            </div>
        </div>
    );
}
```

### 2. Context + useReducer模式

```jsx
import React, { createContext, useContext, useReducer } from 'react';

// 定义action类型
const ACTIONS = {
    ADD_TO_CART: 'ADD_TO_CART',
    REMOVE_FROM_CART: 'REMOVE_FROM_CART',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    CLEAR_CART: 'CLEAR_CART',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR'
};

// Reducer函数
function cartReducer(state, action) {
    switch (action.type) {
        case ACTIONS.ADD_TO_CART:
            const existingItemIndex = state.items.findIndex(
                item => item.id === action.payload.id
            );
            
            if (existingItemIndex >= 0) {
                const updatedItems = [...state.items];
                updatedItems[existingItemIndex].quantity += 1;
                return {
                    ...state,
                    items: updatedItems
                };
            } else {
                return {
                    ...state,
                    items: [...state.items, { ...action.payload, quantity: 1 }]
                };
            }
            
        case ACTIONS.REMOVE_FROM_CART:
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload)
            };
            
        case ACTIONS.UPDATE_QUANTITY:
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ).filter(item => item.quantity > 0)
            };
            
        case ACTIONS.CLEAR_CART:
            return {
                ...state,
                items: []
            };
            
        case ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };
            
        case ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false
            };
            
        default:
            return state;
    }
}

// 初始状态
const initialState = {
    items: [],
    loading: false,
    error: null
};

// 创建Context
const CartContext = createContext();

// Provider组件
export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    
    // Action creators
    const addToCart = (product) => {
        dispatch({ type: ACTIONS.ADD_TO_CART, payload: product });
    };
    
    const removeFromCart = (productId) => {
        dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: productId });
    };
    
    const updateQuantity = (productId, quantity) => {
        dispatch({ 
            type: ACTIONS.UPDATE_QUANTITY, 
            payload: { id: productId, quantity }
        });
    };
    
    const clearCart = () => {
        dispatch({ type: ACTIONS.CLEAR_CART });
    };
    
    // 计算总价
    const totalPrice = state.items.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
    );
    
    // 计算总数量
    const totalItems = state.items.reduce(
        (total, item) => total + item.quantity, 
        0
    );
    
    const value = {
        ...state,
        totalPrice,
        totalItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    };
    
    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

// 自定义Hook
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

// 使用Context的组件
function ProductCard({ product }) {
    const { addToCart, items } = useCart();
    
    const cartItem = items.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    
    return (
        <div className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <div className="cart-controls">
                <button onClick={() => addToCart(product)}>
                    Add to Cart {quantity > 0 && `(${quantity})`}
                </button>
            </div>
        </div>
    );
}

function CartSummary() {
    const { items, totalPrice, totalItems, clearCart } = useCart();
    
    return (
        <div className="cart-summary">
            <h3>Cart Summary</h3>
            <p>Items: {totalItems}</p>
            <p>Total: ${totalPrice.toFixed(2)}</p>
            {items.length > 0 && (
                <button onClick={clearCart}>Clear Cart</button>
            )}
        </div>
    );
}

// 主应用
function App() {
    return (
        <CartProvider>
            <div className="app">
                <h1>React Shopping App</h1>
                <ProductList />
                <CartSummary />
            </div>
        </CartProvider>
    );
}
```

## （二）第三方状态管理

### 1. Redux基础

```jsx
// store/actions.js
export const ADD_TODO = 'ADD_TODO';
export const TOGGLE_TODO = 'TOGGLE_TODO';
export const DELETE_TODO = 'DELETE_TODO';
export const SET_FILTER = 'SET_FILTER';

export const addTodo = (text) => ({
    type: ADD_TODO,
    payload: {
        id: Date.now(),
        text,
        completed: false
    }
});

export const toggleTodo = (id) => ({
    type: TOGGLE_TODO,
    payload: id
});

export const deleteTodo = (id) => ({
    type: DELETE_TODO,
    payload: id
});

export const setFilter = (filter) => ({
    type: SET_FILTER,
    payload: filter
});

// store/reducers.js
import { combineReducers } from 'redux';
import { ADD_TODO, TOGGLE_TODO, DELETE_TODO, SET_FILTER } from './actions';

const todosReducer = (state = [], action) => {
    switch (action.type) {
        case ADD_TODO:
            return [...state, action.payload];
        case TOGGLE_TODO:
            return state.map(todo =>
                todo.id === action.payload
                    ? { ...todo, completed: !todo.completed }
                    : todo
            );
        case DELETE_TODO:
            return state.filter(todo => todo.id !== action.payload);
        default:
            return state;
    }
};

const filterReducer = (state = 'all', action) => {
    switch (action.type) {
        case SET_FILTER:
            return action.payload;
        default:
            return state;
    }
};

export default combineReducers({
    todos: todosReducer,
    filter: filterReducer
});

// store/index.js
import { createStore } from 'redux';
import rootReducer from './reducers';

const store = createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
```

### 2. React-Redux使用

```jsx
import React, { useState } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './store';
import { addTodo, toggleTodo, deleteTodo, setFilter } from './store/actions';

// TodoList组件
function TodoList() {
    const todos = useSelector(state => state.todos);
    const filter = useSelector(state => state.filter);
    const dispatch = useDispatch();
    
    // 过滤todos
    const filteredTodos = todos.filter(todo => {
        switch (filter) {
            case 'active':
                return !todo.completed;
            case 'completed':
                return todo.completed;
            default:
                return true;
        }
    });
    
    return (
        <ul className="todo-list">
            {filteredTodos.map(todo => (
                <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => dispatch(toggleTodo(todo.id))}
                    />
                    <span>{todo.text}</span>
                    <button onClick={() => dispatch(deleteTodo(todo.id))}>
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    );
}

// AddTodo组件
function AddTodo() {
    const [text, setText] = useState('');
    const dispatch = useDispatch();
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            dispatch(addTodo(text.trim()));
            setText('');
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a new todo..."
            />
            <button type="submit">Add</button>
        </form>
    );
}

// FilterButtons组件
function FilterButtons() {
    const filter = useSelector(state => state.filter);
    const dispatch = useDispatch();
    
    return (
        <div className="filters">
            <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => dispatch(setFilter('all'))}
            >
                All
            </button>
            <button
                className={filter === 'active' ? 'active' : ''}
                onClick={() => dispatch(setFilter('active'))}
            >
                Active
            </button>
            <button
                className={filter === 'completed' ? 'active' : ''}
                onClick={() => dispatch(setFilter('completed'))}
            >
                Completed
            </button>
        </div>
    );
}

// 主应用
function TodoApp() {
    return (
        <div className="todo-app">
            <h1>Redux Todo App</h1>
            <AddTodo />
            <FilterButtons />
            <TodoList />
        </div>
    );
}

// 根组件
function App() {
    return (
        <Provider store={store}>
            <TodoApp />
        </Provider>
    );
}
```

# 五、性能优化

## （一）React.memo

```jsx
import React, { memo, useState, useCallback } from 'react';

// 使用memo优化的子组件
const ExpensiveChild = memo(({ data, onUpdate }) => {
    console.log('ExpensiveChild rendered');
    
    // 模拟昂贵的计算
    const expensiveValue = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
        <div>
            <h3>Expensive Child Component</h3>
            <p>Calculated Value: {expensiveValue}</p>
            <button onClick={() => onUpdate(Math.random())}>
                Update Random Value
            </button>
        </div>
    );
});

// 带自定义比较函数的memo
const UserCard = memo(({ user, onEdit }) => {
    console.log('UserCard rendered for:', user.name);
    
    return (
        <div className="user-card">
            <h3>{user.name}</h3>
            <p>Email: {user.email}</p>
            <p>Age: {user.age}</p>
            <button onClick={() => onEdit(user.id)}>Edit</button>
        </div>
    );
}, (prevProps, nextProps) => {
    // 自定义比较函数
    return (
        prevProps.user.id === nextProps.user.id &&
        prevProps.user.name === nextProps.user.name &&
        prevProps.user.email === nextProps.user.email &&
        prevProps.user.age === nextProps.user.age
    );
});

// 父组件
function OptimizedParent() {
    const [count, setCount] = useState(0);
    const [data, setData] = useState([
        { id: 1, value: 10 },
        { id: 2, value: 20 },
        { id: 3, value: 30 }
    ]);
    
    // 使用useCallback优化回调函数
    const handleUpdate = useCallback((newValue) => {
        setData(prevData => 
            prevData.map(item => 
                item.id === 1 ? { ...item, value: newValue } : item
            )
        );
    }, []);
    
    return (
        <div>
            <h2>Performance Optimization Example</h2>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment Count</button>
            
            {/* 这个组件不会因为count的变化而重新渲染 */}
            <ExpensiveChild data={data} onUpdate={handleUpdate} />
        </div>
    );
}
```

## （二）useMemo和useCallback

```jsx
import React, { useState, useMemo, useCallback } from 'react';

function ExpensiveCalculation({ items, multiplier }) {
    // 使用useMemo缓存昂贵的计算结果
    const expensiveValue = useMemo(() => {
        console.log('Calculating expensive value...');
        return items.reduce((sum, item) => sum + item * multiplier, 0);
    }, [items, multiplier]); // 只有当items或multiplier改变时才重新计算
    
    // 使用useMemo缓存复杂对象
    const sortedItems = useMemo(() => {
        console.log('Sorting items...');
        return [...items].sort((a, b) => b - a);
    }, [items]);
    
    return (
        <div>
            <h3>Expensive Calculation</h3>
            <p>Result: {expensiveValue}</p>
            <p>Sorted Items: {sortedItems.join(', ')}</p>
        </div>
    );
}

function CallbackExample() {
    const [count, setCount] = useState(0);
    const [items, setItems] = useState([1, 2, 3, 4, 5]);
    
    // 使用useCallback缓存函数
    const handleAddItem = useCallback(() => {
        setItems(prevItems => [...prevItems, Math.floor(Math.random() * 100)]);
    }, []); // 空依赖数组，函数永远不会改变
    
    const handleRemoveItem = useCallback((index) => {
        setItems(prevItems => prevItems.filter((_, i) => i !== index));
    }, []); // 空依赖数组
    
    // 这个函数依赖于count，所以当count改变时会重新创建
    const handleItemClick = useCallback((item) => {
        console.log(`Clicked item ${item}, current count: ${count}`);
    }, [count]);
    
    return (
        <div>
            <h2>useCallback Example</h2>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment Count</button>
            <button onClick={handleAddItem}>Add Random Item</button>
            
            <ExpensiveCalculation items={items} multiplier={2} />
            
            <div>
                <h3>Items:</h3>
                {items.map((item, index) => (
                    <div key={index}>
                        <span onClick={() => handleItemClick(item)}>{item}</span>
                        <button onClick={() => handleRemoveItem(index)}>Remove</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

## （三）虚拟化（Virtualization）

```jsx
import React, { useState, useMemo } from 'react';

// 简单的虚拟列表实现
function VirtualList({ items, itemHeight = 50, containerHeight = 300 }) {
    const [scrollTop, setScrollTop] = useState(0);
    
    // 计算可见范围
    const visibleRange = useMemo(() => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / itemHeight) + 1,
            items.length
        );
        return { startIndex, endIndex };
    }, [scrollTop, itemHeight, containerHeight, items.length]);
    
    // 可见的项目
    const visibleItems = useMemo(() => {
        return items.slice(visibleRange.startIndex, visibleRange.endIndex);
    }, [items, visibleRange]);
    
    const totalHeight = items.length * itemHeight;
    const offsetY = visibleRange.startIndex * itemHeight;
    
    return (
        <div
            style={{
                height: containerHeight,
                overflow: 'auto',
                border: '1px solid #ccc'
            }}
            onScroll={(e) => setScrollTop(e.target.scrollTop)}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div
                    style={{
                        transform: `translateY(${offsetY}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0
                    }}
                >
                    {visibleItems.map((item, index) => (
                        <div
                            key={visibleRange.startIndex + index}
                            style={{
                                height: itemHeight,
                                padding: '10px',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            Item {visibleRange.startIndex + index}: {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// 使用虚拟列表
function VirtualListExample() {
    // 生成大量数据
    const items = useMemo(() => {
        return Array.from({ length: 10000 }, (_, i) => `Data item ${i + 1}`);
    }, []);
    
    return (
        <div>
            <h2>Virtual List Example</h2>
            <p>Rendering 10,000 items efficiently</p>
            <VirtualList items={items} itemHeight={60} containerHeight={400} />
        </div>
    );
}
```

# 六、路由（React Router）

## （一）基础路由

```jsx
import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    useNavigate,
    useParams,
    useLocation
} from 'react-router-dom';

// 页面组件
function Home() {
    return (
        <div>
            <h2>Home Page</h2>
            <p>Welcome to the home page!</p>
        </div>
    );
}

function About() {
    return (
        <div>
            <h2>About Page</h2>
            <p>This is the about page.</p>
        </div>
    );
}

function Contact() {
    const navigate = useNavigate();
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // 处理表单提交
        alert('Message sent!');
        // 编程式导航
        navigate('/');
    };
    
    return (
        <div>
            <h2>Contact Page</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Your name" required />
                <textarea placeholder="Your message" required></textarea>
                <button type="submit">Send Message</button>
            </form>
        </div>
    );
}

// 用户详情页面（带参数）
function UserProfile() {
    const { userId } = useParams();
    const location = useLocation();
    
    return (
        <div>
            <h2>User Profile</h2>
            <p>User ID: {userId}</p>
            <p>Current path: {location.pathname}</p>
            <p>Search params: {location.search}</p>
        </div>
    );
}

// 导航组件
function Navigation() {
    return (
        <nav style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
            <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
            <Link to="/about" style={{ marginRight: '10px' }}>About</Link>
            <Link to="/contact" style={{ marginRight: '10px' }}>Contact</Link>
            <Link to="/user/123" style={{ marginRight: '10px' }}>User Profile</Link>
        </nav>
    );
}

// 404页面
function NotFound() {
    return (
        <div>
            <h2>404 - Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <Link to="/">Go back to home</Link>
        </div>
    );
}

// 主应用
function RouterApp() {
    return (
        <Router>
            <div>
                <Navigation />
                <div style={{ padding: '20px' }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/user/:userId" element={<UserProfile />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}
```

## （二）嵌套路由和路由守卫

```jsx
import React, { createContext, useContext, useState } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Outlet,
    Navigate,
    useLocation
} from 'react-router-dom';

// 认证上下文
const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    
    const login = (username) => {
        setUser({ username });
    };
    
    const logout = () => {
        setUser(null);
    };
    
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    return useContext(AuthContext);
}

// 路由守卫组件
function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    
    if (!user) {
        // 重定向到登录页面，并保存当前位置
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return children;
}

// 登录页面
function Login() {
    const { login } = useAuth();
    const location = useLocation();
    const [username, setUsername] = useState('');
    
    const from = location.state?.from?.pathname || '/';
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            login(username);
            // 登录成功后重定向到之前的页面
            window.location.href = from;
        }
    };
    
    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

// 仪表板布局
function DashboardLayout() {
    const { user, logout } = useAuth();
    
    return (
        <div>
            <header style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
                <span>Welcome, {user?.username}!</span>
                <button onClick={logout} style={{ marginLeft: '10px' }}>Logout</button>
            </header>
            <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                <Link to="/dashboard" style={{ marginRight: '10px' }}>Dashboard</Link>
                <Link to="/dashboard/profile" style={{ marginRight: '10px' }}>Profile</Link>
                <Link to="/dashboard/settings" style={{ marginRight: '10px' }}>Settings</Link>
            </nav>
            <main style={{ padding: '20px' }}>
                <Outlet /> {/* 嵌套路由的内容会在这里渲染 */}
            </main>
        </div>
    );
}

// 仪表板页面
function Dashboard() {
    return (
        <div>
            <h2>Dashboard</h2>
            <p>This is the main dashboard page.</p>
        </div>
    );
}

function Profile() {
    const { user } = useAuth();
    
    return (
        <div>
            <h2>Profile</h2>
            <p>Username: {user?.username}</p>
            <p>This is your profile page.</p>
        </div>
    );
}

function Settings() {
    return (
        <div>
            <h2>Settings</h2>
            <p>Configure your application settings here.</p>
        </div>
    );
}

// 带认证的路由应用
function AuthenticatedApp() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        {/* 嵌套路由 */}
                        <Route index element={<Dashboard />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
```

# 七、测试

## （一）单元测试

```jsx
// Counter.js
import React, { useState } from 'react';

function Counter({ initialValue = 0 }) {
    const [count, setCount] = useState(initialValue);
    
    return (
        <div>
            <h2>Counter</h2>
            <p data-testid="count-value">Count: {count}</p>
            <button 
                data-testid="increment-button"
                onClick={() => setCount(count + 1)}
            >
                Increment
            </button>
            <button 
                data-testid="decrement-button"
                onClick={() => setCount(count - 1)}
            >
                Decrement
            </button>
            <button 
                data-testid="reset-button"
                onClick={() => setCount(initialValue)}
            >
                Reset
            </button>
        </div>
    );
}

export default Counter;
```

```jsx
// Counter.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Counter from './Counter';

describe('Counter Component', () => {
    test('renders with initial value', () => {
        render(<Counter initialValue={5} />);
        expect(screen.getByTestId('count-value')).toHaveTextContent('Count: 5');
    });
    
    test('increments count when increment button is clicked', () => {
        render(<Counter />);
        const incrementButton = screen.getByTestId('increment-button');
        const countValue = screen.getByTestId('count-value');
        
        fireEvent.click(incrementButton);
        expect(countValue).toHaveTextContent('Count: 1');
        
        fireEvent.click(incrementButton);
        expect(countValue).toHaveTextContent('Count: 2');
    });
    
    test('decrements count when decrement button is clicked', () => {
        render(<Counter initialValue={5} />);
        const decrementButton = screen.getByTestId('decrement-button');
        const countValue = screen.getByTestId('count-value');
        
        fireEvent.click(decrementButton);
        expect(countValue).toHaveTextContent('Count: 4');
    });
    
    test('resets count to initial value when reset button is clicked', () => {
        render(<Counter initialValue={10} />);
        const incrementButton = screen.getByTestId('increment-button');
        const resetButton = screen.getByTestId('reset-button');
        const countValue = screen.getByTestId('count-value');
        
        // 增加计数
        fireEvent.click(incrementButton);
        fireEvent.click(incrementButton);
        expect(countValue).toHaveTextContent('Count: 12');
        
        // 重置
        fireEvent.click(resetButton);
        expect(countValue).toHaveTextContent('Count: 10');
    });
});
```

## （二）集成测试

```jsx
// UserList.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import UserList from './UserList';

// 模拟API服务器
const server = setupServer(
    rest.get('/api/users', (req, res, ctx) => {
        return res(
            ctx.json([
                { id: 1, name: 'John Doe', email: 'john@example.com' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
            ])
        );
    })
);

// 启动服务器
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserList Component', () => {
    test('loads and displays users', async () => {
        render(<UserList />);
        
        // 检查加载状态
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        
        // 等待用户数据加载
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
        
        // 确保加载状态消失
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    test('handles API error', async () => {
        // 模拟API错误
        server.use(
            rest.get('/api/users', (req, res, ctx) => {
                return res(ctx.status(500));
            })
        );
        
        render(<UserList />);
        
        await waitFor(() => {
            expect(screen.getByText('Error loading users')).toBeInTheDocument();
        });
    });
});
```

# 八、最佳实践

## （一）组件设计原则

```jsx
// ❌ 不好的做法：组件职责过多
function BadUserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // 获取用户信息
        fetch(`/api/users/${userId}`)
            .then(res => res.json())
            .then(setUser);
            
        // 获取用户帖子
        fetch(`/api/users/${userId}/posts`)
            .then(res => res.json())
            .then(setPosts);
            
        setLoading(false);
    }, [userId]);
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
            <div>
                {posts.map(post => (
                    <div key={post.id}>
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ✅ 好的做法：职责分离
function UserInfo({ user }) {
    return (
        <div className="user-info">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
        </div>
    );
}

function PostList({ posts }) {
    return (
        <div className="post-list">
            {posts.map(post => (
                <PostItem key={post.id} post={post} />
            ))}
        </div>
    );
}

function PostItem({ post }) {
    return (
        <article className="post-item">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
        </article>
    );
}

function GoodUserProfile({ userId }) {
    const { user, loading: userLoading } = useUser(userId);
    const { posts, loading: postsLoading } = useUserPosts(userId);
    
    if (userLoading || postsLoading) {
        return <LoadingSpinner />;
    }
    
    return (
        <div className="user-profile">
            <UserInfo user={user} />
            <PostList posts={posts} />
        </div>
    );
}

// 自定义Hooks
function useUser(userId) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(res => res.json())
            .then(user => {
                setUser(user);
                setLoading(false);
            });
    }, [userId]);
    
    return { user, loading };
}

function useUserPosts(userId) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetch(`/api/users/${userId}/posts`)
            .then(res => res.json())
            .then(posts => {
                setPosts(posts);
                setLoading(false);
            });
    }, [userId]);
    
    return { posts, loading };
}
```

## （二）性能优化建议

```jsx
// 1. 避免在渲染中创建对象和函数
// ❌ 不好的做法
function BadComponent({ items }) {
    return (
        <div>
            {items.map(item => (
                <div
                    key={item.id}
                    style={{ padding: '10px', margin: '5px' }} // 每次渲染都创建新对象
                    onClick={() => console.log(item.id)} // 每次渲染都创建新函数
                >
                    {item.name}
                </div>
            ))}
        </div>
    );
}

// ✅ 好的做法
const itemStyle = { padding: '10px', margin: '5px' }; // 提取到组件外部

function GoodComponent({ items, onItemClick }) {
    return (
        <div>
            {items.map(item => (
                <div
                    key={item.id}
                    style={itemStyle}
                    onClick={() => onItemClick(item.id)}
                >
                    {item.name}
                </div>
            ))}
        </div>
    );
}

// 2. 合理使用key
// ❌ 不好的做法
function BadList({ items }) {
    return (
        <ul>
            {items.map((item, index) => (
                <li key={index}>{item.name}</li> // 使用索引作为key
            ))}
        </ul>
    );
}

// ✅ 好的做法
function GoodList({ items }) {
    return (
        <ul>
            {items.map(item => (
                <li key={item.id}>{item.name}</li> // 使用唯一ID作为key
            ))}
        </ul>
    );
}

// 3. 条件渲染优化
// ❌ 不好的做法
function BadConditionalRender({ showExpensive, data }) {
    const expensiveComponent = <ExpensiveComponent data={data} />; // 总是创建
    
    return (
        <div>
            {showExpensive && expensiveComponent}
        </div>
    );
}

// ✅ 好的做法
function GoodConditionalRender({ showExpensive, data }) {
    return (
        <div>
            {showExpensive && <ExpensiveComponent data={data} />} {/* 只在需要时创建 */}
        </div>
    );
}
```

# 九、总结

React作为现代前端开发的核心框架，提供了强大而灵活的组件化开发模式。通过本笔记的学习，我们掌握了：

## 核心概念
- **组件化思想**：将UI拆分为可复用的组件
- **声明式编程**：描述UI应该是什么样子，而不是如何实现
- **单向数据流**：数据从父组件流向子组件
- **虚拟DOM**：提高渲染性能的关键技术

## 重要特性
- **Hooks**：函数组件的状态管理和副作用处理
- **状态管理**：从组件状态到全局状态管理
- **性能优化**：memo、useMemo、useCallback等优化技术
- **路由管理**：单页应用的导航和页面管理

## 最佳实践
- **组件设计**：单一职责、可复用、可测试
- **性能优化**：避免不必要的渲染和计算
- **代码组织**：清晰的文件结构和命名规范
- **测试策略**：单元测试和集成测试

React生态系统丰富，学习曲线相对平缓，是前端开发者必须掌握的重要技能。随着React 18的发布和并发特性的引入，React将继续引领前端开发的发展方向。

---

**参考资料：**
- [React官方文档](https://react.dev/)
- [React Router官方文档](https://reactrouter.com/)
- [Redux官方文档](https://redux.js.org/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)