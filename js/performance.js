// 性能优化JavaScript

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 节流函数
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

// 图片懒加载优化
function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// 预加载关键资源
function preloadCriticalResources() {
  const criticalResources = [
    '/css/custom.css',
    '/js/custom.js',
    'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@latest/css/all.min.css'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.css') ? 'style' : 'script';
    document.head.appendChild(link);
  });
}

// 优化滚动性能
function optimizeScrolling() {
  let ticking = false;

  function updateScrollPosition() {
    // 滚动相关的DOM操作
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateScrollPosition);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
}

// 代码高亮延迟加载
function lazyLoadCodeHighlight() {
  const codeBlocks = document.querySelectorAll('pre code');
  if (codeBlocks.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const codeBlock = entry.target;
        if (typeof Prism !== 'undefined') {
          Prism.highlightElement(codeBlock);
        }
        observer.unobserve(codeBlock);
      }
    });
  });

  codeBlocks.forEach(block => observer.observe(block));
}

// 资源预取
function prefetchResources() {
  // 预取下一页内容
  const nextPageLinks = document.querySelectorAll('a[href*="/page/"]');
  nextPageLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = link.href;
      document.head.appendChild(prefetchLink);
    }, { once: true });
  });
}

// 初始化性能优化
document.addEventListener('DOMContentLoaded', function() {
  initLazyLoading();
  preloadCriticalResources();
  optimizeScrolling();
  lazyLoadCodeHighlight();
  prefetchResources();
  
  // 延迟加载非关键脚本
  setTimeout(() => {
    // 加载统计脚本等非关键资源
  }, 3000);
});

// Service Worker 注册（如果支持）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
