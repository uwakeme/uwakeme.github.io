// 主题增强JavaScript
(function() {
  'use strict';

  // 页面加载动画
  function initPageLoader() {
    // 创建加载动画
    const loader = document.createElement('div');
    loader.className = 'loading-container';
    loader.innerHTML = `
      <div class="loading-spinner"></div>
    `;
    document.body.appendChild(loader);

    // 页面加载完成后隐藏动画
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.remove();
        }, 500);
      }, 500);
    });
  }

  // 主题切换功能
  function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    // 获取当前主题
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // 切换主题
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // 添加切换动画
      document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      setTimeout(() => {
        document.body.style.transition = '';
      }, 300);
    });
  }

  // 滚动动画
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // 观察需要动画的元素
    document.querySelectorAll('.post-card, .sidebar-card, .widget').forEach(el => {
      observer.observe(el);
    });
  }

  // 打字机效果
  function initTypewriter() {
    const typewriterElements = document.querySelectorAll('.typewriter');
    
    typewriterElements.forEach(element => {
      const text = element.textContent;
      element.textContent = '';
      element.style.width = '0';
      
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(timer);
          element.style.borderRight = 'none';
        }
      }, 100);
    });
  }

  // 鼠标跟随效果
  function initMouseFollower() {
    const follower = document.createElement('div');
    follower.className = 'mouse-follower';
    follower.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: var(--theme-color);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.6;
      transition: transform 0.1s ease;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(follower);

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateFollower() {
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;
      
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';
      
      requestAnimationFrame(updateFollower);
    }
    updateFollower();

    // 鼠标悬停效果
    document.addEventListener('mouseenter', (e) => {
      if (e.target.matches('a, button, .clickable')) {
        follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
        follower.style.opacity = '0.8';
      }
    }, true);

    document.addEventListener('mouseleave', (e) => {
      if (e.target.matches('a, button, .clickable')) {
        follower.style.transform = 'translate(-50%, -50%) scale(1)';
        follower.style.opacity = '0.6';
      }
    }, true);
  }

  // 粒子背景效果
  function initParticleBackground() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      opacity: 0.3;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 创建粒子
    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      };
    }

    // 初始化粒子
    for (let i = 0; i < 50; i++) {
      particles.push(createParticle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // 边界检测
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // 绘制粒子
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(73, 177, 245, ${particle.opacity})`;
        ctx.fill();
        
        // 连接附近的粒子
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(73, 177, 245, ${0.1 * (1 - distance / 100)})`;
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    }
    animate();
  }

  // 网站运行时间
  function initRuntimeDisplay() {
    const runtimeElement = document.querySelector('.runtime-display');
    if (!runtimeElement) return;

    const startDate = new Date('2024-01-01 00:00:00');
    
    function updateRuntime() {
      const now = new Date();
      const diff = now - startDate;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      runtimeElement.innerHTML = `本站已运行 ${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`;
    }
    
    updateRuntime();
    setInterval(updateRuntime, 1000);
  }

  // 图片懒加载增强
  function enhanceImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // 添加加载动画
          img.style.filter = 'blur(5px)';
          img.style.transition = 'filter 0.3s ease';
          
          const tempImg = new Image();
          tempImg.onload = () => {
            img.src = img.dataset.src;
            img.style.filter = 'none';
            img.classList.add('loaded');
          };
          tempImg.src = img.dataset.src;
          
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // 代码复制功能增强
  function enhanceCodeBlocks() {
    document.querySelectorAll('pre code').forEach(codeBlock => {
      const pre = codeBlock.parentElement;
      
      // 添加语言标签
      const language = codeBlock.className.match(/language-(\w+)/);
      if (language) {
        const langLabel = document.createElement('span');
        langLabel.className = 'code-language';
        langLabel.textContent = language[1].toUpperCase();
        langLabel.style.cssText = `
          position: absolute;
          top: 8px;
          right: 60px;
          background: rgba(255,255,255,0.1);
          color: #fff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        `;
        pre.appendChild(langLabel);
      }
    });
  }

  // 初始化所有功能
  function initThemeEnhancements() {
    initPageLoader();
    initThemeToggle();
    initScrollAnimations();
    initTypewriter();
    initMouseFollower();
    initParticleBackground();
    initRuntimeDisplay();
    enhanceImageLazyLoading();
    enhanceCodeBlocks();
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeEnhancements);
  } else {
    initThemeEnhancements();
  }

})();
