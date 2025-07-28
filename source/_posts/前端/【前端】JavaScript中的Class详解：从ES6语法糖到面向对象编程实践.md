---
title: 【前端】JavaScript中的Class详解：从ES6语法糖到面向对象编程实践
categories: 前端
date: 2025-07-28
tags:
  - JavaScript
  - ES6
  - Class
  - 面向对象
  - 原型链
  - 继承
  - 前端
  - 编程范式
description: 深入解析JavaScript中Class的本质、语法特性、继承机制，以及与传统原型链的关系，掌握现代JavaScript面向对象编程的核心概念
keywords: JavaScript Class, ES6类, 面向对象编程, 原型链, 继承, constructor, super, 静态方法, 私有属性
---

# 前言

ES6（ECMAScript 2015）引入了`class`关键字，为JavaScript带来了更加直观和熟悉的面向对象编程语法。虽然JavaScript的`class`本质上是基于原型链的语法糖，但它极大地简化了类的定义和继承的实现，使得从其他面向对象语言转来的开发者更容易理解和使用。本文将深入探讨JavaScript中`class`的各个方面，从基础语法到高级特性，帮助开发者全面掌握现代JavaScript的面向对象编程。

# 一、Class的基本概念

## （一）什么是JavaScript Class

JavaScript的`class`是ES6引入的语法糖，它提供了一种更清晰、更简洁的方式来创建对象和实现继承。虽然语法类似于传统的面向对象语言，但JavaScript的类仍然基于原型链机制。

### 1. Class的本质

```javascript
// ES6 Class语法
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    sayHello() {
        return `Hello, I'm ${this.name}`;
    }
}

// 等价的ES5构造函数写法
function Person(name, age) {
    this.name = name;
    this.age = age;
}

Person.prototype.sayHello = function() {
    return `Hello, I'm ${this.name}`;
};

// 验证两者的等价性
console.log(typeof Person); // "function"
console.log(Person.prototype.constructor === Person); // true
```

### 2. Class与构造函数的对比

```javascript
// 对比分析工具
class ClassAnalyzer {
    static compareClassAndFunction() {
        // ES6 Class
        class ModernClass {
            constructor(value) {
                this.value = value;
            }
            
            getValue() {
                return this.value;
            }
        }
        
        // ES5 构造函数
        function TraditionalFunction(value) {
            this.value = value;
        }
        
        TraditionalFunction.prototype.getValue = function() {
            return this.value;
        };
        
        // 创建实例
        const modernInstance = new ModernClass('modern');
        const traditionalInstance = new TraditionalFunction('traditional');
        
        return {
            // 类型检查
            modernType: typeof ModernClass, // "function"
            traditionalType: typeof TraditionalFunction, // "function"
            
            // 原型链检查
            modernProto: ModernClass.prototype,
            traditionalProto: TraditionalFunction.prototype,
            
            // 实例检查
            modernInstanceOf: modernInstance instanceof ModernClass, // true
            traditionalInstanceOf: traditionalInstance instanceof TraditionalFunction, // true
            
            // 方法检查
            modernHasMethod: 'getValue' in modernInstance, // true
            traditionalHasMethod: 'getValue' in traditionalInstance, // true
            
            // 构造函数检查
            modernConstructor: modernInstance.constructor === ModernClass, // true
            traditionalConstructor: traditionalInstance.constructor === TraditionalFunction // true
        };
    }
}

// 运行对比分析
const analysis = ClassAnalyzer.compareClassAndFunction();
console.log('Class vs Function Analysis:', analysis);
```

## （二）Class的基本语法

### 1. 类的定义

```javascript
// 基本类定义
class Rectangle {
    // 构造函数
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    
    // 实例方法
    getArea() {
        return this.width * this.height;
    }
    
    getPerimeter() {
        return 2 * (this.width + this.height);
    }
    
    // Getter方法
    get area() {
        return this.getArea();
    }
    
    // Setter方法
    set dimensions(value) {
        if (Array.isArray(value) && value.length === 2) {
            this.width = value[0];
            this.height = value[1];
        }
    }
    
    // 静态方法
    static createSquare(side) {
        return new Rectangle(side, side);
    }
    
    // 静态属性（ES2022）
    static defaultColor = 'blue';
    
    // 私有属性（ES2022）
    #id = Math.random().toString(36).substr(2, 9);
    
    // 私有方法（ES2022）
    #generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    // 公共方法访问私有属性
    getId() {
        return this.#id;
    }
    
    // 重新生成ID
    regenerateId() {
        this.#id = this.#generateId();
        return this.#id;
    }
}

// 使用示例
const rect = new Rectangle(10, 5);
console.log(rect.getArea()); // 50
console.log(rect.area); // 50 (使用getter)

rect.dimensions = [8, 6]; // 使用setter
console.log(rect.getArea()); // 48

const square = Rectangle.createSquare(4); // 使用静态方法
console.log(square.getArea()); // 16

console.log(Rectangle.defaultColor); // "blue" (静态属性)
console.log(rect.getId()); // 私有属性的值
```

### 2. 类表达式

```javascript
// 命名类表达式
const NamedClass = class MyClass {
    constructor(name) {
        this.name = name;
    }
    
    getName() {
        return this.name;
    }
    
    // 在类内部可以使用MyClass引用自身
    clone() {
        return new MyClass(this.name);
    }
};

// 匿名类表达式
const AnonymousClass = class {
    constructor(value) {
        this.value = value;
    }
    
    getValue() {
        return this.value;
    }
};

// 立即执行的类表达式
const instance = new (class {
    constructor() {
        this.timestamp = Date.now();
    }
    
    getTimestamp() {
        return this.timestamp;
    }
})();

console.log(instance.getTimestamp());

// 动态类创建
function createClass(className, methods = {}) {
    const DynamicClass = class {
        constructor(...args) {
            this.args = args;
            this.className = className;
        }
    };
    
    // 动态添加方法
    Object.keys(methods).forEach(methodName => {
        DynamicClass.prototype[methodName] = methods[methodName];
    });
    
    return DynamicClass;
}

// 使用动态类创建
const CustomClass = createClass('CustomClass', {
    greet() {
        return `Hello from ${this.className}`;
    },
    
    getArgs() {
        return this.args;
    }
});

const customInstance = new CustomClass('arg1', 'arg2');
console.log(customInstance.greet()); // "Hello from CustomClass"
console.log(customInstance.getArgs()); // ['arg1', 'arg2']
```

# 二、Constructor构造函数

## （一）构造函数的作用

构造函数是类的特殊方法，用于创建和初始化类的实例。每个类只能有一个构造函数。

### 1. 基本构造函数

```javascript
class User {
    constructor(username, email, role = 'user') {
        // 参数验证
        if (!username || !email) {
            throw new Error('Username and email are required');
        }
        
        // 初始化实例属性
        this.username = username;
        this.email = email;
        this.role = role;
        this.createdAt = new Date();
        this.isActive = true;
        
        // 调用初始化方法
        this.#initialize();
    }
    
    // 私有初始化方法
    #initialize() {
        this.id = this.#generateUserId();
        this.#setupDefaults();
    }
    
    #generateUserId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
    
    #setupDefaults() {
        this.preferences = {
            theme: 'light',
            notifications: true,
            language: 'en'
        };
    }
    
    // 获取用户信息
    getInfo() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            role: this.role,
            createdAt: this.createdAt,
            isActive: this.isActive
        };
    }
    
    // 更新用户信息
    updateInfo(updates) {
        const allowedFields = ['username', 'email', 'role'];
        
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                this[key] = updates[key];
            }
        });
        
        return this;
    }
}

// 使用示例
try {
    const user1 = new User('john_doe', 'john@example.com');
    console.log(user1.getInfo());
    
    const user2 = new User('admin', 'admin@example.com', 'admin');
    console.log(user2.getInfo());
    
    // 参数验证测试
    const invalidUser = new User(); // 抛出错误
} catch (error) {
    console.error('Error creating user:', error.message);
}
```

### 2. 构造函数重载模拟

```javascript
// JavaScript不支持真正的方法重载，但可以通过参数检查模拟
class Product {
    constructor(...args) {
        // 根据参数数量和类型进行不同的初始化
        if (args.length === 1 && typeof args[0] === 'object') {
            // 对象参数构造
            this.#initFromObject(args[0]);
        } else if (args.length === 2) {
            // 两个参数构造
            this.#initFromParams(args[0], args[1]);
        } else if (args.length === 3) {
            // 三个参数构造
            this.#initFromFullParams(args[0], args[1], args[2]);
        } else {
            // 默认构造
            this.#initDefault();
        }
        
        this.createdAt = new Date();
    }
    
    #initFromObject(config) {
        this.name = config.name || 'Unknown Product';
        this.price = config.price || 0;
        this.category = config.category || 'General';
        this.description = config.description || '';
    }
    
    #initFromParams(name, price) {
        this.name = name;
        this.price = price;
        this.category = 'General';
        this.description = '';
    }
    
    #initFromFullParams(name, price, category) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.description = '';
    }
    
    #initDefault() {
        this.name = 'Default Product';
        this.price = 0;
        this.category = 'General';
        this.description = '';
    }
    
    getInfo() {
        return {
            name: this.name,
            price: this.price,
            category: this.category,
            description: this.description,
            createdAt: this.createdAt
        };
    }
}

// 使用不同的构造方式
const product1 = new Product(); // 默认构造
const product2 = new Product('Laptop', 999); // 两参数构造
const product3 = new Product('Phone', 599, 'Electronics'); // 三参数构造
const product4 = new Product({
    name: 'Tablet',
    price: 399,
    category: 'Electronics',
    description: 'High-performance tablet'
}); // 对象构造

console.log('Product 1:', product1.getInfo());
console.log('Product 2:', product2.getInfo());
console.log('Product 3:', product3.getInfo());
console.log('Product 4:', product4.getInfo());
```

## （二）构造函数的高级特性

### 1. 构造函数中的异步操作

```javascript
// 处理构造函数中的异步操作
class AsyncInitializedClass {
    constructor(config) {
        this.config = config;
        this.isInitialized = false;
        this.initPromise = this.#asyncInit();
    }
    
    async #asyncInit() {
        try {
            // 模拟异步初始化操作
            await this.#loadConfiguration();
            await this.#setupConnections();
            await this.#validateSetup();
            
            this.isInitialized = true;
            console.log('Async initialization completed');
        } catch (error) {
            console.error('Initialization failed:', error);
            throw error;
        }
    }
    
    async #loadConfiguration() {
        // 模拟加载配置
        return new Promise(resolve => {
            setTimeout(() => {
                this.settings = { ...this.config, loaded: true };
                resolve();
            }, 100);
        });
    }
    
    async #setupConnections() {
        // 模拟建立连接
        return new Promise(resolve => {
            setTimeout(() => {
                this.connections = ['db', 'cache', 'api'];
                resolve();
            }, 50);
        });
    }
    
    async #validateSetup() {
        // 模拟验证设置
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.settings && this.connections) {
                    resolve();
                } else {
                    reject(new Error('Setup validation failed'));
                }
            }, 30);
        });
    }
    
    // 确保初始化完成后再执行操作
    async ready() {
        await this.initPromise;
        return this.isInitialized;
    }
    
    async performOperation() {
        await this.ready();
        return 'Operation completed successfully';
    }
    
    // 静态工厂方法，返回已初始化的实例
    static async create(config) {
        const instance = new AsyncInitializedClass(config);
        await instance.ready();
        return instance;
    }
}

// 使用异步初始化的类
async function demonstrateAsyncInit() {
    try {
        // 方法1：创建后等待初始化
        const instance1 = new AsyncInitializedClass({ name: 'test' });
        await instance1.ready();
        console.log('Instance 1 ready');
        
        // 方法2：使用静态工厂方法
        const instance2 = await AsyncInitializedClass.create({ name: 'test2' });
        console.log('Instance 2 ready');
        
        // 执行操作
        const result = await instance2.performOperation();
        console.log(result);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// demonstrateAsyncInit();
```

# 三、类的继承机制

## （一）extends关键字

JavaScript的类继承使用`extends`关键字实现，它基于原型链机制，但提供了更清晰的语法。

### 1. 基本继承

```javascript
// 基类（父类）
class Animal {
    constructor(name, species) {
        this.name = name;
        this.species = species;
        this.isAlive = true;
    }

    // 实例方法
    makeSound() {
        return `${this.name} makes a sound`;
    }

    eat(food) {
        return `${this.name} is eating ${food}`;
    }

    sleep() {
        return `${this.name} is sleeping`;
    }

    // 获取基本信息
    getInfo() {
        return {
            name: this.name,
            species: this.species,
            isAlive: this.isAlive
        };
    }

    // 静态方法
    static getKingdom() {
        return 'Animalia';
    }
}

// 派生类（子类）
class Dog extends Animal {
    constructor(name, breed, age) {
        // 调用父类构造函数
        super(name, 'Canine');
        this.breed = breed;
        this.age = age;
        this.isLoyal = true;
    }

    // 重写父类方法
    makeSound() {
        return `${this.name} barks: Woof! Woof!`;
    }

    // 新增方法
    fetch(item) {
        return `${this.name} fetches the ${item}`;
    }

    wagTail() {
        return `${this.name} is wagging its tail happily`;
    }

    // 重写getInfo方法，添加更多信息
    getInfo() {
        return {
            ...super.getInfo(), // 调用父类方法
            breed: this.breed,
            age: this.age,
            isLoyal: this.isLoyal
        };
    }

    // 静态方法
    static getDomesticationPeriod() {
        return '15,000 years ago';
    }
}

// 进一步继承
class GermanShepherd extends Dog {
    constructor(name, age, trainingLevel = 'basic') {
        super(name, 'German Shepherd', age);
        this.trainingLevel = trainingLevel;
        this.isWorkingDog = true;
    }

    // 重写方法
    makeSound() {
        return `${this.name} barks authoritatively: WOOF!`;
    }

    // 新增专业方法
    guard() {
        return `${this.name} is guarding the area`;
    }

    track(scent) {
        return `${this.name} is tracking the ${scent} scent`;
    }

    getInfo() {
        return {
            ...super.getInfo(),
            trainingLevel: this.trainingLevel,
            isWorkingDog: this.isWorkingDog
        };
    }
}

// 使用示例
const animal = new Animal('Generic Animal', 'Unknown');
const dog = new Dog('Buddy', 'Golden Retriever', 3);
const germanShepherd = new GermanShepherd('Rex', 5, 'advanced');

console.log(animal.makeSound()); // "Generic Animal makes a sound"
console.log(dog.makeSound()); // "Buddy barks: Woof! Woof!"
console.log(germanShepherd.makeSound()); // "Rex barks authoritatively: WOOF!"

console.log(dog.getInfo());
console.log(germanShepherd.getInfo());

// 静态方法调用
console.log(Animal.getKingdom()); // "Animalia"
console.log(Dog.getDomesticationPeriod()); // "15,000 years ago"
```

### 2. super关键字详解

```javascript
class Vehicle {
    constructor(make, model, year) {
        this.make = make;
        this.model = model;
        this.year = year;
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        return `${this.make} ${this.model} is starting...`;
    }

    stop() {
        this.isRunning = false;
        return `${this.make} ${this.model} has stopped`;
    }

    getStatus() {
        return {
            make: this.make,
            model: this.model,
            year: this.year,
            isRunning: this.isRunning
        };
    }
}

class Car extends Vehicle {
    constructor(make, model, year, doors, fuelType) {
        // super()必须在使用this之前调用
        super(make, model, year);
        this.doors = doors;
        this.fuelType = fuelType;
        this.gear = 'P'; // Park
    }

    start() {
        // 调用父类方法并扩展功能
        const parentResult = super.start();
        this.gear = 'D'; // Drive
        return `${parentResult} Car is in Drive mode.`;
    }

    stop() {
        // 先执行子类逻辑，再调用父类方法
        this.gear = 'P';
        const parentResult = super.stop();
        return `Car shifted to Park. ${parentResult}`;
    }

    getStatus() {
        // 合并父类状态和子类状态
        return {
            ...super.getStatus(),
            doors: this.doors,
            fuelType: this.fuelType,
            gear: this.gear
        };
    }

    // 新增方法
    honk() {
        return `${this.make} ${this.model} honks: BEEP BEEP!`;
    }
}

class ElectricCar extends Car {
    constructor(make, model, year, doors, batteryCapacity) {
        super(make, model, year, doors, 'Electric');
        this.batteryCapacity = batteryCapacity;
        this.batteryLevel = 100;
        this.chargingPort = 'Type 2';
    }

    start() {
        if (this.batteryLevel < 10) {
            return `${this.make} ${this.model} cannot start - low battery!`;
        }

        // 调用父类的start方法
        const parentResult = super.start();
        return `${parentResult} Electric motor engaged silently.`;
    }

    charge(duration) {
        const chargeAmount = Math.min(duration * 10, 100 - this.batteryLevel);
        this.batteryLevel += chargeAmount;
        return `Charged for ${duration} hours. Battery level: ${this.batteryLevel}%`;
    }

    getStatus() {
        return {
            ...super.getStatus(),
            batteryCapacity: this.batteryCapacity,
            batteryLevel: this.batteryLevel,
            chargingPort: this.chargingPort
        };
    }
}

// 使用示例
const electricCar = new ElectricCar('Tesla', 'Model 3', 2023, 4, '75kWh');

console.log(electricCar.start());
console.log(electricCar.getStatus());
console.log(electricCar.charge(2));
console.log(electricCar.stop());
```

## （二）多层继承和混入模式

### 1. 多层继承链

```javascript
// 演示复杂的继承链
class LivingBeing {
    constructor(name) {
        this.name = name;
        this.isAlive = true;
        this.createdAt = new Date();
    }

    live() {
        return `${this.name} is living`;
    }

    die() {
        this.isAlive = false;
        return `${this.name} has died`;
    }
}

class Organism extends LivingBeing {
    constructor(name, cellType) {
        super(name);
        this.cellType = cellType; // 'prokaryotic' or 'eukaryotic'
    }

    metabolize() {
        return `${this.name} is metabolizing`;
    }
}

class Animal extends Organism {
    constructor(name, mobility) {
        super(name, 'eukaryotic');
        this.mobility = mobility;
        this.canMove = true;
    }

    move() {
        return this.canMove ? `${this.name} is moving` : `${this.name} cannot move`;
    }

    breathe() {
        return `${this.name} is breathing`;
    }
}

class Mammal extends Animal {
    constructor(name, furType) {
        super(name, 'walking');
        this.furType = furType;
        this.isWarmBlooded = true;
        this.hasHair = true;
    }

    produceMilk() {
        return `${this.name} is producing milk`;
    }

    regulateTemperature() {
        return `${this.name} is regulating body temperature`;
    }
}

class Primate extends Mammal {
    constructor(name, intelligence) {
        super(name, 'fur');
        this.intelligence = intelligence;
        this.hasOpposableThumbs = true;
    }

    useTools() {
        return `${this.name} is using tools`;
    }

    communicate() {
        return `${this.name} is communicating`;
    }
}

class Human extends Primate {
    constructor(name, language, culture) {
        super(name, 'high');
        this.language = language;
        this.culture = culture;
        this.canSpeak = true;
        this.canWrite = true;
    }

    speak(message) {
        return `${this.name} says: "${message}" in ${this.language}`;
    }

    write(text) {
        return `${this.name} writes: "${text}"`;
    }

    createArt() {
        return `${this.name} is creating art influenced by ${this.culture} culture`;
    }

    // 展示继承链中的所有能力
    demonstrateAbilities() {
        const abilities = [
            this.live(),
            this.metabolize(),
            this.move(),
            this.breathe(),
            this.produceMilk(),
            this.regulateTemperature(),
            this.useTools(),
            this.communicate(),
            this.speak('Hello World'),
            this.write('JavaScript is awesome'),
            this.createArt()
        ];

        return abilities;
    }
}

// 使用示例
const human = new Human('Alice', 'English', 'Western');
console.log('Human abilities:');
human.demonstrateAbilities().forEach(ability => console.log('- ' + ability));

// 检查继承链
console.log('\nInheritance chain:');
console.log('instanceof Human:', human instanceof Human); // true
console.log('instanceof Primate:', human instanceof Primate); // true
console.log('instanceof Mammal:', human instanceof Mammal); // true
console.log('instanceof Animal:', human instanceof Animal); // true
console.log('instanceof Organism:', human instanceof Organism); // true
console.log('instanceof LivingBeing:', human instanceof LivingBeing); // true
```

### 2. 混入（Mixin）模式

```javascript
// 混入模式 - 模拟多重继承
const Flyable = {
    fly() {
        return `${this.name} is flying`;
    },

    land() {
        return `${this.name} is landing`;
    },

    getAltitude() {
        return this.altitude || 0;
    },

    setAltitude(altitude) {
        this.altitude = altitude;
        return `${this.name} is now at ${altitude} feet`;
    }
};

const Swimmable = {
    swim() {
        return `${this.name} is swimming`;
    },

    dive(depth) {
        this.depth = depth;
        return `${this.name} dives to ${depth} meters`;
    },

    surface() {
        this.depth = 0;
        return `${this.name} surfaces`;
    }
};

const Walkable = {
    walk() {
        return `${this.name} is walking`;
    },

    run() {
        return `${this.name} is running`;
    },

    jump() {
        return `${this.name} jumps`;
    }
};

// 混入函数
function mixin(target, ...sources) {
    sources.forEach(source => {
        Object.getOwnPropertyNames(source).forEach(name => {
            if (name !== 'constructor') {
                target.prototype[name] = source[name];
            }
        });
    });
    return target;
}

// 基础动物类
class BaseAnimal {
    constructor(name, species) {
        this.name = name;
        this.species = species;
    }

    makeSound() {
        return `${this.name} makes a sound`;
    }
}

// 创建具有多种能力的动物类
class Duck extends BaseAnimal {
    constructor(name) {
        super(name, 'Duck');
        this.altitude = 0;
        this.depth = 0;
    }

    makeSound() {
        return `${this.name} quacks: Quack! Quack!`;
    }
}

// 应用混入
mixin(Duck, Flyable, Swimmable, Walkable);

class Penguin extends BaseAnimal {
    constructor(name) {
        super(name, 'Penguin');
        this.depth = 0;
    }

    makeSound() {
        return `${this.name} makes penguin sounds`;
    }
}

// 企鹅只能游泳和走路
mixin(Penguin, Swimmable, Walkable);

class Eagle extends BaseAnimal {
    constructor(name) {
        super(name, 'Eagle');
        this.altitude = 0;
    }

    makeSound() {
        return `${this.name} screeches`;
    }
}

// 老鹰只能飞行和走路
mixin(Eagle, Flyable, Walkable);

// 使用示例
const duck = new Duck('Donald');
const penguin = new Penguin('Pingu');
const eagle = new Eagle('Eddie');

console.log('Duck abilities:');
console.log(duck.makeSound());
console.log(duck.fly());
console.log(duck.swim());
console.log(duck.walk());

console.log('\nPenguin abilities:');
console.log(penguin.makeSound());
console.log(penguin.swim());
console.log(penguin.walk());
// console.log(penguin.fly()); // 这会报错，因为企鹅没有飞行能力

console.log('\nEagle abilities:');
console.log(eagle.makeSound());
console.log(eagle.fly());
console.log(eagle.walk());
// console.log(eagle.swim()); // 这会报错，因为老鹰没有游泳能力
```

# 四、静态方法和属性

## （一）静态方法

静态方法属于类本身，而不是类的实例。它们通过类名直接调用，不能通过实例调用。

### 1. 基本静态方法

```javascript
class MathUtils {
    // 静态方法 - 工具函数
    static add(a, b) {
        return a + b;
    }

    static multiply(a, b) {
        return a * b;
    }

    static factorial(n) {
        if (n <= 1) return 1;
        return n * MathUtils.factorial(n - 1);
    }

    static isPrime(num) {
        if (num < 2) return false;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) return false;
        }
        return true;
    }

    static fibonacci(n) {
        if (n <= 1) return n;
        return MathUtils.fibonacci(n - 1) + MathUtils.fibonacci(n - 2);
    }

    // 静态方法可以调用其他静态方法
    static getRandomPrime(max = 100) {
        const candidates = [];
        for (let i = 2; i <= max; i++) {
            if (this.isPrime(i)) {
                candidates.push(i);
            }
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    }
}

// 使用静态方法
console.log(MathUtils.add(5, 3)); // 8
console.log(MathUtils.factorial(5)); // 120
console.log(MathUtils.isPrime(17)); // true
console.log(MathUtils.fibonacci(10)); // 55
console.log(MathUtils.getRandomPrime(50)); // 随机质数
```

### 2. 工厂模式中的静态方法

```javascript
class User {
    constructor(name, email, role, permissions) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.permissions = permissions;
        this.createdAt = new Date();
        this.id = User.generateId();
    }

    // 实例方法
    hasPermission(permission) {
        return this.permissions.includes(permission);
    }

    getInfo() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            createdAt: this.createdAt
        };
    }

    // 静态方法 - ID生成器
    static generateId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }

    // 静态工厂方法 - 创建管理员用户
    static createAdmin(name, email) {
        const adminPermissions = [
            'read', 'write', 'delete', 'manage_users',
            'manage_system', 'view_analytics'
        ];
        return new User(name, email, 'admin', adminPermissions);
    }

    // 静态工厂方法 - 创建普通用户
    static createRegularUser(name, email) {
        const userPermissions = ['read', 'write'];
        return new User(name, email, 'user', userPermissions);
    }

    // 静态工厂方法 - 创建访客用户
    static createGuest(name = 'Guest') {
        const guestPermissions = ['read'];
        return new User(name, 'guest@example.com', 'guest', guestPermissions);
    }

    // 静态方法 - 批量创建用户
    static createBatch(userDataArray) {
        return userDataArray.map(userData => {
            switch (userData.role) {
                case 'admin':
                    return User.createAdmin(userData.name, userData.email);
                case 'user':
                    return User.createRegularUser(userData.name, userData.email);
                case 'guest':
                    return User.createGuest(userData.name);
                default:
                    throw new Error(`Unknown role: ${userData.role}`);
            }
        });
    }

    // 静态验证方法
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateUserData(userData) {
        const errors = [];

        if (!userData.name || userData.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (!this.validateEmail(userData.email)) {
            errors.push('Invalid email format');
        }

        if (!['admin', 'user', 'guest'].includes(userData.role)) {
            errors.push('Invalid role');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// 使用工厂方法创建用户
const admin = User.createAdmin('John Admin', 'john@admin.com');
const regularUser = User.createRegularUser('Jane User', 'jane@user.com');
const guest = User.createGuest();

console.log('Admin info:', admin.getInfo());
console.log('Admin has manage_users permission:', admin.hasPermission('manage_users'));

console.log('Regular user info:', regularUser.getInfo());
console.log('Regular user has delete permission:', regularUser.hasPermission('delete'));

// 批量创建用户
const usersData = [
    { name: 'Alice', email: 'alice@example.com', role: 'admin' },
    { name: 'Bob', email: 'bob@example.com', role: 'user' },
    { name: 'Charlie', role: 'guest' }
];

const users = User.createBatch(usersData);
console.log('Batch created users:', users.map(user => user.getInfo()));

// 验证用户数据
const validation = User.validateUserData({
    name: 'Test User',
    email: 'invalid-email',
    role: 'unknown'
});
console.log('Validation result:', validation);
```

## （二）静态属性

静态属性属于类本身，所有实例共享同一个静态属性值。

### 1. 静态属性的定义和使用

```javascript
class Counter {
    // 静态属性（ES2022语法）
    static totalInstances = 0;
    static maxInstances = 10;
    static instanceRegistry = [];

    constructor(name) {
        // 检查实例数量限制
        if (Counter.totalInstances >= Counter.maxInstances) {
            throw new Error(`Cannot create more than ${Counter.maxInstances} instances`);
        }

        this.name = name;
        this.id = ++Counter.totalInstances;
        this.createdAt = new Date();

        // 注册实例
        Counter.instanceRegistry.push(this);

        console.log(`Created instance ${this.id}: ${this.name}`);
    }

    // 实例方法
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            createdAt: this.createdAt
        };
    }

    // 静态方法访问静态属性
    static getTotalInstances() {
        return Counter.totalInstances;
    }

    static getInstanceRegistry() {
        return Counter.instanceRegistry.map(instance => instance.getInfo());
    }

    static findInstanceByName(name) {
        return Counter.instanceRegistry.find(instance => instance.name === name);
    }

    static resetCounter() {
        Counter.totalInstances = 0;
        Counter.instanceRegistry = [];
        console.log('Counter reset');
    }

    static setMaxInstances(max) {
        Counter.maxInstances = max;
        console.log(`Max instances set to ${max}`);
    }

    // 销毁实例
    destroy() {
        const index = Counter.instanceRegistry.indexOf(this);
        if (index > -1) {
            Counter.instanceRegistry.splice(index, 1);
            console.log(`Instance ${this.id} destroyed`);
        }
    }
}

// 使用示例
try {
    const counter1 = new Counter('First');
    const counter2 = new Counter('Second');
    const counter3 = new Counter('Third');

    console.log('Total instances:', Counter.getTotalInstances());
    console.log('Instance registry:', Counter.getInstanceRegistry());

    // 查找实例
    const found = Counter.findInstanceByName('Second');
    console.log('Found instance:', found?.getInfo());

    // 销毁实例
    counter2.destroy();
    console.log('After destruction:', Counter.getInstanceRegistry());

} catch (error) {
    console.error('Error:', error.message);
}
```

### 2. 配置管理中的静态属性

```javascript
class AppConfig {
    // 静态配置属性
    static #config = {
        apiUrl: 'https://api.example.com',
        timeout: 5000,
        retryAttempts: 3,
        debug: false,
        version: '1.0.0'
    };

    static #environment = 'development';
    static #initialized = false;

    // 静态方法 - 初始化配置
    static initialize(config = {}) {
        if (AppConfig.#initialized) {
            console.warn('AppConfig already initialized');
            return;
        }

        // 合并配置
        AppConfig.#config = { ...AppConfig.#config, ...config };
        AppConfig.#initialized = true;

        console.log('AppConfig initialized:', AppConfig.#config);
    }

    // 静态方法 - 获取配置值
    static get(key) {
        if (!AppConfig.#initialized) {
            throw new Error('AppConfig not initialized. Call AppConfig.initialize() first.');
        }

        return AppConfig.#config[key];
    }

    // 静态方法 - 设置配置值
    static set(key, value) {
        if (!AppConfig.#initialized) {
            throw new Error('AppConfig not initialized. Call AppConfig.initialize() first.');
        }

        const oldValue = AppConfig.#config[key];
        AppConfig.#config[key] = value;

        console.log(`Config updated: ${key} = ${value} (was: ${oldValue})`);
    }

    // 静态方法 - 获取所有配置
    static getAll() {
        if (!AppConfig.#initialized) {
            throw new Error('AppConfig not initialized');
        }

        return { ...AppConfig.#config }; // 返回副本
    }

    // 静态方法 - 设置环境
    static setEnvironment(env) {
        AppConfig.#environment = env;

        // 根据环境调整配置
        switch (env) {
            case 'production':
                AppConfig.set('debug', false);
                AppConfig.set('apiUrl', 'https://api.production.com');
                break;
            case 'development':
                AppConfig.set('debug', true);
                AppConfig.set('apiUrl', 'https://api.dev.com');
                break;
            case 'testing':
                AppConfig.set('debug', true);
                AppConfig.set('apiUrl', 'https://api.test.com');
                AppConfig.set('timeout', 1000);
                break;
        }

        console.log(`Environment set to: ${env}`);
    }

    // 静态方法 - 获取环境
    static getEnvironment() {
        return AppConfig.#environment;
    }

    // 静态方法 - 重置配置
    static reset() {
        AppConfig.#config = {
            apiUrl: 'https://api.example.com',
            timeout: 5000,
            retryAttempts: 3,
            debug: false,
            version: '1.0.0'
        };
        AppConfig.#environment = 'development';
        AppConfig.#initialized = false;

        console.log('AppConfig reset to defaults');
    }

    // 静态方法 - 验证配置
    static validate() {
        const required = ['apiUrl', 'timeout', 'retryAttempts'];
        const missing = required.filter(key => !(key in AppConfig.#config));

        if (missing.length > 0) {
            throw new Error(`Missing required config keys: ${missing.join(', ')}`);
        }

        // 类型验证
        if (typeof AppConfig.#config.timeout !== 'number') {
            throw new Error('timeout must be a number');
        }

        if (typeof AppConfig.#config.retryAttempts !== 'number') {
            throw new Error('retryAttempts must be a number');
        }

        console.log('Configuration is valid');
        return true;
    }
}

// 使用配置管理
try {
    // 初始化配置
    AppConfig.initialize({
        apiUrl: 'https://my-api.com',
        debug: true,
        customSetting: 'custom value'
    });

    // 获取配置
    console.log('API URL:', AppConfig.get('apiUrl'));
    console.log('Debug mode:', AppConfig.get('debug'));

    // 设置环境
    AppConfig.setEnvironment('production');

    // 验证配置
    AppConfig.validate();

    // 获取所有配置
    console.log('All config:', AppConfig.getAll());

} catch (error) {
    console.error('Config error:', error.message);
}
```

# 五、私有属性和方法

ES2022引入了真正的私有字段和方法，使用`#`前缀标识。

## （一）私有属性

```javascript
class BankAccount {
    // 私有属性
    #balance = 0;
    #accountNumber;
    #pin;
    #transactionHistory = [];
    #isLocked = false;
    #failedAttempts = 0;

    // 静态私有属性
    static #totalAccounts = 0;
    static #bankName = 'SecureBank';

    constructor(initialBalance, pin) {
        if (initialBalance < 0) {
            throw new Error('Initial balance cannot be negative');
        }

        this.#balance = initialBalance;
        this.#pin = pin;
        this.#accountNumber = this.#generateAccountNumber();

        BankAccount.#totalAccounts++;

        this.#addTransaction('Account opened', initialBalance);
    }

    // 私有方法
    #generateAccountNumber() {
        return `ACC${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }

    #validatePin(pin) {
        return this.#pin === pin;
    }

    #addTransaction(type, amount, balance = this.#balance) {
        this.#transactionHistory.push({
            id: Date.now(),
            type,
            amount,
            balance,
            timestamp: new Date()
        });
    }

    #checkAccountLock() {
        if (this.#isLocked) {
            throw new Error('Account is locked due to multiple failed attempts');
        }
    }

    #handleFailedAttempt() {
        this.#failedAttempts++;
        if (this.#failedAttempts >= 3) {
            this.#isLocked = true;
            throw new Error('Account locked after 3 failed PIN attempts');
        }
        throw new Error(`Invalid PIN. ${3 - this.#failedAttempts} attempts remaining`);
    }

    // 公共方法
    deposit(amount, pin) {
        this.#checkAccountLock();

        if (!this.#validatePin(pin)) {
            this.#handleFailedAttempt();
        }

        this.#failedAttempts = 0; // 重置失败次数

        if (amount <= 0) {
            throw new Error('Deposit amount must be positive');
        }

        this.#balance += amount;
        this.#addTransaction('Deposit', amount);

        return {
            success: true,
            message: `Deposited $${amount}`,
            balance: this.#balance
        };
    }

    withdraw(amount, pin) {
        this.#checkAccountLock();

        if (!this.#validatePin(pin)) {
            this.#handleFailedAttempt();
        }

        this.#failedAttempts = 0;

        if (amount <= 0) {
            throw new Error('Withdrawal amount must be positive');
        }

        if (amount > this.#balance) {
            throw new Error('Insufficient funds');
        }

        this.#balance -= amount;
        this.#addTransaction('Withdrawal', -amount);

        return {
            success: true,
            message: `Withdrew $${amount}`,
            balance: this.#balance
        };
    }

    getBalance(pin) {
        this.#checkAccountLock();

        if (!this.#validatePin(pin)) {
            this.#handleFailedAttempt();
        }

        this.#failedAttempts = 0;
        return this.#balance;
    }

    getAccountInfo(pin) {
        this.#checkAccountLock();

        if (!this.#validatePin(pin)) {
            this.#handleFailedAttempt();
        }

        this.#failedAttempts = 0;

        return {
            accountNumber: this.#accountNumber,
            balance: this.#balance,
            isLocked: this.#isLocked,
            transactionCount: this.#transactionHistory.length
        };
    }

    getTransactionHistory(pin, limit = 10) {
        this.#checkAccountLock();

        if (!this.#validatePin(pin)) {
            this.#handleFailedAttempt();
        }

        this.#failedAttempts = 0;

        return this.#transactionHistory
            .slice(-limit)
            .reverse(); // 最新的在前面
    }

    // 管理员方法（仅用于演示，实际应用中需要更严格的权限控制）
    unlockAccount(adminCode) {
        if (adminCode === 'ADMIN123') {
            this.#isLocked = false;
            this.#failedAttempts = 0;
            this.#addTransaction('Account unlocked by admin', 0);
            return { success: true, message: 'Account unlocked' };
        }
        throw new Error('Invalid admin code');
    }

    // 静态方法
    static getTotalAccounts() {
        return BankAccount.#totalAccounts;
    }

    static getBankName() {
        return BankAccount.#bankName;
    }
}

// 使用示例
try {
    const account = new BankAccount(1000, '1234');

    console.log('Account created');
    console.log('Balance:', account.getBalance('1234'));

    // 存款
    console.log(account.deposit(500, '1234'));

    // 取款
    console.log(account.withdraw(200, '1234'));

    // 获取账户信息
    console.log('Account info:', account.getAccountInfo('1234'));

    // 获取交易历史
    console.log('Transaction history:', account.getTransactionHistory('1234', 5));

    // 尝试访问私有属性（会失败）
    // console.log(account.#balance); // SyntaxError: Private field '#balance' must be declared in an enclosing class

    // 错误的PIN测试
    try {
        account.getBalance('wrong');
    } catch (error) {
        console.error('PIN error:', error.message);
    }

    console.log('Total accounts:', BankAccount.getTotalAccounts());

} catch (error) {
    console.error('Account error:', error.message);
}
```

## （二）私有方法的高级应用

```javascript
class DataProcessor {
    // 私有属性
    #data = [];
    #processedData = null;
    #isProcessing = false;
    #processingSteps = [];

    constructor(initialData = []) {
        this.#data = [...initialData];
    }

    // 私有方法 - 数据验证
    #validateData(data) {
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }

        return data.every(item =>
            typeof item === 'object' &&
            item !== null &&
            'value' in item
        );
    }

    // 私有方法 - 数据清洗
    #cleanData(data) {
        this.#addProcessingStep('Data cleaning started');

        const cleaned = data
            .filter(item => item.value !== null && item.value !== undefined)
            .map(item => ({
                ...item,
                value: typeof item.value === 'string' ? item.value.trim() : item.value
            }));

        this.#addProcessingStep(`Data cleaning completed. ${cleaned.length} items remaining`);
        return cleaned;
    }

    // 私有方法 - 数据转换
    #transformData(data) {
        this.#addProcessingStep('Data transformation started');

        const transformed = data.map(item => ({
            ...item,
            value: typeof item.value === 'string' ?
                parseFloat(item.value) || 0 :
                Number(item.value) || 0,
            processed: true,
            processedAt: new Date()
        }));

        this.#addProcessingStep('Data transformation completed');
        return transformed;
    }

    // 私有方法 - 数据聚合
    #aggregateData(data) {
        this.#addProcessingStep('Data aggregation started');

        const aggregated = {
            total: data.length,
            sum: data.reduce((sum, item) => sum + item.value, 0),
            average: 0,
            min: Math.min(...data.map(item => item.value)),
            max: Math.max(...data.map(item => item.value)),
            items: data
        };

        aggregated.average = aggregated.total > 0 ? aggregated.sum / aggregated.total : 0;

        this.#addProcessingStep('Data aggregation completed');
        return aggregated;
    }

    // 私有方法 - 添加处理步骤记录
    #addProcessingStep(step) {
        this.#processingSteps.push({
            step,
            timestamp: new Date()
        });
    }

    // 私有方法 - 重置处理状态
    #resetProcessingState() {
        this.#isProcessing = false;
        this.#processingSteps = [];
        this.#processedData = null;
    }

    // 公共方法 - 添加数据
    addData(newData) {
        if (this.#isProcessing) {
            throw new Error('Cannot add data while processing');
        }

        if (!this.#validateData(newData)) {
            throw new Error('Invalid data format');
        }

        this.#data.push(...newData);
        this.#resetProcessingState(); // 重置之前的处理结果

        return this.#data.length;
    }

    // 公共方法 - 处理数据
    async processData() {
        if (this.#isProcessing) {
            throw new Error('Processing already in progress');
        }

        if (this.#data.length === 0) {
            throw new Error('No data to process');
        }

        this.#isProcessing = true;
        this.#resetProcessingState();

        try {
            this.#addProcessingStep('Processing started');

            // 模拟异步处理
            await new Promise(resolve => setTimeout(resolve, 100));

            let processedData = [...this.#data];

            // 执行处理管道
            processedData = this.#cleanData(processedData);
            await new Promise(resolve => setTimeout(resolve, 50));

            processedData = this.#transformData(processedData);
            await new Promise(resolve => setTimeout(resolve, 50));

            this.#processedData = this.#aggregateData(processedData);

            this.#addProcessingStep('Processing completed successfully');

            return {
                success: true,
                result: this.#processedData,
                steps: [...this.#processingSteps]
            };

        } catch (error) {
            this.#addProcessingStep(`Processing failed: ${error.message}`);
            throw error;
        } finally {
            this.#isProcessing = false;
        }
    }

    // 公共方法 - 获取处理结果
    getProcessedData() {
        if (this.#isProcessing) {
            throw new Error('Processing in progress');
        }

        if (!this.#processedData) {
            throw new Error('No processed data available. Call processData() first.');
        }

        return { ...this.#processedData };
    }

    // 公共方法 - 获取处理步骤
    getProcessingSteps() {
        return [...this.#processingSteps];
    }

    // 公共方法 - 获取原始数据统计
    getDataStats() {
        return {
            totalItems: this.#data.length,
            isProcessing: this.#isProcessing,
            hasProcessedData: this.#processedData !== null
        };
    }

    // 公共方法 - 清除所有数据
    clearData() {
        if (this.#isProcessing) {
            throw new Error('Cannot clear data while processing');
        }

        this.#data = [];
        this.#resetProcessingState();

        return true;
    }
}

// 使用示例
async function demonstrateDataProcessor() {
    const processor = new DataProcessor();

    // 添加测试数据
    const testData = [
        { id: 1, value: '10.5', category: 'A' },
        { id: 2, value: 20, category: 'B' },
        { id: 3, value: '30.7', category: 'A' },
        { id: 4, value: null, category: 'C' }, // 将被清理掉
        { id: 5, value: '  15.2  ', category: 'B' } // 将被trim
    ];

    try {
        console.log('Adding data...');
        const count = processor.addData(testData);
        console.log(`Added ${count} total items`);

        console.log('Data stats:', processor.getDataStats());

        console.log('Processing data...');
        const result = await processor.processData();

        console.log('Processing result:', result.result);
        console.log('Processing steps:');
        result.steps.forEach(step => {
            console.log(`- ${step.step} at ${step.timestamp.toISOString()}`);
        });

        // 获取处理后的数据
        const processedData = processor.getProcessedData();
        console.log('Final processed data:', processedData);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// demonstrateDataProcessor();
```

# 六、参考资料

## 官方文档
- [MDN - Classes](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)
- [ECMAScript 2015 Language Specification](https://www.ecma-international.org/ecma-262/6.0/#sec-class-definitions)
- [MDN - Constructor](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/constructor)
- [MDN - Static](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/static)
- [MDN - Private class features](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/Private_class_fields)

## 相关文章
- [【前端】JavaScript中的核心：理解和使用Document对象](./【前端】JavaScript中的核心：理解和使用Document对象.md)
- [【前端】TypeScript与JavaScript对比：异同、优势及适用场景](./【前端】TypeScript与JavaScript对比：异同、优势及适用场景.md)
- [【学习路线】JavaScript全栈开发攻略：前端到后端的完整征程](../学习路线/【学习路线】JavaScript全栈开发攻略：前端到后端的完整征程.md)
- [【前端】跨域问题详解：从同源策略到解决方案的完整指南](./【前端】跨域问题详解：从同源策略到解决方案的完整指南.md)

## 技术资源
- [Babel在线转换器](https://babeljs.io/repl)
- [JavaScript类兼容性表](https://kangax.github.io/compat-table/es6/)
- [Node.js ES6支持情况](https://node.green/)
- [Can I Use - JavaScript Classes](https://caniuse.com/es6-class)

## 学习资源
- [JavaScript高级程序设计](https://book.douban.com/subject/10546125/)
- [你不知道的JavaScript](https://book.douban.com/subject/26351021/)
- [ES6标准入门](https://book.douban.com/subject/27127030/)
