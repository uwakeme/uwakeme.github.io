// 用户体验增强脚本
(function() {
  'use strict';

  // 平滑滚动
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // 返回顶部按钮
  function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #007acc;
      color: white;
      border: none;
      font-size: 20px;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(backToTopBtn);

    // 滚动显示/隐藏
    window.addEventListener('scroll', throttle(() => {
      if (window.pageYOffset > 300) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.visibility = 'visible';
      } else {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.visibility = 'hidden';
      }
    }, 100));

    // 点击返回顶部
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 阅读进度条
  function initReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #007acc, #00d4aa);
      z-index: 9999;
      transition: width 0.1s ease;
    `;

    document.body.appendChild(progressBar);

    window.addEventListener('scroll', throttle(() => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    }, 50));
  }

  // 图片懒加载增强
  function enhanceImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // 创建加载占位符
            img.style.filter = 'blur(5px)';
            img.style.transition = 'filter 0.3s ease';
            
            // 预加载图片
            const tempImg = new Image();
            tempImg.onload = () => {
              img.src = img.dataset.src;
              img.style.filter = 'none';
              img.classList.remove('lazy');
              img.classList.add('loaded');
            };
            tempImg.onerror = () => {
              img.src = '/img/placeholder.png'; // 错误占位图
              img.classList.add('error');
            };
            tempImg.src = img.dataset.src;
            
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  // 代码复制功能增强 - 移除自定义复制按钮，使用主题自带功能
  function enhanceCodeCopy() {
    // 不添加自定义复制按钮，让主题自带的复制功能正常工作
    console.log('使用Butterfly主题自带的代码复制功能');
  }

  // 移动端导航优化
  function initMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle, .mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu, .mobile-nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // 防止背景滚动
        if (navMenu.classList.contains('active')) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      });

      // 点击菜单项关闭导航
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          navToggle.classList.remove('active');
          document.body.style.overflow = '';
        });
      });

      // 点击外部关闭导航
      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
          navMenu.classList.remove('active');
          navToggle.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  }

  // 文章目录优化
  function enhanceTableOfContents() {
    const toc = document.querySelector('.toc, .post-toc');
    if (!toc) return;

    const headings = document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3');
    const tocLinks = toc.querySelectorAll('a');

    // 滚动高亮当前章节
    window.addEventListener('scroll', throttle(() => {
      let current = '';
      
      headings.forEach(heading => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          current = heading.id;
        }
      });

      tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
    }, 100));
  }

  // 工具函数：节流
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // 键盘快捷键
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K 打开搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('#local-search-input, .search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // ESC 关闭搜索/导航
      if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu.active');
        const searchModal = document.querySelector('.search-modal.active');
        
        if (navMenu) {
          navMenu.classList.remove('active');
          document.body.style.overflow = '';
        }
        
        if (searchModal) {
          searchModal.classList.remove('active');
        }
      }
    });
  }

  // 初始化所有功能
  function initUXEnhancements() {
    initSmoothScroll();
    initBackToTop();
    initReadingProgress();
    enhanceImageLazyLoading();
    enhanceCodeCopy();
    initMobileNavigation();
    enhanceTableOfContents();
    initKeyboardShortcuts();
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUXEnhancements);
  } else {
    initUXEnhancements();
  }

})();
