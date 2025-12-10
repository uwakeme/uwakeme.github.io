---
title: 【Java】Java多线程编程详解：从基础到实战
date: 2025-12-10
categories:
  - Java
tags:
  - Java
  - 多线程
  - 并发编程
  - 线程安全
  - 并发工具
---

## 前言

多线程是Java编程中的重要特性，它允许程序同时执行多个任务，充分利用CPU资源，提高程序性能。然而，多线程编程也带来了线程安全、死锁、性能优化等挑战。本文将全面介绍Java多线程的概念、使用方法、常见问题以及最佳实践，帮助您掌握Java并发编程。

## 1. 多线程基础概念

### 1.1 进程与线程

**进程（Process）：**
- 操作系统分配资源的基本单位
- 拥有独立的内存空间
- 进程间通信需要特殊机制（IPC）
- 创建和销毁开销大

**线程（Thread）：**
- CPU调度的基本单位
- 共享进程的内存空间
- 线程间通信简单（共享变量）
- 创建和销毁开销小

**对比：**
```
进程 = 工厂
线程 = 工厂里的工人

一个工厂（进程）可以有多个工人（线程）
工人们共享工厂的资源（内存）
```

### 1.2 并发与并行

**并发（Concurrency）：**
- 多个任务交替执行
- 单核CPU通过时间片轮转实现
- 宏观上同时进行，微观上串行

**并行（Parallelism）：**
- 多个任务真正同时执行
- 需要多核CPU支持
- 真正的同时进行

```java
// 并发示例
单核CPU:
时间片1: 线程A执行
时间片2: 线程B执行
时间片3: 线程A执行
时间片4: 线程C执行

// 并行示例
多核CPU:
核心1: 线程A执行
核心2: 线程B执行  } 同时进行
核心3: 线程C执行
```

### 1.3 线程的生命周期

Java线程有6种状态：

```
NEW (新建)
  ↓ start()
RUNNABLE (可运行)
  ↓ 获得CPU时间片
RUNNING (运行中)
  ↓ sleep()/wait()/阻塞IO
BLOCKED/WAITING/TIMED_WAITING (阻塞/等待)
  ↓ notify()/notifyAll()/超时/IO完成
RUNNABLE (可运行)
  ↓ run()方法执行完毕
TERMINATED (终止)
```

**详细说明：**

1. **NEW（新建）**：线程对象被创建，但未调用start()方法
2. **RUNNABLE（可运行）**：调用start()后，等待CPU调度
3. **BLOCKED（阻塞）**：等待获取锁
4. **WAITING（等待）**：调用wait()或join()，等待其他线程通知
5. **TIMED_WAITING（超时等待）**：调用sleep()或wait(timeout)
6. **TERMINATED（终止）**：线程执行完毕或异常终止

## 2. 创建线程的方式

### 2.1 继承Thread类

```java
/**
 * 方式1：继承Thread类
 */
public class MyThread extends Thread {
    
    private String threadName;
    
    public MyThread(String name) {
        this.threadName = name;
    }
    
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(threadName + " 执行：" + i);
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
    
    public static void main(String[] args) {
        // 创建线程
        MyThread thread1 = new MyThread("线程1");
        MyThread thread2 = new MyThread("线程2");
        
        // 启动线程
        thread1.start();
        thread2.start();
    }
}
```

**优点：**
- 代码简单，易于理解

**缺点：**
- Java不支持多继承，继承Thread后无法继承其他类
- 线程和任务耦合在一起

### 2.2 实现Runnable接口

```java
/**
 * 方式2：实现Runnable接口
 */
public class MyRunnable implements Runnable {
    
    private String taskName;
    
    public MyRunnable(String name) {
        this.taskName = name;
    }
    
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(taskName + " 执行：" + i);
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
    
    public static void main(String[] args) {
        // 创建任务
        MyRunnable task1 = new MyRunnable("任务1");
        MyRunnable task2 = new MyRunnable("任务2");
        
        // 创建线程并启动
        Thread thread1 = new Thread(task1);
        Thread thread2 = new Thread(task2);
        
        thread1.start();
        thread2.start();
    }
}
```

**优点：**
- 避免单继承限制
- 线程和任务分离，更灵活
- 推荐使用

**缺点：**
- 代码相对复杂一点

### 2.3 实现Callable接口

```java
import java.util.concurrent.*;

/**
 * 方式3：实现Callable接口（有返回值）
 */
public class MyCallable implements Callable<String> {
    
    private String taskName;
    
    public MyCallable(String name) {
        this.taskName = name;
    }
    
    @Override
    public String call() throws Exception {
        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            sum += i;
            System.out.println(taskName + " 计算：" + i);
            Thread.sleep(100);
        }
        return taskName + " 计算结果：" + sum;
    }
    
    public static void main(String[] args) {
        // 创建任务
        MyCallable task1 = new MyCallable("任务1");
        MyCallable task2 = new MyCallable("任务2");
        
        // 创建FutureTask
        FutureTask<String> future1 = new FutureTask<>(task1);
        FutureTask<String> future2 = new FutureTask<>(task2);
        
        // 创建线程并启动
        Thread thread1 = new Thread(future1);
        Thread thread2 = new Thread(future2);
        
        thread1.start();
        thread2.start();
        
        try {
            // 获取返回值（会阻塞直到任务完成）
            String result1 = future1.get();
            String result2 = future2.get();
            
            System.out.println(result1);
            System.out.println(result2);
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
    }
}
```

**优点：**
- 可以获取线程执行结果
- 可以抛出异常

**缺点：**
- 代码较复杂

### 2.4 使用线程池

```java
import java.util.concurrent.*;

/**
 * 方式4：使用线程池（推荐）
 */
public class ThreadPoolExample {
    
    public static void main(String[] args) {
        // 创建固定大小的线程池
        ExecutorService executor = Executors.newFixedThreadPool(3);
        
        // 提交任务
        for (int i = 0; i < 5; i++) {
            final int taskId = i;
            executor.submit(() -> {
                System.out.println("任务" + taskId + " 在线程 " 
                    + Thread.currentThread().getName() + " 中执行");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            });
        }
        
        // 关闭线程池
        executor.shutdown();
    }
}
```

**优点：**
- 重用线程，减少创建销毁开销
- 控制并发数量
- 提供更多功能（定时、周期性执行等）
- 生产环境推荐使用

### 2.5 创建方式对比

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 继承Thread | 简单直观 | 无法多继承 | 学习、简单场景 |
| 实现Runnable | 灵活，推荐 | 无返回值 | 一般场景 |
| 实现Callable | 有返回值 | 代码复杂 | 需要返回值 |
| 线程池 | 性能好，功能强 | 配置复杂 | 生产环境 |

## 3. 线程的常用方法

### 3.1 Thread类的常用方法

```java
public class ThreadMethods {
    
    public static void main(String[] args) throws InterruptedException {
        
        Thread thread = new Thread(() -> {
            System.out.println("线程开始执行");
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                System.out.println("线程被中断");
            }
            System.out.println("线程执行完毕");
        });
        
        // 1. start() - 启动线程
        thread.start();
        
        // 2. getName() / setName() - 获取/设置线程名称
        System.out.println("线程名称：" + thread.getName());
        thread.setName("MyThread");
        
        // 3. getPriority() / setPriority() - 获取/设置优先级
        thread.setPriority(Thread.MAX_PRIORITY);  // 1-10，默认5
        
        // 4. isAlive() - 判断线程是否存活
        System.out.println("线程是否存活：" + thread.isAlive());
        
        // 5. join() - 等待线程结束
        thread.join();  // 主线程等待thread执行完毕
        System.out.println("主线程继续执行");
        
        // 6. sleep() - 线程休眠
        Thread.sleep(1000);  // 休眠1秒
        
        // 7. yield() - 线程让步
        Thread.yield();  // 暂停当前线程，让其他线程执行
        
        // 8. interrupt() - 中断线程
        Thread thread2 = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                System.out.println("工作中...");
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    System.out.println("收到中断信号");
                    break;
                }
            }
        });
        thread2.start();
        Thread.sleep(2000);
        thread2.interrupt();  // 发送中断信号
        
        // 9. isDaemon() / setDaemon() - 守护线程
        Thread daemonThread = new Thread(() -> {
            while (true) {
                System.out.println("守护线程运行中");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    break;
                }
            }
        });
        daemonThread.setDaemon(true);  // 设置为守护线程
        daemonThread.start();
        // 主线程结束后，守护线程也会结束
    }
}
```

### 3.2 方法详解

**start() vs run()：**
```java
// start() - 启动新线程，调用run()方法
thread.start();  // 正确：创建新线程

// run() - 直接调用，不会创建新线程
thread.run();    // 错误：在当前线程中执行，不是多线程
```

**sleep() vs wait()：**
```java
// sleep() - Thread类的静态方法，不释放锁
Thread.sleep(1000);  // 休眠1秒，不释放锁

// wait() - Object类的方法，释放锁
synchronized (obj) {
    obj.wait();  // 释放obj的锁，等待notify()
}
```

**join() 示例：**
```java
public class JoinExample {
    public static void main(String[] args) throws InterruptedException {
        Thread thread = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                System.out.println("子线程：" + i);
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        
        thread.start();
        thread.join();  // 主线程等待子线程执行完毕
        
        System.out.println("主线程继续执行");
    }
}
```

## 4. 线程同步与锁

### 4.1 线程安全问题

```java
/**
 * 线程不安全的示例
 */
public class UnsafeCounter {
    
    private int count = 0;
    
    public void increment() {
        count++;  // 非原子操作：读取、加1、写入
    }
    
    public int getCount() {
        return count;
    }
    
    public static void main(String[] args) throws InterruptedException {
        UnsafeCounter counter = new UnsafeCounter();
        
        // 创建10个线程，每个线程执行1000次加1操作
        Thread[] threads = new Thread[10];
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    counter.increment();
                }
            });
            threads[i].start();
        }
        
        // 等待所有线程执行完毕
        for (Thread thread : threads) {
            thread.join();
        }
        
        // 期望结果：10000，实际结果：小于10000
        System.out.println("最终计数：" + counter.getCount());
    }
}
```

### 4.2 synchronized关键字

**方式1：同步方法**
```java
public class SafeCounter {
    
    private int count = 0;
    
    // 同步实例方法（锁对象是this）
    public synchronized void increment() {
        count++;
    }
    
    // 同步静态方法（锁对象是类的Class对象）
    public static synchronized void staticMethod() {
        // ...
    }
    
    public synchronized int getCount() {
        return count;
    }
}
```

**方式2：同步代码块**
```java
public class SafeCounter {
    
    private int count = 0;
    private final Object lock = new Object();
    
    public void increment() {
        synchronized (lock) {  // 同步代码块
            count++;
        }
    }
    
    public int getCount() {
        synchronized (lock) {
            return count;
        }
    }
}
```

**synchronized原理：**
```
1. 每个对象都有一个监视器锁（monitor）
2. 线程进入synchronized块时获取锁
3. 线程退出synchronized块时释放锁
4. 其他线程必须等待锁释放才能进入
```

### 4.3 ReentrantLock（可重入锁）

```java
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class LockCounter {
    
    private int count = 0;
    private final Lock lock = new ReentrantLock();
    
    public void increment() {
        lock.lock();  // 获取锁
        try {
            count++;
        } finally {
            lock.unlock();  // 释放锁（必须在finally中）
        }
    }
    
    public int getCount() {
        lock.lock();
        try {
            return count;
        } finally {
            lock.unlock();
        }
    }
    
    // 尝试获取锁（非阻塞）
    public boolean tryIncrement() {
        if (lock.tryLock()) {  // 尝试获取锁
            try {
                count++;
                return true;
            } finally {
                lock.unlock();
            }
        }
        return false;
    }
}
```

**ReentrantLock vs synchronized：**

| 特性 | synchronized | ReentrantLock |
|------|-------------|---------------|
| 使用方式 | 关键字，自动释放 | 类，手动释放 |
| 灵活性 | 低 | 高 |
| 可中断 | 不支持 | 支持 |
| 超时获取 | 不支持 | 支持 |
| 公平锁 | 非公平 | 可选公平/非公平 |
| 条件变量 | 1个（wait/notify） | 多个（Condition） |
| 性能 | JDK6后优化，相近 | 相近 |

### 4.4 ReadWriteLock（读写锁）

```java
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ReadWriteLockExample {
    
    private int value = 0;
    private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
    
    // 读操作（可以多个线程同时读）
    public int read() {
        rwLock.readLock().lock();
        try {
            System.out.println(Thread.currentThread().getName() + " 读取：" + value);
            Thread.sleep(100);
            return value;
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            rwLock.readLock().unlock();
        }
    }
    
    // 写操作（只能一个线程写）
    public void write(int newValue) {
        rwLock.writeLock().lock();
        try {
            System.out.println(Thread.currentThread().getName() + " 写入：" + newValue);
            this.value = newValue;
            Thread.sleep(100);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            rwLock.writeLock().unlock();
        }
    }
    
    public static void main(String[] args) {
        ReadWriteLockExample example = new ReadWriteLockExample();
        
        // 创建多个读线程
        for (int i = 0; i < 3; i++) {
            new Thread(() -> example.read(), "读线程" + i).start();
        }
        
        // 创建写线程
        new Thread(() -> example.write(100), "写线程").start();
    }
}
```

### 4.5 volatile关键字

```java
public class VolatileExample {
    
    // volatile保证可见性和有序性，但不保证原子性
    private volatile boolean flag = false;
    private volatile int count = 0;
    
    public void setFlag() {
        flag = true;  // 写操作立即对其他线程可见
    }
    
    public void checkFlag() {
        while (!flag) {  // 能够及时看到flag的变化
            // 等待
        }
        System.out.println("Flag已设置");
    }
    
    // volatile不能保证原子性
    public void increment() {
        count++;  // 仍然不是线程安全的！
    }
    
    public static void main(String[] args) throws InterruptedException {
        VolatileExample example = new VolatileExample();
        
        Thread thread1 = new Thread(() -> {
            try {
                Thread.sleep(1000);
                example.setFlag();
                System.out.println("Flag已设置为true");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        
        Thread thread2 = new Thread(() -> {
            example.checkFlag();
        });
        
        thread2.start();
        thread1.start();
        
        thread1.join();
        thread2.join();
    }
}
```

**volatile使用场景：**
1. 状态标志（如上面的flag）
2. 双重检查锁定（DCL）单例模式
3. 读多写少的场景

## 5. 线程通信

### 5.1 wait() 和 notify()

```java
public class WaitNotifyExample {
    
    private final Object lock = new Object();
    private boolean dataReady = false;
    
    // 生产者
    public void produce() {
        synchronized (lock) {
            System.out.println("生产者：准备数据...");
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            dataReady = true;
            System.out.println("生产者：数据准备完毕，通知消费者");
            lock.notify();  // 通知等待的线程
        }
    }
    
    // 消费者
    public void consume() {
        synchronized (lock) {
            while (!dataReady) {
                try {
                    System.out.println("消费者：数据未准备好，等待...");
                    lock.wait();  // 释放锁，等待通知
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            System.out.println("消费者：接收到数据，开始处理");
        }
    }
    
    public static void main(String[] args) {
        WaitNotifyExample example = new WaitNotifyExample();
        
        // 消费者线程
        Thread consumer = new Thread(() -> example.consume());
        
        // 生产者线程
        Thread producer = new Thread(() -> example.produce());
        
        consumer.start();
        try {
            Thread.sleep(100);  // 确保消费者先启动
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        producer.start();
    }
}
```

**wait() vs notify() vs notifyAll()：**
- `wait()`：释放锁，进入等待状态
- `notify()`：随机唤醒一个等待的线程
- `notifyAll()`：唤醒所有等待的线程

### 5.2 生产者消费者模式

```java
import java.util.LinkedList;
import java.util.Queue;

public class ProducerConsumer {
    
    private final Queue<Integer> queue = new LinkedList<>();
    private final int MAX_SIZE = 5;
    private final Object lock = new Object();
    
    // 生产者
    class Producer implements Runnable {
        @Override
        public void run() {
            int value = 0;
            while (true) {
                synchronized (lock) {
                    while (queue.size() == MAX_SIZE) {
                        try {
                            System.out.println("队列已满，生产者等待...");
                            lock.wait();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                    
                    System.out.println("生产：" + value);
                    queue.offer(value++);
                    lock.notifyAll();  // 通知消费者
                    
                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
    
    // 消费者
    class Consumer implements Runnable {
        @Override
        public void run() {
            while (true) {
                synchronized (lock) {
                    while (queue.isEmpty()) {
                        try {
                            System.out.println("队列为空，消费者等待...");
                            lock.wait();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                    
                    int value = queue.poll();
                    System.out.println("消费：" + value);
                    lock.notifyAll();  // 通知生产者
                    
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
    
    public static void main(String[] args) {
        ProducerConsumer pc = new ProducerConsumer();
        
        Thread producer = new Thread(pc.new Producer());
        Thread consumer = new Thread(pc.new Consumer());
        
        producer.start();
        consumer.start();
    }
}
```

### 5.3 使用BlockingQueue实现生产者消费者

```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class BlockingQueueExample {
    
    public static void main(String[] args) {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);
        
        // 生产者
        Thread producer = new Thread(() -> {
            int value = 0;
            while (true) {
                try {
                    queue.put(value);  // 队列满时自动阻塞
                    System.out.println("生产：" + value);
                    value++;
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        
        // 消费者
        Thread consumer = new Thread(() -> {
            while (true) {
                try {
                    int value = queue.take();  // 队列空时自动阻塞
                    System.out.println("消费：" + value);
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        
        producer.start();
        consumer.start();
    }
}
```

## 6. 线程池详解

### 6.1 为什么使用线程池

**优势：**
1. **降低资源消耗**：重用线程，减少创建销毁开销
2. **提高响应速度**：任务到达时，无需等待线程创建
3. **提高线程可管理性**：统一分配、调优和监控
4. **提供更多功能**：定时执行、周期执行等

### 6.2 ThreadPoolExecutor参数详解

```java
import java.util.concurrent.*;

public class ThreadPoolExample {
    
    public static void main(String[] args) {
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            2,                      // corePoolSize：核心线程数
            5,                      // maximumPoolSize：最大线程数
            60L,                    // keepAliveTime：空闲线程存活时间
            TimeUnit.SECONDS,       // unit：时间单位
            new ArrayBlockingQueue<>(10),  // workQueue：任务队列
            Executors.defaultThreadFactory(),  // threadFactory：线程工厂
            new ThreadPoolExecutor.AbortPolicy()  // handler：拒绝策略
        );
        
        // 提交任务
        for (int i = 0; i < 20; i++) {
            final int taskId = i;
            executor.execute(() -> {
                System.out.println("任务" + taskId + " 在线程 " 
                    + Thread.currentThread().getName() + " 中执行");
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            });
        }
        
        executor.shutdown();
    }
}
```

**参数说明：**

1. **corePoolSize（核心线程数）**
   - 线程池中始终保持的线程数量
   - 即使线程空闲也不会被回收

2. **maximumPoolSize（最大线程数）**
   - 线程池允许创建的最大线程数
   - 当队列满时，会创建新线程直到达到最大值

3. **keepAliveTime（存活时间）**
   - 非核心线程空闲时的存活时间
   - 超过这个时间，线程会被回收

4. **workQueue（任务队列）**
   - `ArrayBlockingQueue`：有界队列
   - `LinkedBlockingQueue`：无界队列（可能导致OOM）
   - `SynchronousQueue`：不存储元素的队列
   - `PriorityBlockingQueue`：优先级队列

5. **threadFactory（线程工厂）**
   - 用于创建新线程
   - 可以自定义线程名称、优先级等

6. **handler（拒绝策略）**
   - `AbortPolicy`：抛出异常（默认）
   - `CallerRunsPolicy`：调用者线程执行
   - `DiscardPolicy`：丢弃任务
   - `DiscardOldestPolicy`：丢弃最老的任务

### 6.3 线程池执行流程

```
提交任务
  ↓
核心线程数未满？
  是 → 创建核心线程执行
  否 ↓
任务队列未满？
  是 → 加入队列等待
  否 ↓
线程数未达最大值？
  是 → 创建非核心线程执行
  否 ↓
执行拒绝策略
```

### 6.4 常用线程池类型

```java
import java.util.concurrent.*;

public class ExecutorsExample {
    
    public static void main(String[] args) {
        
        // 1. FixedThreadPool - 固定大小线程池
        ExecutorService fixedPool = Executors.newFixedThreadPool(3);
        // 特点：核心线程数=最大线程数，使用无界队列
        // 适用：执行长期任务
        
        // 2. CachedThreadPool - 可缓存线程池
        ExecutorService cachedPool = Executors.newCachedThreadPool();
        // 特点：核心线程数=0，最大线程数=Integer.MAX_VALUE
        // 适用：执行大量短期异步任务
        
        // 3. SingleThreadExecutor - 单线程线程池
        ExecutorService singlePool = Executors.newSingleThreadExecutor();
        // 特点：只有一个线程，保证任务顺序执行
        // 适用：需要顺序执行的任务
        
        // 4. ScheduledThreadPool - 定时线程池
        ScheduledExecutorService scheduledPool = 
            Executors.newScheduledThreadPool(2);
        // 特点：支持定时和周期性任务
        // 适用：定时任务
        
        // 定时任务示例
        scheduledPool.schedule(() -> {
            System.out.println("延迟3秒执行");
        }, 3, TimeUnit.SECONDS);
        
        scheduledPool.scheduleAtFixedRate(() -> {
            System.out.println("每2秒执行一次");
        }, 0, 2, TimeUnit.SECONDS);
        
        // 关闭线程池
        fixedPool.shutdown();
        cachedPool.shutdown();
        singlePool.shutdown();
        // scheduledPool.shutdown();  // 注释掉以便看到周期执行
    }
}
```

**⚠️ 阿里巴巴Java开发手册建议：**
```java
// 不推荐使用Executors创建线程池
// 原因：可能导致OOM（内存溢出）

// 推荐：手动创建ThreadPoolExecutor
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10,                     // 核心线程数
    20,                     // 最大线程数
    60L,                    // 存活时间
    TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),  // 有界队列
    new ThreadFactoryBuilder()
        .setNameFormat("my-pool-%d")
        .build(),
    new ThreadPoolExecutor.CallerRunsPolicy()
);
```

### 6.5 线程池最佳实践

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class ThreadPoolBestPractice {
    
    // 自定义线程工厂
    static class CustomThreadFactory implements ThreadFactory {
        private final AtomicInteger threadNumber = new AtomicInteger(1);
        private final String namePrefix;
        
        public CustomThreadFactory(String namePrefix) {
            this.namePrefix = namePrefix;
        }
        
        @Override
        public Thread newThread(Runnable r) {
            Thread thread = new Thread(r, 
                namePrefix + "-thread-" + threadNumber.getAndIncrement());
            thread.setDaemon(false);
            thread.setPriority(Thread.NORM_PRIORITY);
            return thread;
        }
    }
    
    // 自定义拒绝策略
    static class CustomRejectedHandler implements RejectedExecutionHandler {
        @Override
        public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
            System.err.println("任务被拒绝：" + r.toString());
            // 记录日志、发送告警等
        }
    }
    
    public static void main(String[] args) {
        // 创建线程池
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            5,                          // 核心线程数
            10,                         // 最大线程数
            60L,                        // 存活时间
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(100),  // 任务队列
            new CustomThreadFactory("MyPool"),  // 自定义线程工厂
            new CustomRejectedHandler()         // 自定义拒绝策略
        );
        
        // 提交任务
        for (int i = 0; i < 20; i++) {
            final int taskId = i;
            executor.execute(() -> {
                System.out.println("执行任务" + taskId);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            });
        }
        
        // 监控线程池状态
        System.out.println("活跃线程数：" + executor.getActiveCount());
        System.out.println("核心线程数：" + executor.getCorePoolSize());
        System.out.println("最大线程数：" + executor.getMaximumPoolSize());
        System.out.println("队列大小：" + executor.getQueue().size());
        System.out.println("已完成任务数：" + executor.getCompletedTaskCount());
        
        // 优雅关闭
        executor.shutdown();  // 不再接受新任务，等待已提交任务完成
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();  // 超时则强制关闭
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }
    }
}
```

## 7. 并发工具类

### 7.1 CountDownLatch（倒计时门闩）

```java
import java.util.concurrent.CountDownLatch;

public class CountDownLatchExample {
    
    public static void main(String[] args) throws InterruptedException {
        int workerCount = 5;
        CountDownLatch latch = new CountDownLatch(workerCount);
        
        System.out.println("主线程等待所有工作线程完成...");
        
        // 创建工作线程
        for (int i = 0; i < workerCount; i++) {
            final int workerId = i;
            new Thread(() -> {
                try {
                    System.out.println("工作线程" + workerId + " 开始工作");
                    Thread.sleep((long) (Math.random() * 3000));
                    System.out.println("工作线程" + workerId + " 完成工作");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    latch.countDown();  // 计数减1
                }
            }).start();
        }
        
        latch.await();  // 等待计数归零
        System.out.println("所有工作线程已完成，主线程继续执行");
    }
}
```

**使用场景：**
- 等待多个线程完成初始化
- 并行计算，等待所有子任务完成

### 7.2 CyclicBarrier（循环栅栏）

```java
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.BrokenBarrierException;

public class CyclicBarrierExample {
    
    public static void main(String[] args) {
        int playerCount = 4;
        
        CyclicBarrier barrier = new CyclicBarrier(playerCount, () -> {
            System.out.println("所有玩家已准备就绪，游戏开始！\n");
        });
        
        // 创建玩家线程
        for (int i = 0; i < playerCount; i++) {
            final int playerId = i;
            new Thread(() -> {
                try {
                    System.out.println("玩家" + playerId + " 已准备");
                    barrier.await();  // 等待其他玩家
                    
                    System.out.println("玩家" + playerId + " 开始游戏");
                    Thread.sleep((long) (Math.random() * 2000));
                    System.out.println("玩家" + playerId + " 完成第一关");
                    
                    barrier.await();  // 等待进入第二关
                    System.out.println("玩家" + playerId + " 开始第二关");
                    
                } catch (InterruptedException | BrokenBarrierException e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}
```

**CountDownLatch vs CyclicBarrier：**

| 特性 | CountDownLatch | CyclicBarrier |
|------|---------------|---------------|
| 可重用 | 不可重用 | 可重用 |
| 等待方式 | 一个线程等待多个线程 | 多个线程互相等待 |
| 计数方式 | 递减到0 | 递增到指定值 |
| 回调 | 不支持 | 支持 |

### 7.3 Semaphore（信号量）

```java
import java.util.concurrent.Semaphore;

public class SemaphoreExample {
    
    public static void main(String[] args) {
        // 模拟停车场，只有3个车位
        Semaphore parkingLot = new Semaphore(3);
        
        // 10辆车尝试停车
        for (int i = 0; i < 10; i++) {
            final int carId = i;
            new Thread(() -> {
                try {
                    System.out.println("车辆" + carId + " 尝试进入停车场");
                    parkingLot.acquire();  // 获取许可（车位）
                    
                    System.out.println("车辆" + carId + " 成功停车");
                    Thread.sleep((long) (Math.random() * 5000));
                    System.out.println("车辆" + carId + " 离开停车场");
                    
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    parkingLot.release();  // 释放许可（车位）
                }
            }).start();
        }
    }
}
```

**使用场景：**
- 限流（控制并发访问数量）
- 资源池管理

### 7.4 Exchanger（交换器）

```java
import java.util.concurrent.Exchanger;

public class ExchangerExample {
    
    public static void main(String[] args) {
        Exchanger<String> exchanger = new Exchanger<>();
        
        // 线程1
        new Thread(() -> {
            try {
                String data1 = "来自线程1的数据";
                System.out.println("线程1准备交换数据：" + data1);
                
                String data2 = exchanger.exchange(data1);
                
                System.out.println("线程1收到数据：" + data2);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
        
        // 线程2
        new Thread(() -> {
            try {
                Thread.sleep(2000);  // 模拟准备数据
                String data2 = "来自线程2的数据";
                System.out.println("线程2准备交换数据：" + data2);
                
                String data1 = exchanger.exchange(data2);
                
                System.out.println("线程2收到数据：" + data1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
}
```

## 8. 原子类

### 8.1 AtomicInteger

```java
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicExample {
    
    private AtomicInteger count = new AtomicInteger(0);
    
    public void increment() {
        count.incrementAndGet();  // 原子操作：加1
    }
    
    public void decrement() {
        count.decrementAndGet();  // 原子操作：减1
    }
    
    public int get() {
        return count.get();
    }
    
    // CAS操作示例
    public boolean compareAndSet(int expect, int update) {
        return count.compareAndSet(expect, update);
    }
    
    public static void main(String[] args) throws InterruptedException {
        AtomicExample example = new AtomicExample();
        
        // 创建10个线程，每个线程执行1000次加1操作
        Thread[] threads = new Thread[10];
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    example.increment();
                }
            });
            threads[i].start();
        }
        
        // 等待所有线程执行完毕
        for (Thread thread : threads) {
            thread.join();
        }
        
        // 结果：10000（线程安全）
        System.out.println("最终计数：" + example.get());
    }
}
```

### 8.2 常用原子类

```java
import java.util.concurrent.atomic.*;

public class AtomicClasses {
    
    public static void main(String[] args) {
        
        // 1. AtomicInteger - 原子整数
        AtomicInteger atomicInt = new AtomicInteger(0);
        atomicInt.incrementAndGet();  // i++
        atomicInt.getAndIncrement();  // ++i
        atomicInt.addAndGet(5);       // i += 5
        
        // 2. AtomicLong - 原子长整数
        AtomicLong atomicLong = new AtomicLong(0);
        
        // 3. AtomicBoolean - 原子布尔
        AtomicBoolean atomicBoolean = new AtomicBoolean(false);
        atomicBoolean.compareAndSet(false, true);
        
        // 4. AtomicReference - 原子引用
        AtomicReference<String> atomicRef = new AtomicReference<>("初始值");
        atomicRef.set("新值");
        atomicRef.compareAndSet("新值", "更新值");
        
        // 5. AtomicIntegerArray - 原子整数数组
        AtomicIntegerArray atomicArray = new AtomicIntegerArray(10);
        atomicArray.set(0, 100);
        atomicArray.incrementAndGet(0);
        
        // 6. AtomicStampedReference - 带版本号的原子引用（解决ABA问题）
        AtomicStampedReference<String> stampedRef = 
            new AtomicStampedReference<>("初始值", 0);
        int[] stampHolder = new int[1];
        String value = stampedRef.get(stampHolder);
        int stamp = stampHolder[0];
        stampedRef.compareAndSet(value, "新值", stamp, stamp + 1);
    }
}
```

## 9. 常见问题与解决方案

### 9.1 死锁

**死锁示例：**
```java
public class DeadlockExample {
    
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();
    
    public void method1() {
        synchronized (lock1) {
            System.out.println(Thread.currentThread().getName() + " 获取lock1");
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            synchronized (lock2) {
                System.out.println(Thread.currentThread().getName() + " 获取lock2");
            }
        }
    }
    
    public void method2() {
        synchronized (lock2) {
            System.out.println(Thread.currentThread().getName() + " 获取lock2");
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            synchronized (lock1) {
                System.out.println(Thread.currentThread().getName() + " 获取lock1");
            }
        }
    }
    
    public static void main(String[] args) {
        DeadlockExample example = new DeadlockExample();
        
        new Thread(() -> example.method1(), "线程1").start();
        new Thread(() -> example.method2(), "线程2").start();
        
        // 结果：死锁，程序无法继续执行
    }
}
```

**死锁的四个必要条件：**
1. 互斥条件：资源不能被共享
2. 请求与保持：持有资源的同时请求新资源
3. 不剥夺条件：资源不能被强制剥夺
4. 循环等待：存在资源的循环等待链

**避免死锁的方法：**
```java
public class AvoidDeadlock {
    
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();
    
    // 方法1：按照固定顺序获取锁
    public void method1() {
        synchronized (lock1) {
            synchronized (lock2) {
                // 业务逻辑
            }
        }
    }
    
    public void method2() {
        synchronized (lock1) {  // 与method1相同的顺序
            synchronized (lock2) {
                // 业务逻辑
            }
        }
    }
    
    // 方法2：使用tryLock()超时机制
    public void methodWithTimeout() {
        Lock lock1 = new ReentrantLock();
        Lock lock2 = new ReentrantLock();
        
        try {
            if (lock1.tryLock(1000, TimeUnit.MILLISECONDS)) {
                try {
                    if (lock2.tryLock(1000, TimeUnit.MILLISECONDS)) {
                        try {
                            // 业务逻辑
                        } finally {
                            lock2.unlock();
                        }
                    }
                } finally {
                    lock1.unlock();
                }
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 9.2 线程安全的单例模式

**双重检查锁定（DCL）：**
```java
public class Singleton {
    
    // volatile保证可见性和禁止指令重排
    private static volatile Singleton instance;
    
    private Singleton() {
        // 私有构造函数
    }
    
    public static Singleton getInstance() {
        if (instance == null) {  // 第一次检查
            synchronized (Singleton.class) {
                if (instance == null) {  // 第二次检查
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

**静态内部类（推荐）：**
```java
public class Singleton {
    
    private Singleton() {
        // 私有构造函数
    }
    
    private static class SingletonHolder {
        private static final Singleton INSTANCE = new Singleton();
    }
    
    public static Singleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

**枚举（最安全）：**
```java
public enum Singleton {
    INSTANCE;
    
    public void doSomething() {
        // 业务方法
    }
}

// 使用
Singleton.INSTANCE.doSomething();
```

### 9.3 ThreadLocal

```java
public class ThreadLocalExample {
    
    // 每个线程都有自己的副本
    private static ThreadLocal<Integer> threadLocal = ThreadLocal.withInitial(() -> 0);
    
    public static void main(String[] args) {
        // 线程1
        new Thread(() -> {
            threadLocal.set(100);
            System.out.println("线程1设置值：" + threadLocal.get());
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("线程1读取值：" + threadLocal.get());
            threadLocal.remove();  // 使用完后要remove，避免内存泄漏
        }).start();
        
        // 线程2
        new Thread(() -> {
            threadLocal.set(200);
            System.out.println("线程2设置值：" + threadLocal.get());
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("线程2读取值：" + threadLocal.get());
            threadLocal.remove();
        }).start();
    }
}
```

**ThreadLocal使用场景：**
1. 数据库连接管理
2. Session管理
3. 用户信息传递
4. 日期格式化（SimpleDateFormat线程不安全）

**⚠️ 注意事项：**
- 使用完后必须调用`remove()`，避免内存泄漏
- 线程池环境下要特别注意清理

## 10. 最佳实践

### 10.1 线程命名

```java
// 为线程设置有意义的名称，便于调试
Thread thread = new Thread(() -> {
    // 任务代码
}, "MyWorkerThread-1");

// 线程池中使用自定义线程工厂
ThreadFactory threadFactory = new ThreadFactoryBuilder()
    .setNameFormat("my-pool-%d")
    .setDaemon(false)
    .build();
```

### 10.2 异常处理

```java
// 设置未捕获异常处理器
Thread thread = new Thread(() -> {
    throw new RuntimeException("线程异常");
});

thread.setUncaughtExceptionHandler((t, e) -> {
    System.err.println("线程 " + t.getName() + " 发生异常：" + e.getMessage());
    // 记录日志、发送告警等
});

thread.start();
```

### 10.3 避免过度同步

```java
// 不好的做法：同步整个方法
public synchronized void processLargeData() {
    // 大量计算
    // 数据库操作
    // 网络请求
}

// 好的做法：只同步必要的部分
public void processLargeData() {
    // 大量计算（不需要同步）
    
    synchronized (this) {
        // 只同步需要保护的共享数据
    }
    
    // 数据库操作（不需要同步）
}
```

### 10.4 使用并发集合

```java
import java.util.concurrent.*;

// 不要使用：
// List<String> list = Collections.synchronizedList(new ArrayList<>());

// 推荐使用：
ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();
BlockingQueue<String> blockingQueue = new LinkedBlockingQueue<>();
```

### 10.5 线程数量设置

```java
/**
 * CPU密集型任务：线程数 = CPU核心数 + 1
 * IO密集型任务：线程数 = CPU核心数 * 2
 * 混合型任务：根据实际情况调整
 */
public class ThreadPoolConfig {
    
    public static ThreadPoolExecutor createThreadPool() {
        int processors = Runtime.getRuntime().availableProcessors();
        
        // CPU密集型
        int cpuIntensivePoolSize = processors + 1;
        
        // IO密集型
        int ioIntensivePoolSize = processors * 2;
        
        return new ThreadPoolExecutor(
            cpuIntensivePoolSize,
            cpuIntensivePoolSize * 2,
            60L,
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(100),
            new ThreadFactoryBuilder()
                .setNameFormat("worker-%d")
                .build(),
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
    }
}
```

## 11. 总结

### 11.1 关键要点

| 主题 | 要点 |
|------|------|
| **线程创建** | 推荐使用Runnable接口或线程池 |
| **线程同步** | synchronized、Lock、volatile |
| **线程通信** | wait/notify、BlockingQueue |
| **线程池** | 手动创建ThreadPoolExecutor |
| **并发工具** | CountDownLatch、CyclicBarrier、Semaphore |
| **原子类** | AtomicInteger等，无锁并发 |
| **死锁** | 固定顺序获取锁，使用超时机制 |
| **最佳实践** | 线程命名、异常处理、合理设置线程数 |

### 11.2 学习建议

1. **理解基础概念**：进程、线程、并发、并行
2. **掌握同步机制**：synchronized、Lock、volatile
3. **熟悉线程池**：ThreadPoolExecutor的参数和使用
4. **学习并发工具**：CountDownLatch、Semaphore等
5. **实践项目**：在实际项目中应用多线程
6. **性能调优**：监控、分析、优化线程池配置
7. **阅读源码**：研究JUC包的源码实现

### 11.3 推荐资源

**书籍：**
- 《Java并发编程实战》（Java Concurrency in Practice）
- 《Java并发编程的艺术》
- 《深入理解Java虚拟机》

**在线资源：**
- [Java官方并发教程](https://docs.oracle.com/javase/tutorial/essential/concurrency/)
- [JUC包源码](https://github.com/openjdk/jdk)
- [并发编程网](http://ifeve.com/)

**工具：**
- JConsole：监控线程状态
- VisualVM：性能分析
- JProfiler：专业性能分析工具

## 参考资源

- [Java官方文档 - Concurrency](https://docs.oracle.com/javase/tutorial/essential/concurrency/)
- [Java并发编程实战](https://jcip.net/)
- [Doug Lea的并发编程](http://gee.cs.oswego.edu/dl/cpj/)
- [阿里巴巴Java开发手册](https://github.com/alibaba/p3c)

