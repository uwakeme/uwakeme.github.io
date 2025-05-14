// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 添加文章卡片动画延迟
  addAnimationDelay();
  
  // 添加代码块语言标签
  addCodeLangLabel();
  
  // 添加图片点击放大效果
  addImageZoom();
  
  // 初始化回到顶部按钮
  initBackToTop();
  
  // 初始化文章内容目录悬浮效果
  initTocSticky();
});

// 添加文章卡片动画延迟
function addAnimationDelay() {
  const cards = document.querySelectorAll('.index-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });
}

// 添加代码块语言标签
function addCodeLangLabel() {
  const preElements = document.querySelectorAll('pre');
  
  preElements.forEach(pre => {
    const code = pre.querySelector('code');
    if (code) {
      const classes = code.className.split(' ');
      const langClass = classes.find(cls => cls.startsWith('language-'));
      
      if (langClass) {
        const lang = langClass.replace('language-', '').toUpperCase();
        const label = document.createElement('div');
        label.className = 'code-lang-label';
        label.textContent = lang;
        label.style.position = 'absolute';
        label.style.top = '0';
        label.style.right = '0';
        label.style.backgroundColor = '#49b1f5';
        label.style.color = 'white';
        label.style.padding = '2px 8px';
        label.style.fontSize = '12px';
        label.style.borderRadius = '0 0 0 4px';
        label.style.zIndex = '1';
        
        // 确保pre有position: relative;
        if (getComputedStyle(pre).position === 'static') {
          pre.style.position = 'relative';
        }
        
        pre.appendChild(label);
      }
    }
  });
}

// 添加图片点击放大效果
function addImageZoom() {
  const contentImages = document.querySelectorAll('.markdown-body img');
  
  contentImages.forEach(img => {
    img.style.cursor = 'zoom-in';
    
    img.addEventListener('click', function() {
      // 创建遮罩层
      const overlay = document.createElement('div');
      overlay.className = 'image-zoom-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.cursor = 'zoom-out';
      
      // 创建放大的图片
      const zoomedImg = document.createElement('img');
      zoomedImg.src = this.src;
      zoomedImg.style.maxWidth = '90%';
      zoomedImg.style.maxHeight = '90%';
      zoomedImg.style.objectFit = 'contain';
      zoomedImg.style.transition = 'transform 0.3s';
      zoomedImg.style.transform = 'scale(0.9)';
      
      // 添加到页面
      overlay.appendChild(zoomedImg);
      document.body.appendChild(overlay);
      
      // 动画效果
      setTimeout(() => {
        zoomedImg.style.transform = 'scale(1)';
      }, 10);
      
      // 点击关闭
      overlay.addEventListener('click', function() {
        zoomedImg.style.transform = 'scale(0.9)';
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 300);
      });
    });
  });
}

// 初始化回到顶部按钮
function initBackToTop() {
  const backToTop = document.querySelector('.scroll-top-arrow');
  
  if (backToTop) {
    // 添加平滑滚动
    backToTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    // 添加悬停动画
    backToTop.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
    });
    
    backToTop.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  }
}

// 初始化文章内容目录悬浮效果
function initTocSticky() {
  const toc = document.querySelector('.toc-wrapper');
  
  if (toc) {
    const originalTop = toc.offsetTop;
    const footer = document.querySelector('.footer');
    
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > originalTop) {
        toc.style.position = 'fixed';
        toc.style.top = '20px';
        
        // 防止与页脚重叠
        if (footer) {
          const footerTop = footer.getBoundingClientRect().top;
          if (footerTop - window.innerHeight + toc.offsetHeight < 0) {
            toc.style.top = `${footerTop - window.innerHeight + toc.offsetHeight}px`;
          }
        }
      } else {
        toc.style.position = 'static';
      }
    });
  }
} 