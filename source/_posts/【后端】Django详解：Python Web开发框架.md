---
title: 【后端】Django详解：Python Web开发框架
tags: 
    - 后端
    - Python
    - Django
    - Web开发
    - ORM
    - MTV架构
    - REST API
categories: 后端
description: 全面深入解析Django框架，涵盖MTV架构模式、ORM数据库操作、模板引擎系统、表单处理机制、用户认证授权、REST API开发、中间件应用、缓存优化、安全防护等Python Web开发的核心技术与最佳实践
keywords: Django, Python Web框架, MTV架构, ORM, 模板引擎, 表单处理, 用户认证, REST API, 中间件, 缓存, Web安全
---

# 前言

Django是一个高级的Python Web框架，由Lawrence Journal-World的开发团队于2005年创建并开源。它以"快速开发、干净设计"为核心理念，遵循DRY（Don't Repeat Yourself）原则，为开发者提供了一个功能完整、开箱即用的Web开发解决方案。

## 为什么选择Django？

- **完整的框架**：内置ORM、模板引擎、表单处理、用户认证、管理后台等功能
- **安全性优先**：内置多种安全防护机制，如CSRF保护、SQL注入防护、XSS防护等
- **可扩展性强**：支持大规模应用开发，Instagram、Pinterest等知名网站都在使用
- **丰富的生态**：拥有庞大的第三方包生态系统和活跃的社区支持
- **文档完善**：官方文档详细全面，学习曲线相对平缓

## 本文内容概览

本文将全面介绍Django框架的核心概念和实践应用，包括：
- **MTV架构模式**：理解Django的设计哲学和架构思想
- **ORM系统详解**：掌握数据库操作和模型设计的最佳实践
- **模板引擎系统**：学习Django模板语言和前端集成
- **表单处理机制**：实现数据验证和用户交互
- **用户认证授权**：构建安全的用户管理系统
- **REST API开发**：使用Django REST Framework构建现代API
- **高级特性应用**：中间件、缓存、信号等进阶功能
- **性能优化策略**：提升应用性能和用户体验
- **部署与运维**：生产环境的配置和最佳实践

# 一、Django核心概念

## （一）MTV架构模式

### 1. Model（模型）
- **数据层**：定义数据结构和业务逻辑
- **ORM映射**：对象关系映射，简化数据库操作
- **数据验证**：内置数据验证机制

### 2. Template（模板）
- **表现层**：负责数据的展示
- **模板语言**：Django模板语言（DTL）
- **模板继承**：支持模板继承和包含

### 3. View（视图）
- **控制层**：处理用户请求和业务逻辑
- **函数视图**：基于函数的视图
- **类视图**：基于类的视图

```python
# models.py - 模型示例
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Product(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE,
        related_name='products'
    )
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='products'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='draft'
    )
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['category', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('product_detail', kwargs={'slug': self.slug})

class Review(models.Model):
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['product', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.username} - {self.product.title}'
```

```python
# views.py - 视图示例
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.generic import ListView, DetailView, CreateView, UpdateView
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import Paginator
from django.db.models import Q, Avg, Count
from django.contrib import messages
from .models import Product, Category, Review
from .forms import ProductForm, ReviewForm

# 函数视图示例
def product_list(request):
    products = Product.objects.filter(status='published')
    
    # 搜索功能
    query = request.GET.get('q')
    if query:
        products = products.filter(
            Q(title__icontains=query) | 
            Q(description__icontains=query)
        )
    
    # 分类筛选
    category_id = request.GET.get('category')
    if category_id:
        products = products.filter(category_id=category_id)
    
    # 排序
    sort_by = request.GET.get('sort', '-created_at')
    if sort_by in ['title', '-title', 'price', '-price', 'created_at', '-created_at']:
        products = products.order_by(sort_by)
    
    # 分页
    paginator = Paginator(products, 12)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # 获取分类列表
    categories = Category.objects.annotate(
        product_count=Count('products', filter=Q(products__status='published'))
    ).filter(product_count__gt=0)
    
    context = {
        'page_obj': page_obj,
        'categories': categories,
        'current_category': category_id,
        'query': query,
        'sort_by': sort_by,
    }
    return render(request, 'products/list.html', context)

def product_detail(request, slug):
    product = get_object_or_404(
        Product.objects.select_related('category', 'author'),
        slug=slug,
        status='published'
    )
    
    # 获取评论
    reviews = product.reviews.select_related('user').all()
    
    # 计算平均评分
    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
    
    # 相关产品
    related_products = Product.objects.filter(
        category=product.category,
        status='published'
    ).exclude(id=product.id)[:4]
    
    # 处理评论表单
    review_form = None
    if request.user.is_authenticated:
        if request.method == 'POST':
            review_form = ReviewForm(request.POST)
            if review_form.is_valid():
                review = review_form.save(commit=False)
                review.product = product
                review.user = request.user
                review.save()
                messages.success(request, '评论提交成功！')
                return redirect('product_detail', slug=slug)
        else:
            # 检查用户是否已经评论过
            existing_review = reviews.filter(user=request.user).first()
            if not existing_review:
                review_form = ReviewForm()
    
    context = {
        'product': product,
        'reviews': reviews,
        'avg_rating': avg_rating,
        'related_products': related_products,
        'review_form': review_form,
    }
    return render(request, 'products/detail.html', context)

# 类视图示例
class ProductListView(ListView):
    model = Product
    template_name = 'products/list.html'
    context_object_name = 'products'
    paginate_by = 12
    
    def get_queryset(self):
        queryset = Product.objects.filter(status='published')
        
        # 搜索
        query = self.request.GET.get('q')
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) | 
                Q(description__icontains=query)
            )
        
        # 分类筛选
        category_id = self.request.GET.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        return queryset.select_related('category', 'author')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.annotate(
            product_count=Count('products', filter=Q(products__status='published'))
        ).filter(product_count__gt=0)
        return context

class ProductDetailView(DetailView):
    model = Product
    template_name = 'products/detail.html'
    context_object_name = 'product'
    slug_field = 'slug'
    
    def get_queryset(self):
        return Product.objects.filter(status='published').select_related(
            'category', 'author'
        )
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        product = self.object
        
        # 获取评论和平均评分
        reviews = product.reviews.select_related('user').all()
        context['reviews'] = reviews
        context['avg_rating'] = reviews.aggregate(Avg('rating'))['rating__avg']
        
        # 相关产品
        context['related_products'] = Product.objects.filter(
            category=product.category,
            status='published'
        ).exclude(id=product.id)[:4]
        
        return context

class ProductCreateView(LoginRequiredMixin, CreateView):
    model = Product
    form_class = ProductForm
    template_name = 'products/create.html'
    
    def form_valid(self, form):
        form.instance.author = self.request.user
        messages.success(self.request, '产品创建成功！')
        return super().form_valid(form)

@login_required
def ajax_add_review(request, product_id):
    if request.method == 'POST':
        product = get_object_or_404(Product, id=product_id, status='published')
        
        # 检查用户是否已经评论过
        existing_review = Review.objects.filter(
            product=product, user=request.user
        ).first()
        
        if existing_review:
            return JsonResponse({
                'success': False,
                'error': '您已经评论过这个产品了'
            })
        
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            review.product = product
            review.user = request.user
            review.save()
            
            return JsonResponse({
                'success': True,
                'message': '评论提交成功！',
                'review': {
                    'user': review.user.username,
                    'rating': review.rating,
                    'comment': review.comment,
                    'created_at': review.created_at.strftime('%Y-%m-%d %H:%M')
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'errors': form.errors
            })
    
    return JsonResponse({'success': False, 'error': '无效的请求方法'})
```

## （二）URL配置

```python
# urls.py - URL配置
from django.urls import path, include
from django.contrib import admin
from . import views

# 项目主URL配置
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('products/', include('products.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('api/', include('api.urls')),
]

# 应用URL配置 (products/urls.py)
app_name = 'products'

urlpatterns = [
    path('', views.ProductListView.as_view(), name='list'),
    path('create/', views.ProductCreateView.as_view(), name='create'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='detail'),
    path('<slug:slug>/edit/', views.ProductUpdateView.as_view(), name='edit'),
    path('<int:product_id>/review/', views.ajax_add_review, name='add_review'),
    path('category/<int:category_id>/', views.category_products, name='category'),
]
```

# 二、Django ORM系统

## （一）模型定义与关系

### 1. 字段类型
```python
# 常用字段类型示例
from django.db import models
from django.contrib.auth.models import User

class ExampleModel(models.Model):
    # 文本字段
    title = models.CharField(max_length=200)  # 短文本
    content = models.TextField()  # 长文本
    slug = models.SlugField(unique=True)  # URL友好的字符串
    
    # 数字字段
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=0)
    rating = models.FloatField()
    
    # 日期时间字段
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    publish_date = models.DateField()
    
    # 布尔字段
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # 选择字段
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # 文件字段
    image = models.ImageField(upload_to='images/%Y/%m/%d/')
    document = models.FileField(upload_to='documents/')
    
    # 关系字段
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    tags = models.ManyToManyField('Tag', blank=True)
```

### 2. 模型关系
```python
# 一对一关系
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

# 一对多关系
class Category(models.Model):
    name = models.CharField(max_length=100)
    
class Article(models.Model):
    title = models.CharField(max_length=200)
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE,
        related_name='articles'
    )

# 多对多关系
class Tag(models.Model):
    name = models.CharField(max_length=50)
    
class Post(models.Model):
    title = models.CharField(max_length=200)
    tags = models.ManyToManyField(Tag, through='PostTag')

# 自定义中间表
class PostTag(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['post', 'tag']
```

## （二）查询操作

### 1. 基本查询
```python
# 基本查询示例
from django.db.models import Q, F, Count, Avg, Sum, Max, Min
from .models import Product, Category, Review

# 获取所有对象
all_products = Product.objects.all()

# 过滤查询
published_products = Product.objects.filter(status='published')
expensive_products = Product.objects.filter(price__gt=100)
recent_products = Product.objects.filter(created_at__gte='2024-01-01')

# 排除查询
non_draft_products = Product.objects.exclude(status='draft')

# 获取单个对象
product = Product.objects.get(id=1)
product = Product.objects.get(slug='example-product')

# 安全获取对象
from django.shortcuts import get_object_or_404
product = get_object_or_404(Product, slug='example-product')

# 检查存在性
exists = Product.objects.filter(slug='example').exists()

# 计数
count = Product.objects.filter(status='published').count()

# 字段查找
products = Product.objects.filter(
    title__icontains='django',  # 包含（忽略大小写）
    price__range=(10, 100),     # 范围
    created_at__year=2024,      # 年份
    category__name='Technology' # 关联查询
)
```

### 2. 复杂查询
```python
# Q对象复杂查询
from django.db.models import Q

# OR查询
products = Product.objects.filter(
    Q(title__icontains='python') | Q(title__icontains='django')
)

# AND查询
products = Product.objects.filter(
    Q(status='published') & Q(price__lt=50)
)

# NOT查询
products = Product.objects.filter(
    ~Q(status='draft')
)

# 复杂组合
products = Product.objects.filter(
    Q(status='published') & 
    (Q(title__icontains='python') | Q(description__icontains='python'))
)

# F对象字段比较
from django.db.models import F

# 比较字段值
products = Product.objects.filter(updated_at__gt=F('created_at'))

# 字段运算
Product.objects.update(price=F('price') * 1.1)  # 价格上涨10%

# 聚合查询
from django.db.models import Count, Avg, Sum, Max, Min

# 聚合函数
stats = Product.objects.aggregate(
    total_count=Count('id'),
    avg_price=Avg('price'),
    total_value=Sum('price'),
    max_price=Max('price'),
    min_price=Min('price')
)

# 分组聚合
category_stats = Category.objects.annotate(
    product_count=Count('products'),
    avg_price=Avg('products__price')
).filter(product_count__gt=0)

# 子查询
from django.db.models import OuterRef, Subquery

# 获取每个分类的最新产品
latest_products = Product.objects.filter(
    category=OuterRef('pk')
).order_by('-created_at')

categories_with_latest = Category.objects.annotate(
    latest_product_title=Subquery(
        latest_products.values('title')[:1]
    )
)
```

### 3. 性能优化
```python
# select_related - 一对一和外键关系
products = Product.objects.select_related(
    'category', 'author'
).all()

# prefetch_related - 多对多和反向外键关系
products = Product.objects.prefetch_related(
    'reviews', 'tags'
).all()

# 组合使用
products = Product.objects.select_related(
    'category', 'author'
).prefetch_related(
    'reviews__user', 'tags'
).all()

# 自定义预取
from django.db.models import Prefetch

products = Product.objects.prefetch_related(
    Prefetch(
        'reviews',
        queryset=Review.objects.select_related('user').filter(rating__gte=4)
    )
).all()

# 只获取需要的字段
products = Product.objects.values('id', 'title', 'price')
products = Product.objects.only('title', 'price')  # 延迟加载其他字段
products = Product.objects.defer('description')    # 延迟加载指定字段

# 批量操作
# 批量创建
Product.objects.bulk_create([
    Product(title='Product 1', price=10),
    Product(title='Product 2', price=20),
])

# 批量更新
Product.objects.filter(category_id=1).update(status='published')

# 批量删除
Product.objects.filter(status='draft').delete()
```

# 三、模板系统

## （一）模板语法

### 1. 基础模板
```html
<!-- base.html - 基础模板 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}默认标题{% endblock %}</title>
    
    <!-- CSS -->
    {% load static %}
    <link rel="stylesheet" href="{% static 'css/bootstrap.min.css' %}">
    <link rel="stylesheet" href="{% static 'css/style.css' %}">
    {% block extra_css %}{% endblock %}
</head>
<body>
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="{% url 'home' %}">我的网站</a>
            
            <div class="navbar-nav ms-auto">
                {% if user.is_authenticated %}
                    <a class="nav-link" href="{% url 'profile' %}">{{ user.username }}</a>
                    <a class="nav-link" href="{% url 'logout' %}">退出</a>
                {% else %}
                    <a class="nav-link" href="{% url 'login' %}">登录</a>
                    <a class="nav-link" href="{% url 'register' %}">注册</a>
                {% endif %}
            </div>
        </div>
    </nav>
    
    <!-- 消息提示 -->
    {% if messages %}
        <div class="container mt-3">
            {% for message in messages %}
                <div class="alert alert-{{ message.tags }} alert-dismissible fade show" role="alert">
                    {{ message }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            {% endfor %}
        </div>
    {% endif %}
    
    <!-- 主要内容 -->
    <main class="container my-4">
        {% block content %}
        {% endblock %}
    </main>
    
    <!-- 页脚 -->
    <footer class="bg-dark text-light py-4 mt-5">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <p>&copy; 2024 我的网站. 保留所有权利.</p>
                </div>
                <div class="col-md-6 text-end">
                    <a href="{% url 'about' %}" class="text-light">关于我们</a> |
                    <a href="{% url 'contact' %}" class="text-light">联系我们</a>
                </div>
            </div>
        </div>
    </footer>
    
    <!-- JavaScript -->
    <script src="{% static 'js/bootstrap.bundle.min.js' %}"></script>
    {% block extra_js %}{% endblock %}
</body>
</html>
```

### 2. 产品列表模板
```html
<!-- products/list.html -->
{% extends 'base.html' %}
{% load static %}

{% block title %}产品列表{% endblock %}

{% block content %}
<div class="row">
    <!-- 侧边栏 -->
    <div class="col-md-3">
        <div class="card">
            <div class="card-header">
                <h5>分类筛选</h5>
            </div>
            <div class="card-body">
                <ul class="list-unstyled">
                    <li><a href="{% url 'products:list' %}" 
                           class="{% if not current_category %}fw-bold{% endif %}">全部</a></li>
                    {% for category in categories %}
                        <li>
                            <a href="{% url 'products:list' %}?category={{ category.id }}" 
                               class="{% if current_category == category.id|stringformat:'s' %}fw-bold{% endif %}">
                                {{ category.name }} ({{ category.product_count }})
                            </a>
                        </li>
                    {% endfor %}
                </ul>
            </div>
        </div>
        
        <!-- 搜索框 -->
        <div class="card mt-3">
            <div class="card-header">
                <h5>搜索</h5>
            </div>
            <div class="card-body">
                <form method="get">
                    <div class="mb-3">
                        <input type="text" name="q" class="form-control" 
                               placeholder="搜索产品..." value="{{ query }}">
                    </div>
                    <button type="submit" class="btn btn-primary">搜索</button>
                </form>
            </div>
        </div>
    </div>
    
    <!-- 主要内容 -->
    <div class="col-md-9">
        <!-- 排序和结果统计 -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <p class="mb-0">找到 {{ page_obj.paginator.count }} 个产品</p>
            </div>
            <div>
                <select class="form-select" onchange="location.href=this.value">
                    <option value="{% url 'products:list' %}?sort=-created_at" 
                            {% if sort_by == '-created_at' %}selected{% endif %}>最新</option>
                    <option value="{% url 'products:list' %}?sort=price" 
                            {% if sort_by == 'price' %}selected{% endif %}>价格从低到高</option>
                    <option value="{% url 'products:list' %}?sort=-price" 
                            {% if sort_by == '-price' %}selected{% endif %}>价格从高到低</option>
                    <option value="{% url 'products:list' %}?sort=title" 
                            {% if sort_by == 'title' %}selected{% endif %}>名称A-Z</option>
                </select>
            </div>
        </div>
        
        <!-- 产品网格 -->
        <div class="row">
            {% for product in page_obj %}
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        {% if product.image %}
                            <img src="{{ product.image.url }}" class="card-img-top" 
                                 alt="{{ product.title }}" style="height: 200px; object-fit: cover;">
                        {% endif %}
                        
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">{{ product.title }}</h5>
                            <p class="card-text">{{ product.description|truncatewords:20 }}</p>
                            <p class="card-text">
                                <small class="text-muted">{{ product.category.name }}</small>
                            </p>
                            
                            <div class="mt-auto">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="h5 mb-0 text-primary">¥{{ product.price }}</span>
                                    <a href="{{ product.get_absolute_url }}" class="btn btn-primary">查看详情</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {% empty %}
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <h4>没有找到产品</h4>
                        <p>请尝试调整搜索条件或浏览其他分类。</p>
                    </div>
                </div>
            {% endfor %}
        </div>
        
        <!-- 分页 -->
        {% if page_obj.has_other_pages %}
            <nav aria-label="产品分页">
                <ul class="pagination justify-content-center">
                    {% if page_obj.has_previous %}
                        <li class="page-item">
                            <a class="page-link" href="?page=1{% if query %}&q={{ query }}{% endif %}{% if current_category %}&category={{ current_category }}{% endif %}">
                                首页
                            </a>
                        </li>
                        <li class="page-item">
                            <a class="page-link" href="?page={{ page_obj.previous_page_number }}{% if query %}&q={{ query }}{% endif %}{% if current_category %}&category={{ current_category }}{% endif %}">
                                上一页
                            </a>
                        </li>
                    {% endif %}
                    
                    {% for num in page_obj.paginator.page_range %}
                        {% if page_obj.number == num %}
                            <li class="page-item active">
                                <span class="page-link">{{ num }}</span>
                            </li>
                        {% elif num > page_obj.number|add:'-3' and num < page_obj.number|add:'3' %}
                            <li class="page-item">
                                <a class="page-link" href="?page={{ num }}{% if query %}&q={{ query }}{% endif %}{% if current_category %}&category={{ current_category }}{% endif %}">
                                    {{ num }}
                                </a>
                            </li>
                        {% endif %}
                    {% endfor %}
                    
                    {% if page_obj.has_next %}
                        <li class="page-item">
                            <a class="page-link" href="?page={{ page_obj.next_page_number }}{% if query %}&q={{ query }}{% endif %}{% if current_category %}&category={{ current_category }}{% endif %}">
                                下一页
                            </a>
                        </li>
                        <li class="page-item">
                            <a class="page-link" href="?page={{ page_obj.paginator.num_pages }}{% if query %}&q={{ query }}{% endif %}{% if current_category %}&category={{ current_category }}{% endif %}">
                                末页
                            </a>
                        </li>
                    {% endif %}
                </ul>
            </nav>
        {% endif %}
    </div>
</div>
{% endblock %}
```

## （二）模板标签和过滤器

### 1. 内置标签和过滤器
```html
<!-- 常用模板标签 -->
{% load static %}
{% load humanize %}

<!-- 条件判断 -->
{% if user.is_authenticated %}
    <p>欢迎，{{ user.username }}！</p>
{% elif user.is_anonymous %}
    <p>请登录</p>
{% else %}
    <p>未知状态</p>
{% endif %}

<!-- 循环 -->
{% for product in products %}
    <div class="product-item">
        <h3>{{ product.title }}</h3>
        <p>{{ product.description|truncatewords:30 }}</p>
        
        <!-- 循环变量 -->
        <small>第 {{ forloop.counter }} 个产品</small>
        {% if forloop.first %}<span class="badge">最新</span>{% endif %}
    </div>
{% empty %}
    <p>没有产品</p>
{% endfor %}

<!-- 常用过滤器 -->
<p>价格：{{ product.price|floatformat:2 }}</p>
<p>创建时间：{{ product.created_at|date:"Y-m-d H:i" }}</p>
<p>相对时间：{{ product.created_at|timesince }}前</p>
<p>描述：{{ product.description|linebreaks }}</p>
<p>标题：{{ product.title|title }}</p>
<p>长度：{{ product.title|length }}</p>
<p>默认值：{{ product.subtitle|default:"无副标题" }}</p>

<!-- 人性化显示 -->
<p>文件大小：{{ file_size|filesizeformat }}</p>
<p>数字：{{ large_number|intcomma }}</p>
<p>序数：{{ number|ordinal }}</p>
```

### 2. 自定义模板标签
```python
# templatetags/product_tags.py
from django import template
from django.db.models import Count, Avg
from ..models import Product, Category

register = template.Library()

@register.simple_tag
def get_featured_products(count=5):
    """获取推荐产品"""
    return Product.objects.filter(
        status='published', 
        featured=True
    )[:count]

@register.simple_tag
def get_popular_categories(count=10):
    """获取热门分类"""
    return Category.objects.annotate(
        product_count=Count('products')
    ).filter(product_count__gt=0).order_by('-product_count')[:count]

@register.inclusion_tag('products/tags/product_card.html')
def product_card(product, show_category=True):
    """产品卡片组件"""
    return {
        'product': product,
        'show_category': show_category,
    }

@register.filter
def multiply(value, arg):
    """乘法过滤器"""
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return 0

@register.filter
def rating_stars(rating):
    """评分星星显示"""
    if not rating:
        return ''
    
    full_stars = int(rating)
    half_star = 1 if rating - full_stars >= 0.5 else 0
    empty_stars = 5 - full_stars - half_star
    
    stars = '★' * full_stars + '☆' * half_star + '☆' * empty_stars
    return stars

register.filter('multiply', multiply)
register.filter('rating_stars', rating_stars)
```

```html
<!-- 使用自定义标签 -->
{% load product_tags %}

<!-- 简单标签 -->
{% get_featured_products 3 as featured %}
<div class="featured-products">
    {% for product in featured %}
        {% product_card product %}
    {% endfor %}
</div>

<!-- 包含标签 -->
{% product_card product show_category=False %}

<!-- 自定义过滤器 -->
<p>总价：{{ product.price|multiply:quantity }}</p>
<p>评分：{{ product.avg_rating|rating_stars }}</p>
```

# 四、表单处理

## （一）Django表单

### 1. 表单定义
```python
# forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from .models import Product, Review, Category

class ProductForm(forms.ModelForm):
    """产品表单"""
    
    class Meta:
        model = Product
        fields = ['title', 'slug', 'description', 'price', 'category', 'image', 'featured']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入产品标题'
            }),
            'slug': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '产品URL标识符'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': '请输入产品描述'
            }),
            'price': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'min': '0'
            }),
            'category': forms.Select(attrs={
                'class': 'form-select'
            }),
            'image': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            }),
            'featured': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })
        }
    
    def clean_slug(self):
        """验证slug唯一性"""
        slug = self.cleaned_data['slug']
        if Product.objects.filter(slug=slug).exclude(pk=self.instance.pk).exists():
            raise ValidationError('该URL标识符已存在')
        return slug
    
    def clean_price(self):
        """验证价格"""
        price = self.cleaned_data['price']
        if price <= 0:
            raise ValidationError('价格必须大于0')
        return price

class ReviewForm(forms.ModelForm):
    """评论表单"""
    
    class Meta:
        model = Review
        fields = ['rating', 'comment']
        widgets = {
            'rating': forms.Select(
                choices=[(i, f'{i}星') for i in range(1, 6)],
                attrs={'class': 'form-select'}
            ),
            'comment': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': '请分享您的使用体验...'
            })
        }
    
    def clean_comment(self):
        """验证评论内容"""
        comment = self.cleaned_data['comment']
        if len(comment) < 10:
            raise ValidationError('评论内容至少需要10个字符')
        return comment

class ContactForm(forms.Form):
    """联系表单"""
    
    SUBJECT_CHOICES = [
        ('general', '一般咨询'),
        ('support', '技术支持'),
        ('business', '商务合作'),
        ('complaint', '投诉建议'),
    ]
    
    name = forms.CharField(
        max_length=100,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '您的姓名'
        })
    )
    
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': '您的邮箱'
        })
    )
    
    subject = forms.ChoiceField(
        choices=SUBJECT_CHOICES,
        widget=forms.Select(attrs={
            'class': 'form-select'
        })
    )
    
    message = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 6,
            'placeholder': '请详细描述您的问题或建议...'
        })
    )
    
    def clean_message(self):
        """验证消息内容"""
        message = self.cleaned_data['message']
        if len(message) < 20:
            raise ValidationError('消息内容至少需要20个字符')
        return message

class CustomUserCreationForm(UserCreationForm):
    """自定义用户注册表单"""
    
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': '邮箱地址'
        })
    )
    
    first_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '名字'
        })
    )
    
    last_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '姓氏'
        })
    )
    
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2')
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '用户名'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': '密码'
        })
        self.fields['password2'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': '确认密码'
        })
    
    def clean_email(self):
        """验证邮箱唯一性"""
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise ValidationError('该邮箱已被注册')
        return email
    
    def save(self, commit=True):
        """保存用户"""
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        if commit:
            user.save()
        return user
```

### 2. 表单视图处理
```python
# views.py - 表单处理视图
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login
from django.core.mail import send_mail
from django.conf import settings
from .forms import ProductForm, ContactForm, CustomUserCreationForm

def create_product(request):
    """创建产品"""
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save(commit=False)
            product.author = request.user
            product.save()
            messages.success(request, '产品创建成功！')
            return redirect('products:detail', slug=product.slug)
    else:
        form = ProductForm()
    
    return render(request, 'products/create.html', {'form': form})

def edit_product(request, slug):
    """编辑产品"""
    product = get_object_or_404(Product, slug=slug, author=request.user)
    
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            form.save()
            messages.success(request, '产品更新成功！')
            return redirect('products:detail', slug=product.slug)
    else:
        form = ProductForm(instance=product)
    
    return render(request, 'products/edit.html', {
        'form': form,
        'product': product
    })

def contact_view(request):
    """联系表单"""
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # 发送邮件
            subject = f"联系表单：{form.cleaned_data['subject']}"
            message = f"""
            姓名：{form.cleaned_data['name']}
            邮箱：{form.cleaned_data['email']}
            主题：{form.cleaned_data['subject']}
            
            消息内容：
            {form.cleaned_data['message']}
            """
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [settings.CONTACT_EMAIL],
                    fail_silently=False,
                )
                messages.success(request, '您的消息已发送，我们会尽快回复！')
                return redirect('contact')
            except Exception as e:
                messages.error(request, '发送失败，请稍后重试。')
    else:
        form = ContactForm()
    
    return render(request, 'contact.html', {'form': form})

def register_view(request):
    """用户注册"""
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'欢迎，{user.username}！注册成功。')
            return redirect('home')
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'registration/register.html', {'form': form})
```

## （二）表单模板

```html
<!-- products/create.html -->
{% extends 'base.html' %}

{% block title %}创建产品{% endblock %}

{% block content %}
<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h3>创建新产品</h3>
            </div>
            <div class="card-body">
                <form method="post" enctype="multipart/form-data">
                    {% csrf_token %}
                    
                    <!-- 显示表单错误 -->
                    {% if form.non_field_errors %}
                        <div class="alert alert-danger">
                            {{ form.non_field_errors }}
                        </div>
                    {% endif %}
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="{{ form.title.id_for_label }}" class="form-label">产品标题 *</label>
                                {{ form.title }}
                                {% if form.title.errors %}
                                    <div class="text-danger small">
                                        {{ form.title.errors }}
                                    </div>
                                {% endif %}
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="{{ form.slug.id_for_label }}" class="form-label">URL标识符 *</label>
                                {{ form.slug }}
                                {% if form.slug.errors %}
                                    <div class="text-danger small">
                                        {{ form.slug.errors }}
                                    </div>
                                {% endif %}
                                <div class="form-text">用于生成产品页面URL</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="{{ form.description.id_for_label }}" class="form-label">产品描述 *</label>
                        {{ form.description }}
                        {% if form.description.errors %}
                            <div class="text-danger small">
                                {{ form.description.errors }}
                            </div>
                        {% endif %}
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="{{ form.price.id_for_label }}" class="form-label">价格 *</label>
                                <div class="input-group">
                                    <span class="input-group-text">¥</span>
                                    {{ form.price }}
                                </div>
                                {% if form.price.errors %}
                                    <div class="text-danger small">
                                        {{ form.price.errors }}
                                    </div>
                                {% endif %}
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="{{ form.category.id_for_label }}" class="form-label">分类 *</label>
                                {{ form.category }}
                                {% if form.category.errors %}
                                    <div class="text-danger small">
                                        {{ form.category.errors }}
                                    </div>
                                {% endif %}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="{{ form.image.id_for_label }}" class="form-label">产品图片</label>
                        {{ form.image }}
                        {% if form.image.errors %}
                            <div class="text-danger small">
                                {{ form.image.errors }}
                            </div>
                        {% endif %}
                        <div class="form-text">支持JPG、PNG格式，建议尺寸800x600像素</div>
                    </div>
                    
                    <div class="mb-3 form-check">
                        {{ form.featured }}
                        <label class="form-check-label" for="{{ form.featured.id_for_label }}">
                            设为推荐产品
                        </label>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <a href="{% url 'products:list' %}" class="btn btn-secondary">取消</a>
                        <button type="submit" class="btn btn-primary">创建产品</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
// 自动生成slug
document.getElementById('id_title').addEventListener('input', function() {
    const title = this.value;
    const slug = title.toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '');
    document.getElementById('id_slug').value = slug;
});
</script>
{% endblock %}
```

# 五、用户认证与权限

## （一）用户认证系统

### 1. 认证配置
```python
# settings.py
AUTH_USER_MODEL = 'accounts.User'  # 自定义用户模型

# 认证后端
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'accounts.backends.EmailBackend',  # 邮箱登录
]

# 登录/登出重定向
LOGIN_URL = '/accounts/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

# 密码验证
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
```

### 2. 自定义用户模型
```python
# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    bio = models.TextField(max_length=500, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    
    # 邮箱验证
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=100, blank=True)
    
    # 隐私设置
    is_profile_public = models.BooleanField(default=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'.strip() or self.username
    
    def get_short_name(self):
        return self.first_name or self.username

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # 社交媒体链接
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    
    # 通知设置
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    
    # 统计信息
    profile_views = models.PositiveIntegerField(default=0)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 3. 认证视图
```python
# accounts/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.urls import reverse
from .forms import CustomUserCreationForm, UserProfileForm
from .models import User

def register_view(request):
    """用户注册"""
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # 发送验证邮件
            token = get_random_string(50)
            user.email_verification_token = token
            user.save()
            
            verification_url = request.build_absolute_uri(
                reverse('verify_email', kwargs={'token': token})
            )
            
            send_mail(
                '验证您的邮箱',
                f'请点击链接验证邮箱：{verification_url}',
                'noreply@example.com',
                [user.email],
                fail_silently=False,
            )
            
            messages.success(request, '注册成功！请检查邮箱并验证。')
            return redirect('login')
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'registration/register.html', {'form': form})

@login_required
def profile_view(request):
    """用户资料"""
    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, '资料更新成功！')
            return redirect('profile')
    else:
        form = UserProfileForm(instance=request.user)
    
    return render(request, 'accounts/profile.html', {'form': form})

def verify_email(request, token):
    """邮箱验证"""
    try:
        user = User.objects.get(email_verification_token=token)
        user.email_verified = True
        user.email_verification_token = ''
        user.save()
        messages.success(request, '邮箱验证成功！')
        return redirect('login')
    except User.DoesNotExist:
        messages.error(request, '验证链接无效或已过期。')
        return redirect('home')
```

## （二）权限系统

### 1. 权限装饰器
```python
# decorators.py
from functools import wraps
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

def owner_required(model):
    """要求用户是对象的所有者"""
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def _wrapped_view(request, *args, **kwargs):
            obj_id = kwargs.get('pk') or kwargs.get('id')
            obj = get_object_or_404(model, pk=obj_id)
            
            if hasattr(obj, 'author') and obj.author != request.user:
                raise PermissionDenied
            elif hasattr(obj, 'user') and obj.user != request.user:
                raise PermissionDenied
            elif hasattr(obj, 'owner') and obj.owner != request.user:
                raise PermissionDenied
            
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator

def staff_required(view_func):
    """要求用户是员工"""
    @wraps(view_func)
    @login_required
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied
        return view_func(request, *args, **kwargs)
    return _wrapped_view
```

### 2. 基于类的权限
```python
# mixins.py
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.core.exceptions import PermissionDenied

class OwnerRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    """要求用户是对象所有者的混入类"""
    
    def test_func(self):
        obj = self.get_object()
        return (
            hasattr(obj, 'author') and obj.author == self.request.user or
            hasattr(obj, 'user') and obj.user == self.request.user or
            hasattr(obj, 'owner') and obj.owner == self.request.user
        )

class StaffRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    """要求用户是员工的混入类"""
    
    def test_func(self):
        return self.request.user.is_staff

# 使用示例
class ProductUpdateView(OwnerRequiredMixin, UpdateView):
    model = Product
    form_class = ProductForm
    template_name = 'products/edit.html'
    
    def form_valid(self, form):
        messages.success(self.request, '产品更新成功！')
        return super().form_valid(form)
```

# 六、Django REST Framework

## （一）API配置

### 1. 基础配置
```python
# settings.py
INSTALLED_APPS = [
    # ... 其他应用
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... 其他中间件
]

# DRF配置
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# CORS配置
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### 2. 序列化器
```python
# serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, Category, Review

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'product_count']
    
    def get_product_count(self, obj):
        return obj.products.filter(status='published').count()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    author = UserSerializer(read_only=True)
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'price', 
            'category', 'author', 'image', 'featured',
            'avg_rating', 'review_count', 'created_at'
        ]
    
    def get_avg_rating(self, obj):
        return obj.reviews.aggregate(models.Avg('rating'))['rating__avg']
    
    def get_review_count(self, obj):
        return obj.reviews.count()

class ProductDetailSerializer(ProductListSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    
    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ['reviews']

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'title', 'slug', 'description', 'price', 
            'category', 'image', 'featured'
        ]
    
    def validate_slug(self, value):
        if Product.objects.filter(slug=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError('该URL标识符已存在')
        return value
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('价格必须大于0')
        return value
```

### 3. API视图
```python
# api/views.py
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .serializers import *
from .models import Product, Category, Review

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'featured', 'status']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'price', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Product.objects.filter(status='published').select_related(
            'category', 'author'
        ).prefetch_related('reviews')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return ProductListSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.filter(status='published')
    lookup_field = 'slug'
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer
    
    def get_queryset(self):
        return Product.objects.filter(status='published').select_related(
            'category', 'author'
        ).prefetch_related('reviews__user')
    
    def perform_update(self, serializer):
        # 只允许作者更新
        if self.get_object().author != self.request.user:
            raise PermissionDenied('您只能编辑自己的产品')
        serializer.save()
    
    def perform_destroy(self, instance):
        # 只允许作者删除
        if instance.author != self.request.user:
            raise PermissionDenied('您只能删除自己的产品')
        instance.delete()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request, product_slug):
    """添加产品评论"""
    try:
        product = Product.objects.get(slug=product_slug, status='published')
    except Product.DoesNotExist:
        return Response(
            {'error': '产品不存在'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # 检查用户是否已经评论过
    if Review.objects.filter(product=product, user=request.user).exists():
        return Response(
            {'error': '您已经评论过这个产品了'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user, product=product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def search_products(request):
    """产品搜索"""
    query = request.GET.get('q', '')
    if not query:
        return Response({'results': []})
    
    products = Product.objects.filter(
        Q(title__icontains=query) | Q(description__icontains=query),
        status='published'
    ).select_related('category', 'author')[:10]
    
    serializer = ProductListSerializer(products, many=True)
    return Response({'results': serializer.data})
```

# 七、缓存与性能优化

## （一）缓存配置

### 1. Redis缓存
```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'myapp',
        'TIMEOUT': 300,
    }
}

# 会话存储
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

### 2. 缓存使用
```python
# utils/cache.py
from django.core.cache import cache
from django.core.cache.utils import make_template_fragment_key
from functools import wraps
import hashlib

def cache_result(timeout=300, key_prefix=''):
    """缓存函数结果装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 生成缓存键
            cache_key = f"{key_prefix}:{func.__name__}:{hashlib.md5(str(args + tuple(kwargs.items())).encode()).hexdigest()}"
            
            # 尝试从缓存获取
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # 执行函数并缓存结果
            result = func(*args, **kwargs)
            cache.set(cache_key, result, timeout)
            return result
        return wrapper
    return decorator

# 使用示例
@cache_result(timeout=600, key_prefix='products')
def get_featured_products():
    return Product.objects.filter(
        status='published', 
        featured=True
    ).select_related('category')[:5]

@cache_result(timeout=3600, key_prefix='stats')
def get_site_statistics():
    return {
        'total_products': Product.objects.filter(status='published').count(),
        'total_categories': Category.objects.count(),
        'total_reviews': Review.objects.count(),
    }
```

## （二）数据库优化

### 1. 查询优化
```python
# 优化查询示例
class OptimizedProductViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        # 使用select_related和prefetch_related
        return Product.objects.select_related(
            'category', 'author'
        ).prefetch_related(
            'reviews__user', 'tags'
        ).filter(status='published')
    
    def list(self, request, *args, **kwargs):
        # 使用缓存
        cache_key = f"products_list_{request.GET.urlencode()}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, 300)
        return response

# 数据库索引
class Product(models.Model):
    # ... 字段定义
    
    class Meta:
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['featured', 'status']),
        ]
```

# 八、部署与配置

## （一）生产环境配置

### 1. 设置文件分离
```python
# settings/base.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# 基础配置
SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = False
ALLOWED_HOSTS = []

# 应用配置
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'corsheaders',
    'django_filters',
]

LOCAL_APPS = [
    'accounts',
    'products',
    'api',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# 数据库
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# settings/production.py
from .base import *

DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']

# 安全设置
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# 静态文件
STATIC_ROOT = '/var/www/static/'
MEDIA_ROOT = '/var/www/media/'

# 日志配置
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 2. Docker部署
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目文件
COPY . .

# 收集静态文件
RUN python manage.py collectstatic --noinput

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "myproject.wsgi:application"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - SECRET_KEY=your-secret-key
      - DB_NAME=myapp
      - DB_USER=postgres
      - DB_PASSWORD=password
      - DB_HOST=db
    depends_on:
      - db
      - redis
    volumes:
      - static_volume:/app/static
      - media_volume:/app/media

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/static
      - media_volume:/media
    depends_on:
      - web

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

# 九、最佳实践与总结

## （一）开发最佳实践

### 1. 项目结构
```
myproject/
├── manage.py
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── myproject/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── accounts/
│   ├── products/
│   └── api/
├── static/
├── media/
├── templates/
└── tests/
```

### 2. 代码质量
```python
# 使用类型提示
from typing import List, Optional
from django.http import HttpRequest, HttpResponse

def get_products(request: HttpRequest, category_id: Optional[int] = None) -> HttpResponse:
    products: List[Product] = Product.objects.filter(status='published')
    if category_id:
        products = products.filter(category_id=category_id)
    return render(request, 'products/list.html', {'products': products})

# 使用常量
class ProductStatus:
    DRAFT = 'draft'
    PUBLISHED = 'published'
    ARCHIVED = 'archived'
    
    CHOICES = [
        (DRAFT, 'Draft'),
        (PUBLISHED, 'Published'),
        (ARCHIVED, 'Archived'),
    ]

# 模型方法
class Product(models.Model):
    # ... 字段定义
    
    def is_published(self) -> bool:
        return self.status == ProductStatus.PUBLISHED
    
    def can_be_edited_by(self, user) -> bool:
        return self.author == user or user.is_staff
```

## （二）安全最佳实践

### 1. 输入验证
```python
# 表单验证
class ProductForm(forms.ModelForm):
    def clean_title(self):
        title = self.cleaned_data['title']
        # 防止XSS
        title = bleach.clean(title, tags=[], strip=True)
        if len(title) < 3:
            raise ValidationError('标题至少需要3个字符')
        return title

# API验证
class ProductSerializer(serializers.ModelSerializer):
    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('价格不能为负数')
        if value > 999999:
            raise serializers.ValidationError('价格过高')
        return value
```

### 2. 权限控制
```python
# 基于对象的权限
class ProductPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # 读取权限：所有人
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 写入权限：仅作者
        return obj.author == request.user
```

## （三）总结

Django是一个功能强大且成熟的Web框架，具有以下优势：

### 1. 核心优势
- **快速开发**：内置管理后台、ORM、模板引擎
- **安全性**：内置CSRF、XSS、SQL注入防护
- **可扩展性**：丰富的第三方包生态
- **文档完善**：官方文档详细且更新及时

### 2. 适用场景
- **内容管理系统**：博客、新闻网站
- **电商平台**：在线商店、市场平台
- **企业应用**：CRM、ERP系统
- **API服务**：RESTful API、微服务

### 3. 学习建议
- **掌握基础**：Python基础、Web开发概念
- **实践项目**：从简单项目开始，逐步增加复杂度
- **阅读源码**：理解Django内部机制
- **关注社区**：参与开源项目，学习最佳实践

Django为Python Web开发提供了一个完整的解决方案，无论是快速原型开发还是大型企业应用，都能找到合适的解决方案。通过合理的架构设计和最佳实践，可以构建出高性能、可维护的Web应用。