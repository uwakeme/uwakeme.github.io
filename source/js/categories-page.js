/**
 * 分类页面增强脚本
 * 为分类页面提供动态内容生成和交互效果
 */

(function() {
  'use strict';

  // 分类配置
  const categoryConfig = {
    'Java': {
      icon: 'fab fa-java',
      color: '#f89820',
      description: 'Java编程技巧、框架应用和最佳实践'
    },
    '前端': {
      icon: 'fab fa-html5',
      color: '#e34c26',
      description: 'HTML、CSS、JavaScript和现代前端框架'
    },
    '后端': {
      icon: 'fas fa-server',
      color: '#28a745',
      description: '服务器端开发、API设计和系统架构'
    },
    '数据库': {
      icon: 'fas fa-database',
      color: '#336791',
      description: 'MySQL、Redis等数据库技术和优化'
    },
    'LINUX': {
      icon: 'fab fa-linux',
      color: '#fcc624',
      description: 'Linux系统管理、命令行工具和运维'
    },
    '算法': {
      icon: 'fas fa-code',
      color: '#6f42c1',
      description: '数据结构、算法分析和编程题解'
    },
    '学习': {
      icon: 'fas fa-graduation-cap',
      color: '#17a2b8',
      description: '技术学习笔记和知识总结'
    },
    '工具': {
      icon: 'fas fa-tools',
      color: '#fd7e14',
      description: '开发工具、效率软件和使用技巧'
    },
    'BUG解决': {
      icon: 'fas fa-bug',
      color: '#dc3545',
      description: '问题排查、错误解决和调试技巧'
    },
    '博客': {
      icon: 'fas fa-blog',
      color: '#e83e8c',
      description: '博客搭建、主题定制和写作心得'
    },
    '其他': {
      icon: 'fas fa-ellipsis-h',
      color: '#6c757d',
      description: '其他技术话题和随笔分享'
    }
  };

  // 日期格式化函数
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '昨天';
    } else if (diffDays <= 7) {
      return `${diffDays}天前`;
    } else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}周前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  }

  // 获取分类数据
  async function getCategoriesData() {
    try {
      // 使用数据管理器获取分类数据
      if (window.CategoriesDataManager) {
        return await window.CategoriesDataManager.getCompleteCategoriesData();
      } else {
        // 如果数据管理器不可用，使用默认数据
        return getDefaultCategoriesData();
      }
    } catch (error) {
      console.warn('获取分类数据失败，使用默认数据:', error);
      return getDefaultCategoriesData();
    }
  }

  // 默认分类数据
  function getDefaultCategoriesData() {
    return [
      {
        name: 'Java',
        count: 17,
        posts: [
          { title: 'Spring Boot项目实战指南', url: '/2024/01/15/spring-boot-guide/' },
          { title: 'Java Stream流操作详解', url: '/2024/01/10/java-stream/' },
          { title: 'MyBatis Plus使用技巧', url: '/2024/01/05/mybatis-plus/' }
        ]
      },
      {
        name: '前端',
        count: 25,
        posts: [
          { title: 'Vue3组合式API实践', url: '/2024/01/20/vue3-composition/' },
          { title: 'CSS Grid布局完全指南', url: '/2024/01/18/css-grid/' },
          { title: 'JavaScript异步编程', url: '/2024/01/12/js-async/' }
        ]
      },
      {
        name: '数据库',
        count: 12,
        posts: [
          { title: 'MySQL性能优化实战', url: '/2024/01/25/mysql-optimization/' },
          { title: 'Redis缓存策略详解', url: '/2024/01/22/redis-cache/' },
          { title: 'SQL查询优化技巧', url: '/2024/01/16/sql-optimization/' }
        ]
      },
      {
        name: 'LINUX',
        count: 9,
        posts: [
          { title: 'Linux系统监控命令大全', url: '/2024/01/28/linux-monitoring/' },
          { title: 'Shell脚本编程入门', url: '/2024/01/24/shell-scripting/' },
          { title: 'Docker容器化部署', url: '/2024/01/19/docker-deployment/' }
        ]
      },
      {
        name: '算法',
        count: 10,
        posts: [
          { title: '动态规划经典题解', url: '/2024/01/30/dynamic-programming/' },
          { title: '二叉树遍历算法详解', url: '/2024/01/26/binary-tree/' },
          { title: '排序算法性能对比', url: '/2024/01/21/sorting-algorithms/' }
        ]
      },
      {
        name: '学习',
        count: 22,
        posts: [
          { title: '如何高效学习编程', url: '/2024/02/01/learning-programming/' },
          { title: '技术文档写作技巧', url: '/2024/01/29/tech-writing/' },
          { title: '代码审查最佳实践', url: '/2024/01/27/code-review/' }
        ]
      },
      {
        name: 'BUG解决',
        count: 8,
        posts: [
          { title: 'Spring Boot启动失败解决方案', url: '/2024/01/14/spring-boot-startup-error/' },
          { title: 'MySQL连接超时问题排查', url: '/2024/01/11/mysql-timeout/' },
          { title: 'JavaScript内存泄漏调试', url: '/2024/01/08/js-memory-leak/' }
        ]
      },
      {
        name: '博客',
        count: 6,
        posts: [
          { title: 'Hexo博客搭建完整指南', url: '/2024/01/13/hexo-blog-setup/' },
          { title: 'Butterfly主题定制技巧', url: '/2024/01/09/butterfly-customization/' },
          { title: '博客SEO优化实践', url: '/2024/01/06/blog-seo/' }
        ]
      }
    ];
  }

  // 渲染分类卡片
  function renderCategoryCard(category) {
    const config = categoryConfig[category.name] || categoryConfig['其他'];
    const recentPosts = category.posts.slice(0, 3);
    
    return `
      <div class="category-card" style="--category-color: ${config.color}">
        <div class="category-header">
          <a href="/categories/${encodeURIComponent(category.name)}/" class="category-name">
            <div class="category-icon">
              <i class="${config.icon}"></i>
            </div>
            ${category.name}
          </a>
          <span class="category-count">${category.count} 篇</span>
        </div>
        
        <div class="category-description">
          ${config.description}
        </div>
        
        <div class="category-posts">
          <div class="category-posts-title">最新文章</div>
          <ul class="recent-posts">
            ${recentPosts.map((post, index) => `
              <li class="recent-post-item">
                <a href="${post.url}" class="recent-post-link" title="${post.title}">
                  ${post.title.length > 35 ? post.title.substring(0, 35) + '...' : post.title}
                </a>
                <div class="recent-post-meta">
                  <span class="post-date">
                    <i class="fas fa-calendar-alt"></i>
                    ${formatDate(post.date)}
                  </span>
                  <div class="post-tags">
                    <span class="post-tag">#${index + 1}</span>
                  </div>
                </div>
              </li>
            `).join('')}
          </ul>
          <a href="/categories/${encodeURIComponent(category.name)}/" class="view-all-link">
            查看全部 <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `;
  }

  // 更新统计信息
  function updateStats(categories) {
    const totalCategories = categories.length;
    const totalPosts = categories.reduce((sum, cat) => sum + cat.count, 0);
    
    const totalCategoriesEl = document.getElementById('total-categories');
    const totalPostsEl = document.getElementById('total-posts');
    
    if (totalCategoriesEl && totalPostsEl) {
      // 数字动画效果
      animateNumber(totalCategoriesEl, 0, totalCategories, 1000);
      animateNumber(totalPostsEl, 0, totalPosts, 1500);
    }
  }

  // 数字动画
  function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const range = end - start;
    
    function updateNumber(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + range * easeOutQuart);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    }
    
    requestAnimationFrame(updateNumber);
  }

  // 添加搜索功能
  function addSearchFunctionality() {
    const header = document.querySelector('.categories-header');
    if (!header) return;
    
    const searchHTML = `
      <div class="categories-search" style="margin-top: 20px;">
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input type="text" id="category-search" placeholder="搜索分类..." class="search-input">
        </div>
      </div>
    `;
    
    header.insertAdjacentHTML('beforeend', searchHTML);
    
    // 添加搜索样式
    const searchStyles = `
      <style>
        .categories-search {
          max-width: 400px;
          margin: 20px auto 0;
        }
        
        .search-input-wrapper {
          position: relative;
        }
        
        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          z-index: 1;
        }
        
        .search-input {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 25px;
          background: rgba(255,255,255,0.2);
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .search-input::placeholder {
          color: rgba(255,255,255,0.8);
        }
        
        .search-input:focus {
          outline: none;
          border-color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.3);
        }
        
        [data-theme="dark"] .search-input {
          background: rgba(0,0,0,0.3);
          border-color: rgba(255,255,255,0.2);
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', searchStyles);
    
    // 搜索功能
    const searchInput = document.getElementById('category-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const categoryCards = document.querySelectorAll('.category-card');
        
        categoryCards.forEach(card => {
          const categoryName = card.querySelector('.category-name').textContent.toLowerCase();
          const categoryDesc = card.querySelector('.category-description').textContent.toLowerCase();
          
          if (categoryName.includes(searchTerm) || categoryDesc.includes(searchTerm)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
          } else {
            card.style.display = 'none';
          }
        });
      });
    }
  }

  // 初始化分类页面
  async function initCategoriesPage() {
    // 检查是否在分类页面
    if (!document.getElementById('categories-page-container')) {
      return;
    }
    
    console.log('正在初始化分类页面...');
    
    try {
      // 获取分类数据
      const categories = await getCategoriesData();
      
      // 渲染分类网格
      const categoriesGrid = document.getElementById('categories-grid');
      if (categoriesGrid) {
        categoriesGrid.innerHTML = categories.map(renderCategoryCard).join('');
      }
      
      // 更新统计信息
      updateStats(categories);
      
      // 添加搜索功能
      addSearchFunctionality();
      
      // 添加动画效果
      setTimeout(() => {
        const cards = document.querySelectorAll('.category-card');
        cards.forEach((card, index) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          
          setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 100);
        });
      }, 100);
      
      console.log('分类页面初始化完成');
      
    } catch (error) {
      console.error('分类页面初始化失败:', error);
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCategoriesPage);
  } else {
    initCategoriesPage();
  }

  // 添加淡入动画样式
  const animationStyles = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', animationStyles);

})();
