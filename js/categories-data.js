/**
 * 分类数据获取脚本
 * 从页面DOM中提取实际的分类信息
 */

(function() {
  'use strict';

  // 从页面中提取分类数据
  function extractCategoriesFromDOM() {
    const categories = [];
    
    // 尝试从侧边栏的分类卡片中提取数据
    const categoryLinks = document.querySelectorAll('.card-categories .card-category-list .card-category-list-item');
    
    if (categoryLinks.length > 0) {
      categoryLinks.forEach(link => {
        const nameEl = link.querySelector('.card-category-list-name');
        const countEl = link.querySelector('.card-category-list-count');
        
        if (nameEl && countEl) {
          const name = nameEl.textContent.trim();
          const count = parseInt(countEl.textContent.replace(/[^\d]/g, '')) || 0;
          const url = link.getAttribute('href') || `/categories/${encodeURIComponent(name)}/`;
          
          categories.push({
            name: name,
            count: count,
            url: url,
            posts: [] // 这里暂时为空，后续可以通过AJAX获取
          });
        }
      });
    }
    
    // 如果侧边栏没有分类信息，尝试从其他地方获取
    if (categories.length === 0) {
      // 尝试从页面的分类列表中获取
      const categoryItems = document.querySelectorAll('.category-list-item, .category-item');
      
      categoryItems.forEach(item => {
        const link = item.querySelector('a');
        const countEl = item.querySelector('.category-list-count, .category-count, .count');
        
        if (link) {
          const name = link.textContent.trim().replace(/\(\d+\)/, '').trim();
          const count = countEl ? parseInt(countEl.textContent.replace(/[^\d]/g, '')) || 0 : 0;
          const url = link.getAttribute('href') || `/categories/${encodeURIComponent(name)}/`;
          
          if (name && !categories.find(cat => cat.name === name)) {
            categories.push({
              name: name,
              count: count,
              url: url,
              posts: []
            });
          }
        }
      });
    }
    
    return categories;
  }

  // 通过AJAX获取分类页面的文章列表
  async function fetchCategoryPosts(categoryUrl, categoryName) {
    try {
      const response = await fetch(categoryUrl);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const posts = [];
      const postItems = doc.querySelectorAll('.recent-post-item, .post-preview, article');
      
      postItems.forEach((item, index) => {
        if (index >= 5) return; // 只取前5篇
        
        const titleEl = item.querySelector('.post-title a, .recent-post-info .article-title, h2 a, h3 a');
        const linkEl = item.querySelector('a[href*="/"]');
        
        if (titleEl && linkEl) {
          posts.push({
            title: titleEl.textContent.trim(),
            url: linkEl.getAttribute('href'),
            date: new Date() // 暂时使用当前时间
          });
        }
      });
      
      return posts;
    } catch (error) {
      console.warn(`无法获取分类 ${categoryName} 的文章列表:`, error);
      return [];
    }
  }

  // 获取完整的分类数据
  async function getCompleteCategoriesData() {
    let categories = extractCategoriesFromDOM();
    
    // 如果没有从DOM中提取到数据，使用默认数据
    if (categories.length === 0) {
      categories = getDefaultCategories();
    }
    
    // 为每个分类获取文章列表
    const promises = categories.map(async (category) => {
      const posts = await fetchCategoryPosts(category.url, category.name);
      return {
        ...category,
        posts: posts
      };
    });
    
    try {
      const categoriesWithPosts = await Promise.all(promises);
      return categoriesWithPosts;
    } catch (error) {
      console.warn('获取分类文章列表时出错:', error);
      return categories;
    }
  }

  // 默认分类数据
  function getDefaultCategories() {
    return [
      {
        name: 'Java',
        count: 17,
        url: '/categories/Java/',
        posts: [
          { title: 'Spring Boot项目实战指南', url: '/2024/01/15/spring-boot-guide/', date: new Date('2024-01-15') },
          { title: 'Java Stream流操作详解', url: '/2024/01/10/java-stream/', date: new Date('2024-01-10') },
          { title: 'MyBatis Plus使用技巧', url: '/2024/01/05/mybatis-plus/', date: new Date('2024-01-05') }
        ]
      },
      {
        name: '前端',
        count: 25,
        url: '/categories/前端/',
        posts: [
          { title: 'Vue3组合式API实践', url: '/2024/01/20/vue3-composition/', date: new Date('2024-01-20') },
          { title: 'CSS Grid布局完全指南', url: '/2024/01/18/css-grid/', date: new Date('2024-01-18') },
          { title: 'JavaScript异步编程', url: '/2024/01/12/js-async/', date: new Date('2024-01-12') }
        ]
      },
      {
        name: '数据库',
        count: 12,
        url: '/categories/数据库/',
        posts: [
          { title: 'MySQL性能优化实战', url: '/2024/01/25/mysql-optimization/', date: new Date('2024-01-25') },
          { title: 'Redis缓存策略详解', url: '/2024/01/22/redis-cache/', date: new Date('2024-01-22') },
          { title: 'SQL查询优化技巧', url: '/2024/01/16/sql-optimization/', date: new Date('2024-01-16') }
        ]
      },
      {
        name: 'LINUX',
        count: 9,
        url: '/categories/LINUX/',
        posts: [
          { title: 'Linux系统监控命令大全', url: '/2024/01/28/linux-monitoring/', date: new Date('2024-01-28') },
          { title: 'Shell脚本编程入门', url: '/2024/01/24/shell-scripting/', date: new Date('2024-01-24') },
          { title: 'Docker容器化部署', url: '/2024/01/19/docker-deployment/', date: new Date('2024-01-19') }
        ]
      },
      {
        name: '算法',
        count: 10,
        url: '/categories/算法/',
        posts: [
          { title: '动态规划经典题解', url: '/2024/01/30/dynamic-programming/', date: new Date('2024-01-30') },
          { title: '二叉树遍历算法详解', url: '/2024/01/26/binary-tree/', date: new Date('2024-01-26') },
          { title: '排序算法性能对比', url: '/2024/01/21/sorting-algorithms/', date: new Date('2024-01-21') }
        ]
      },
      {
        name: '学习',
        count: 22,
        url: '/categories/学习/',
        posts: [
          { title: '如何高效学习编程', url: '/2024/02/01/learning-programming/', date: new Date('2024-02-01') },
          { title: '技术文档写作技巧', url: '/2024/01/29/tech-writing/', date: new Date('2024-01-29') },
          { title: '代码审查最佳实践', url: '/2024/01/27/code-review/', date: new Date('2024-01-27') }
        ]
      },
      {
        name: 'BUG解决',
        count: 8,
        url: '/categories/BUG解决/',
        posts: [
          { title: 'Spring Boot启动失败解决方案', url: '/2024/01/14/spring-boot-startup-error/', date: new Date('2024-01-14') },
          { title: 'MySQL连接超时问题排查', url: '/2024/01/11/mysql-timeout/', date: new Date('2024-01-11') },
          { title: 'JavaScript内存泄漏调试', url: '/2024/01/08/js-memory-leak/', date: new Date('2024-01-08') }
        ]
      },
      {
        name: '博客',
        count: 6,
        url: '/categories/博客/',
        posts: [
          { title: 'Hexo博客搭建完整指南', url: '/2024/01/13/hexo-blog-setup/', date: new Date('2024-01-13') },
          { title: 'Butterfly主题定制技巧', url: '/2024/01/09/butterfly-customization/', date: new Date('2024-01-09') },
          { title: '博客SEO优化实践', url: '/2024/01/06/blog-seo/', date: new Date('2024-01-06') }
        ]
      }
    ];
  }

  // 将函数暴露到全局作用域
  window.CategoriesDataManager = {
    extractCategoriesFromDOM,
    fetchCategoryPosts,
    getCompleteCategoriesData,
    getDefaultCategories
  };

})();
