// 性能监控脚本
(function() {
  'use strict';

  // 性能指标收集
  const performanceMetrics = {
    // 页面加载时间
    pageLoadTime: 0,
    // DOM构建时间
    domBuildTime: 0,
    // 资源加载时间
    resourceLoadTime: 0,
    // 首次内容绘制时间
    firstContentfulPaint: 0,
    // 最大内容绘制时间
    largestContentfulPaint: 0
  };

  // 收集性能数据
  function collectPerformanceData() {
    if (!window.performance || !window.performance.timing) {
      return;
    }

    const timing = window.performance.timing;
    const navigation = window.performance.navigation;

    // 计算各项性能指标
    performanceMetrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    performanceMetrics.domBuildTime = timing.domComplete - timing.domLoading;
    performanceMetrics.resourceLoadTime = timing.loadEventEnd - timing.domContentLoadedEventEnd;

    // 获取Paint Timing API数据
    if (window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          performanceMetrics.firstContentfulPaint = entry.startTime;
        }
      });

      // 获取LCP数据
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            performanceMetrics.largestContentfulPaint = lastEntry.startTime;
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP monitoring not supported');
        }
      }
    }

    // 发送性能数据（可选）
    sendPerformanceData();
  }

  // 发送性能数据到服务器（示例）
  function sendPerformanceData() {
    // 这里可以发送到你的分析服务
    console.log('Performance Metrics:', performanceMetrics);
    
    // 示例：发送到Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_load_time', {
        event_category: 'Performance',
        event_label: 'Page Load',
        value: Math.round(performanceMetrics.pageLoadTime)
      });
    }
  }

  // 监控资源加载错误
  function monitorResourceErrors() {
    window.addEventListener('error', function(e) {
      if (e.target !== window) {
        console.warn('Resource failed to load:', e.target.src || e.target.href);
        
        // 可以发送错误报告
        if (typeof gtag !== 'undefined') {
          gtag('event', 'resource_error', {
            event_category: 'Error',
            event_label: e.target.tagName,
            value: 1
          });
        }
      }
    }, true);
  }

  // 监控长任务
  function monitorLongTasks() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.warn('Long task detected:', entry.duration + 'ms');
            
            // 发送长任务报告
            if (typeof gtag !== 'undefined') {
              gtag('event', 'long_task', {
                event_category: 'Performance',
                event_label: 'Long Task',
                value: Math.round(entry.duration)
              });
            }
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }
    }
  }

  // 内存使用监控
  function monitorMemoryUsage() {
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      console.log('Memory usage:', {
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
      });
    }
  }

  // 网络状态监控
  function monitorNetworkStatus() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      console.log('Network info:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      });

      connection.addEventListener('change', () => {
        console.log('Network status changed:', connection.effectiveType);
      });
    }
  }

  // 初始化性能监控
  function initPerformanceMonitoring() {
    // 页面加载完成后收集数据
    if (document.readyState === 'complete') {
      setTimeout(collectPerformanceData, 0);
    } else {
      window.addEventListener('load', () => {
        setTimeout(collectPerformanceData, 0);
      });
    }

    // 启动各项监控
    monitorResourceErrors();
    monitorLongTasks();
    
    // 定期监控内存使用
    setInterval(monitorMemoryUsage, 30000);
    
    // 监控网络状态
    monitorNetworkStatus();
  }

  // 页面可见性变化监控
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('Page hidden');
    } else {
      console.log('Page visible');
    }
  });

  // 启动监控
  initPerformanceMonitoring();

})();
