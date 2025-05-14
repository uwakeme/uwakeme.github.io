// 页面加载动画
window.addEventListener('load', function() {
  // 创建页面加载动画
  const pageLoading = document.createElement('div');
  pageLoading.className = 'page-loading';
  
  const loadingSpinner = document.createElement('div');
  loadingSpinner.className = 'loading-spinner';
  
  pageLoading.appendChild(loadingSpinner);
  document.body.appendChild(pageLoading);
  
  // 延迟隐藏加载动画
  setTimeout(() => {
    pageLoading.classList.add('loaded');
    setTimeout(() => {
      document.body.removeChild(pageLoading);
    }, 600);
  }, 300);
});

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
  
  // 添加阅读进度条
  addReadingProgressBar();
  
  // 增强代码块复制功能
  enhanceCodeCopy();
  
  // 激活目录跟随滚动
  activateTocScroll();
  
  // 添加文章推荐
  addRelatedPosts();
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

// 添加阅读进度条
function addReadingProgressBar() {
  // 只在文章页面添加进度条
  if (!document.querySelector('.post-content')) {
    return;
  }
  
  // 创建进度条元素
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress-bar';
  document.body.appendChild(progressBar);
  
  // 计算阅读进度
  window.addEventListener('scroll', function() {
    const docElem = document.documentElement;
    const docBody = document.body;
    const scrollTop = docElem.scrollTop || docBody.scrollTop;
    const scrollHeight = docElem.scrollHeight || docBody.scrollHeight;
    const clientHeight = docElem.clientHeight;
    
    // 计算百分比
    const percent = Math.floor((scrollTop / (scrollHeight - clientHeight)) * 100);
    
    // 更新进度条宽度
    progressBar.style.width = percent + '%';
  });
}

// 增强代码块复制功能
function enhanceCodeCopy() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  
  copyButtons.forEach(btn => {
    const originalText = btn.textContent;
    
    btn.addEventListener('click', function() {
      // 创建成功提示
      const successTip = document.createElement('div');
      successTip.className = 'copy-success-tip';
      successTip.textContent = '复制成功！';
      successTip.style.position = 'fixed';
      successTip.style.top = '20px';
      successTip.style.left = '50%';
      successTip.style.transform = 'translateX(-50%)';
      successTip.style.padding = '8px 16px';
      successTip.style.backgroundColor = 'rgba(73, 177, 245, 0.9)';
      successTip.style.color = 'white';
      successTip.style.borderRadius = '4px';
      successTip.style.zIndex = '9999';
      successTip.style.opacity = '0';
      successTip.style.transition = 'opacity 0.3s';
      
      document.body.appendChild(successTip);
      
      // 显示提示
      setTimeout(() => {
        successTip.style.opacity = '1';
      }, 10);
      
      // 隐藏提示
      setTimeout(() => {
        successTip.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(successTip);
        }, 300);
      }, 2000);
    });
  });
}

// 激活目录跟随滚动
function activateTocScroll() {
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6');
  
  if (tocLinks.length === 0 || headings.length === 0) {
    return;
  }
  
  // 清除所有激活状态
  function clearActiveLinks() {
    tocLinks.forEach(link => {
      link.classList.remove('active');
    });
  }
  
  // 监听滚动事件
  window.addEventListener('scroll', function() {
    // 获取当前滚动位置
    const scrollTop = window.scrollY;
    
    // 找到当前可见的标题
    let currentHeading = null;
    
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      
      // 如果标题在视口上方或在视口内靠上位置
      if (rect.top <= 100) {
        currentHeading = heading;
      }
    });
    
    // 如果找到了当前可见的标题
    if (currentHeading) {
      // 清除所有激活状态
      clearActiveLinks();
      
      // 获取当前标题的ID
      const id = currentHeading.id;
      
      // 找到对应的TOC链接并设置为激活状态
      const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  });
}

// 添加文章推荐
function addRelatedPosts() {
  // 只在文章页面添加推荐
  const postContent = document.querySelector('.post-content');
  if (!postContent) {
    return;
  }
  
  // 找到标签列表
  const tagElements = document.querySelectorAll('.tag-item');
  if (tagElements.length === 0) {
    return;
  }
  
  // 获取当前文章的标签
  const currentTags = Array.from(tagElements).map(tag => tag.textContent.trim());
  
  // 获取当前文章的标题
  const currentTitle = document.querySelector('.post-title').textContent.trim();
  
  // 创建推荐容器
  const recommendContainer = document.createElement('div');
  recommendContainer.className = 'recommend-posts';
  recommendContainer.innerHTML = `
    <h4 style="margin-top: 50px; margin-bottom: 20px; position: relative;">
      <i class="iconfont icon-bookmark" style="margin-right: 5px;"></i>
      <span>相关推荐</span>
      <div style="position: absolute; bottom: -10px; left: 0; width: 100px; height: 2px; background: linear-gradient(to right, var(--primary-color), transparent);"></div>
    </h4>
    <div class="recommend-posts-container" style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
      <div class="recommend-loading" style="width: 100%; text-align: center; padding: 20px;">
        <i class="iconfont icon-loading" style="animation: spin 1s linear infinite;"></i> 
        <span>正在加载推荐内容...</span>
      </div>
    </div>
  `;
  
  // 添加到页面底部
  const prevNext = document.querySelector('.post-prev-next');
  if (prevNext) {
    prevNext.parentNode.insertBefore(recommendContainer, prevNext);
  } else {
    postContent.parentNode.appendChild(recommendContainer);
  }
  
  // 创建模拟延迟，实际项目中应该从服务器获取相关文章
  setTimeout(() => {
    const recommendContainer = document.querySelector('.recommend-posts-container');
    recommendContainer.innerHTML = '';
    
    // 模拟推荐文章数据（在实际项目中，这些数据应该从服务器获取）
    const recommendPosts = [
      {
        title: '相关推荐文章1',
        link: '#',
        cover: 'https://cdn.jsdelivr.net/gh/uwakeme/cdn@main/img/default.jpg',
        date: '2024-08-30',
        tags: ['技术', '前端']
      },
      {
        title: '相关推荐文章2',
        link: '#',
        cover: 'https://cdn.jsdelivr.net/gh/uwakeme/cdn@main/img/default.jpg',
        date: '2024-08-29',
        tags: ['后端', 'Java']
      },
      {
        title: '相关推荐文章3',
        link: '#',
        cover: 'https://cdn.jsdelivr.net/gh/uwakeme/cdn@main/img/default.jpg',
        date: '2024-08-28',
        tags: ['人工智能', '学习']
      }
    ];
    
    // 根据标签为文章设置相关性分数
    recommendPosts.forEach(post => {
      let score = 0;
      post.tags.forEach(tag => {
        if (currentTags.includes(tag)) {
          score += 1;
        }
      });
      post.score = score;
    });
    
    // 根据相关性排序
    recommendPosts.sort((a, b) => b.score - a.score);
    
    // 渲染推荐文章
    recommendPosts.forEach(post => {
      const postCard = document.createElement('div');
      postCard.className = 'recommend-post-card';
      postCard.style.width = 'calc(33.333% - 20px)';
      postCard.style.margin = '10px';
      postCard.style.borderRadius = '8px';
      postCard.style.overflow = 'hidden';
      postCard.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      postCard.style.transition = 'all 0.3s';
      
      postCard.innerHTML = `
        <a href="${post.link}" style="display: block; text-decoration: none; color: inherit;">
          <div class="recommend-post-cover" style="height: 150px; overflow: hidden;">
            <img src="${post.cover}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;">
          </div>
          <div class="recommend-post-info" style="padding: 15px;">
            <h5 style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${post.title}</h5>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #999;">
              <span>${post.date}</span>
              <span>${post.tags.join(', ')}</span>
            </div>
          </div>
        </a>
      `;
      
      // 添加悬停效果
      postCard.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)';
        const img = this.querySelector('img');
        if (img) {
          img.style.transform = 'scale(1.05)';
        }
      });
      
      postCard.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        const img = this.querySelector('img');
        if (img) {
          img.style.transform = 'scale(1)';
        }
      });
      
      recommendContainer.appendChild(postCard);
    });
    
    // 如果没有推荐文章
    if (recommendPosts.length === 0) {
      recommendContainer.innerHTML = '<p style="width: 100%; text-align: center; padding: 20px; color: #999;">暂无相关文章推荐</p>';
    }
  }, 1000);
} 