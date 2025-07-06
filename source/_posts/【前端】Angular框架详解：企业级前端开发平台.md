---
title: 【前端】Angular框架详解：企业级前端开发平台
date: 2024-12-19 14:30:00
tags: 
  - 前端, 
  - Angular, 
  - TypeScript, 
  - 企业级开发, 
  - SPA
categories: 前端
description: 深入学习Angular框架，掌握企业级前端开发的核心技术和最佳实践
---

Angular是由Google开发和维护的开源前端框架，专为构建大型、复杂的单页应用程序而设计。它采用TypeScript作为主要开发语言，提供了完整的开发生态系统和企业级特性。

# 目录

1. [Angular基础概念](#一angular基础概念)
2. [项目结构与CLI](#二项目结构与cli)
3. [组件系统](#三组件系统)
4. [模板语法](#四模板语法)
5. [依赖注入](#五依赖注入)
6. [服务与HTTP客户端](#六服务与http客户端)
7. [路由系统](#七路由系统)
8. [表单处理](#八表单处理)
9. [状态管理](#九状态管理)
10. [测试](#十测试)
11. [最佳实践](#十一最佳实践)
12. [总结](#十二总结)

---

# 一、Angular基础概念

## （一）核心特性

### 1. TypeScript优先

Angular从设计之初就采用TypeScript，提供强类型支持和现代JavaScript特性。

```typescript
// 接口定义
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

// 类型安全的组件
@Component({
  selector: 'app-user',
  template: `
    <div class="user-card">
      <h3>{{ user.name }
 ```

## （二）响应式表单

### 1. 基础响应式表单

```typescript
// 自定义验证器
export class CustomValidators {
  // 密码强度验证
  static passwordStrength(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);
    
    const valid = hasNumber && hasUpper && hasLower && hasSpecial && value.length >= 8;
    
    if (!valid) {
      return {
        passwordStrength: {
          hasNumber,
          hasUpper,
          hasLower,
          hasSpecial,
          minLength: value.length >= 8
        }
      };
    }
    
    return null;
  }
  
  // 确认密码验证
  static confirmPassword(passwordField: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.parent?.get(passwordField)?.value;
      const confirmPassword = control.value;
      
      if (password !== confirmPassword) {
        return { confirmPassword: true };
      }
      
      return null;
    };
  }
  
  // 异步邮箱唯一性验证
  static emailUnique(userService: UserService) {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      
      return userService.checkEmailExists(control.value).pipe(
        map(exists => exists ? { emailExists: true } : null),
        catchError(() => of(null))
      );
    };
  }
}

@Component({
  selector: 'app-reactive-form',
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="reactive-form">
      <h3>响应式用户注册表单</h3>
      
      <!-- 基本信息组 -->
      <div formGroupName="basicInfo" class="form-section">
        <h4>基本信息</h4>
        
        <!-- 用户名 -->
        <div class="form-group">
          <label for="username">用户名 *</label>
          <input 
            type="text" 
            id="username"
            formControlName="username"
            class="form-control"
            [class.is-invalid]="isFieldInvalid('basicInfo.username')">
          
          <div *ngIf="isFieldInvalid('basicInfo.username')" class="invalid-feedback">
            <div *ngIf="getFieldError('basicInfo.username', 'required')">用户名是必填项</div>
            <div *ngIf="getFieldError('basicInfo.username', 'minlength')">用户名至少需要3个字符</div>
            <div *ngIf="getFieldError('basicInfo.username', 'pattern')">用户名只能包含字母、数字和下划线</div>
          </div>
        </div>
        
        <!-- 邮箱 -->
        <div class="form-group">
          <label for="email">邮箱 *</label>
          <input 
            type="email" 
            id="email"
            formControlName="email"
            class="form-control"
            [class.is-invalid]="isFieldInvalid('basicInfo.email')">
          
          <div *ngIf="isFieldInvalid('basicInfo.email')" class="invalid-feedback">
            <div *ngIf="getFieldError('basicInfo.email', 'required')">邮箱是必填项</div>
            <div *ngIf="getFieldError('basicInfo.email', 'email')">请输入有效的邮箱地址</div>
            <div *ngIf="getFieldError('basicInfo.email', 'emailExists')">该邮箱已被注册</div>
          </div>
          
          <div *ngIf="userForm.get('basicInfo.email')?.pending" class="form-text">
            正在验证邮箱...
          </div>
        </div>
        
        <!-- 手机号 -->
        <div class="form-group">
          <label for="phone">手机号</label>
          <input 
            type="tel" 
            id="phone"
            formControlName="phone"
            class="form-control"
            [class.is-invalid]="isFieldInvalid('basicInfo.phone')">
          
          <div *ngIf="isFieldInvalid('basicInfo.phone')" class="invalid-feedback">
            <div *ngIf="getFieldError('basicInfo.phone', 'pattern')">请输入有效的手机号码</div>
          </div>
        </div>
      </div>
      
      <!-- 密码组 -->
      <div formGroupName="passwordGroup" class="form-section">
        <h4>密码设置</h4>
        
        <!-- 密码 -->
        <div class="form-group">
          <label for="password">密码 *</label>
          <input 
            type="password" 
            id="password"
            formControlName="password"
            class="form-control"
            [class.is-invalid]="isFieldInvalid('passwordGroup.password')">
          
          <div *ngIf="isFieldInvalid('passwordGroup.password')" class="invalid-feedback">
            <div *ngIf="getFieldError('passwordGroup.password', 'required')">密码是必填项</div>
            <div *ngIf="getFieldError('passwordGroup.password', 'passwordStrength')">
              <div>密码必须包含：</div>
              <ul>
                <li [class.valid]="getFieldError('passwordGroup.password', 'passwordStrength')?.hasNumber">
                  至少一个数字
                </li>
                <li [class.valid]="getFieldError('passwordGroup.password', 'passwordStrength')?.hasUpper">
                  至少一个大写字母
                </li>
                <li [class.valid]="getFieldError('passwordGroup.password', 'passwordStrength')?.hasLower">
                  至少一个小写字母
                </li>
                <li [class.valid]="getFieldError('passwordGroup.password', 'passwordStrength')?.hasSpecial">
                  至少一个特殊字符
                </li>
                <li [class.valid]="getFieldError('passwordGroup.password', 'passwordStrength')?.minLength">
                  至少8个字符
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 确认密码 -->
        <div class="form-group">
          <label for="confirmPassword">确认密码 *</label>
          <input 
            type="password" 
            id="confirmPassword"
            formControlName="confirmPassword"
            class="form-control"
            [class.is-invalid]="isFieldInvalid('passwordGroup.confirmPassword')">
          
          <div *ngIf="isFieldInvalid('passwordGroup.confirmPassword')" class="invalid-feedback">
            <div *ngIf="getFieldError('passwordGroup.confirmPassword', 'required')">请确认密码</div>
            <div *ngIf="getFieldError('passwordGroup.confirmPassword', 'confirmPassword')">两次输入的密码不一致</div>
          </div>
        </div>
      </div>
      
      <!-- 个人信息组 -->
      <div formGroupName="personalInfo" class="form-section">
        <h4>个人信息</h4>
        
        <!-- 姓名 -->
        <div class="form-group">
          <label for="fullName">姓名</label>
          <input 
            type="text" 
            id="fullName"
            formControlName="fullName"
            class="form-control">
        </div>
        
        <!-- 生日 -->
        <div class="form-group">
          <label for="birthDate">生日</label>
          <input 
            type="date" 
            id="birthDate"
            formControlName="birthDate"
            class="form-control">
        </div>
        
        <!-- 性别 -->
        <div class="form-group">
          <label>性别</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" formControlName="gender" value="male">
              男性
            </label>
            <label class="radio-label">
              <input type="radio" formControlName="gender" value="female">
              女性
            </label>
            <label class="radio-label">
              <input type="radio" formControlName="gender" value="other">
              其他
            </label>
          </div>
        </div>
      </div>
      
      <!-- 兴趣爱好 -->
      <div class="form-section">
        <h4>兴趣爱好</h4>
        <div formArrayName="interests" class="interests-array">
          <div *ngFor="let interest of interests.controls; let i = index" 
               [formGroupName]="i" 
               class="interest-item">
            <input 
              type="text" 
              formControlName="name"
              placeholder="输入兴趣爱好"
              class="form-control">
            <button 
              type="button" 
              (click)="removeInterest(i)"
              class="btn btn-danger btn-sm">
              删除
            </button>
          </div>
          
          <button 
            type="button" 
            (click)="addInterest()"
            class="btn btn-secondary">
            添加兴趣
          </button>
        </div>
      </div>
      
      <!-- 同意条款 -->
      <div class="form-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            formControlName="agreedToTerms">
          我同意服务条款和隐私政策 *
        </label>
        
        <div *ngIf="isFieldInvalid('agreedToTerms')" class="invalid-feedback">
          <div *ngIf="getFieldError('agreedToTerms', 'required')">必须同意服务条款才能继续</div>
        </div>
      </div>
      
      <!-- 表单状态显示 -->
      <div class="form-debug" *ngIf="showDebugInfo">
        <h4>表单状态调试信息</h4>
        <p>表单有效: {{ userForm.valid }}</p>
        <p>表单值: {{ userForm.value | json }}</p>
        <p>表单错误: {{ userForm.errors | json }}</p>
      </div>
      
      <!-- 提交按钮 -->
      <div class="form-actions">
        <button 
          type="submit" 
          class="btn btn-primary"
          [disabled]="userForm.invalid || isSubmitting">
          {{ isSubmitting ? '注册中...' : '注册' }}
        </button>
        
        <button 
          type="button" 
          class="btn btn-secondary"
          (click)="resetForm()">
          重置
        </button>
        
        <button 
          type="button" 
          class="btn btn-info"
          (click)="toggleDebugInfo()">
          {{ showDebugInfo ? '隐藏' : '显示' }}调试信息
        </button>
      </div>
    </form>
  `
})
export class ReactiveFormComponent implements OnInit {
  userForm!: FormGroup;
  isSubmitting = false;
  showDebugInfo = false;
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}
  
  ngOnInit(): void {
    this.createForm();
    this.setupFormSubscriptions();
  }
  
  private createForm(): void {
    this.userForm = this.fb.group({
      basicInfo: this.fb.group({
        username: ['', [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z0-9_]+$/)
        ]],
        email: ['', 
          [Validators.required, Validators.email],
          [CustomValidators.emailUnique(this.userService)]
        ],
        phone: ['', [Validators.pattern(/^1[3-9]\d{9}$/)]]
      }),
      passwordGroup: this.fb.group({
        password: ['', [Validators.required, CustomValidators.passwordStrength]],
        confirmPassword: ['', [Validators.required]]
      }, { validators: this.passwordMatchValidator }),
      personalInfo: this.fb.group({
        fullName: [''],
        birthDate: [''],
        gender: ['male']
      }),
      interests: this.fb.array([]),
      agreedToTerms: [false, Validators.requiredTrue]
    });
  }
  
  private setupFormSubscriptions(): void {
    // 监听密码字段变化，重新验证确认密码
    this.userForm.get('passwordGroup.password')?.valueChanges.subscribe(() => {
      this.userForm.get('passwordGroup.confirmPassword')?.updateValueAndValidity();
    });
    
    // 监听表单值变化
    this.userForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      console.log('表单值变化:', value);
    });
  }
  
  // 密码匹配验证器
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ confirmPassword: true });
      return { passwordMismatch: true };
    } else {
      const confirmPasswordControl = group.get('confirmPassword');
      if (confirmPasswordControl?.errors?.['confirmPassword']) {
        delete confirmPasswordControl.errors['confirmPassword'];
        if (Object.keys(confirmPasswordControl.errors).length === 0) {
          confirmPasswordControl.setErrors(null);
        }
      }
    }
    
    return null;
  }
  
  get interests(): FormArray {
    return this.userForm.get('interests') as FormArray;
  }
  
  addInterest(): void {
    const interestGroup = this.fb.group({
      name: ['', Validators.required]
    });
    this.interests.push(interestGroup);
  }
  
  removeInterest(index: number): void {
    this.interests.removeAt(index);
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  
  getFieldError(fieldName: string, errorType: string): any {
    const field = this.userForm.get(fieldName);
    return field?.errors?.[errorType];
  }
  
  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      
      const formData = this.userForm.value;
      console.log('提交的表单数据:', formData);
      
      // 模拟API调用
      setTimeout(() => {
        alert('注册成功！');
        this.isSubmitting = false;
        this.resetForm();
      }, 2000);
    } else {
      console.log('表单验证失败');
      this.markFormGroupTouched(this.userForm);
    }
  }
  
  resetForm(): void {
    this.userForm.reset();
    this.userForm.get('personalInfo.gender')?.setValue('male');
    this.userForm.get('agreedToTerms')?.setValue(false);
    
    // 清空兴趣数组
    while (this.interests.length !== 0) {
      this.interests.removeAt(0);
    }
  }
  
  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
  }
  
  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }
}
```

# 八、路由与导航

## （一）基础路由配置

### 1. 路由模块设置

```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';

const routes: Routes = [
  // 重定向
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // 基础路由
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  
  // 带参数的路由
  { path: 'user/:id', component: UserDetailComponent },
  { path: 'product/:category/:id', component: ProductDetailComponent },
  
  // 查询参数路由
  { path: 'search', component: SearchComponent },
  
  // 受保护的路由
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    canDeactivate: [UnsavedChangesGuard]
  },
  
  // 管理员路由
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  
  // 懒加载模块
  {
    path: 'features',
    loadChildren: () => import('./features/features.module').then(m => m.FeaturesModule)
  },
  
  // 嵌套路由
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  
  // 通配符路由（必须放在最后）
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // 开发时可设为true来调试路由
    preloadingStrategy: PreloadAllModules, // 预加载策略
    scrollPositionRestoration: 'top' // 路由切换时滚动到顶部
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### 2. 路由组件示例

```typescript
// 用户详情组件
@Component({
  selector: 'app-user-detail',
  template: `
    <div class="user-detail" *ngIf="user">
      <div class="header">
        <button (click)="goBack()" class="btn btn-secondary">
          ← 返回
        </button>
        <h2>{{ user.name }}</h2>
      </div>
      
      <div class="content">
        <div class="user-info">
          <p><strong>ID:</strong> {{ user.id }}</p>
          <p><strong>邮箱:</strong> {{ user.email }}</p>
          <p><strong>注册时间:</strong> {{ user.createdAt | date:'medium' }}</p>
        </div>
        
        <div class="actions">
          <button (click)="editUser()" class="btn btn-primary">
            编辑用户
          </button>
          <button (click)="deleteUser()" class="btn btn-danger">
            删除用户
          </button>
        </div>
      </div>
      
      <div class="navigation">
        <button (click)="goToPrevious()" [disabled]="!hasPrevious">
          上一个用户
        </button>
        <button (click)="goToNext()" [disabled]="!hasNext">
          下一个用户
        </button>
      </div>
    </div>
    
    <div *ngIf="!user && !loading" class="error">
      用户不存在
    </div>
    
    <div *ngIf="loading" class="loading">
      正在加载用户信息...
    </div>
  `
})
export class UserDetailComponent implements OnInit, OnDestroy {
  user: User | null = null;
  loading = false;
  hasPrevious = false;
  hasNext = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private location: Location
  ) {}
  
  ngOnInit(): void {
    // 监听路由参数变化
    this.route.params.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const userId = +params['id'];
        if (isNaN(userId)) {
          this.router.navigate(['/users']);
          return EMPTY;
        }
        
        this.loading = true;
        return this.userService.getUserById(userId);
      })
    ).subscribe({
      next: user => {
        this.user = user;
        this.loading = false;
        this.checkNavigation();
      },
      error: error => {
        console.error('加载用户失败:', error);
        this.loading = false;
      }
    });
    
    // 监听查询参数
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      console.log('查询参数:', params);
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private checkNavigation(): void {
    if (this.user) {
      // 检查是否有上一个/下一个用户
      this.userService.hasAdjacentUsers(this.user.id).subscribe(result => {
        this.hasPrevious = result.hasPrevious;
        this.hasNext = result.hasNext;
      });
    }
  }
  
  goBack(): void {
    this.location.back();
  }
  
  editUser(): void {
    if (this.user) {
      this.router.navigate(['/user', this.user.id, 'edit']);
    }
  }
  
  deleteUser(): void {
    if (this.user && confirm('确定要删除这个用户吗？')) {
      this.userService.deleteUser(this.user.id).subscribe(() => {
        this.router.navigate(['/users']);
      });
    }
  }
  
  goToPrevious(): void {
    if (this.user && this.hasPrevious) {
      this.router.navigate(['/user', this.user.id - 1]);
    }
  }
  
  goToNext(): void {
    if (this.user && this.hasNext) {
      this.router.navigate(['/user', this.user.id + 1]);
    }
  }
}

// 搜索组件
@Component({
  selector: 'app-search',
  template: `
    <div class="search-page">
      <div class="search-form">
        <input 
          type="text" 
          [(ngModel)]="searchQuery"
          (keyup.enter)="search()"
          placeholder="搜索..."
          class="form-control">
        <button (click)="search()" class="btn btn-primary">
          搜索
        </button>
      </div>
      
      <div class="filters">
        <select [(ngModel)]="category" (change)="search()" class="form-control">
          <option value="">所有分类</option>
          <option value="users">用户</option>
          <option value="products">产品</option>
          <option value="articles">文章</option>
        </select>
        
        <select [(ngModel)]="sortBy" (change)="search()" class="form-control">
          <option value="relevance">相关性</option>
          <option value="date">日期</option>
          <option value="name">名称</option>
        </select>
      </div>
      
      <div class="results" *ngIf="results.length > 0">
        <h3>搜索结果 ({{ totalResults }})</h3>
        <div *ngFor="let result of results" class="result-item">
          <h4>{{ result.title }}</h4>
          <p>{{ result.description }}</p>
          <a [routerLink]="result.link">查看详情</a>
        </div>
        
        <!-- 分页 -->
        <div class="pagination">
          <button 
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage <= 1"
            class="btn btn-secondary">
            上一页
          </button>
          
          <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
          
          <button 
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage >= totalPages"
            class="btn btn-secondary">
            下一页
          </button>
        </div>
      </div>
      
      <div *ngIf="searched && results.length === 0" class="no-results">
        没有找到相关结果
      </div>
    </div>
  `
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  category = '';
  sortBy = 'relevance';
  currentPage = 1;
  pageSize = 10;
  
  results: any[] = [];
  totalResults = 0;
  totalPages = 0;
  searched = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService
  ) {}
  
  ngOnInit(): void {
    // 从查询参数初始化搜索状态
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.category = params['category'] || '';
      this.sortBy = params['sort'] || 'relevance';
      this.currentPage = +params['page'] || 1;
      
      if (this.searchQuery) {
        this.performSearch();
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  search(): void {
    this.currentPage = 1;
    this.updateUrl();
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
    this.updateUrl();
  }
  
  private updateUrl(): void {
    const queryParams: any = {};
    
    if (this.searchQuery) queryParams.q = this.searchQuery;
    if (this.category) queryParams.category = this.category;
    if (this.sortBy !== 'relevance') queryParams.sort = this.sortBy;
    if (this.currentPage > 1) queryParams.page = this.currentPage;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace'
    });
  }
  
  private performSearch(): void {
    if (!this.searchQuery.trim()) {
      this.results = [];
      this.searched = false;
      return;
    }
    
    const searchParams = {
      query: this.searchQuery,
      category: this.category,
      sortBy: this.sortBy,
      page: this.currentPage,
      pageSize: this.pageSize
    };
    
    this.searchService.search(searchParams).subscribe(response => {
      this.results = response.results;
      this.totalResults = response.total;
      this.totalPages = Math.ceil(this.totalResults / this.pageSize);
      this.searched = true;
    });
  }
}
```}</h3>
      <p>{{ user.email }}</p>
      <span [class.active]="user.isActive">状态</span>
    </div>
  `
})
export class UserComponent {
  @Input() user!: User; // 强类型输入属性
  @Output() userClick = new EventEmitter<User>();
  
  onUserClick(): void {
    this.userClick.emit(this.user);
  }
}
```

### 2. 组件化架构

```typescript
// 父组件
@Component({
  selector: 'app-user-list',
  template: `
    <div class="user-list">
      <app-user 
        *ngFor="let user of users; trackBy: trackByUserId"
        [user]="user"
        (userClick)="onUserSelected($event)">
      </app-user>
    </div>
  `
})
export class UserListComponent {
  users: User[] = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', isActive: true },
    { id: 2, name: '李四', email: 'lisi@example.com', isActive: false }
  ];
  
  trackByUserId(index: number, user: User): number {
    return user.id;
  }
  
  onUserSelected(user: User): void {
    console.log('选中用户:', user);
  }
}
```

### 3. 依赖注入系统

```typescript
// 服务定义
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://api.example.com/users';
  
  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
  
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
}

// 组件中注入服务
@Component({
  selector: 'app-user-container',
  template: `
    <div *ngIf="loading">加载中...</div>
    <app-user-list 
      *ngIf="!loading" 
      [users]="users">
    </app-user-list>
  `
})
export class UserContainerComponent implements OnInit {
  users: User[] = [];
  loading = true;
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  private loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('加载用户失败:', error);
        this.loading = false;
      }
    })
 export class CoreModule {}
 ```

## （二）响应式编程与RxJS

### 1. Observable基础

```typescript
// 数据服务示例
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private dataSubject = new BehaviorSubject<any[]>([]);
  public data$ = this.dataSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  // 加载数据
  loadData(): void {
    this.loadingSubject.next(true);
    
    this.http.get<any[]>('/api/data').pipe(
      delay(1000), // 模拟网络延迟
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: data => this.dataSubject.next(data),
      error: error => console.error('加载数据失败:', error)
    });
  }
  
  // 添加数据项
  addItem(item: any): void {
    const currentData = this.dataSubject.value;
    this.dataSubject.next([...currentData, item]);
  }
  
  // 更新数据项
  updateItem(id: number, updates: Partial<any>): void {
    const currentData = this.dataSubject.value;
    const updatedData = currentData.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    this.dataSubject.next(updatedData);
  }
  
  // 删除数据项
  deleteItem(id: number): void {
    const currentData = this.dataSubject.value;
    const filteredData = currentData.filter(item => item.id !== id);
    this.dataSubject.next(filteredData);
  }
}

// 使用Observable的组件
@Component({
  selector: 'app-data-list',
  template: `
    <div class="data-list">
      <div class="header">
        <h3>数据列表</h3>
        <button (click)="loadData()" [disabled]="loading$ | async">
          {{ (loading$ | async) ? '加载中...' : '刷新数据' }}
        </button>
      </div>
      
      <div *ngIf="loading$ | async" class="loading">
        正在加载数据...
      </div>
      
      <div *ngIf="!(loading$ | async)" class="content">
        <div *ngFor="let item of data$ | async; trackBy: trackByFn" 
             class="data-item">
          <span>{{ item.name }}</span>
          <button (click)="editItem(item)">编辑</button>
          <button (click)="deleteItem(item.id)">删除</button>
        </div>
        
        <div *ngIf="(data$ | async)?.length === 0" class="empty">
          暂无数据
        </div>
      </div>
    </div>
  `
})
export class DataListComponent implements OnInit, OnDestroy {
  data$ = this.dataService.data$;
  loading$ = this.dataService.loading$;
  
  private destroy$ = new Subject<void>();
  
  constructor(private dataService: DataService) {}
  
  ngOnInit(): void {
    // 组合多个Observable
    const combinedData$ = combineLatest([
      this.data$,
      this.loading$
    ]).pipe(
      takeUntil(this.destroy$),
      map(([data, loading]) => ({ data, loading, count: data.length }))
    );
    
    combinedData$.subscribe(result => {
      console.log('数据状态:', result);
    });
    
    this.loadData();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadData(): void {
    this.dataService.loadData();
  }
  
  editItem(item: any): void {
    // 实现编辑逻辑
    const updates = { name: item.name + ' (已编辑)' };
    this.dataService.updateItem(item.id, updates);
  }
  
  deleteItem(id: number): void {
    this.dataService.deleteItem(id);
  }
  
  trackByFn(index: number, item: any): any {
    return item.id;
  }
}
```

### 2. 高级RxJS操作符

```typescript
@Component({
  selector: 'app-search',
  template: `
    <div class="search-container">
      <input 
        #searchInput
        type="text" 
        placeholder="搜索..."
        (input)="onSearchInput($event)">
      
      <div *ngIf="loading" class="loading">搜索中...</div>
      
      <div class="results">
        <div *ngFor="let result of searchResults$ | async" class="result-item">
          {{ result.title }}
        </div>
      </div>
    </div>
  `
})
export class SearchComponent implements OnInit, OnDestroy {
  private searchSubject = new Subject<string>();
  searchResults$!: Observable<any[]>;
  loading = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(private searchService: SearchService) {}
  
  ngOnInit(): void {
    this.searchResults$ = this.searchSubject.pipe(
      // 防抖：等待用户停止输入300ms后再搜索
      debounceTime(300),
      
      // 去重：只有当搜索词发生变化时才搜索
      distinctUntilChanged(),
      
      // 过滤：只搜索长度大于2的词
      filter(term => term.length > 2),
      
      // 切换到搜索Observable，自动取消之前的请求
      switchMap(term => {
        this.loading = true;
        return this.searchService.search(term).pipe(
          // 错误处理：搜索失败时返回空数组
          catchError(error => {
            console.error('搜索失败:', error);
            return of([]);
          }),
          // 完成时设置loading为false
          finalize(() => this.loading = false)
        );
      }),
      
      // 组件销毁时自动取消订阅
      takeUntil(this.destroy$)
    );
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }
}

// 搜索服务
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(private http: HttpClient) {}
  
  search(term: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/search?q=${encodeURIComponent(term)}`);
  }
}
```

# 七、表单处理

## （一）模板驱动表单

### 1. 基础表单

```typescript
// 用户模型
export interface User {
  id?: number;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  interests: string[];
  address: {
    street: string;
    city: string;
    zipCode: string;
  };
  agreedToTerms: boolean;
}

@Component({
  selector: 'app-template-form',
  template: `
    <form #userForm="ngForm" (ngSubmit)="onSubmit(userForm)" class="user-form">
      <h3>用户信息表单</h3>
      
      <!-- 姓名字段 -->
      <div class="form-group">
        <label for="name">姓名 *</label>
        <input 
          type="text" 
          id="name"
          name="name"
          [(ngModel)]="user.name"
          #name="ngModel"
          required
          minlength="2"
          maxlength="50"
          class="form-control"
          [class.is-invalid]="name.invalid && name.touched">
        
        <div *ngIf="name.invalid && name.touched" class="invalid-feedback">
          <div *ngIf="name.errors?.['required']">姓名是必填项</div>
          <div *ngIf="name.errors?.['minlength']">姓名至少需要2个字符</div>
          <div *ngIf="name.errors?.['maxlength']">姓名不能超过50个字符</div>
        </div>
      </div>
      
      <!-- 邮箱字段 -->
      <div class="form-group">
        <label for="email">邮箱 *</label>
        <input 
          type="email" 
          id="email"
          name="email"
          [(ngModel)]="user.email"
          #email="ngModel"
          required
          email
          class="form-control"
          [class.is-invalid]="email.invalid && email.touched">
        
        <div *ngIf="email.invalid && email.touched" class="invalid-feedback">
          <div *ngIf="email.errors?.['required']">邮箱是必填项</div>
          <div *ngIf="email.errors?.['email']">请输入有效的邮箱地址</div>
        </div>
      </div>
      
      <!-- 年龄字段 -->
      <div class="form-group">
        <label for="age">年龄</label>
        <input 
          type="number" 
          id="age"
          name="age"
          [(ngModel)]="user.age"
          #age="ngModel"
          min="18"
          max="120"
          class="form-control"
          [class.is-invalid]="age.invalid && age.touched">
        
        <div *ngIf="age.invalid && age.touched" class="invalid-feedback">
          <div *ngIf="age.errors?.['min']">年龄不能小于18岁</div>
          <div *ngIf="age.errors?.['max']">年龄不能大于120岁</div>
        </div>
      </div>
      
      <!-- 性别字段 -->
      <div class="form-group">
        <label>性别</label>
        <div class="radio-group">
          <label class="radio-label">
            <input 
              type="radio" 
              name="gender" 
              value="male"
              [(ngModel)]="user.gender">
            男性
          </label>
          <label class="radio-label">
            <input 
              type="radio" 
              name="gender" 
              value="female"
              [(ngModel)]="user.gender">
            女性
          </label>
          <label class="radio-label">
            <input 
              type="radio" 
              name="gender" 
              value="other"
              [(ngModel)]="user.gender">
            其他
          </label>
        </div>
      </div>
      
      <!-- 兴趣爱好 -->
      <div class="form-group">
        <label>兴趣爱好</label>
        <div class="checkbox-group">
          <label class="checkbox-label" *ngFor="let interest of availableInterests">
            <input 
              type="checkbox" 
              [value]="interest"
              (change)="onInterestChange($event, interest)">
            {{ interest }}
          </label>
        </div>
      </div>
      
      <!-- 地址信息 -->
      <fieldset class="form-group">
        <legend>地址信息</legend>
        
        <div class="form-group">
          <label for="street">街道地址</label>
          <input 
            type="text" 
            id="street"
            name="street"
            [(ngModel)]="user.address.street"
            class="form-control">
        </div>
        
        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="city">城市</label>
            <input 
              type="text" 
              id="city"
              name="city"
              [(ngModel)]="user.address.city"
              class="form-control">
          </div>
          
          <div class="form-group col-md-6">
            <label for="zipCode">邮政编码</label>
            <input 
              type="text" 
              id="zipCode"
              name="zipCode"
              [(ngModel)]="user.address.zipCode"
              pattern="[0-9]{6}"
              #zipCode="ngModel"
              class="form-control"
              [class.is-invalid]="zipCode.invalid && zipCode.touched">
            
            <div *ngIf="zipCode.invalid && zipCode.touched" class="invalid-feedback">
              <div *ngIf="zipCode.errors?.['pattern']">请输入6位数字的邮政编码</div>
            </div>
          </div>
        </div>
      </fieldset>
      
      <!-- 同意条款 -->
      <div class="form-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            name="agreedToTerms"
            [(ngModel)]="user.agreedToTerms"
            #terms="ngModel"
            required>
          我同意服务条款和隐私政策 *
        </label>
        
        <div *ngIf="terms.invalid && terms.touched" class="invalid-feedback">
          <div *ngIf="terms.errors?.['required']">必须同意服务条款才能继续</div>
        </div>
      </div>
      
      <!-- 表单状态显示 -->
      <div class="form-debug" *ngIf="showDebugInfo">
        <h4>表单状态调试信息</h4>
        <p>表单有效: {{ userForm.valid }}</p>
        <p>表单已提交: {{ userForm.submitted }}</p>
        <p>表单已修改: {{ userForm.dirty }}</p>
        <p>表单已触摸: {{ userForm.touched }}</p>
        <pre>{{ user | json }}</pre>
      </div>
      
      <!-- 提交按钮 -->
      <div class="form-actions">
        <button 
          type="submit" 
          class="btn btn-primary"
          [disabled]="userForm.invalid || isSubmitting">
          {{ isSubmitting ? '提交中...' : '提交' }}
        </button>
        
        <button 
          type="button" 
          class="btn btn-secondary"
          (click)="resetForm(userForm)">
          重置
        </button>
        
        <button 
          type="button" 
          class="btn btn-info"
          (click)="toggleDebugInfo()">
          {{ showDebugInfo ? '隐藏' : '显示' }}调试信息
        </button>
      </div>
    </form>
  `
})
export class TemplateFormComponent {
  user: User = {
    name: '',
    email: '',
    age: 18,
    gender: 'male',
    interests: [],
    address: {
      street: '',
      city: '',
      zipCode: ''
    },
    agreedToTerms: false
  };
  
  availableInterests = ['阅读', '运动', '音乐', '旅行', '编程', '摄影'];
  isSubmitting = false;
  showDebugInfo = false;
  
  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.isSubmitting = true;
      
      // 模拟API调用
      setTimeout(() => {
        console.log('提交的用户数据:', this.user);
        alert('用户信息提交成功！');
        this.isSubmitting = false;
      }, 2000);
    } else {
      console.log('表单验证失败');
      this.markFormGroupTouched(form);
    }
  }
  
  onInterestChange(event: Event, interest: string): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.user.interests.push(interest);
    } else {
      const index = this.user.interests.indexOf(interest);
      if (index > -1) {
        this.user.interests.splice(index, 1);
      }
    }
  }
  
  resetForm(form: NgForm): void {
    form.resetForm();
    this.user = {
      name: '',
      email: '',
      age: 18,
      gender: 'male',
      interests: [],
      address: {
        street: '',
        city: '',
        zipCode: ''
      },
      agreedToTerms: false
    };
  }
  
  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
  }
  
  private markFormGroupTouched(form: NgForm): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.controls[key];
      control.markAsTouched();
    });
  }
}
```;
  }
}
```

## （二）Angular架构

### 1. 模块系统

```typescript
// 特性模块
@NgModule({
  declarations: [
    UserComponent,
    UserListComponent,
    UserContainerComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule
  ],
  providers: [
    UserService
  ],
  exports: [
    UserContainerComponent
  ]
})
export class UserModule {}

// 应用根模块
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    UserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### 2. 生命周期钩子

```typescript
@Component({
  selector: 'app-lifecycle-demo',
  template: `
    <div>
      <h3>生命周期演示</h3>
      <p>计数器: {{ counter }}</p>
      <button (click)="increment()">增加</button>
    </div>
  `
})
export class LifecycleDemoComponent implements 
  OnInit, OnChanges, DoCheck, AfterContentInit, 
  AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy {
  
  @Input() inputValue: string = '';
  counter = 0;
  
  constructor() {
    console.log('Constructor: 组件实例化');
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log('OnChanges: 输入属性变化', changes);
  }
  
  ngOnInit(): void {
    console.log('OnInit: 组件初始化完成');
  }
  
  ngDoCheck(): void {
    console.log('DoCheck: 变更检测');
  }
  
  ngAfterContentInit(): void {
    console.log('AfterContentInit: 内容投影初始化');
  }
  
  ngAfterContentChecked(): void {
    console.log('AfterContentChecked: 内容投影检查');
  }
  
  ngAfterViewInit(): void {
    console.log('AfterViewInit: 视图初始化完成');
  }
  
  ngAfterViewChecked(): void {
    console.log('AfterViewChecked: 视图检查完成');
  }
  
  ngOnDestroy(): void {
    console.log('OnDestroy: 组件销毁');
  }
  
  increment(): void {
    this.counter++;
  }
}
```

# 二、项目结构与CLI

## （一）Angular CLI

### 1. 项目创建与基本命令

```bash
# 安装Angular CLI
npm install -g @angular/cli

# 创建新项目
ng new my-angular-app
cd my-angular-app

# 启动开发服务器
ng serve

# 构建生产版本
ng build --prod

# 运行测试
ng test

# 运行端到端测试
ng e2e
```

### 2. 代码生成

```bash
# 生成组件
ng generate component user-profile
ng g c user-profile --skip-tests

# 生成服务
ng generate service user
ng g s user --skip-tests

# 生成模块
ng generate module user --routing
ng g m user --routing

# 生成指令
ng generate directive highlight
ng g d highlight

# 生成管道
ng generate pipe currency-format
ng g p currency-format

# 生成守卫
ng generate guard auth
ng g g auth
```

## （二）项目结构

```
src/
├── app/
│   ├── core/                 # 核心模块（单例服务）
│   │   ├── services/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── core.module.ts
│   ├── shared/               # 共享模块
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── shared.module.ts
│   ├── features/             # 特性模块
│   │   ├── user/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── user.module.ts
│   │   └── product/
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.scss
│   └── app.module.ts
├── assets/                   # 静态资源
├── environments/             # 环境配置
│   ├── environment.ts
│   └── environment.prod.ts
├── index.html
├── main.ts
├── polyfills.ts
└── styles.scss
```

### 3. 环境配置

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  enableLogging: true
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  enableLogging: false
};

// 在服务中使用环境配置
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {
    if (environment.enableLogging) {
      console.log('API服务初始化，基础URL:', this.baseUrl);
    }
  }
}
```

# 三、组件系统

## （一）组件基础

### 1. 组件定义与元数据

```typescript
@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  @Input() showActions = true;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() viewDetails = new EventEmitter<number>();
  
  @ViewChild('priceElement', { static: true }) 
  priceElement!: ElementRef<HTMLElement>;
  
  @ViewChildren('actionButton') 
  actionButtons!: QueryList<ElementRef<HTMLButtonElement>>;
  
  isLoading = false;
  
  constructor(
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}
  
  ngOnInit(): void {
    this.updatePriceDisplay();
  }
  
  onAddToCart(): void {
    if (this.product && !this.isLoading) {
      this.isLoading = true;
      this.addToCart.emit(this.product);
      
      // 模拟异步操作
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.markForCheck(); // 手动触发变更检测
      }, 1000);
    }
  }
  
  onViewDetails(): void {
    this.viewDetails.emit(this.product.id);
  }
  
  private updatePriceDisplay(): void {
    if (this.priceElement) {
      const element = this.priceElement.nativeElement;
      if (this.product.discountPrice) {
        this.renderer.addClass(element, 'discounted');
      }
    }
  }
}
```

### 2. 组件模板

```html
<!-- product-card.component.html -->
<div class="product-card" [class.loading]="isLoading">
  <div class="product-image">
    <img [src]="product.imageUrl" [alt]="product.name" loading="lazy">
    <div class="discount-badge" *ngIf="product.discountPrice">
      {{ ((product.price - product.discountPrice) / product.price * 100) | number:'1.0-0' }}% OFF
    </div>
  </div>
  
  <div class="product-info">
    <h3 class="product-name">{{ product.name }}</h3>
    <p class="product-description">{{ product.description | slice:0:100 }}...</p>
    
    <div class="price-section" #priceElement>
      <span class="current-price">
        {{ (product.discountPrice || product.price) | currency:'CNY':'symbol':'1.2-2' }}
      </span>
      <span class="original-price" *ngIf="product.discountPrice">
        {{ product.price | currency:'CNY':'symbol':'1.2-2' }}
      </span>
    </div>
    
    <div class="rating">
      <span class="stars">
        <i *ngFor="let star of [1,2,3,4,5]" 
           class="star" 
           [class.filled]="star <= product.rating">
          ★
        </i>
      </span>
      <span class="rating-text">({{ product.reviewCount }})</span>
    </div>
  </div>
  
  <div class="product-actions" *ngIf="showActions">
    <button 
      #actionButton
      type="button" 
      class="btn btn-primary"
      [disabled]="isLoading || !product.inStock"
      (click)="onAddToCart()">
      <span *ngIf="!isLoading">加入购物车</span>
      <span *ngIf="isLoading">添加中...</span>
    </button>
    
    <button 
      #actionButton
      type="button" 
      class="btn btn-secondary"
      (click)="onViewDetails()">
      查看详情
    </button>
  </div>
</div>
```

### 3. 组件样式

```scss
// product-card.component.scss
.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  &.loading {
    opacity: 0.7;
    pointer-events: none;
  }
  
  .product-image {
    position: relative;
    height: 200px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    &:hover img {
      transform: scale(1.05);
    }
    
    .discount-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #ff4444;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
  }
  
  .product-info {
    padding: 16px;
    
    .product-name {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    
    .product-description {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .price-section {
      margin-bottom: 12px;
      
      .current-price {
        font-size: 20px;
        font-weight: bold;
        color: #e74c3c;
      }
      
      .original-price {
        margin-left: 8px;
        font-size: 16px;
        color: #999;
        text-decoration: line-through;
      }
      
      &.discounted .current-price {
        color: #27ae60;
      }
    }
    
    .rating {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .stars {
        .star {
          color: #ddd;
          font-size: 16px;
          
          &.filled {
            color: #ffc107;
          }
        }
      }
      
      .rating-text {
        font-size: 14px;
        color: #666;
      }
    }
  }
  
  .product-actions {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    gap: 8px;
    
    .btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      &.btn-primary {
        background: #007bff;
        color: white;
        
        &:hover:not(:disabled) {
          background: #0056b3;
        }
      }
      
      &.btn-secondary {
        background: #6c757d;
        color: white;
        
        &:hover:not(:disabled) {
          background: #545b62;
        }
      }
    }
  }
}
```

## （二）组件通信

### 1. 父子组件通信

```typescript
// 产品接口
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  category: string;
}

// 父组件
@Component({
  selector: 'app-product-list',
  template: `
    <div class="product-list">
      <div class="filters">
        <select [(ngModel)]="selectedCategory" (change)="onCategoryChange()">
          <option value="">所有分类</option>
          <option *ngFor="let category of categories" [value]="category">
            {{ category }}
          </option>
        </select>
        
        <input 
          type="text" 
          [(ngModel)]="searchTerm" 
          (input)="onSearch()"
          placeholder="搜索产品...">
      </div>
      
      <div class="products-grid">
        <app-product-card
          *ngFor="let product of filteredProducts; trackBy: trackByProductId"
          [product]="product"
          [showActions]="true"
          (addToCart)="onAddToCart($event)"
          (viewDetails)="onViewDetails($event)">
        </app-product-card>
      </div>
      
      <div *ngIf="filteredProducts.length === 0" class="no-products">
        没有找到匹配的产品
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  selectedCategory = '';
  searchTerm = '';
  
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadProducts();
  }
  
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
  
  onCategoryChange(): void {
    this.filterProducts();
  }
  
  onSearch(): void {
    this.filterProducts();
  }
  
  onAddToCart(product: Product): void {
    this.cartService.addToCart(product).subscribe({
      next: () => {
        console.log('产品已添加到购物车:', product.name);
      },
      error: (error) => {
        console.error('添加到购物车失败:', error);
      }
    });
  }
  
  onViewDetails(productId: number): void {
    this.router.navigate(['/products', productId]);
  }
  
  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.categories = [...new Set(products.map(p => p.category))];
      },
      error: (error) => {
        console.error('加载产品失败:', error);
      }
    });
  }
  
  private filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = !this.selectedCategory || 
        product.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }
}
```

### 2. 服务通信

```typescript
// 购物车服务
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems$ = new BehaviorSubject<CartItem[]>([]);
  private cartTotal$ = new BehaviorSubject<number>(0);
  
  // 公开的Observable
  readonly cartItems = this.cartItems$.asObservable();
  readonly cartTotal = this.cartTotal$.asObservable();
  readonly cartItemCount = this.cartItems.pipe(
    map(items => items.reduce((count, item) => count + item.quantity, 0))
  );
  
  constructor(private http: HttpClient) {
    this.loadCartFromStorage();
  }
  
  addToCart(product: Product, quantity = 1): Observable<void> {
    return new Observable(observer => {
      const currentItems = this.cartItems$.value;
      const existingItem = currentItems.find(item => item.product.id === product.id);
      
      let updatedItems: CartItem[];
      
      if (existingItem) {
        updatedItems = currentItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedItems = [...currentItems, { product, quantity }];
      }
      
      this.updateCart(updatedItems);
      observer.next();
      observer.complete();
    });
  }
  
  removeFromCart(productId: number): Observable<void> {
    return new Observable(observer => {
      const currentItems = this.cartItems$.value;
      const updatedItems = currentItems.filter(item => item.product.id !== productId);
      
      this.updateCart(updatedItems);
      observer.next();
      observer.complete();
    });
  }
  
  updateQuantity(productId: number, quantity: number): Observable<void> {
    return new Observable(observer => {
      if (quantity <= 0) {
        this.removeFromCart(productId).subscribe(() => {
          observer.next();
          observer.complete();
        });
        return;
      }
      
      const currentItems = this.cartItems$.value;
      const updatedItems = currentItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      );
      
      this.updateCart(updatedItems);
      observer.next();
      observer.complete();
    });
  }
  
  clearCart(): Observable<void> {
    return new Observable(observer => {
      this.updateCart([]);
      observer.next();
      observer.complete();
    });
  }
  
  private updateCart(items: CartItem[]): void {
    this.cartItems$.next(items);
    
    const total = items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    
    this.cartTotal$.next(total);
    this.saveCartToStorage(items);
  }
  
  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart) as CartItem[];
        this.updateCart(items);
      } catch (error) {
        console.error('加载购物车数据失败:', error);
      }
    }
  }
  
  private saveCartToStorage(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
  }
}

// 购物车项目接口
interface CartItem {
  product: Product;
  quantity: number;
}
```

# 四、模板语法

## （一）数据绑定

### 1. 插值表达式

```typescript
@Component({
  selector: 'app-interpolation-demo',
  template: `
    <div class="demo-container">
      <!-- 基本插值 -->
      <h2>{{ title }}</h2>
      <p>当前时间: {{ currentTime | date:'yyyy-MM-dd HH:mm:ss' }}</p>
      
      <!-- 表达式计算 -->
      <p>总价: {{ price * quantity | currency:'CNY' }}</p>
      <p>折扣价: {{ calculateDiscountPrice() | currency:'CNY' }}</p>
      
      <!-- 条件表达式 -->
      <p>状态: {{ isActive ? '激活' : '未激活' }}</p>
      <p>等级: {{ user?.level || '普通用户' }}</p>
      
      <!-- 方法调用 -->
      <p>格式化名称: {{ formatUserName(user) }}</p>
      
      <!-- 避免副作用的表达式 -->
      <p>商品数量: {{ items.length }}</p>
      <p>第一个商品: {{ items[0]?.name || '暂无商品' }}</p>
    </div>
  `
})
export class InterpolationDemoComponent {
  title = 'Angular插值演示';
  currentTime = new Date();
  price = 99.99;
  quantity = 2;
  discountRate = 0.1;
  isActive = true;
  
  user = {
    name: '张三',
    level: 'VIP',
    firstName: '三',
    lastName: '张'
  };
  
  items = [
    { name: '商品1', price: 100 },
    { name: '商品2', price: 200 }
  ];
  
  constructor() {
    // 定时更新时间
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }
  
  calculateDiscountPrice(): number {
    return this.price * this.quantity * (1 - this.discountRate);
  }
  
  formatUserName(user: any): string {
    return user ? `${user.lastName}${user.firstName}` : '未知用户';
  }
}
```

### 2. 属性绑定

```typescript
@Component({
  selector: 'app-property-binding-demo',
  template: `
    <div class="demo-container">
      <!-- HTML属性绑定 -->
      <img [src]="imageUrl" [alt]="imageAlt" [width]="imageWidth">
      
      <!-- 类绑定 -->
      <div [class]="cssClass">基本类绑定</div>
      <div [class.active]="isActive">条件类绑定</div>
      <div [ngClass]="getClasses()">多类绑定</div>
      
      <!-- 样式绑定 -->
      <div [style.color]="textColor">颜色绑定</div>
      <div [style.font-size.px]="fontSize">字体大小绑定</div>
      <div [ngStyle]="getStyles()">多样式绑定</div>
      
      <!-- 表单控件属性 -->
      <input [value]="inputValue" [disabled]="isDisabled" [placeholder]="placeholder">
      <button [disabled]="!canSubmit">提交</button>
      
      <!-- 自定义属性 -->
      <div [attr.data-id]="userId" [attr.aria-label]="ariaLabel">
        自定义属性绑定
      </div>
      
      <!-- 内容绑定 -->
      <div [innerHTML]="htmlContent"></div>
      <div [textContent]="textContent"></div>
    </div>
  `
})
export class PropertyBindingDemoComponent {
  imageUrl = 'https://via.placeholder.com/300x200';
  imageAlt = '示例图片';
  imageWidth = 300;
  
  cssClass = 'highlight';
  isActive = true;
  
  textColor = '#007bff';
  fontSize = 16;
  
  inputValue = '默认值';
  isDisabled = false;
  placeholder = '请输入内容';
  canSubmit = true;
  
  userId = 123;
  ariaLabel = '用户信息';
  
  htmlContent = '<strong>这是HTML内容</strong>';
  textContent = '这是纯文本内容';
  
  getClasses(): any {
    return {
      'active': this.isActive,
      'disabled': this.isDisabled,
      'highlight': true
    };
  }
  
  getStyles(): any {
    return {
      'color': this.textColor,
      'font-size': this.fontSize + 'px',
      'font-weight': this.isActive ? 'bold' : 'normal'
    };
  }
}
```

### 3. 事件绑定

```typescript
@Component({
  selector: 'app-event-binding-demo',
  template: `
    <div class="demo-container">
      <!-- 基本事件绑定 -->
      <button (click)="onClick()">点击事件</button>
      <button (click)="onClickWithParam('参数')">带参数点击</button>
      
      <!-- 事件对象 -->
      <input (input)="onInput($event)" (keyup.enter)="onEnter($event)">
      <div (mouseover)="onMouseOver($event)" (mouseleave)="onMouseLeave($event)">
        鼠标悬停区域
      </div>
      
      <!-- 键盘事件 -->
      <input 
        (keydown)="onKeyDown($event)"
        (keyup.escape)="onEscape()"
        (keyup.ctrl.s)="onSave()"
        placeholder="键盘事件演示">
      
      <!-- 表单事件 -->
      <form (submit)="onSubmit($event)" (reset)="onReset()">
        <input [(ngModel)]="formData.name" name="name" placeholder="姓名">
        <input [(ngModel)]="formData.email" name="email" placeholder="邮箱">
        <button type="submit">提交</button>
        <button type="reset">重置</button>
      </form>
      
      <!-- 自定义事件 -->
      <app-custom-component 
        (customEvent)="onCustomEvent($event)"
        (dataChange)="onDataChange($event)">
      </app-custom-component>
      
      <!-- 事件修饰符 -->
      <div (click)="onOuterClick()" class="outer">
        外层
        <div (click)="onInnerClick($event)" class="inner">
          内层（点击测试事件冒泡）
        </div>
        <div (click.stop)="onStopPropagation()" class="inner">
          阻止冒泡
        </div>
      </div>
      
      <!-- 防抖事件 -->
      <input 
        (input)="onDebouncedInput($event)"
        placeholder="防抖输入">
      
      <div class="event-log">
        <h4>事件日志:</h4>
        <div *ngFor="let log of eventLogs" class="log-item">
          {{ log.timestamp | date:'HH:mm:ss' }} - {{ log.message }}
        </div>
      </div>
    </div>
  `
})
export class EventBindingDemoComponent {
  formData = {
    name: '',
    email: ''
  };
  
  eventLogs: Array<{timestamp: Date, message: string}> = [];
  private debounceTimer: any;
  
  onClick(): void {
    this.addLog('按钮被点击');
  }
  
  onClickWithParam(param: string): void {
    this.addLog(`带参数点击: ${param}`);
  }
  
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.addLog(`输入内容: ${target.value}`);
  }
  
  onEnter(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
    this.addLog(`回车确认: ${target.value}`);
  }
  
  onMouseOver(event: MouseEvent): void {
    this.addLog('鼠标悬停');
  }
  
  onMouseLeave(event: MouseEvent): void {
    this.addLog('鼠标离开');
  }
  
  onKeyDown(event: KeyboardEvent): void {
    this.addLog(`按键按下: ${event.key}`);
  }
  
  onEscape(): void {
    this.addLog('ESC键被按下');
  }
  
  onSave(): void {
    this.addLog('Ctrl+S 保存快捷键');
  }
  
  onSubmit(event: Event): void {
    event.preventDefault();
    this.addLog(`表单提交: ${JSON.stringify(this.formData)}`);
  }
  
  onReset(): void {
    this.formData = { name: '', email: '' };
    this.addLog('表单重置');
  }
  
  onCustomEvent(data: any): void {
    this.addLog(`自定义事件: ${JSON.stringify(data)}`);
  }
  
  onDataChange(data: any): void {
    this.addLog(`数据变化: ${JSON.stringify(data)}`);
  }
  
  onOuterClick(): void {
    this.addLog('外层点击');
  }
  
  onInnerClick(event: Event): void {
    this.addLog('内层点击');
  }
  
  onStopPropagation(): void {
    this.addLog('阻止冒泡点击');
  }
  
  onDebouncedInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    
    // 清除之前的定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // 设置新的定时器
    this.debounceTimer = setTimeout(() => {
      this.addLog(`防抖输入: ${target.value}`);
    }, 500);
  }
  
  private addLog(message: string): void {
    this.eventLogs.unshift({
      timestamp: new Date(),
      message
    });
    
    // 保持日志数量在合理范围内
    if (this.eventLogs.length > 20) {
      this.eventLogs = this.eventLogs.slice(0, 20);
    }
  }
}
```

### 4. 双向数据绑定

```typescript
@Component({
  selector: 'app-two-way-binding-demo',
  template: `
    <div class="demo-container">
      <h3>双向数据绑定演示</h3>
      
      <!-- 基本双向绑定 -->
      <div class="form-group">
        <label>姓名:</label>
        <input [(ngModel)]="user.name" placeholder="请输入姓名">
        <p>当前值: {{ user.name }}</p>
      </div>
      
      <!-- 复选框 -->
      <div class="form-group">
        <label>
          <input type="checkbox" [(ngModel)]="user.isActive">
          激活状态
        </label>
        <p>状态: {{ user.isActive ? '激活' : '未激活' }}</p>
      </div>
      
      <!-- 单选按钮 -->
      <div class="form-group">
        <label>性别:</label>
        <label>
          <input type="radio" [(ngModel)]="user.gender" value="male">
          男
        </label>
        <label>
          <input type="radio" [(ngModel)]="user.gender" value="female">
          女
        </label>
        <p>选择: {{ user.gender }}</p>
      </div>
      
      <!-- 下拉选择 -->
      <div class="form-group">
        <label>城市:</label>
        <select [(ngModel)]="user.city">
          <option value="">请选择城市</option>
          <option *ngFor="let city of cities" [value]="city.value">
            {{ city.label }}
          </option>
        </select>
        <p>选择的城市: {{ user.city }}</p>
      </div>
      
      <!-- 多选 -->
      <div class="form-group">
        <label>兴趣爱好:</label>
        <div *ngFor="let hobby of hobbies">
          <label>
            <input 
              type="checkbox" 
              [checked]="user.hobbies.includes(hobby.value)"
              (change)="onHobbyChange(hobby.value, $event)">
            {{ hobby.label }}
          </label>
        </div>
        <p>选择的爱好: {{ user.hobbies.join(', ') }}</p>
      </div>
      
      <!-- 文本域 -->
      <div class="form-group">
        <label>个人简介:</label>
        <textarea [(ngModel)]="user.bio" rows="4" placeholder="请输入个人简介"></textarea>
        <p>字符数: {{ user.bio.length }}</p>
      </div>
      
      <!-- 自定义双向绑定组件 -->
      <div class="form-group">
        <label>评分:</label>
        <app-rating [(rating)]="user.rating" [maxRating]="5"></app-rating>
        <p>当前评分: {{ user.rating }}</p>
      </div>
      
      <!-- 数据预览 -->
      <div class="data-preview">
        <h4>用户数据:</h4>
        <pre>{{ user | json }}</pre>
      </div>
      
      <!-- 操作按钮 -->
      <div class="actions">
        <button (click)="resetForm()">重置表单</button>
        <button (click)="saveUser()" [disabled]="!isFormValid()">保存用户</button>
      </div>
    </div>
  `
})
export class TwoWayBindingDemoComponent {
  user = {
    name: '',
    isActive: false,
    gender: '',
    city: '',
    hobbies: [] as string[],
    bio: '',
    rating: 0
  };
  
  cities = [
    { value: 'beijing', label: '北京' },
    { value: 'shanghai', label: '上海' },
    { value: 'guangzhou', label: '广州' },
    { value: 'shenzhen', label: '深圳' }
  ];
  
  hobbies = [
    { value: 'reading', label: '阅读' },
    { value: 'music', label: '音乐' },
    { value: 'sports', label: '运动' },
    { value: 'travel', label: '旅行' },
    { value: 'coding', label: '编程' }
  ];
  
  onHobbyChange(hobby: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    
    if (target.checked) {
      if (!this.user.hobbies.includes(hobby)) {
        this.user.hobbies.push(hobby);
      }
    } else {
      this.user.hobbies = this.user.hobbies.filter(h => h !== hobby);
    }
  }
  
  resetForm(): void {
    this.user = {
      name: '',
      isActive: false,
      gender: '',
      city: '',
      hobbies: [],
      bio: '',
      rating: 0
    };
  }
  
  saveUser(): void {
    console.log('保存用户数据:', this.user);
    alert('用户数据已保存！');
  }
  
  isFormValid(): boolean {
    return this.user.name.trim().length > 0 && 
           this.user.gender !== '' && 
           this.user.city !== '';
  }
}
```

## （二）结构指令

### 1. *ngIf 条件渲染

```typescript
@Component({
  selector: 'app-ngif-demo',
  template: `
    <div class="demo-container">
      <h3>*ngIf 条件渲染演示</h3>
      
      <!-- 基本条件渲染 -->
      <div class="controls">
        <button (click)="toggleVisibility()">切换显示</button>
        <button (click)="toggleUser()">切换用户</button>
        <button (click)="toggleLoading()">切换加载状态</button>
      </div>
      
      <!-- 简单条件 -->
      <div *ngIf="isVisible" class="message">
        这个内容是条件显示的
      </div>
      
      <!-- 条件表达式 -->
      <div *ngIf="user && user.isActive" class="user-info">
        用户 {{ user.name }} 当前是激活状态
      </div>
      
      <!-- if-else 模式 -->
      <div *ngIf="isLoading; else contentTemplate" class="loading">
        正在加载...
      </div>
      
      <ng-template #contentTemplate>
        <div class="content">
          内容已加载完成
        </div>
      </ng-template>
      
      <!-- if-then-else 模式 -->
      <div *ngIf="user; then userTemplate; else noUserTemplate"></div>
      
      <ng-template #userTemplate>
        <div class="user-card">
          <h4>{{ user.name }}</h4>
          <p>邮箱: {{ user.email }}</p>
          <p>状态: {{ user.isActive ? '激活' : '未激活' }}</p>
        </div>
      </ng-template>
      
      <ng-template #noUserTemplate>
        <div class="no-user">
          暂无用户信息
        </div>
      </ng-template>
      
      <!-- 复杂条件 -->
      <div *ngIf="user && user.permissions && user.permissions.includes('admin')" 
           class="admin-panel">
        管理员面板
      </div>
      
      <!-- 嵌套条件 -->
      <div *ngIf="user" class="user-details">
        <h4>用户详情</h4>
        <div *ngIf="user.profile" class="profile">
          <div *ngIf="user.profile.avatar" class="avatar">
            <img [src]="user.profile.avatar" [alt]="user.name">
          </div>
          <div *ngIf="user.profile.bio" class="bio">
            {{ user.profile.bio }}
          </div>
        </div>
        <div *ngIf="!user.profile" class="no-profile">
          用户未完善个人资料
        </div>
      </div>
      
      <!-- 性能优化：使用trackBy -->
      <div *ngIf="showExpensiveComponent" class="expensive">
        <app-expensive-component [data]="expensiveData"></app-expensive-component>
      </div>
    </div>
  `
})
export class NgIfDemoComponent {
  isVisible = true;
  isLoading = false;
  showExpensiveComponent = false;
  
  user: any = {
    name: '张三',
    email: 'zhangsan@example.com',
    isActive: true,
    permissions: ['user', 'admin'],
    profile: {
      avatar: 'https://via.placeholder.com/50',
      bio: '这是用户的个人简介'
    }
  };
  
  expensiveData = { /* 复杂数据 */ };
  
  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
  }
  
  toggleUser(): void {
    this.user = this.user ? null : {
      name: '李四',
      email: 'lisi@example.com',
      isActive: false,
      permissions: ['user'],
      profile: null
    };
  }
  
  toggleLoading(): void {
    this.isLoading = !this.isLoading;
  }
}
```

### 2. *ngFor 列表渲染

```typescript
@Component({
  selector: 'app-ngfor-demo',
  template: `
    <div class="demo-container">
      <h3>*ngFor 列表渲染演示</h3>
      
      <!-- 基本列表 -->
      <div class="section">
        <h4>基本列表</h4>
        <ul>
          <li *ngFor="let item of items">{{ item }}</li>
        </ul>
      </div>
      
      <!-- 带索引的列表 -->
      <div class="section">
        <h4>带索引的列表</h4>
        <ul>
          <li *ngFor="let item of items; let i = index">
            {{ i + 1 }}. {{ item }}
          </li>
        </ul>
      </div>
      
      <!-- 复杂对象列表 -->
      <div class="section">
        <h4>用户列表</h4>
        <div class="user-grid">
          <div 
            *ngFor="let user of users; let i = index; let first = first; let last = last; let even = even; let odd = odd; trackBy: trackByUserId"
            class="user-card"
            [class.first]="first"
            [class.last]="last"
            [class.even]="even"
            [class.odd]="odd">
            
            <div class="user-header">
              <span class="index">#{{ i + 1 }}</span>
              <span class="status" [class.active]="user.isActive"></span>
            </div>
            
            <div class="user-info">
              <h5>{{ user.name }}</h5>
              <p>{{ user.email }}</p>
              <p>年龄: {{ user.age }}</p>
            </div>
            
            <div class="user-actions">
              <button (click)="editUser(user)">编辑</button>
              <button (click)="deleteUser(user.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 嵌套循环 -->
      <div class="section">
        <h4>分类商品</h4>
        <div *ngFor="let category of categories; trackBy: trackByCategoryId" class="category">
          <h5>{{ category.name }}</h5>
          <div class="products">
            <div 
              *ngFor="let product of category.products; trackBy: trackByProductId"
              class="product-item">
              <span>{{ product.name }}</span>
              <span class="price">¥{{ product.price }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 条件循环 -->
      <div class="section">
        <h4>激活用户</h4>
        <div *ngFor="let user of users; trackBy: trackByUserId">
          <div *ngIf="user.isActive" class="active-user">
            {{ user.name }} - {{ user.email }}
          </div>
        </div>
      </div>
      
      <!-- 空列表处理 -->
      <div class="section">
        <h4>搜索结果</h4>
        <input [(ngModel)]="searchTerm" placeholder="搜索用户...">
        
        <div *ngIf="filteredUsers.length > 0; else noResults">
          <div *ngFor="let user of filteredUsers; trackBy: trackByUserId" class="search-result">
            {{ user.name }} - {{ user.email }}
          </div>
        </div>
        
        <ng-template #noResults>
          <div class="no-results">
            <p *ngIf="searchTerm">没有找到匹配 "{{ searchTerm }}" 的用户</p>
            <p *ngIf="!searchTerm">请输入搜索关键词</p>
          </div>
        </ng-template>
      </div>
      
      <!-- 操作按钮 -->
      <div class="actions">
        <button (click)="addUser()">添加用户</button>
        <button (click)="shuffleUsers()">随机排序</button>
        <button (click)="sortUsers()">按名称排序</button>
        <button (click)="clearUsers()">清空列表</button>
      </div>
    </div>
  `
})
export class NgForDemoComponent implements OnInit {
  items = ['苹果', '香蕉', '橙子', '葡萄'];
  
  users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25, isActive: true },
    { id: 2, name: '李四', email: 'lisi@example.com', age: 30, isActive: false },
    { id: 3, name: '王五', email: 'wangwu@example.com', age: 28, isActive: true },
    { id: 4, name: '赵六', email: 'zhaoliu@example.com', age: 35, isActive: true }
  ];
  
  categories = [
    {
      id: 1,
      name: '电子产品',
      products: [
        { id: 1, name: '手机', price: 3999 },
        { id: 2, name: '电脑', price: 8999 },
        { id: 3, name: '平板', price: 2999 }
      ]
    },
    {
      id: 2,
      name: '服装',
      products: [
        { id: 4, name: 'T恤', price: 99 },
        { id: 5, name: '牛仔裤', price: 299 },
        { id: 6, name: '运动鞋', price: 599 }
      ]
    }
  ];
  
  searchTerm = '';
  
  get filteredUsers() {
    if (!this.searchTerm) {
      return [];
    }
    
    return this.users.filter(user => 
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  
  ngOnInit(): void {
    console.log('NgFor演示组件初始化');
  }
  
  // TrackBy函数优化性能
  trackByUserId(index: number, user: any): number {
    return user.id;
  }
  
  trackByCategoryId(index: number, category: any): number {
    return category.id;
  }
  
  trackByProductId(index: number, product: any): number {
    return product.id;
  }
  
  editUser(user: any): void {
    console.log('编辑用户:', user);
  }
  
  deleteUser(userId: number): void {
    this.users = this.users.filter(user => user.id !== userId);
  }
  
  addUser(): void {
    const newId = Math.max(...this.users.map(u => u.id)) + 1;
    const newUser = {
      id: newId,
      name: `用户${newId}`,
      email: `user${newId}@example.com`,
      age: Math.floor(Math.random() * 40) + 20,
      isActive: Math.random() > 0.5
    };
    
    this.users.push(newUser);
  }
  
  shuffleUsers(): void {
    this.users = [...this.users].sort(() => Math.random() - 0.5);
  }
  
  sortUsers(): void {
    this.users = [...this.users].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  clearUsers(): void {
    this.users = [];
  }
}
```

### 3. ngSwitch 多条件渲染

```typescript
@Component({
  selector: 'app-ngswitch-demo',
  template: `
    <div class="demo-container">
      <h3>ngSwitch 多条件渲染演示</h3>
      
      <!-- 控制面板 -->
      <div class="controls">
        <label>选择视图类型:</label>
        <select [(ngModel)]="viewType">
          <option value="list">列表视图</option>
          <option value="grid">网格视图</option>
          <option value="card">卡片视图</option>
          <option value="table">表格视图</option>
        </select>
        
        <label>用户状态:</label>
        <select [(ngModel)]="userStatus">
          <option value="active">激活</option>
          <option value="inactive">未激活</option>
          <option value="pending">待审核</option>
          <option value="banned">已禁用</option>
        </select>
      </div>
      
      <!-- 基本 ngSwitch -->
      <div class="section">
        <h4>视图切换</h4>
        <div [ngSwitch]="viewType">
          <div *ngSwitchCase="'list'" class="list-view">
            <h5>列表视图</h5>
            <ul>
              <li *ngFor="let user of users">{{ user.name }} - {{ user.email }}</li>
            </ul>
          </div>
          
          <div *ngSwitchCase="'grid'" class="grid-view">
            <h5>网格视图</h5>
            <div class="user-grid">
              <div *ngFor="let user of users" class="grid-item">
                <strong>{{ user.name }}</strong>
                <br>
                <small>{{ user.email }}</small>
              </div>
            </div>
          </div>
          
          <div *ngSwitchCase="'card'" class="card-view">
            <h5>卡片视图</h5>
            <div class="card-container">
              <div *ngFor="let user of users" class="user-card">
                <div class="card-header">{{ user.name }}</div>
                <div class="card-body">
                  <p>邮箱: {{ user.email }}</p>
                  <p>年龄: {{ user.age }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngSwitchCase="'table'" class="table-view">
            <h5>表格视图</h5>
            <table>
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>邮箱</th>
                  <th>年龄</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.age }}</td>
                  <td>{{ user.isActive ? '激活' : '未激活' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div *ngSwitchDefault class="default-view">
            <p>未知的视图类型</p>
          </div>
        </div>
      </div>
      
      <!-- 用户状态显示 -->
      <div class="section">
        <h4>用户状态</h4>
        <div [ngSwitch]="userStatus" class="status-display">
          <div *ngSwitchCase="'active'" class="status active">
            <i class="icon-check"></i>
            <span>用户状态正常，可以正常使用所有功能</span>
          </div>
          
          <div *ngSwitchCase="'inactive'" class="status inactive">
            <i class="icon-pause"></i>
            <span>用户未激活，请检查邮箱并完成激活</span>
          </div>
          
          <div *ngSwitchCase="'pending'" class="status pending">
            <i class="icon-clock"></i>
            <span>用户待审核，管理员正在审核中</span>
          </div>
          
          <div *ngSwitchCase="'banned'" class="status banned">
            <i class="icon-ban"></i>
            <span>用户已被禁用，如有疑问请联系管理员</span>
          </div>
          
          <div *ngSwitchDefault class="status unknown">
            <i class="icon-question"></i>
            <span>未知状态</span>
          </div>
        </div>
      </div>
      
      <!-- 嵌套 ngSwitch -->
      <div class="section">
        <h4>嵌套条件</h4>
        <div [ngSwitch]="viewType">
          <div *ngSwitchCase="'card'">
            <div [ngSwitch]="userStatus">
              <div *ngSwitchCase="'active'" class="nested-content">
                激活用户的卡片视图
              </div>
              <div *ngSwitchCase="'inactive'" class="nested-content">
                未激活用户的卡片视图
              </div>
              <div *ngSwitchDefault class="nested-content">
                其他状态用户的卡片视图
              </div>
            </div>
          </div>
          
          <div *ngSwitchDefault>
            非卡片视图模式
          </div>
        </div>
      </div>
    </div>
  `
})
export class NgSwitchDemoComponent {
  viewType = 'list';
  userStatus = 'active';
  
  users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25, isActive: true },
    { id: 2, name: '李四', email: 'lisi@example.com', age: 30, isActive: false },
    { id: 3, name: '王五', email: 'wangwu@example.com', age: 28, isActive: true }
  ];
}
```

# 五、依赖注入

## （一）服务与依赖注入基础

### 1. 创建和注册服务

```typescript
// 基础服务
@Injectable({
  providedIn: 'root' // 在根注入器中提供，创建单例
})
export class LoggerService {
  private logs: string[] = [];
  
  log(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }
  
  error(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR: ${message}`;
    this.logs.push(logEntry);
    console.error(logEntry);
  }
  
  getLogs(): string[] {
    return [...this.logs];
  }
  
  clearLogs(): void {
    this.logs = [];
  }
}

// HTTP服务
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  
  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {
    this.logger.log('ApiService 初始化');
  }
  
  get<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    this.logger.log(`GET 请求: ${url}`);
    
    return this.http.get<T>(url).pipe(
      tap(() => this.logger.log(`GET 请求成功: ${url}`)),
      catchError(error => {
        this.logger.error(`GET 请求失败: ${url} - ${error.message}`);
        return throwError(() => error);
      })
    );
  }
  
  post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    this.logger.log(`POST 请求: ${url}`);
    
    return this.http.post<T>(url, data).pipe(
      tap(() => this.logger.log(`POST 请求成功: ${url}`)),
      catchError(error => {
        this.logger.error(`POST 请求失败: ${url} - ${error.message}`);
        return throwError(() => error);
      })
    );
  }
}
```

### 2. 不同的注入方式

```typescript
// 在模块中提供服务
@NgModule({
  providers: [
    // 基本提供方式
    UserService,
    
    // 使用类提供
    { provide: UserService, useClass: UserService },
    
    // 使用现有服务
    { provide: 'UserServiceAlias', useExisting: UserService },
    
    // 使用工厂函数
    {
      provide: 'ApiConfig',
      useFactory: (env: any) => {
        return {
          baseUrl: env.production ? 'https://api.prod.com' : 'http://localhost:3000',
          timeout: 5000
        };
      },
      deps: ['Environment']
    },
    
    // 使用值
    { provide: 'API_URL', useValue: 'https://api.example.com' },
    
    // 条件提供
    {
      provide: StorageService,
      useClass: environment.production ? CloudStorageService : LocalStorageService
    }
  ]
})
export class AppModule {}

// 在组件中提供服务（组件级别的实例）
@Component({
  selector: 'app-user-profile',
  template: `...`,
  providers: [
    // 每个组件实例都会有自己的服务实例
    UserProfileService,
    
    // 使用不同的实现
    { provide: NotificationService, useClass: ToastNotificationService }
  ]
})
export class UserProfileComponent {
  constructor(
    private userProfileService: UserProfileService,
    private notificationService: NotificationService
  ) {}
}
```

### 3. 注入令牌和接口

```typescript
// 定义接口
export interface StorageInterface {
  get(key: string): any;
  set(key: string, value: any): void;
  remove(key: string): void;
  clear(): void;
}

// 创建注入令牌
export const STORAGE_SERVICE = new InjectionToken<StorageInterface>('StorageService');

// 实现接口的服务
@Injectable()
export class LocalStorageService implements StorageInterface {
  get(key: string): any {
    const item = localStorage.getItem(key);
    try {
      return item ? JSON.parse(item) : null;
    } catch {
      return item;
    }
  }
  
  set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  remove(key: string): void {
    localStorage.removeItem(key);
  }
  
  clear(): void {
    localStorage.clear();
  }
}

@Injectable()
export class SessionStorageService implements StorageInterface {
  get(key: string): any {
    const item = sessionStorage.getItem(key);
    try {
      return item ? JSON.parse(item) : null;
    } catch {
      return item;
    }
  }
  
  set(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
  
  remove(key: string): void {
    sessionStorage.removeItem(key);
  }
  
  clear(): void {
    sessionStorage.clear();
  }
}

// 在模块中配置
@NgModule({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useClass: LocalStorageService
    }
  ]
})
export class AppModule {}

// 在组件中使用
@Component({
  selector: 'app-settings',
  template: `
    <div>
      <h3>用户设置</h3>
      <label>
        <input type="checkbox" [(ngModel)]="darkMode" (change)="saveSetting('darkMode', darkMode)">
        深色模式
      </label>
      <label>
        <select [(ngModel)]="language" (change)="saveSetting('language', language)">
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </label>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  darkMode = false;
  language = 'zh';
  
  constructor(
    @Inject(STORAGE_SERVICE) private storage: StorageInterface
  ) {}
  
  ngOnInit(): void {
    this.loadSettings();
  }
  
  saveSetting(key: string, value: any): void {
    this.storage.set(key, value);
  }
  
  private loadSettings(): void {
     this.darkMode = this.storage.get('darkMode') || false;
     this.language = this.storage.get('language') || 'zh';
   }
 }
 ```

## （二）路由守卫

### 1. 认证守卫

```typescript
// auth.guard.ts
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth(state.url);
  }
  
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }
  
  private checkAuth(url: string): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated().pipe(
      map(isAuth => {
        if (isAuth) {
          return true;
        } else {
          this.snackBar.open('请先登录', '关闭', { duration: 3000 });
          return this.router.createUrlTree(['/login'], {
            queryParams: { returnUrl: url }
          });
        }
      }),
      catchError(() => {
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}

// admin.guard.ts
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (user && user.role === 'admin') {
          return true;
        } else {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  }
}

// unsaved-changes.guard.ts
export interface CanComponentDeactivate {
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(
    component: CanComponentDeactivate,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (component.canDeactivate) {
      return component.canDeactivate();
    }
    return true;
  }
}

// 实现CanComponentDeactivate接口的组件
@Component({
  selector: 'app-profile-edit',
  template: `
    <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="name">姓名</label>
        <input type="text" id="name" formControlName="name" class="form-control">
      </div>
      
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" id="email" formControlName="email" class="form-control">
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid">
          保存
        </button>
        <button type="button" (click)="cancel()" class="btn btn-secondary">
          取消
        </button>
      </div>
    </form>
  `
})
export class ProfileEditComponent implements OnInit, CanComponentDeactivate {
  profileForm!: FormGroup;
  private originalValue: any;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    
    // 保存原始值
    this.originalValue = this.profileForm.value;
  }
  
  canDeactivate(): Observable<boolean> | boolean {
    if (this.hasUnsavedChanges()) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: '未保存的更改',
          message: '您有未保存的更改，确定要离开吗？',
          confirmText: '离开',
          cancelText: '取消'
        }
      });
      
      return dialogRef.afterClosed();
    }
    
    return true;
  }
  
  private hasUnsavedChanges(): boolean {
    return JSON.stringify(this.originalValue) !== JSON.stringify(this.profileForm.value);
  }
  
  onSubmit(): void {
    if (this.profileForm.valid) {
      // 保存逻辑
      this.originalValue = this.profileForm.value;
    }
  }
  
  cancel(): void {
    this.router.navigate(['/profile']);
  }
}
```

### 2. 数据预加载守卫

```typescript
// data-resolver.service.ts
@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<User> {
  constructor(private userService: UserService, private router: Router) {}
  
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<User> | Promise<User> | User {
    const userId = +route.paramMap.get('id')!;
    
    return this.userService.getUserById(userId).pipe(
      catchError(error => {
        console.error('加载用户数据失败:', error);
        this.router.navigate(['/users']);
        return EMPTY;
      })
    );
  }
}

// 在路由配置中使用
const routes: Routes = [
  {
    path: 'user/:id',
    component: UserDetailComponent,
    resolve: {
      user: UserResolver
    }
  }
];

// 在组件中使用预加载的数据
@Component({
  selector: 'app-user-detail',
  template: `
    <div class="user-detail">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  user!: User;
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    // 从路由数据中获取预加载的用户信息
    this.user = this.route.snapshot.data['user'];
    
    // 或者监听数据变化
    this.route.data.subscribe(data => {
      this.user = data['user'];
    });
  }
}
```

# 九、生命周期钩子

## （一）组件生命周期

### 1. 完整生命周期示例

```typescript
@Component({
  selector: 'app-lifecycle-demo',
  template: `
    <div class="lifecycle-demo">
      <h3>生命周期演示组件</h3>
      <p>计数器: {{ counter }}</p>
      <p>输入值: {{ inputValue }}</p>
      
      <input 
        type="text" 
        [(ngModel)]="inputValue"
        placeholder="输入一些文本">
      
      <button (click)="increment()">增加计数</button>
      <button (click)="triggerError()">触发错误</button>
      
      <div class="lifecycle-log">
        <h4>生命周期日志:</h4>
        <ul>
          <li *ngFor="let log of lifecycleLogs">{{ log }}</li>
        </ul>
        <button (click)="clearLogs()">清空日志</button>
      </div>
    </div>
  `
})
export class LifecycleDemoComponent implements 
  OnInit, OnDestroy, OnChanges, DoCheck, 
  AfterContentInit, AfterContentChecked,
  AfterViewInit, AfterViewChecked {
  
  @Input() externalData: any;
  
  counter = 0;
  inputValue = '';
  lifecycleLogs: string[] = [];
  
  private intervalId?: number;
  private previousInputValue = '';
  
  constructor() {
    this.log('Constructor: 组件实例创建');
  }
  
  // 1. ngOnChanges - 输入属性变化时调用
  ngOnChanges(changes: SimpleChanges): void {
    this.log('ngOnChanges: 输入属性发生变化');
    
    for (const propName in changes) {
      const change = changes[propName];
      const current = JSON.stringify(change.currentValue);
      const previous = JSON.stringify(change.previousValue);
      
      this.log(`  ${propName}: ${previous} => ${current}`);
    }
  }
  
  // 2. ngOnInit - 组件初始化完成
  ngOnInit(): void {
    this.log('ngOnInit: 组件初始化完成');
    
    // 启动定时器
    this.intervalId = window.setInterval(() => {
      // 这里可以执行一些定期任务
    }, 5000);
    
    // 初始化数据
    this.loadInitialData();
  }
  
  // 3. ngDoCheck - 每次变更检测时调用
  ngDoCheck(): void {
    // 注意：这个方法会频繁调用，避免在这里执行重操作
    if (this.inputValue !== this.previousInputValue) {
      this.log(`ngDoCheck: 检测到输入值变化 ${this.previousInputValue} => ${this.inputValue}`);
      this.previousInputValue = this.inputValue;
    }
  }
  
  // 4. ngAfterContentInit - 内容投影初始化完成
  ngAfterContentInit(): void {
    this.log('ngAfterContentInit: 内容投影初始化完成');
  }
  
  // 5. ngAfterContentChecked - 内容投影检查完成
  ngAfterContentChecked(): void {
    // 这个方法也会频繁调用
    // this.log('ngAfterContentChecked: 内容投影检查完成');
  }
  
  // 6. ngAfterViewInit - 视图初始化完成
  ngAfterViewInit(): void {
    this.log('ngAfterViewInit: 视图初始化完成');
    
    // 在这里可以安全地访问视图中的元素
    this.setupViewRelatedFeatures();
  }
  
  // 7. ngAfterViewChecked - 视图检查完成
  ngAfterViewChecked(): void {
    // 这个方法也会频繁调用
    // this.log('ngAfterViewChecked: 视图检查完成');
  }
  
  // 8. ngOnDestroy - 组件销毁前
  ngOnDestroy(): void {
    this.log('ngOnDestroy: 组件即将销毁');
    
    // 清理工作
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    // 取消订阅
    this.cleanup();
  }
  
  // 辅助方法
  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.lifecycleLogs.push(`[${timestamp}] ${message}`);
    console.log(message);
    
    // 限制日志数量
    if (this.lifecycleLogs.length > 20) {
      this.lifecycleLogs.shift();
    }
  }
  
  private loadInitialData(): void {
    // 模拟数据加载
    setTimeout(() => {
      this.log('初始数据加载完成');
    }, 1000);
  }
  
  private setupViewRelatedFeatures(): void {
    // 设置视图相关功能
    this.log('设置视图相关功能');
  }
  
  private cleanup(): void {
    // 清理订阅、事件监听器等
    this.log('执行清理工作');
  }
  
  // 组件方法
  increment(): void {
    this.counter++;
    this.log(`计数器增加到: ${this.counter}`);
  }
  
  triggerError(): void {
    throw new Error('这是一个测试错误');
  }
  
  clearLogs(): void {
    this.lifecycleLogs = [];
  }
}
```

### 2. 实际应用场景

```typescript
// 数据加载组件
@Component({
  selector: 'app-data-loader',
  template: `
    <div class="data-loader">
      <div *ngIf="loading" class="loading">
        正在加载数据...
      </div>
      
      <div *ngIf="!loading && data" class="data-content">
        <h3>{{ data.title }}</h3>
        <p>{{ data.description }}</p>
        <ul>
          <li *ngFor="let item of data.items">{{ item.name }}</li>
        </ul>
      </div>
      
      <div *ngIf="!loading && error" class="error">
        加载失败: {{ error.message }}
        <button (click)="retry()">重试</button>
      </div>
    </div>
  `
})
export class DataLoaderComponent implements OnInit, OnDestroy {
  @Input() dataId!: string;
  
  data: any = null;
  loading = false;
  error: any = null;
  
  private destroy$ = new Subject<void>();
  private retryCount = 0;
  private maxRetries = 3;
  
  constructor(private dataService: DataService) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private loadData(): void {
    if (!this.dataId) {
      this.error = { message: '缺少数据ID' };
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    this.dataService.getData(this.dataId).pipe(
      takeUntil(this.destroy$),
      retry(this.maxRetries),
      catchError(error => {
        this.error = error;
        this.loading = false;
        return EMPTY;
      })
    ).subscribe({
      next: data => {
        this.data = data;
        this.loading = false;
        this.retryCount = 0;
      },
      error: error => {
        this.error = error;
        this.loading = false;
      }
    });
  }
  
  retry(): void {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.loadData();
    }
  }
}

// 表单组件
@Component({
  selector: 'app-smart-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-group" *ngFor="let field of formFields">
        <label [for]="field.name">{{ field.label }}</label>
        <input 
          [id]="field.name"
          [type]="field.type"
          [formControlName]="field.name"
          [placeholder]="field.placeholder"
          class="form-control">
        
        <div *ngIf="form.get(field.name)?.invalid && form.get(field.name)?.touched" 
             class="error-message">
          {{ getErrorMessage(field.name) }}
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" [disabled]="form.invalid || submitting">
          {{ submitting ? '提交中...' : '提交' }}
        </button>
        <button type="button" (click)="reset()">重置</button>
      </div>
      
      <div *ngIf="autoSaveEnabled" class="auto-save-status">
        {{ autoSaveStatus }}
      </div>
    </form>
  `
})
export class SmartFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() formConfig!: FormConfig;
  @Input() initialData?: any;
  @Input() autoSaveEnabled = false;
  @Output() formSubmit = new EventEmitter<any>();
  
  form!: FormGroup;
  formFields: FormField[] = [];
  submitting = false;
  autoSaveStatus = '';
  
  private destroy$ = new Subject<void>();
  private autoSaveSubscription?: Subscription;
  
  constructor(private fb: FormBuilder) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formConfig'] && this.formConfig) {
      this.buildForm();
    }
    
    if (changes['initialData'] && this.initialData && this.form) {
      this.form.patchValue(this.initialData);
    }
    
    if (changes['autoSaveEnabled']) {
      this.setupAutoSave();
    }
  }
  
  ngOnInit(): void {
    if (this.formConfig) {
      this.buildForm();
    }
    
    this.setupAutoSave();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
  }
  
  private buildForm(): void {
    const formControls: { [key: string]: FormControl } = {};
    this.formFields = this.formConfig.fields;
    
    this.formFields.forEach(field => {
      const validators = this.buildValidators(field.validation || {});
      formControls[field.name] = new FormControl(
        field.defaultValue || '',
        validators
      );
    });
    
    this.form = this.fb.group(formControls);
    
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }
  
  private buildValidators(validation: any): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    
    if (validation.required) {
      validators.push(Validators.required);
    }
    
    if (validation.minLength) {
      validators.push(Validators.minLength(validation.minLength));
    }
    
    if (validation.maxLength) {
      validators.push(Validators.maxLength(validation.maxLength));
    }
    
    if (validation.pattern) {
      validators.push(Validators.pattern(validation.pattern));
    }
    
    if (validation.email) {
      validators.push(Validators.email);
    }
    
    return validators;
  }
  
  private setupAutoSave(): void {
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
    
    if (this.autoSaveEnabled && this.form) {
      this.autoSaveSubscription = this.form.valueChanges.pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe(value => {
        this.autoSave(value);
      });
    }
  }
  
  private autoSave(value: any): void {
    this.autoSaveStatus = '正在自动保存...';
    
    // 模拟自动保存
    setTimeout(() => {
      this.autoSaveStatus = '已自动保存';
      
      setTimeout(() => {
        this.autoSaveStatus = '';
      }, 2000);
    }, 500);
  }
  
  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors) return '';
    
    const errors = control.errors;
    
    if (errors['required']) return '此字段为必填项';
    if (errors['minlength']) return `最少需要${errors['minlength'].requiredLength}个字符`;
    if (errors['maxlength']) return `最多允许${errors['maxlength'].requiredLength}个字符`;
    if (errors['email']) return '请输入有效的邮箱地址';
    if (errors['pattern']) return '格式不正确';
    
    return '输入无效';
  }
  
  onSubmit(): void {
    if (this.form.valid) {
      this.submitting = true;
      this.formSubmit.emit(this.form.value);
      
      // 模拟提交
      setTimeout(() => {
        this.submitting = false;
      }, 2000);
    }
  }
  
  reset(): void {
    this.form.reset();
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }
}

// 接口定义
interface FormConfig {
  fields: FormField[];
}

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  defaultValue?: any;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    email?: boolean;
  };
}
```

# 十、性能优化

## （一）变更检测优化

### 1. OnPush 策略

```typescript
// 使用OnPush策略的组件
@Component({
  selector: 'app-optimized-list',
  template: `
    <div class="optimized-list">
      <h3>优化列表组件</h3>
      <p>当前时间: {{ currentTime }}</p>
      
      <div class="list-container">
        <div 
          *ngFor="let item of items; trackBy: trackByFn" 
          class="list-item"
          [class.selected]="item.selected">
          <span>{{ item.name }}</span>
          <span>{{ item.value }}</span>
          <button (click)="selectItem(item)">选择</button>
        </div>
      </div>
      
      <div class="actions">
        <button (click)="addItem()">添加项目</button>
        <button (click)="updateTime()">更新时间</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedListComponent implements OnInit {
  @Input() items: ListItem[] = [];
  @Output() itemSelected = new EventEmitter<ListItem>();
  
  currentTime = new Date().toLocaleTimeString();
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    // 使用OnPush策略时，需要手动触发变更检测
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString();
      this.cdr.markForCheck(); // 标记需要检查
    }, 1000);
  }
  
  trackByFn(index: number, item: ListItem): any {
    return item.id; // 使用唯一标识符进行跟踪
  }
  
  selectItem(item: ListItem): void {
    // 创建新的数组引用以触发变更检测
    this.items = this.items.map(i => ({
      ...i,
      selected: i.id === item.id
    }));
    
    this.itemSelected.emit(item);
    this.cdr.markForCheck();
  }
  
  addItem(): void {
    const newItem: ListItem = {
      id: Date.now(),
      name: `Item ${this.items.length + 1}`,
      value: Math.random(),
      selected: false
    };
    
    // 创建新的数组引用
    this.items = [...this.items, newItem];
    this.cdr.markForCheck();
  }
  
  updateTime(): void {
    this.currentTime = new Date().toLocaleTimeString();
    this.cdr.markForCheck();
  }
}

interface ListItem {
  id: number;
  name: string;
  value: number;
  selected: boolean;
}
```

### 2. 异步管道优化

```typescript
@Component({
  selector: 'app-async-data',
  template: `
    <div class="async-data">
      <!-- 使用异步管道自动处理订阅和取消订阅 -->
      <div *ngIf="loading$ | async" class="loading">
        正在加载...
      </div>
      
      <div *ngIf="error$ | async as error" class="error">
        错误: {{ error.message }}
      </div>
      
      <div *ngIf="data$ | async as data" class="data">
        <h3>{{ data.title }}</h3>
        <ul>
          <li *ngFor="let item of data.items">{{ item.name }}</li>
        </ul>
      </div>
      
      <!-- 组合多个Observable -->
      <div *ngIf="viewModel$ | async as vm" class="view-model">
        <p>用户: {{ vm.user.name }}</p>
        <p>权限: {{ vm.permissions.join(', ') }}</p>
        <p>设置: {{ vm.settings | json }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsyncDataComponent implements OnInit {
  data$!: Observable<any>;
  loading$!: Observable<boolean>;
  error$!: Observable<any>;
  viewModel$!: Observable<ViewModel>;
  
  constructor(
    private dataService: DataService,
    private userService: UserService
  ) {}
  
  ngOnInit(): void {
    // 创建loading状态流
    const loadingSubject = new BehaviorSubject<boolean>(false);
    this.loading$ = loadingSubject.asObservable();
    
    // 创建错误状态流
    const errorSubject = new BehaviorSubject<any>(null);
    this.error$ = errorSubject.asObservable();
    
    // 数据流
    this.data$ = this.dataService.getData().pipe(
      tap(() => loadingSubject.next(true)),
      catchError(error => {
        errorSubject.next(error);
        loadingSubject.next(false);
        return EMPTY;
      }),
      tap(() => loadingSubject.next(false))
    );
    
    // 组合多个数据流
    this.viewModel$ = combineLatest([
      this.userService.getCurrentUser(),
      this.userService.getUserPermissions(),
      this.userService.getUserSettings()
    ]).pipe(
      map(([user, permissions, settings]) => ({
        user,
        permissions,
        settings
      })),
      shareReplay(1) // 缓存最新值
    );
  }
}

interface ViewModel {
  user: any;
  permissions: string[];
  settings: any;
}
```

## （二）懒加载和代码分割

### 1. 模块懒加载

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
    canLoad: [AuthGuard] // 懒加载守卫
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canLoad: [AdminGuard]
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule)
  }
];

// 懒加载模块示例
@NgModule({
  declarations: [
    UsersComponent,
    UserListComponent,
    UserDetailComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule
  ]
})
export class UsersModule {}
```

### 2. 组件懒加载

```typescript
// 动态组件加载服务
@Injectable({
  providedIn: 'root'
})
export class DynamicComponentService {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}
  
  async loadComponent(
    componentName: string,
    container: ViewContainerRef
  ): Promise<ComponentRef<any>> {
    let component: any;
    
    // 根据组件名动态导入
    switch (componentName) {
      case 'chart':
        const chartModule = await import('./chart/chart.component');
        component = chartModule.ChartComponent;
        break;
      case 'table':
        const tableModule = await import('./table/table.component');
        component = tableModule.TableComponent;
        break;
      case 'form':
        const formModule = await import('./form/form.component');
        component = formModule.FormComponent;
        break;
      default:
        throw new Error(`Unknown component: ${componentName}`);
    }
    
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    return container.createComponent(componentFactory, undefined, this.injector);
  }
}

// 使用动态组件的容器
@Component({
  selector: 'app-dynamic-container',
  template: `
    <div class="dynamic-container">
      <div class="component-selector">
        <button 
          *ngFor="let comp of availableComponents" 
          (click)="loadComponent(comp.name)"
          [disabled]="loading">
          加载 {{ comp.label }}
        </button>
      </div>
      
      <div class="component-container" #componentContainer></div>
      
      <div *ngIf="loading" class="loading">
        正在加载组件...
      </div>
    </div>
  `
})
export class DynamicContainerComponent {
  @ViewChild('componentContainer', { read: ViewContainerRef, static: true })
  componentContainer!: ViewContainerRef;
  
  availableComponents = [
    { name: 'chart', label: '图表' },
    { name: 'table', label: '表格' },
    { name: 'form', label: '表单' }
  ];
  
  loading = false;
  currentComponent?: ComponentRef<any>;
  
  constructor(private dynamicComponentService: DynamicComponentService) {}
  
  async loadComponent(componentName: string): Promise<void> {
    this.loading = true;
    
    try {
      // 清除之前的组件
      if (this.currentComponent) {
        this.currentComponent.destroy();
      }
      
      this.componentContainer.clear();
      
      // 加载新组件
      this.currentComponent = await this.dynamicComponentService.loadComponent(
        componentName,
        this.componentContainer
      );
      
      // 传递数据给动态组件
      if (this.currentComponent.instance.data !== undefined) {
        this.currentComponent.instance.data = this.getComponentData(componentName);
      }
      
    } catch (error) {
      console.error('加载组件失败:', error);
    } finally {
      this.loading = false;
    }
  }
  
  private getComponentData(componentName: string): any {
    // 根据组件类型返回相应的数据
    switch (componentName) {
      case 'chart':
        return {
          type: 'line',
          data: [1, 2, 3, 4, 5]
        };
      case 'table':
        return {
          columns: ['Name', 'Age', 'Email'],
          rows: [
            ['John', 25, 'john@example.com'],
            ['Jane', 30, 'jane@example.com']
          ]
        };
      case 'form':
        return {
          fields: [
            { name: 'name', type: 'text', label: '姓名' },
            { name: 'email', type: 'email', label: '邮箱' }
          ]
        };
      default:
        return {};
    }
  }
}
```

## （三）虚拟滚动

```typescript
@Component({
  selector: 'app-virtual-scroll',
  template: `
    <div class="virtual-scroll-container">
      <h3>虚拟滚动列表 ({{ items.length }} 项)</h3>
      
      <cdk-virtual-scroll-viewport 
        itemSize="50" 
        class="viewport"
        [style.height.px]="400">
        
        <div 
          *cdkVirtualFor="let item of items; trackBy: trackByFn" 
          class="list-item"
          [style.height.px]="50">
          
          <div class="item-content">
            <span class="item-id">#{{ item.id }}</span>
            <span class="item-name">{{ item.name }}</span>
            <span class="item-value">{{ item.value | currency }}</span>
            <button (click)="selectItem(item)">选择</button>
          </div>
        </div>
      </cdk-virtual-scroll-viewport>
      
      <div class="actions">
        <button (click)="generateItems(1000)">生成1000项</button>
        <button (click)="generateItems(10000)">生成10000项</button>
        <button (click)="generateItems(100000)">生成100000项</button>
      </div>
    </div>
  `,
  styles: [`
    .viewport {
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .list-item {
      display: flex;
      align-items: center;
      padding: 0 16px;
      border-bottom: 1px solid #eee;
    }
    
    .item-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    
    .item-id {
      font-weight: bold;
      color: #666;
    }
  `]
})
export class VirtualScrollComponent {
  items: VirtualItem[] = [];
  
  constructor() {
    this.generateItems(1000);
  }
  
  trackByFn(index: number, item: VirtualItem): number {
    return item.id;
  }
  
  generateItems(count: number): void {
    console.time('生成数据');
    
    this.items = Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      name: `Item ${index + 1}`,
      value: Math.random() * 1000,
      description: `这是第 ${index + 1} 个项目的描述`
    }));
    
    console.timeEnd('生成数据');
  }
  
  selectItem(item: VirtualItem): void {
    console.log('选择项目:', item);
  }
}

interface VirtualItem {
  id: number;
  name: string;
  value: number;
  description: string;
}
```

# 十一、测试

## （一）单元测试

### 1. 组件测试

```typescript
// counter.component.spec.ts
describe('CounterComponent', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should initialize with count 0', () => {
    expect(component.count).toBe(0);
  });
  
  it('should increment count when increment is called', () => {
    component.increment();
    expect(component.count).toBe(1);
  });
  
  it('should decrement count when decrement is called', () => {
    component.count = 5;
    component.decrement();
    expect(component.count).toBe(4);
  });
  
  it('should display current count in template', () => {
    component.count = 42;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.count').textContent).toContain('42');
  });
  
  it('should call increment when increment button is clicked', () => {
    spyOn(component, 'increment');
    
    const button = fixture.nativeElement.querySelector('.increment-btn');
    button.click();
    
    expect(component.increment).toHaveBeenCalled();
  });
  
  it('should emit countChange when count changes', () => {
    spyOn(component.countChange, 'emit');
    
    component.increment();
    
    expect(component.countChange.emit).toHaveBeenCalledWith(1);
  });
});

// user-list.component.spec.ts
describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: jasmine.SpyObj<UserService>;
  
  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['getUsers', 'deleteUser']);
    
    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      providers: [
        { provide: UserService, useValue: spy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });
  
  it('should load users on init', () => {
    const mockUsers = [
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' }
    ];
    
    userService.getUsers.and.returnValue(of(mockUsers));
    
    component.ngOnInit();
    
    expect(userService.getUsers).toHaveBeenCalled();
    expect(component.users).toEqual(mockUsers);
  });
  
  it('should handle error when loading users fails', () => {
    userService.getUsers.and.returnValue(throwError('Error loading users'));
    
    component.ngOnInit();
    
    expect(component.error).toBe('Error loading users');
    expect(component.loading).toBe(false);
  });
  
  it('should delete user when deleteUser is called', () => {
    const userId = 1;
    userService.deleteUser.and.returnValue(of({}));
    component.users = [
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' }
    ];
    
    component.deleteUser(userId);
    
    expect(userService.deleteUser).toHaveBeenCalledWith(userId);
    expect(component.users.length).toBe(1);
    expect(component.users[0].id).toBe(2);
  });
});
```

### 2. 服务测试

```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('should get users', () => {
    const mockUsers = [
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' }
    ];
    
    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });
    
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });
  
  it('should create user', () => {
    const newUser = { name: 'Bob', email: 'bob@example.com' };
    const createdUser = { id: 3, ...newUser };
    
    service.createUser(newUser).subscribe(user => {
      expect(user).toEqual(createdUser);
    });
    
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(createdUser);
  });
  
  it('should handle error when getting users fails', () => {
    service.getUsers().subscribe(
      () => fail('should have failed'),
      error => {
        expect(error.status).toBe(500);
      }
    );
    
    const req = httpMock.expectOne('/api/users');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
```

## （二）集成测试

```typescript
// app.component.spec.ts
describe('AppComponent Integration', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let location: Location;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent, HomeComponent, AboutComponent],
      imports: [RouterTestingModule.withRoutes([
        { path: '', component: HomeComponent },
        { path: 'about', component: AboutComponent }
      ])]
    }).compileComponents();
    
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    
    fixture.detectChanges();
  });
  
  it('should navigate to home', fakeAsync(() => {
    router.navigate(['']);
    tick();
    
    expect(location.path()).toBe('');
  }));
  
  it('should navigate to about', fakeAsync(() => {
    router.navigate(['/about']);
    tick();
    
    expect(location.path()).toBe('/about');
  }));
});
```

# 十二、最佳实践

## （一）组件设计原则

### 1. 单一职责原则

```typescript
// ❌ 不好的例子 - 组件职责过多
@Component({
  selector: 'app-bad-user-profile',
  template: `
    <div class="user-profile">
      <!-- 用户信息显示 -->
      <div class="user-info">
        <img [src]="user.avatar" [alt]="user.name">
        <h2>{{ user.name }}</h2>
        <p>{{ user.email }}</p>
      </div>
      
      <!-- 用户设置表单 -->
      <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
        <input formControlName="theme" placeholder="主题">
        <input formControlName="language" placeholder="语言">
        <button type="submit">保存设置</button>
      </form>
      
      <!-- 用户活动日志 -->
      <div class="activity-log">
        <h3>活动日志</h3>
        <ul>
          <li *ngFor="let activity of activities">{{ activity.description }}</li>
        </ul>
      </div>
      
      <!-- 通知设置 -->
      <div class="notifications">
        <h3>通知设置</h3>
        <label>
          <input type="checkbox" [(ngModel)]="emailNotifications">
          邮件通知
        </label>
      </div>
    </div>
  `
})
export class BadUserProfileComponent {
  user: User;
  settingsForm: FormGroup;
  activities: Activity[];
  emailNotifications: boolean;
  
  // 太多的职责混在一个组件中
  constructor(
    private userService: UserService,
    private settingsService: SettingsService,
    private activityService: ActivityService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {}
  
  // 方法过多，职责不清
  ngOnInit() { /* 初始化所有数据 */ }
  saveSettings() { /* 保存设置 */ }
  loadActivities() { /* 加载活动 */ }
  updateNotifications() { /* 更新通知 */ }
}

// ✅ 好的例子 - 职责分离
@Component({
  selector: 'app-user-profile',
  template: `
    <div class="user-profile">
      <app-user-info [user]="user"></app-user-info>
      <app-user-settings [userId]="user.id"></app-user-settings>
      <app-activity-log [userId]="user.id"></app-activity-log>
      <app-notification-settings [userId]="user.id"></app-notification-settings>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  user: User;
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    this.loadUser();
  }
  
  private loadUser(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.user = user;
    });
  }
}

// 分离的子组件
@Component({
  selector: 'app-user-info',
  template: `
    <div class="user-info">
      <img [src]="user.avatar" [alt]="user.name">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
    </div>
  `
})
export class UserInfoComponent {
  @Input() user: User;
}

@Component({
  selector: 'app-user-settings',
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
      <input formControlName="theme" placeholder="主题">
      <input formControlName="language" placeholder="语言">
      <button type="submit" [disabled]="settingsForm.invalid">保存设置</button>
    </form>
  `
})
export class UserSettingsComponent implements OnInit {
  @Input() userId: number;
  settingsForm: FormGroup;
  
  constructor(
    private settingsService: SettingsService,
    private fb: FormBuilder
  ) {}
  
  ngOnInit(): void {
    this.buildForm();
    this.loadSettings();
  }
  
  private buildForm(): void {
    this.settingsForm = this.fb.group({
      theme: ['', Validators.required],
      language: ['', Validators.required]
    });
  }
  
  private loadSettings(): void {
    this.settingsService.getUserSettings(this.userId).subscribe(settings => {
      this.settingsForm.patchValue(settings);
    });
  }
  
  saveSettings(): void {
    if (this.settingsForm.valid) {
      this.settingsService.updateUserSettings(
        this.userId,
        this.settingsForm.value
      ).subscribe();
    }
  }
}
```

### 2. 智能组件与展示组件

```typescript
// 智能组件（容器组件）
@Component({
  selector: 'app-todo-container',
  template: `
    <div class="todo-container">
      <app-todo-form 
        (todoAdd)="addTodo($event)"
        [loading]="adding">
      </app-todo-form>
      
      <app-todo-list 
        [todos]="todos$ | async"
        [loading]="loading$ | async"
        (todoToggle)="toggleTodo($event)"
        (todoDelete)="deleteTodo($event)">
      </app-todo-list>
      
      <app-todo-stats 
        [todos]="todos$ | async">
      </app-todo-stats>
    </div>
  `
})
export class TodoContainerComponent implements OnInit {
  todos$: Observable<Todo[]>;
  loading$: Observable<boolean>;
  adding = false;
  
  constructor(private todoService: TodoService) {}
  
  ngOnInit(): void {
    this.todos$ = this.todoService.getTodos();
    this.loading$ = this.todoService.loading$;
  }
  
  addTodo(text: string): void {
    this.adding = true;
    this.todoService.addTodo(text).subscribe(() => {
      this.adding = false;
    });
  }
  
  toggleTodo(todo: Todo): void {
    this.todoService.toggleTodo(todo.id).subscribe();
  }
  
  deleteTodo(todo: Todo): void {
    this.todoService.deleteTodo(todo.id).subscribe();
  }
}

// 展示组件
@Component({
  selector: 'app-todo-list',
  template: `
    <div class="todo-list">
      <div *ngIf="loading" class="loading">加载中...</div>
      
      <div *ngIf="!loading && todos?.length === 0" class="empty">
        暂无待办事项
      </div>
      
      <div 
        *ngFor="let todo of todos; trackBy: trackByFn" 
        class="todo-item"
        [class.completed]="todo.completed">
        
        <input 
          type="checkbox" 
          [checked]="todo.completed"
          (change)="onToggle(todo)">
        
        <span class="todo-text">{{ todo.text }}</span>
        
        <button 
          class="delete-btn"
          (click)="onDelete(todo)"
          aria-label="删除">
          ×
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent {
  @Input() todos: Todo[] | null = null;
  @Input() loading = false;
  @Output() todoToggle = new EventEmitter<Todo>();
  @Output() todoDelete = new EventEmitter<Todo>();
  
  trackByFn(index: number, todo: Todo): number {
    return todo.id;
  }
  
  onToggle(todo: Todo): void {
    this.todoToggle.emit(todo);
  }
  
  onDelete(todo: Todo): void {
    this.todoDelete.emit(todo);
  }
}
```

## （二）性能优化建议

### 1. 避免在模板中使用函数

```typescript
// ❌ 不好的例子
@Component({
  template: `
    <div *ngFor="let item of items">
      <!-- 每次变更检测都会调用函数 -->
      <span>{{ formatPrice(item.price) }}</span>
      <span>{{ isExpensive(item.price) ? '昂贵' : '便宜' }}</span>
    </div>
  `
})
export class BadPriceListComponent {
  items = [];
  
  formatPrice(price: number): string {
    console.log('formatPrice called'); // 会频繁调用
    return `$${price.toFixed(2)}`;
  }
  
  isExpensive(price: number): boolean {
    console.log('isExpensive called'); // 会频繁调用
    return price > 100;
  }
}

// ✅ 好的例子
@Component({
  template: `
    <div *ngFor="let item of processedItems">
      <span>{{ item.formattedPrice }}</span>
      <span>{{ item.isExpensive ? '昂贵' : '便宜' }}</span>
    </div>
  `
})
export class GoodPriceListComponent implements OnInit {
  items = [];
  processedItems = [];
  
  ngOnInit(): void {
    this.processItems();
  }
  
  private processItems(): void {
    this.processedItems = this.items.map(item => ({
      ...item,
      formattedPrice: `$${item.price.toFixed(2)}`,
      isExpensive: item.price > 100
    }));
  }
}
```

### 2. 合理使用管道

```typescript
// 自定义管道
@Pipe({
  name: 'currency',
  pure: true // 纯管道，只有输入变化时才重新计算
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  }
}

// 使用管道
@Component({
  template: `
    <div *ngFor="let item of items">
      <span>{{ item.price | currency:'USD' }}</span>
    </div>
  `
})
export class PriceListComponent {
  items = [];
}
```

# 十三、总结

Angular是一个功能强大的企业级前端开发平台，具有以下核心特点：

## 核心优势

1. **TypeScript优先**：提供强类型支持，提高代码质量和开发效率
2. **组件化架构**：模块化开发，代码复用性强
3. **依赖注入**：松耦合设计，便于测试和维护
4. **强大的CLI工具**：自动化开发流程
5. **完整的生态系统**：路由、表单、HTTP客户端等一应俱全

## 重要概念

- **组件**：Angular应用的基本构建块
- **服务**：提供业务逻辑和数据访问
- **模块**：组织和配置应用的功能单元
- **依赖注入**：管理组件和服务之间的依赖关系
- **生命周期钩子**：在组件生命周期的特定时刻执行代码
- **响应式编程**：使用RxJS处理异步数据流

## 最佳实践

1. **遵循单一职责原则**，保持组件和服务的职责清晰
2. **使用OnPush变更检测策略**优化性能
3. **合理使用懒加载**减少初始包大小
4. **编写全面的测试**确保代码质量
5. **使用TypeScript的类型系统**提高代码安全性
6. **遵循Angular风格指南**保持代码一致性

## 学习建议

1. 掌握TypeScript基础
2. 理解组件化开发思想
3. 熟练使用Angular CLI
4. 学习RxJS响应式编程
5. 实践测试驱动开发
6. 关注性能优化技巧

## 参考资料

- [Angular官方文档](https://angular.io/docs)
- [Angular CLI文档](https://angular.io/cli)
- [RxJS官方文档](https://rxjs.dev/)
- [Angular风格指南](https://angular.io/guide/styleguide)
- [Angular DevKit](https://github.com/angular/angular-cli)

 ## （二）层次化注入器

### 1. 注入器层次结构

```typescript
// 根级服务（全局单例）
@Injectable({
  providedIn: 'root'
})
export class GlobalConfigService {
  private config = {
    appName: 'My Angular App',
    version: '1.0.0',
    apiUrl: environment.apiUrl
  };
  
  getConfig() {
    return this.config;
  }
  
  updateConfig(newConfig: Partial<typeof this.config>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// 模块级服务
@Injectable()
export class FeatureService {
  constructor(private globalConfig: GlobalConfigService) {
    console.log('FeatureService 创建，应用名称:', globalConfig.getConfig().appName);
  }
  
  getFeatureData() {
    return 'Feature specific data';
  }
}

// 组件级服务
@Injectable()
export class ComponentScopedService {
  private instanceId = Math.random().toString(36).substr(2, 9);
  
  constructor() {
    console.log('ComponentScopedService 实例创建:', this.instanceId);
  }
  
  getInstanceId() {
    return this.instanceId;
  }
}

// 特性模块
@NgModule({
  declarations: [FeatureComponent],
  providers: [
    FeatureService // 模块级别提供
  ]
})
export class FeatureModule {}

// 父组件
@Component({
  selector: 'app-parent',
  template: `
    <div class="parent">
      <h3>父组件</h3>
      <p>服务实例ID: {{ serviceInstanceId }}</p>
      <button (click)="createChild()">创建子组件</button>
      
      <app-child *ngFor="let child of children; trackBy: trackByIndex"></app-child>
    </div>
  `,
  providers: [
    ComponentScopedService // 组件级别提供
  ]
})
export class ParentComponent {
  children: number[] = [];
  serviceInstanceId: string;
  
  constructor(private componentService: ComponentScopedService) {
    this.serviceInstanceId = componentService.getInstanceId();
  }
  
  createChild() {
    this.children.push(this.children.length);
  }
  
  trackByIndex(index: number): number {
    return index;
  }
}

// 子组件（继承父组件的服务实例）
@Component({
  selector: 'app-child',
  template: `
    <div class="child">
      <h4>子组件</h4>
      <p>继承的服务实例ID: {{ serviceInstanceId }}</p>
      <p>自己的服务实例ID: {{ ownServiceInstanceId }}</p>
    </div>
  `,
  providers: [
    // 如果提供了自己的服务实例，会覆盖父组件的
    // ComponentScopedService
  ]
})
export class ChildComponent {
  serviceInstanceId: string;
  ownServiceInstanceId: string;
  
  constructor(
    private componentService: ComponentScopedService,
    @Optional() @SkipSelf() private parentService?: ComponentScopedService
  ) {
    this.serviceInstanceId = componentService.getInstanceId();
    this.ownServiceInstanceId = parentService?.getInstanceId() || 'N/A';
  }
}
```

### 2. 注入修饰符

```typescript
@Component({
  selector: 'app-injection-modifiers',
  template: `
    <div>
      <h3>注入修饰符演示</h3>
      <p>可选服务状态: {{ optionalServiceStatus }}</p>
      <p>自身服务状态: {{ selfServiceStatus }}</p>
      <p>跳过自身服务状态: {{ skipSelfServiceStatus }}</p>
    </div>
  `
})
export class InjectionModifiersComponent {
  optionalServiceStatus: string;
  selfServiceStatus: string;
  skipSelfServiceStatus: string;
  
  constructor(
    // @Optional() - 如果服务不存在，注入null而不是抛出错误
    @Optional() private optionalService: OptionalService | null,
    
    // @Self() - 只从当前注入器查找服务
    @Self() @Optional() private selfService: ComponentScopedService | null,
    
    // @SkipSelf() - 跳过当前注入器，从父注入器查找
    @SkipSelf() @Optional() private skipSelfService: ComponentScopedService | null,
    
    // @Host() - 只在宿主组件的注入器中查找
    @Host() @Optional() private hostService: ComponentScopedService | null
  ) {
    this.optionalServiceStatus = optionalService ? '存在' : '不存在';
    this.selfServiceStatus = selfService ? '存在' : '不存在';
    this.skipSelfServiceStatus = skipSelfService ? '存在' : '不存在';
  }
}
```

# 六、服务与HTTP客户端

## （一）HTTP客户端基础

### 1. 基本HTTP操作

```typescript
// 用户数据接口
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  avatar?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

// 用户服务
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  
  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {}
  
  // GET 请求 - 获取所有用户
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(users => this.logger.log(`获取到 ${users.length} 个用户`)),
      catchError(this.handleError<User[]>('getUsers', []))
    );
  }
  
  // GET 请求 - 根据ID获取用户
  getUserById(id: number): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<User>(url).pipe(
      tap(user => this.logger.log(`获取用户: ${user.name}`)),
      catchError(this.handleError<User>(`getUserById id=${id}`))
    );
  }
  
  // POST 请求 - 创建用户
  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      tap(newUser => this.logger.log(`创建用户: ${newUser.name}`)),
      catchError(this.handleError<User>('createUser'))
    );
  }
  
  // PUT 请求 - 更新用户
  updateUser(id: number, user: UpdateUserRequest): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<User>(url, user, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      tap(updatedUser => this.logger.log(`更新用户: ${updatedUser.name}`)),
      catchError(this.handleError<User>('updateUser'))
    );
  }
  
  // DELETE 请求 - 删除用户
  deleteUser(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => this.logger.log(`删除用户 ID: ${id}`)),
      catchError(this.handleError<void>('deleteUser'))
    );
  }
  
  // 搜索用户
  searchUsers(query: string, page = 1, limit = 10): Observable<{users: User[], total: number}> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<{users: User[], total: number}>(`${this.apiUrl}/search`, { params }).pipe(
      tap(result => this.logger.log(`搜索到 ${result.users.length} 个用户`)),
      catchError(this.handleError<{users: User[], total: number}>('searchUsers', {users: [], total: 0}))
    );
  }
  
  // 上传用户头像
  uploadAvatar(userId: number, file: File): Observable<{avatarUrl: string}> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post<{avatarUrl: string}>(`${this.apiUrl}/${userId}/avatar`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      filter(event => event.type === HttpEventType.Response),
      map(event => (event as HttpResponse<{avatarUrl: string}>).body!),
      catchError(this.handleError<{avatarUrl: string}>('uploadAvatar'))
    );
  }
  
  // 错误处理
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.logger.error(`${operation} 失败: ${error.message}`);
      
      // 可以在这里添加用户友好的错误处理
      // 比如显示通知、重定向等
      
      return of(result as T);
    };
  }
}
```

### 2. HTTP拦截器

```typescript
// 认证拦截器
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 获取认证令牌
    const authToken = this.authService.getToken();
    
    // 如果有令牌，添加到请求头
    if (authToken) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}

// 日志拦截器
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private logger: LoggerService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();
    
    this.logger.log(`HTTP请求开始: ${req.method} ${req.url}`);
    
    return next.handle(req).pipe(
      tap(
        event => {
          if (event.type === HttpEventType.Response) {
            const duration = Date.now() - startTime;
            this.logger.log(`HTTP请求完成: ${req.method} ${req.url} - ${event.status} (${duration}ms)`);
          }
        },
        error => {
          const duration = Date.now() - startTime;
          this.logger.error(`HTTP请求失败: ${req.method} ${req.url} - ${error.status} (${duration}ms)`);
        }
      )
    );
  }
}

// 错误处理拦截器
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '发生未知错误';
        
        if (error.error instanceof ErrorEvent) {
          // 客户端错误
          errorMessage = `客户端错误: ${error.error.message}`;
        } else {
          // 服务器错误
          switch (error.status) {
            case 400:
              errorMessage = '请求参数错误';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              this.router.navigate(['/login']);
              break;
            case 403:
              errorMessage = '禁止访问';
              break;
            case 404:
              errorMessage = '请求的资源不存在';
              break;
            case 500:
              errorMessage = '服务器内部错误';
              break;
            default:
              errorMessage = `服务器错误: ${error.status}`;
          }
        }
        
        this.notificationService.showError(errorMessage);
        return throwError(() => error);
      })
    );
  }
}

// 缓存拦截器
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, HttpResponse<any>>();
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next.handle(req);
    }
    
    // 检查缓存
    const cachedResponse = this.cache.get(req.url);
    if (cachedResponse) {
      return of(cachedResponse);
    }
    
    // 发送请求并缓存响应
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(req.url, event);
        }
      })
    );
  }
}

// 在模块中注册拦截器
@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {}
```