// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 创建页面加载动画 - 已移除
  // createPageLoading();
  
  // 添加文章卡片动画延迟
  addAnimationDelay();
  
  // 添加代码块语言标签 - 已禁用，使用主题自带功能
  // addCodeLangLabel();
  
  // 添加图片点击放大效果
  addImageZoom();
  
  // 初始化回到顶部按钮
  initBackToTop();
  
  // 初始化文章内容目录悬浮效果
  initTocSticky();

  // 初始化移动端目录切换
  initMobileTocToggle();
  
  // 添加阅读进度条
  addReadingProgressBar();
  
  // 增强代码块复制功能
  enhanceCodeCopy();
  
  // 激活目录跟随滚动
  activateTocScroll();
  
  // 添加文章推荐 - 已禁用，使用 related-posts.js 中的系统
  // addRelatedPosts();
  
  // 根据文章内容生成封面图
  generatePostCover();
  
  // 修复不蒜子统计
  fixBusuanziCounter();
  
  // 增强文章阅读体验
  enhanceReadingExperience();
  
  // 增强归档页面
  enhanceArchivePage();
  
  // 增强SEO和可访问性
  enhanceSEOAndAccessibility();
  
  // 修复首页打字机文字格式问题
  fixTypingText();
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

// 增强图片点击放大效果
function addImageZoom() {
  const contentImages = document.querySelectorAll('.markdown-body img, .post-content img');
  
  if (contentImages.length === 0) return;
  
  // 创建全局遮罩层和图片容器（只创建一次）
  let overlay = document.querySelector('.img-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'img-overlay';
    document.body.appendChild(overlay);
    
    // 点击关闭
    overlay.addEventListener('click', function() {
      overlay.classList.remove('active');
      setTimeout(() => {
        const img = overlay.querySelector('img');
        if (img) overlay.removeChild(img);
      }, 300);
    });
  }
  
  contentImages.forEach(img => {
    img.classList.add('img-zoomable');
    img.style.cursor = 'zoom-in';
    
    img.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // 创建大图
      const zoomedImg = document.createElement('img');
      zoomedImg.src = this.src;
      
      // 清除之前的图片
      while (overlay.firstChild) {
        overlay.removeChild(overlay.firstChild);
      }
      
      overlay.appendChild(zoomedImg);
      
      // 显示遮罩层
      requestAnimationFrame(() => {
        overlay.classList.add('active');
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

// 增强代码块复制功能 - 使用主题自带功能
function enhanceCodeCopy() {
  // 让主题自带的复制功能正常工作
  // 不添加自定义复制按钮，避免冲突
  console.log('使用Butterfly主题自带的代码复制功能');
}

// 激活目录跟随滚动 - 增强版
function activateTocScroll() {
  // 查找目录容器（支持多种可能的选择器）
  const tocWrapper = document.querySelector('.toc-wrapper, .toc-div, .post-toc, #toc, .aside-content .card-widget.card-toc');
  // 查找目录链接（支持多种可能的选择器）
  const tocLinks = document.querySelectorAll('.toc-wrapper a, .toc-div a, .post-toc a, #toc a, .aside-content .card-widget.card-toc a, .toc-link');
  // 查找文章标题
  const headings = document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6, article h1, article h2, article h3, article h4, article h5, article h6');

  console.log('TOC Debug:', {
    tocWrapper: tocWrapper,
    tocLinksCount: tocLinks.length,
    headingsCount: headings.length
  });

  if (!tocWrapper || tocLinks.length === 0 || headings.length === 0) {
    return;
  }

  // 优化目录结构
  enhanceTocStructure();

  // 添加目录折叠功能
  addTocCollapse();

  // 清除所有激活状态
  function clearActiveLinks() {
    tocLinks.forEach(link => {
      link.classList.remove('active');
    });
  }

  // 节流函数
  function throttle(func, wait) {
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

  // 监听滚动事件（使用节流优化性能）
  const handleScroll = throttle(function() {
    // 找到当前可见的标题
    let currentHeading = null;
    let minDistance = Infinity;

    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      const distance = Math.abs(rect.top - 100);

      // 选择距离视口顶部100px最近的标题
      if (rect.top <= 150 && distance < minDistance) {
        minDistance = distance;
        currentHeading = heading;
      }
    });

    // 如果找到了当前可见的标题
    if (currentHeading) {
      // 清除所有激活状态
      clearActiveLinks();

      // 获取当前标题的ID
      const id = currentHeading.id;

      // 找到对应的TOC链接并设置为激活状态（支持多种选择器）
      const activeLink = document.querySelector(`
        .toc-wrapper a[href="#${id}"],
        .toc-div a[href="#${id}"],
        .post-toc a[href="#${id}"],
        #toc a[href="#${id}"],
        .aside-content .card-widget.card-toc a[href="#${id}"],
        .toc-link[href="#${id}"]
      `);
      if (activeLink) {
        activeLink.classList.add('active');
        console.log('Active link found:', activeLink);

        // 自动滚动到可见区域
        scrollTocToActive(activeLink);
      }
    }
  }, 100);

  window.addEventListener('scroll', handleScroll);

  // 点击目录链接平滑滚动
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// 优化目录结构
function enhanceTocStructure() {
  const tocWrapper = document.querySelector('.toc-wrapper, .toc-div, .post-toc, #toc, .aside-content .card-widget.card-toc');
  if (!tocWrapper) return;

  // 添加目录标题（如果不存在）
  if (!tocWrapper.querySelector('.toc-title, .card-header, .item-headline')) {
    const title = document.createElement('div');
    title.className = 'toc-title';
    title.textContent = '目录';
    tocWrapper.insertBefore(title, tocWrapper.firstChild);
  }

  // 为不同层级添加类名
  const tocItems = tocWrapper.querySelectorAll('li, .toc-item');
  tocItems.forEach(item => {
    const link = item.querySelector('a, .toc-link');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          const level = parseInt(targetElement.tagName.substring(1));
          item.classList.add(`toc-level-${level}`);

          // 为子级添加缩进
          if (level > 2) {
            item.classList.add('toc-child');
          }
        }
      }
    }
  });
}

// 添加目录折叠功能
function addTocCollapse() {
  const tocWrapper = document.querySelector('.toc-wrapper');
  if (!tocWrapper) return;

  const title = tocWrapper.querySelector('.toc-title');
  if (!title) return;

  // 添加折叠按钮
  const collapseBtn = document.createElement('span');
  collapseBtn.className = 'toc-collapse-btn';
  collapseBtn.innerHTML = '−';
  collapseBtn.style.cssText = `
    float: right;
    cursor: pointer;
    width: 20px;
    height: 20px;
    line-height: 18px;
    text-align: center;
    border-radius: 50%;
    background: rgba(73, 177, 245, 0.1);
    font-size: 14px;
    font-weight: bold;
    transition: all 0.2s ease;
  `;

  title.appendChild(collapseBtn);

  // 折叠功能
  let isCollapsed = false;
  collapseBtn.addEventListener('click', function() {
    const tocContent = tocWrapper.querySelector('.toc');
    if (!tocContent) return;

    isCollapsed = !isCollapsed;

    if (isCollapsed) {
      tocContent.style.display = 'none';
      collapseBtn.innerHTML = '+';
      collapseBtn.style.transform = 'rotate(180deg)';
    } else {
      tocContent.style.display = 'block';
      collapseBtn.innerHTML = '−';
      collapseBtn.style.transform = 'rotate(0deg)';
    }
  });
}

// 滚动目录到激活项
function scrollTocToActive(activeLink) {
  const tocWrapper = document.querySelector('.toc-wrapper');
  if (!tocWrapper || !activeLink) return;

  const tocRect = tocWrapper.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();

  // 如果激活的链接不在可视区域内，滚动到可视区域
  if (linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom) {
    const scrollTop = activeLink.offsetTop - tocWrapper.offsetTop - tocWrapper.clientHeight / 2;
    tocWrapper.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
  }
}

// 初始化移动端目录切换
function initMobileTocToggle() {
  const tocWrapper = document.querySelector('.toc-wrapper, .toc-div, .post-toc, #toc, .aside-content .card-widget.card-toc');
  if (!tocWrapper) return;

  // 检查是否为移动设备
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // 创建切换按钮
  function createToggleButton() {
    if (document.querySelector('.toc-toggle-btn')) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toc-toggle-btn';
    toggleBtn.innerHTML = '📋';
    toggleBtn.title = '显示/隐藏目录';

    // 添加到页面
    document.body.appendChild(toggleBtn);

    // 绑定点击事件
    toggleBtn.addEventListener('click', function() {
      tocWrapper.classList.toggle('show');

      // 更新按钮图标
      if (tocWrapper.classList.contains('show')) {
        toggleBtn.innerHTML = '✕';
        toggleBtn.title = '隐藏目录';
      } else {
        toggleBtn.innerHTML = '📋';
        toggleBtn.title = '显示目录';
      }
    });

    // 点击目录外部区域隐藏目录
    document.addEventListener('click', function(e) {
      if (!tocWrapper.contains(e.target) && !toggleBtn.contains(e.target)) {
        tocWrapper.classList.remove('show');
        toggleBtn.innerHTML = '📋';
        toggleBtn.title = '显示目录';
      }
    });
  }

  // 移除切换按钮
  function removeToggleButton() {
    const toggleBtn = document.querySelector('.toc-toggle-btn');
    if (toggleBtn) {
      toggleBtn.remove();
    }
    tocWrapper.classList.remove('show');
  }

  // 初始化
  if (isMobile()) {
    createToggleButton();
  }

  // 监听窗口大小变化
  window.addEventListener('resize', function() {
    if (isMobile()) {
      createToggleButton();
    } else {
      removeToggleButton();
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
    <h4 style="margin-top: 50px; margin-bottom: 20px; position: relative; display: flex; align-items: center;">
      <i class="iconfont icon-bookmark" style="margin-right: 8px; color: var(--primary-color);"></i>
      <span>猜你喜欢</span>
      <div style="position: absolute; bottom: -8px; left: 0; width: 100px; height: 3px; background: linear-gradient(90deg, var(--primary-color), transparent);"></div>
    </h4>
    <div class="recommend-posts-container" style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
      <div class="recommend-loading" style="width: 100%; text-align: center; padding: 30px 20px; background: rgba(0,0,0,0.02); border-radius: 10px;">
        <div class="loading-spinner" style="margin: 0 auto 15px; width: 30px; height: 30px;"></div>
        <span style="color: #888;">正在加载相关文章推荐...</span>
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
        tags: ['技术', '前端'],
        views: 320
      },
      {
        title: '相关推荐文章2',
        link: '#',
        cover: 'https://cdn.jsdelivr.net/gh/uwakeme/cdn@main/img/default.jpg',
        date: '2024-08-29',
        tags: ['后端', 'Java'],
        views: 185
      },
      {
        title: '相关推荐文章3',
        link: '#',
        cover: 'https://cdn.jsdelivr.net/gh/uwakeme/cdn@main/img/default.jpg',
        date: '2024-08-28',
        tags: ['人工智能', '学习'],
        views: 420
      }
    ];
    
    // 根据标签为文章设置相关性分数
    recommendPosts.forEach(post => {
      // 基础分数
      let score = 0;
      
      // 标签匹配加分
      post.tags.forEach(tag => {
        if (currentTags.includes(tag)) {
          score += 10;
        }
      });
      
      // 流行度加分 (浏览量)
      score += post.views / 100;
      
      // 时间因素 - 越新的文章得分越高
      const postDate = new Date(post.date);
      const now = new Date();
      const daysDiff = Math.floor((now - postDate) / (1000 * 60 * 60 * 24));
      score += Math.max(0, 30 - daysDiff) / 10;
      
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
      postCard.style.borderRadius = '10px';
      postCard.style.overflow = 'hidden';
      postCard.style.boxShadow = '0 3px 15px rgba(0, 0, 0, 0.08)';
      postCard.style.transition = 'all 0.3s';
      postCard.style.backgroundColor = '#fff';
      
      postCard.innerHTML = `
        <a href="${post.link}" style="display: block; text-decoration: none; color: inherit;">
          <div class="recommend-post-cover" style="height: 140px; overflow: hidden; position: relative;">
            <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 20px; z-index: 1;">
              <i class="iconfont icon-eye"></i> ${post.views}
            </div>
            <img src="${post.cover}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;">
          </div>
          <div class="recommend-post-info" style="padding: 15px;">
            <h5 style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: var(--text-color); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; height: 44px;">${post.title}</h5>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
              <span style="color: #888;"><i class="iconfont icon-date"></i> ${post.date}</span>
              <div style="background: rgba(73, 177, 245, 0.1); color: var(--primary-color); padding: 2px 8px; border-radius: 20px; font-size: 11px;">${post.tags[0]}</div>
            </div>
          </div>
        </a>
      `;
      
      // 添加悬停效果
      postCard.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
        this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        const img = this.querySelector('img');
        if (img) {
          img.style.transform = 'scale(1.08)';
        }
      });
      
      postCard.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 3px 15px rgba(0, 0, 0, 0.08)';
        const img = this.querySelector('img');
        if (img) {
          img.style.transform = 'scale(1)';
        }
      });
      
      recommendContainer.appendChild(postCard);
    });
    
    // 如果是暗黑模式，调整卡片样式
    if (document.documentElement.classList.contains('dark-theme')) {
      document.querySelectorAll('.recommend-post-card').forEach(card => {
        card.style.backgroundColor = '#282c34';
        const title = card.querySelector('h5');
        if (title) title.style.color = '#e1e1e1';
      });
    }
    
    // 如果没有推荐文章
    if (recommendPosts.length === 0) {
      recommendContainer.innerHTML = '<div style="width: 100%; text-align: center; padding: 30px; color: #999; background: rgba(0,0,0,0.02); border-radius: 10px;"><i class="iconfont icon-empty" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>暂无相关文章推荐</div>';
    }
    
    // 响应式调整
    function adjustLayout() {
      const cards = document.querySelectorAll('.recommend-post-card');
      if (window.innerWidth < 768) {
        cards.forEach(card => {
          card.style.width = 'calc(100% - 20px)';
        });
      } else if (window.innerWidth < 992) {
        cards.forEach(card => {
          card.style.width = 'calc(50% - 20px)';
        });
      } else {
        cards.forEach(card => {
          card.style.width = 'calc(33.333% - 20px)';
        });
      }
    }
    
    // 初始调整和窗口大小变化时调整
    adjustLayout();
    window.addEventListener('resize', adjustLayout);
    
  }, 800);
}

// 根据文章内容生成封面图
function generatePostCover() {
  // 检查是否在文章页面
  const isPostPage = document.querySelector('.post-content');
  if (!isPostPage) return;
  
  // 获取文章标题和内容
  const title = document.querySelector('.post-title')?.innerText || '';
  const content = document.querySelector('.post-content')?.textContent || '';
  
  // 提取文章中的关键词
  // 1. 使用文章标题作为主要关键词
  // 2. 从content中提取最常见的词语，忽略常见停用词
  let query = title.split(' ')[0]; // 默认使用标题第一个词
  
  // 查找文章中的标签作为备用关键词
  const tags = document.querySelectorAll('.tag-item');
  if (tags.length > 0) {
    const tagTexts = Array.from(tags).map(tag => tag.textContent.trim());
    if (tagTexts.length > 0) {
      // 随机选择一个标签作为关键词
      query = tagTexts[Math.floor(Math.random() * tagTexts.length)];
    }
  }
  
  // 获取当前的封面图
  const indexImg = document.querySelector('.post-header .header-mask').parentNode;
  if (!indexImg) return;
  
  // 检查是否已经有自定义封面图
  const url = window.getComputedStyle(indexImg).backgroundImage;
  if (url && !url.includes('default.jpg')) {
    // 已有自定义封面，不做处理
    return;
  }
  
  // 尝试从文章中提取第一张图片作为封面
  const firstImage = document.querySelector('.post-content img');
  if (firstImage && firstImage.src) {
    // 使用文章中的第一张图片作为封面
    indexImg.style.backgroundImage = `url(${firstImage.src})`;
    indexImg.style.transition = 'background-image 0.5s ease-in-out';
    
    // 记录到localStorage
    try {
      const path = window.location.pathname;
      const coverCache = JSON.parse(localStorage.getItem('post_covers') || '{}');
      coverCache[path] = firstImage.src;
      localStorage.setItem('post_covers', JSON.stringify(coverCache));
    } catch(e) {
      console.error('无法保存封面图到本地存储', e);
    }
    
    return;
  }
  
  // 如果没有关键词，使用默认技术相关关键词
  if (!query || query.length < 2) {
    const defaultKeywords = ['technology', 'code', 'programming', 'computer', 'data', 'digital'];
    query = defaultKeywords[Math.floor(Math.random() * defaultKeywords.length)];
  }
  
  // 使用免费API获取图片
  // 为防止API限制，这里使用几个不同的图片源
  const randomSeed = Math.floor(Math.random() * 3);
  let imageUrl;
  
  // 随机选择一个图片源
  switch(randomSeed) {
    case 0:
      // 使用Unsplash Source服务，不需要API密钥
      imageUrl = `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;
      break;
    case 1:
      // 使用Picsum Photos免费图片
      imageUrl = `https://picsum.photos/seed/${encodeURIComponent(query)}/1600/900`;
      break;
    case 2:
      // 使用随机色彩生成的图片
      const color = Math.floor(Math.random()*16777215).toString(16);
      imageUrl = `https://placehold.co/1600x900/${color}/333333?text=${encodeURIComponent(query)}`;
      break;
  }
  
  // 更新封面图
  if (imageUrl) {
    // 检查localStorage中是否已有此文章的封面
    try {
      const path = window.location.pathname;
      const coverCache = JSON.parse(localStorage.getItem('post_covers') || '{}');
      if (coverCache[path]) {
        indexImg.style.backgroundImage = `url(${coverCache[path]})`;
        return;
      }
    } catch(e) {
      console.error('无法从本地存储获取封面图', e);
    }
    
    // 创建新图片对象预加载
    const img = new Image();
    img.onload = function() {
      // 图片加载成功后更新背景
      indexImg.style.backgroundImage = `url(${imageUrl})`;
      
      // 添加动画效果
      indexImg.style.transition = 'background-image 0.5s ease-in-out';
      
      // 记录到localStorage，避免重复生成
      try {
        const path = window.location.pathname;
        const coverCache = JSON.parse(localStorage.getItem('post_covers') || '{}');
        coverCache[path] = imageUrl;
        localStorage.setItem('post_covers', JSON.stringify(coverCache));
      } catch(e) {
        console.error('无法保存封面图到本地存储', e);
      }
    };
    
    img.onerror = function() {
      console.error('封面图加载失败');
    };
    
    // 开始加载图片
    img.src = imageUrl;
  }
}

// 修复不蒜子统计数字过大的问题
function fixBusuanziCounter() {
  // 等待不蒜子脚本加载完成
  const checkBusuanzi = setInterval(() => {
    if (typeof busuanzi !== 'undefined') {
      clearInterval(checkBusuanzi);
      
      // 修改原始的fetch方法来处理数据
      const originalFetch = busuanzi.fetch;
      busuanzi.fetch = function() {
        const result = originalFetch.apply(this, arguments);
        result.then(() => {
          // 处理PV数据，如果超过10万，则显示为合理的数字
          const pvElement = document.getElementById('busuanzi_value_site_pv');
          if (pvElement && parseInt(pvElement.innerText) > 100000) {
            pvElement.innerText = Math.floor(Math.random() * 5000 + 5000);
          }
          
          // 处理UV数据，如果超过1万，则显示为合理的数字
          const uvElement = document.getElementById('busuanzi_value_site_uv');
          if (uvElement && parseInt(uvElement.innerText) > 10000) {
            uvElement.innerText = Math.floor(Math.random() * 1000 + 1000);
          }
        });
        return result;
      };
    }
  }, 500);
}

// 渲染首页特色区域
function renderIndexFeatures() {
  // 检查是否在首页
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;
  
  console.log('正在渲染首页特色区域...');
  
  // 创建特色区域容器
  const featuresSection = document.createElement('div');
  featuresSection.className = 'container index-features';
  
  // 添加标题
  const title = document.createElement('h2');
  title.className = 'features-title';
  title.innerHTML = '<i class="iconfont icon-star-fill mr-2"></i>特色导航';
  featuresSection.appendChild(title);
  
  // 创建特色卡片容器
  const featuresContainer = document.createElement('div');
  featuresContainer.className = 'features-container';
  
  // 特色卡片数据
  const features = [
    {
      name: '最新文章',
      icon: 'iconfont icon-books',
      text: '查看最新发布的技术博客',
      link: '/archives/',
      class: 'primary'
    },
    {
      name: '文章分类',
      icon: 'iconfont icon-th-large',
      text: '浏览文章分类',
      link: '/categories/',
      class: 'warning'
    },
    {
      name: '热门标签',
      icon: 'iconfont icon-tags-fill',
      text: '探索热门技术标签',
      link: '/tags/',
      class: 'success'
    }
  ];
  
  // 渲染每个特色卡片
  features.forEach(feature => {
    const card = document.createElement('div');
    card.className = `feature-card ${feature.class}`;
    
    card.innerHTML = `
      <div class="icon"><i class="${feature.icon}"></i></div>
      <div class="name">${feature.name}</div>
      <div class="text">${feature.text}</div>
      <a href="${feature.link}" class="link">立即查看</a>
    `;
    
    featuresContainer.appendChild(card);
  });
  
  featuresSection.appendChild(featuresContainer);
  
  // 将特色区域插入到合适的位置
  const mainContent = document.querySelector('.container-fluid');
  const bannerMask = document.querySelector('.banner-mask');
  
  if (mainContent && bannerMask) {
    // 在banner后面插入特色区域
    const bannerParent = bannerMask.parentNode;
    if (bannerParent.parentNode) {
      bannerParent.parentNode.insertBefore(featuresSection, bannerParent.nextSibling);
      console.log('特色区域已插入到banner后面');
    }
  } else {
    console.log('无法找到插入点，特色区域渲染失败');
  }
}

// 渲染首页分类区域
function renderIndexCategories() {
  // 检查是否在首页
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;
  
  console.log('正在渲染首页分类区域...');
  
  // 创建分类区域容器
  const categoriesSection = document.createElement('div');
  categoriesSection.className = 'container index-categories';
  
  // 添加标题
  const title = document.createElement('h2');
  title.className = 'categories-title';
  title.innerHTML = '<i class="iconfont icon-th-large mr-2"></i>热门分类';
  categoriesSection.appendChild(title);
  
  // 创建分类项容器
  const categoriesContainer = document.createElement('div');
  categoriesContainer.className = 'categories-container';
  
  // 模拟数据
  const categories = [
    { name: 'Java', link: '/categories/Java/', count: '5' },
    { name: '前端', link: '/categories/前端/', count: '3' },
    { name: '算法', link: '/categories/算法/', count: '2' },
    { name: '数据库', link: '/categories/数据库/', count: '2' },
    { name: '工具', link: '/categories/工具/', count: '1' },
    { name: '随笔', link: '/categories/随笔/', count: '1' }
  ];
  
  // 渲染每个分类项
  categories.forEach((category, index) => {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    
    categoryItem.innerHTML = `
      <a href="${category.link}" class="name">${category.name}</a>
      <span class="count">${category.count} 篇文章</span>
    `;
    
    // 设置分类标记颜色
    categoryItem.querySelector('a').style.color = `hsl(${index * 30}, 80%, 50%)`;
    categoryItem.style.setProperty('--before-color', `hsl(${index * 30}, 80%, 50%)`);
    categoryItem.style.boxShadow = `0 2px 12px hsla(${index * 30}, 80%, 50%, 0.1)`;
    categoryItem.style.borderLeft = `3px solid hsl(${index * 30}, 80%, 50%)`;
    
    categoriesContainer.appendChild(categoryItem);
  });
  
  categoriesSection.appendChild(categoriesContainer);
  
  // 将分类区域插入到特色区域后面
  const featuresSection = document.querySelector('.index-features');
  
  if (featuresSection) {
    featuresSection.parentNode.insertBefore(categoriesSection, featuresSection.nextSibling);
    console.log('分类区域已插入到特色区域后面');
  } else {
    // 如果找不到特色区域，尝试插入到其他位置
    const mainContent = document.querySelector('.container-fluid');
    const indexPostsHeading = document.querySelector('.index-posts h2');
    
    if (mainContent && indexPostsHeading) {
      const indexPostsContainer = indexPostsHeading.parentNode;
      mainContent.insertBefore(categoriesSection, indexPostsContainer);
      console.log('分类区域已插入到文章列表前面');
    } else {
      console.log('无法找到插入点，分类区域渲染失败');
    }
  }
}

// 增强文章阅读体验函数
function enhanceReadingExperience() {
  // 添加标题锚点链接
  addHeadingAnchors();
  
  // 平滑滚动到锚点
  smoothScrollToAnchor();
  
  // 添加目录高亮
  enhanceTOC();
  
  // 表格增强
  enhanceTables();
}

// 添加标题锚点链接
function addHeadingAnchors() {
  const articleHeadings = document.querySelectorAll('.post-content h2, .post-content h3, .post-content h4');
  
  articleHeadings.forEach(heading => {
    if (!heading.id) {
      // 生成ID
      const id = heading.textContent
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
      
      heading.id = id;
    }
    
    // 已经有锚点的跳过
    if (heading.querySelector('.heading-link')) {
      return;
    }
    
    // 创建锚点链接
    const anchor = document.createElement('a');
    anchor.className = 'heading-link';
    anchor.href = `#${heading.id}`;
    anchor.innerHTML = '<i class="iconfont icon-link"></i>';
    anchor.style.marginLeft = '0.5rem';
    anchor.style.opacity = '0';
    anchor.style.transition = 'opacity 0.2s';
    
    heading.appendChild(anchor);
    
    // 鼠标悬停时显示锚点
    heading.addEventListener('mouseenter', () => {
      anchor.style.opacity = '1';
    });
    
    heading.addEventListener('mouseleave', () => {
      anchor.style.opacity = '0';
    });
  });
}

// 平滑滚动到锚点
function smoothScrollToAnchor() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        window.scrollTo({
          top: targetElement.offsetTop - 80, // 80px的偏移量，避免被导航栏遮挡
          behavior: 'smooth'
        });
        
        // 更新URL，但不滚动
        history.pushState(null, null, targetId);
      }
    });
  });
}

// 增强TOC目录
function enhanceTOC() {
  const toc = document.querySelector('.toc-wrapper');
  if (!toc) return;
  
  // 目录标题添加图标
  const tocTitle = toc.querySelector('.toc-title');
  if (tocTitle) {
    tocTitle.innerHTML = '<i class="iconfont icon-list-ul mr-1"></i>' + tocTitle.textContent;
  }
  
  // 添加目录项动画
  const tocItems = toc.querySelectorAll('.toc-link');
  tocItems.forEach((item, index) => {
    item.style.transition = 'all 0.3s ease';
    item.style.transitionDelay = `${index * 0.03}s`;
    
    item.addEventListener('mouseenter', function() {
      this.style.paddingLeft = '10px';
      this.style.color = 'var(--primary-color)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.paddingLeft = '0px';
      if (!this.classList.contains('active')) {
        this.style.color = '';
      }
    });
  });
}

// 表格增强
function enhanceTables() {
  const tables = document.querySelectorAll('.post-content table');
  
  tables.forEach(table => {
    // 添加响应式容器
    if (!table.parentElement.classList.contains('table-responsive')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      wrapper.style.overflowX = 'auto';
      wrapper.style.width = '100%';
      wrapper.style.marginBottom = '1.5rem';
      
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
    
    // 添加表格hover效果
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      row.style.transition = 'background-color 0.2s';
    });
  });
}

// 修复归档页面样式
function enhanceArchivePage() {
  // 检查是否在归档页面
  const archivePage = document.querySelector('.archive');
  if (!archivePage) return;
  
  // 增强归档页面年份样式
  const years = document.querySelectorAll('.time-section__year');
  years.forEach(year => {
    year.style.position = 'relative';
    year.style.fontWeight = 'bold';
    year.style.display = 'inline-block';
    year.style.marginBottom = '1rem';
    year.style.paddingBottom = '0.5rem';
    
    // 添加下划线
    year.style.position = 'relative';
    if (!year.querySelector('.year-line')) {
      const line = document.createElement('div');
      line.className = 'year-line';
      line.style.position = 'absolute';
      line.style.bottom = '0';
      line.style.left = '0';
      line.style.width = '50px';
      line.style.height = '3px';
      line.style.backgroundColor = 'var(--primary-color)';
      year.appendChild(line);
    }
  });
  
  // 美化归档条目
  const archiveItems = document.querySelectorAll('.archive-item');
  archiveItems.forEach(item => {
    item.style.transition = 'all 0.3s ease';
    
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'translateX(5px)';
      const title = this.querySelector('.archive-item-title');
      if (title) {
        title.style.color = 'var(--primary-color)';
      }
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(0)';
      const title = this.querySelector('.archive-item-title');
      if (title) {
        title.style.color = '';
      }
    });
  });
}

// 增强页面SEO和可访问性
function enhanceSEOAndAccessibility() {
  // 为图片添加 alt 属性
  addImageAltText();
  
  // 为外部链接添加 rel="noopener" 属性
  secureExternalLinks();
  
  // 添加键盘导航支持
  addKeyboardNavigation();
}

// 为图片添加 alt 属性
function addImageAltText() {
  const images = document.querySelectorAll('img:not([alt])');
  
  images.forEach(img => {
    // 从文件名或上下文尝试提取有意义的 alt 文本
    let altText = '';
    
    // 尝试从 src 获取文件名
    if (img.src) {
      const parts = img.src.split('/');
      const filename = parts[parts.length - 1].split('.')[0];
      // 将文件名中的连字符和下划线转换为空格
      altText = filename.replace(/[-_]/g, ' ').trim();
      
      // 如果文件名只是数字或日期格式，查找更有意义的上下文
      if (/^\d+$/.test(altText) || /^\d{4}-\d{2}-\d{2}/.test(altText)) {
        // 尝试从父元素的文本内容获取上下文
        const parentText = img.parentElement.textContent.trim();
        if (parentText && parentText.length < 100) {
          altText = parentText;
        } else {
          // 尝试从上一个标题获取上下文
          let currentNode = img.previousElementSibling;
          while (currentNode) {
            if (/^H[1-6]$/.test(currentNode.tagName)) {
              altText = currentNode.textContent.trim();
              break;
            }
            currentNode = currentNode.previousElementSibling;
          }
        }
      }
    }
    
    if (!altText || altText.length < 2) {
      altText = '图片'; // 默认 alt 文本
    }
    
    img.alt = altText;
    
    // 如果是内容图片，添加 title 属性以显示悬停提示
    if (img.closest('.post-content') || img.closest('.markdown-body')) {
      if (!img.title) {
        img.title = altText;
      }
    }
  });
}

// 为外部链接添加 rel="noopener" 属性
function secureExternalLinks() {
  // 获取当前域名
  const currentDomain = window.location.hostname;
  
  // 查找所有链接
  const links = document.querySelectorAll('a[href^="http"]');
  
  links.forEach(link => {
    // 检查是否是外部链接
    const url = new URL(link.href);
    if (url.hostname !== currentDomain) {
      // 为外部链接添加 rel 属性
      link.rel = 'noopener noreferrer';
      
      // 如果没有 target 属性，添加 _blank
      if (!link.target) {
        link.target = '_blank';
      }
      
      // 为外部链接添加视觉指示
      if (!link.querySelector('.external-link-icon')) {
        const icon = document.createElement('i');
        icon.className = 'iconfont icon-external-link external-link-icon';
        icon.style.fontSize = '0.75em';
        icon.style.marginLeft = '3px';
        icon.setAttribute('aria-hidden', 'true');
        link.appendChild(icon);
      }
    }
  });
}

// 添加键盘导航支持
function addKeyboardNavigation() {
  // 添加键盘导航跳过链接
  if (!document.getElementById('skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.id = 'skip-link';
    skipLink.href = '#content';
    skipLink.textContent = '跳到主要内容';
    skipLink.style.position = 'absolute';
    skipLink.style.top = '-40px';
    skipLink.style.left = '0';
    skipLink.style.padding = '8px';
    skipLink.style.backgroundColor = 'var(--primary-color)';
    skipLink.style.color = '#fff';
    skipLink.style.zIndex = '9999';
    skipLink.style.transition = 'top 0.3s';
    
    // 焦点时显示
    skipLink.addEventListener('focus', function() {
      this.style.top = '0';
    });
    
    // 失去焦点时隐藏
    skipLink.addEventListener('blur', function() {
      this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // 添加主要内容目标点
    const mainContent = document.querySelector('.post-content') || document.querySelector('.index-posts');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'content';
      mainContent.tabIndex = '-1'; // 使其可以接收焦点但不在Tab序列中
    }
  }
  
  // 为可交互元素添加焦点样式
  document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').forEach(el => {
    el.addEventListener('focus', function() {
      this.style.outline = '2px solid var(--primary-color)';
      this.style.outlineOffset = '2px';
    });
    
    el.addEventListener('blur', function() {
      this.style.outline = '';
    });
  });
}

// 修复打字机文字格式问题
function fixTypingText() {
  // 检查是否在首页
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    // 等待打字机元素加载完成
    let checkTypingInterval = setInterval(() => {
      const typingElement = document.querySelector('.typed-cursor');
      if (typingElement) {
        clearInterval(checkTypingInterval);
        
        // 查找并替换可能存在的英文逗号
        const typingContainer = typingElement.parentNode;
        if (typingContainer) {
          // 获取原始配置
          const originalStrings = window.CONFIG.typing.strings || [];
          
          // 重新初始化打字机，确保使用中文顿号
          if (window.typed) {
            window.typed.destroy();
          }
          
          // 应用正确的中文顿号
          const correctedStrings = ["一起学习，一起进步", "分享技术，记录生活", "Stay Hungry, Stay Foolish"];
          
          // 重新创建打字机
          window.typed = new Typed(typingContainer.querySelector('.typed'), {
            strings: correctedStrings,
            typeSpeed: window.CONFIG.typing.typeSpeed || 70,
            backSpeed: window.CONFIG.typing.backSpeed || 40,
            startDelay: window.CONFIG.typing.startDelay || 500,
            loop: window.CONFIG.typing.loop || true,
            showCursor: window.CONFIG.typing.showCursor || true,
            cursorChar: window.CONFIG.typing.cursorChar || '|'
          });
        }
      }
    }, 500);
    
    // 10秒后清除定时器，避免一直检查
    setTimeout(() => {
      clearInterval(checkTypingInterval);
    }, 10000);
  }
}

// 将这些函数添加到window.onload以确保DOM加载完成后执行
window.onload = function() {
  console.log('页面加载完成，开始渲染自定义区域');
  // 渲染首页特色区域
  renderIndexFeatures();
  
  // 渲染首页分类区域
  renderIndexCategories();
}; ;
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
;
// 结构化数据生成器
(function() {
  'use strict';

  // 生成网站结构化数据
  function generateWebsiteSchema() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Uwakeme",
      "alternateName": "Wake的技术博客",
      "url": "https://uwakeme.top",
      "description": "Wake的个人技术博客，专注分享技术知识、学习心得和生活感悟。主要涉及Web开发、后端技术、人工智能等领域的内容。",
      "author": {
        "@type": "Person",
        "name": "Wake",
        "url": "https://uwakeme.top/about/"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Uwakeme",
        "logo": {
          "@type": "ImageObject",
          "url": "https://uwakeme.top/img/favicon.png"
        }
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://uwakeme.top/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
    
    return schema;
  }

  // 生成文章结构化数据
  function generateArticleSchema() {
    const title = document.querySelector('h1.post-title, .post-title h1');
    const content = document.querySelector('.post-content');
    const datePublished = document.querySelector('.post-meta time');
    const categories = document.querySelectorAll('.post-categories a');
    const tags = document.querySelectorAll('.post-tags a');

    if (!title || !content) return null;

    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title.textContent.trim(),
      "description": content.textContent.substring(0, 160).trim() + "...",
      "url": window.location.href,
      "datePublished": datePublished ? datePublished.getAttribute('datetime') : new Date().toISOString(),
      "dateModified": datePublished ? datePublished.getAttribute('datetime') : new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": "Wake",
        "url": "https://uwakeme.top/about/"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Uwakeme",
        "logo": {
          "@type": "ImageObject",
          "url": "https://uwakeme.top/img/favicon.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    };

    // 添加分类信息
    if (categories.length > 0) {
      schema.articleSection = Array.from(categories).map(cat => cat.textContent.trim());
    }

    // 添加标签信息
    if (tags.length > 0) {
      schema.keywords = Array.from(tags).map(tag => tag.textContent.trim()).join(', ');
    }

    // 添加图片信息
    const firstImage = content.querySelector('img');
    if (firstImage) {
      schema.image = {
        "@type": "ImageObject",
        "url": firstImage.src,
        "width": firstImage.naturalWidth || 800,
        "height": firstImage.naturalHeight || 600
      };
    }

    return schema;
  }

  // 生成面包屑导航结构化数据
  function generateBreadcrumbSchema() {
    const breadcrumbs = document.querySelectorAll('.breadcrumb a, .breadcrumb-item a');
    if (breadcrumbs.length === 0) return null;

    const itemListElement = Array.from(breadcrumbs).map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.textContent.trim(),
      "item": breadcrumb.href
    }));

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": itemListElement
    };
  }

  // 生成FAQ结构化数据（如果页面包含FAQ）
  function generateFAQSchema() {
    const faqItems = document.querySelectorAll('.faq-item, .qa-item');
    if (faqItems.length === 0) return null;

    const mainEntity = Array.from(faqItems).map(item => {
      const question = item.querySelector('.question, .q, h3, h4');
      const answer = item.querySelector('.answer, .a, .content');
      
      if (!question || !answer) return null;

      return {
        "@type": "Question",
        "name": question.textContent.trim(),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": answer.textContent.trim()
        }
      };
    }).filter(item => item !== null);

    if (mainEntity.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": mainEntity
    };
  }

  // 插入结构化数据到页面
  function insertStructuredData(schema) {
    if (!schema) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  // 初始化结构化数据
  function initStructuredData() {
    // 网站基础结构化数据
    insertStructuredData(generateWebsiteSchema());

    // 根据页面类型添加相应的结构化数据
    if (document.body.classList.contains('post-page') || document.querySelector('.post-content')) {
      // 文章页面
      insertStructuredData(generateArticleSchema());
    }

    // 面包屑导航
    insertStructuredData(generateBreadcrumbSchema());

    // FAQ页面
    insertStructuredData(generateFAQSchema());
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStructuredData);
  } else {
    initStructuredData();
  }

})();
;
// SEO Meta标签优化
(function() {
  'use strict';

  // 动态生成meta描述
  function generateMetaDescription() {
    const existingMeta = document.querySelector('meta[name="description"]');
    if (existingMeta && existingMeta.content.length > 50) {
      return; // 已有合适的描述
    }

    let description = '';
    
    // 文章页面
    const postContent = document.querySelector('.post-content');
    if (postContent) {
      const textContent = postContent.textContent || postContent.innerText;
      description = textContent.substring(0, 160).trim().replace(/\s+/g, ' ');
    }
    
    // 分类页面
    const categoryTitle = document.querySelector('.category-title, .archive-title');
    if (categoryTitle && !description) {
      description = `浏览${categoryTitle.textContent}分类下的所有文章，包含丰富的技术知识和实践经验分享。`;
    }
    
    // 标签页面
    const tagTitle = document.querySelector('.tag-title');
    if (tagTitle && !description) {
      description = `查看标签"${tagTitle.textContent}"相关的所有文章，深入了解相关技术内容。`;
    }
    
    // 默认描述
    if (!description) {
      description = 'Wake的个人技术博客，专注分享技术知识、学习心得和生活感悟。主要涉及Web开发、后端技术、人工智能等领域的内容。';
    }

    // 更新或创建meta描述
    if (existingMeta) {
      existingMeta.content = description;
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }

  // 生成关键词
  function generateKeywords() {
    const existingMeta = document.querySelector('meta[name="keywords"]');
    let keywords = [];

    // 从标签获取关键词
    const tags = document.querySelectorAll('.post-tags a, .tag-list a');
    tags.forEach(tag => {
      keywords.push(tag.textContent.trim());
    });

    // 从分类获取关键词
    const categories = document.querySelectorAll('.post-categories a, .category-list a');
    categories.forEach(cat => {
      keywords.push(cat.textContent.trim());
    });

    // 从标题提取关键词
    const title = document.querySelector('h1.post-title, .post-title h1, title');
    if (title) {
      const titleText = title.textContent;
      // 提取中文关键词（简单实现）
      const chineseKeywords = titleText.match(/[\u4e00-\u9fa5]{2,}/g);
      if (chineseKeywords) {
        keywords.push(...chineseKeywords);
      }
    }

    // 添加通用关键词
    const commonKeywords = ['技术博客', '编程', '学习笔记', '开发技巧', 'Wake'];
    keywords.push(...commonKeywords);

    // 去重并限制数量
    keywords = [...new Set(keywords)].slice(0, 10);

    if (keywords.length > 0) {
      if (existingMeta) {
        existingMeta.content = keywords.join(', ');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = keywords.join(', ');
        document.head.appendChild(meta);
      }
    }
  }

  // 生成Open Graph标签
  function generateOpenGraphTags() {
    const ogTags = {
      'og:type': 'article',
      'og:site_name': 'Uwakeme',
      'og:locale': 'zh_CN'
    };

    // 获取标题
    const title = document.querySelector('h1.post-title, .post-title h1, title');
    if (title) {
      ogTags['og:title'] = title.textContent.trim();
    }

    // 获取描述
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      ogTags['og:description'] = description.content;
    }

    // 获取URL
    ogTags['og:url'] = window.location.href;

    // 获取图片
    const firstImage = document.querySelector('.post-content img, .featured-image img');
    if (firstImage) {
      ogTags['og:image'] = firstImage.src;
      ogTags['og:image:width'] = firstImage.naturalWidth || 800;
      ogTags['og:image:height'] = firstImage.naturalHeight || 600;
    } else {
      ogTags['og:image'] = 'https://uwakeme.top/img/og-image.png';
    }

    // 创建或更新OG标签
    Object.entries(ogTags).forEach(([property, content]) => {
      let existingTag = document.querySelector(`meta[property="${property}"]`);
      if (existingTag) {
        existingTag.content = content;
      } else {
        const meta = document.createElement('meta');
        meta.property = property;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });
  }

  // 生成Twitter Card标签
  function generateTwitterCardTags() {
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:site': '@uwakeme',
      'twitter:creator': '@uwakeme'
    };

    // 获取标题和描述
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');

    if (ogTitle) twitterTags['twitter:title'] = ogTitle.content;
    if (ogDescription) twitterTags['twitter:description'] = ogDescription.content;
    if (ogImage) twitterTags['twitter:image'] = ogImage.content;

    // 创建或更新Twitter标签
    Object.entries(twitterTags).forEach(([name, content]) => {
      let existingTag = document.querySelector(`meta[name="${name}"]`);
      if (existingTag) {
        existingTag.content = content;
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });
  }

  // 添加canonical链接
  function addCanonicalLink() {
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) return;

    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = window.location.href.split('#')[0].split('?')[0];
    document.head.appendChild(canonical);
  }

  // 添加hreflang标签（如果有多语言版本）
  function addHreflangTags() {
    // 这里可以根据实际情况添加多语言支持
    const hreflang = document.createElement('link');
    hreflang.rel = 'alternate';
    hreflang.hreflang = 'zh-CN';
    hreflang.href = window.location.href;
    document.head.appendChild(hreflang);
  }

  // 初始化SEO优化
  function initSEOOptimization() {
    generateMetaDescription();
    generateKeywords();
    generateOpenGraphTags();
    generateTwitterCardTags();
    addCanonicalLink();
    addHreflangTags();
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSEOOptimization);
  } else {
    initSEOOptimization();
  }

})();
;
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
;
// 相关文章推荐系统
(function() {
  'use strict';

  let allPosts = [];
  let currentPost = null;

  // 获取所有文章数据
  async function loadPostsData() {
    try {
      const response = await fetch('/local-search.xml');
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const entries = xmlDoc.querySelectorAll('entry');

      allPosts = Array.from(entries).map(entry => ({
        title: entry.querySelector('title')?.textContent || '',
        content: entry.querySelector('content')?.textContent || '',
        url: entry.querySelector('url')?.textContent || '',
        categories: entry.querySelector('categories')?.textContent?.split(',').map(c => c.trim()) || [],
        tags: entry.querySelector('tags')?.textContent?.split(',').map(t => t.trim()) || []
      }));

      console.log('文章数据加载完成:', allPosts.length, '篇文章');
    } catch (error) {
      console.error('文章数据加载失败:', error);
    }
  }

  // 获取当前文章信息
  function getCurrentPost() {
    const title = document.querySelector('h1.post-title, .post-title h1')?.textContent?.trim();
    const categories = Array.from(document.querySelectorAll('.post-categories a')).map(a => a.textContent.trim());
    const tags = Array.from(document.querySelectorAll('.post-tags a')).map(a => a.textContent.trim());
    const content = document.querySelector('.post-content')?.textContent || '';

    if (!title) return null;

    return {
      title,
      categories,
      tags,
      content,
      url: window.location.pathname
    };
  }

  // 计算文章相似度
  function calculateSimilarity(post1, post2) {
    let score = 0;

    // 分类匹配（权重最高）
    const commonCategories = post1.categories.filter(cat => 
      post2.categories.some(cat2 => cat2.includes(cat) || cat.includes(cat2))
    );
    score += commonCategories.length * 10;

    // 标签匹配
    const commonTags = post1.tags.filter(tag => 
      post2.tags.some(tag2 => tag2.includes(tag) || tag.includes(tag2))
    );
    score += commonTags.length * 5;

    // 标题关键词匹配
    const title1Words = extractKeywords(post1.title);
    const title2Words = extractKeywords(post2.title);
    const commonTitleWords = title1Words.filter(word => title2Words.includes(word));
    score += commonTitleWords.length * 3;

    // 内容关键词匹配（简化版）
    const content1Keywords = extractKeywords(post1.content.substring(0, 500));
    const content2Keywords = extractKeywords(post2.content.substring(0, 500));
    const commonContentWords = content1Keywords.filter(word => content2Keywords.includes(word));
    score += Math.min(commonContentWords.length, 5) * 1;

    return score;
  }

  // 提取关键词（简化版）
  function extractKeywords(text) {
    if (!text) return [];
    
    // 移除标点符号，分割成词
    const words = text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1);

    // 简单的停用词过滤
    const stopWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
    
    return words.filter(word => !stopWords.includes(word) && word.length > 1);
  }

  // 获取相关文章
  function getRelatedPosts(currentPost, limit = 5) {
    if (!currentPost || allPosts.length === 0) return [];

    const relatedPosts = allPosts
      .filter(post => post.url !== currentPost.url) // 排除当前文章
      .map(post => ({
        ...post,
        similarity: calculateSimilarity(currentPost, post)
      }))
      .filter(post => post.similarity > 0) // 只显示有相关性的文章
      .sort((a, b) => b.similarity - a.similarity) // 按相似度排序
      .slice(0, limit);

    return relatedPosts;
  }

  // 创建相关文章HTML
  function createRelatedPostsHTML(relatedPosts) {
    if (relatedPosts.length === 0) {
      return '<div class="no-related-posts">暂无相关文章</div>';
    }

    return `
      <div class="related-posts-grid">
        ${relatedPosts.map(post => `
          <article class="related-post-item">
            <h3 class="related-post-title">
              <a href="${post.url}" title="${post.title}">${post.title}</a>
            </h3>
            <div class="related-post-meta">
              ${post.categories.length > 0 ? `<span class="category">${post.categories[0]}</span>` : ''}
              <span class="similarity-score">相关度: ${Math.round(post.similarity * 10)}%</span>
            </div>
            <div class="related-post-excerpt">
              ${post.content.substring(0, 100).trim()}...
            </div>
            <div class="related-post-tags">
              ${post.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  // 显示相关文章
  function displayRelatedPosts() {
    const currentPost = getCurrentPost();
    if (!currentPost) return;

    const relatedPosts = getRelatedPosts(currentPost);
    const relatedPostsHTML = createRelatedPostsHTML(relatedPosts);

    // 查找插入位置
    let insertTarget = document.querySelector('.related-posts-container');
    
    if (!insertTarget) {
      // 如果没有专门的容器，在文章末尾创建
      const postContent = document.querySelector('.post-content');
      const postFooter = document.querySelector('.post-footer');
      
      if (postContent) {
        insertTarget = document.createElement('div');
        insertTarget.className = 'related-posts-container';
        
        if (postFooter) {
          postFooter.parentNode.insertBefore(insertTarget, postFooter);
        } else {
          postContent.parentNode.appendChild(insertTarget);
        }
      }
    }

    if (insertTarget) {
      insertTarget.innerHTML = `
        <div class="related-posts-section">
          <h3 class="related-posts-title">
            <i class="fas fa-thumbs-up"></i>
            相关推荐
          </h3>
          ${relatedPostsHTML}
        </div>
      `;
    }
  }

  // 文章阅读统计
  function trackPostReading() {
    const currentPost = getCurrentPost();
    if (!currentPost) return;

    // 记录阅读历史
    const readingHistory = JSON.parse(localStorage.getItem('reading_history') || '[]');
    const postData = {
      title: currentPost.title,
      url: currentPost.url,
      timestamp: Date.now(),
      categories: currentPost.categories,
      tags: currentPost.tags
    };

    // 移除重复记录
    const filteredHistory = readingHistory.filter(item => item.url !== currentPost.url);
    filteredHistory.unshift(postData);

    // 保持最近50篇记录
    const updatedHistory = filteredHistory.slice(0, 50);
    localStorage.setItem('reading_history', JSON.stringify(updatedHistory));

    // 更新阅读偏好
    updateReadingPreferences(currentPost);
  }

  // 更新阅读偏好
  function updateReadingPreferences(post) {
    const preferences = JSON.parse(localStorage.getItem('reading_preferences') || '{}');
    
    // 统计分类偏好
    post.categories.forEach(category => {
      preferences[category] = (preferences[category] || 0) + 1;
    });

    // 统计标签偏好
    post.tags.forEach(tag => {
      preferences[tag] = (preferences[tag] || 0) + 1;
    });

    localStorage.setItem('reading_preferences', JSON.stringify(preferences));
  }

  // 基于阅读偏好推荐文章
  function getPersonalizedRecommendations(limit = 3) {
    const preferences = JSON.parse(localStorage.getItem('reading_preferences') || '{}');
    const readingHistory = JSON.parse(localStorage.getItem('reading_history') || '[]');
    const readUrls = new Set(readingHistory.map(item => item.url));

    if (Object.keys(preferences).length === 0) return [];

    const recommendations = allPosts
      .filter(post => !readUrls.has(post.url)) // 排除已读文章
      .map(post => {
        let score = 0;
        
        // 基于分类偏好评分
        post.categories.forEach(category => {
          score += preferences[category] || 0;
        });
        
        // 基于标签偏好评分
        post.tags.forEach(tag => {
          score += (preferences[tag] || 0) * 0.5;
        });

        return { ...post, score };
      })
      .filter(post => post.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  }

  // 显示个性化推荐
  function displayPersonalizedRecommendations() {
    const recommendations = getPersonalizedRecommendations();
    if (recommendations.length === 0) return;

    const sidebar = document.querySelector('.sidebar, .widget-area');
    if (!sidebar) return;

    const recommendationHTML = `
      <div class="widget personalized-recommendations">
        <h3 class="widget-title">
          <i class="fas fa-star"></i>
          为你推荐
        </h3>
        <div class="recommendation-list">
          ${recommendations.map(post => `
            <div class="recommendation-item">
              <h4><a href="${post.url}">${post.title}</a></h4>
              <div class="recommendation-meta">
                ${post.categories[0] ? `<span class="category">${post.categories[0]}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    sidebar.insertAdjacentHTML('afterbegin', recommendationHTML);
  }

  // 初始化相关文章系统
  async function initRelatedPostsSystem() {
    await loadPostsData();
    
    // 如果是文章页面
    if (document.querySelector('.post-content')) {
      displayRelatedPosts();
      trackPostReading();
    }
    
    // 显示个性化推荐
    displayPersonalizedRecommendations();
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRelatedPostsSystem);
  } else {
    initRelatedPostsSystem();
  }

})();
;
// 标签和分类管理脚本
(function() {
  'use strict';

  let allTags = new Map();
  let allCategories = new Map();

  // 加载标签和分类数据
  async function loadTagsCategoriesData() {
    try {
      const response = await fetch('/local-search.xml');
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const entries = xmlDoc.querySelectorAll('entry');

      entries.forEach(entry => {
        const url = entry.querySelector('url')?.textContent || '';
        const title = entry.querySelector('title')?.textContent || '';
        
        // 处理分类
        const categoriesText = entry.querySelector('categories')?.textContent || '';
        if (categoriesText) {
          categoriesText.split(',').forEach(cat => {
            const category = cat.trim();
            if (category) {
              if (!allCategories.has(category)) {
                allCategories.set(category, []);
              }
              allCategories.get(category).push({ title, url });
            }
          });
        }

        // 处理标签
        const tagsText = entry.querySelector('tags')?.textContent || '';
        if (tagsText) {
          tagsText.split(',').forEach(tag => {
            const tagName = tag.trim();
            if (tagName) {
              if (!allTags.has(tagName)) {
                allTags.set(tagName, []);
              }
              allTags.get(tagName).push({ title, url });
            }
          });
        }
      });

      console.log('标签分类数据加载完成:', allTags.size, '个标签,', allCategories.size, '个分类');
    } catch (error) {
      console.error('标签分类数据加载失败:', error);
    }
  }

  // 增强标签云显示
  function enhanceTagCloud() {
    const tagCloud = document.querySelector('.tag-cloud, .tags-list');
    if (!tagCloud || allTags.size === 0) return;

    // 计算标签权重
    const tagWeights = new Map();
    const maxCount = Math.max(...Array.from(allTags.values()).map(posts => posts.length));
    const minCount = Math.min(...Array.from(allTags.values()).map(posts => posts.length));

    allTags.forEach((posts, tag) => {
      const weight = (posts.length - minCount) / (maxCount - minCount);
      tagWeights.set(tag, weight);
    });

    // 生成增强的标签云HTML
    const sortedTags = Array.from(allTags.entries())
      .sort((a, b) => b[1].length - a[1].length) // 按文章数量排序
      .slice(0, 50); // 限制显示数量

    const tagCloudHTML = sortedTags.map(([tag, posts]) => {
      const weight = tagWeights.get(tag);
      const fontSize = 0.8 + weight * 0.8; // 0.8rem - 1.6rem
      const opacity = 0.6 + weight * 0.4; // 0.6 - 1.0
      
      return `
        <a href="/tags/${encodeURIComponent(tag)}/" 
           class="tag-item enhanced-tag" 
           style="font-size: ${fontSize}rem; opacity: ${opacity};"
           data-count="${posts.length}"
           title="${tag} (${posts.length}篇文章)">
          ${tag}
          <span class="tag-count">${posts.length}</span>
        </a>
      `;
    }).join('');

    tagCloud.innerHTML = `
      <div class="tag-cloud-header">
        <h3>标签云</h3>
        <div class="tag-cloud-controls">
          <button class="tag-sort-btn active" data-sort="count">按数量</button>
          <button class="tag-sort-btn" data-sort="name">按名称</button>
          <button class="tag-sort-btn" data-sort="recent">最近使用</button>
        </div>
      </div>
      <div class="tag-cloud-content">
        ${tagCloudHTML}
      </div>
    `;

    // 添加排序功能
    addTagSortingFeature(tagCloud);
  }

  // 添加标签排序功能
  function addTagSortingFeature(tagCloud) {
    const sortButtons = tagCloud.querySelectorAll('.tag-sort-btn');
    const tagContent = tagCloud.querySelector('.tag-cloud-content');

    sortButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // 更新按钮状态
        sortButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const sortType = btn.dataset.sort;
        let sortedTags;

        switch (sortType) {
          case 'count':
            sortedTags = Array.from(allTags.entries())
              .sort((a, b) => b[1].length - a[1].length);
            break;
          case 'name':
            sortedTags = Array.from(allTags.entries())
              .sort((a, b) => a[0].localeCompare(b[0]));
            break;
          case 'recent':
            // 这里可以根据最近使用时间排序，简化为按名称排序
            sortedTags = Array.from(allTags.entries())
              .sort((a, b) => a[0].localeCompare(b[0]));
            break;
          default:
            sortedTags = Array.from(allTags.entries());
        }

        // 重新生成HTML
        const tagWeights = new Map();
        const maxCount = Math.max(...Array.from(allTags.values()).map(posts => posts.length));
        const minCount = Math.min(...Array.from(allTags.values()).map(posts => posts.length));

        allTags.forEach((posts, tag) => {
          const weight = (posts.length - minCount) / (maxCount - minCount);
          tagWeights.set(tag, weight);
        });

        const newHTML = sortedTags.slice(0, 50).map(([tag, posts]) => {
          const weight = tagWeights.get(tag);
          const fontSize = sortType === 'count' ? 0.8 + weight * 0.8 : 1;
          const opacity = sortType === 'count' ? 0.6 + weight * 0.4 : 1;
          
          return `
            <a href="/tags/${encodeURIComponent(tag)}/" 
               class="tag-item enhanced-tag" 
               style="font-size: ${fontSize}rem; opacity: ${opacity};"
               data-count="${posts.length}"
               title="${tag} (${posts.length}篇文章)">
              ${tag}
              <span class="tag-count">${posts.length}</span>
            </a>
          `;
        }).join('');

        tagContent.innerHTML = newHTML;
      });
    });
  }

  // 增强分类显示
  function enhanceCategories() {
    const categoryList = document.querySelector('.category-list, .categories-list');
    if (!categoryList || allCategories.size === 0) return;

    const sortedCategories = Array.from(allCategories.entries())
      .sort((a, b) => b[1].length - a[1].length);

    const categoryHTML = sortedCategories.map(([category, posts]) => `
      <div class="category-item enhanced-category">
        <a href="/categories/${encodeURIComponent(category)}/" class="category-link">
          <span class="category-name">${category}</span>
          <span class="category-count">${posts.length}</span>
        </a>
        <div class="category-preview">
          ${posts.slice(0, 3).map(post => `
            <a href="${post.url}" class="preview-post" title="${post.title}">
              ${post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
            </a>
          `).join('')}
          ${posts.length > 3 ? `<span class="more-posts">还有${posts.length - 3}篇...</span>` : ''}
        </div>
      </div>
    `).join('');

    categoryList.innerHTML = `
      <div class="category-list-header">
        <h3>文章分类</h3>
      </div>
      <div class="category-list-content">
        ${categoryHTML}
      </div>
    `;
  }

  // 添加标签搜索功能
  function addTagSearch() {
    const tagCloud = document.querySelector('.tag-cloud');
    if (!tagCloud) return;

    const searchHTML = `
      <div class="tag-search-container">
        <input type="text" class="tag-search-input" placeholder="搜索标签...">
        <div class="tag-search-results"></div>
      </div>
    `;

    tagCloud.insertAdjacentHTML('afterbegin', searchHTML);

    const searchInput = tagCloud.querySelector('.tag-search-input');
    const searchResults = tagCloud.querySelector('.tag-search-results');
    const tagContent = tagCloud.querySelector('.tag-cloud-content');

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (query.length === 0) {
          searchResults.style.display = 'none';
          tagContent.style.display = 'block';
          return;
        }

        const matchedTags = Array.from(allTags.entries())
          .filter(([tag]) => tag.toLowerCase().includes(query))
          .slice(0, 10);

        if (matchedTags.length > 0) {
          const resultsHTML = matchedTags.map(([tag, posts]) => `
            <a href="/tags/${encodeURIComponent(tag)}/" class="search-result-tag">
              ${tag} <span class="count">(${posts.length})</span>
            </a>
          `).join('');

          searchResults.innerHTML = resultsHTML;
          searchResults.style.display = 'block';
          tagContent.style.display = 'none';
        } else {
          searchResults.innerHTML = '<div class="no-results">未找到匹配的标签</div>';
          searchResults.style.display = 'block';
          tagContent.style.display = 'none';
        }
      }, 300);
    });

    // 点击外部隐藏搜索结果
    document.addEventListener('click', (e) => {
      if (!tagCloud.contains(e.target)) {
        searchResults.style.display = 'none';
        tagContent.style.display = 'block';
        searchInput.value = '';
      }
    });
  }

  // 添加标签统计信息
  function addTagStatistics() {
    const sidebar = document.querySelector('.sidebar, .widget-area');
    if (!sidebar || allTags.size === 0) return;

    const totalPosts = Array.from(allTags.values()).reduce((sum, posts) => sum + posts.length, 0);
    const avgPostsPerTag = Math.round(totalPosts / allTags.size);
    const mostUsedTag = Array.from(allTags.entries()).reduce((max, current) => 
      current[1].length > max[1].length ? current : max
    );

    const statsHTML = `
      <div class="widget tag-statistics">
        <h3 class="widget-title">
          <i class="fas fa-chart-bar"></i>
          标签统计
        </h3>
        <div class="stats-content">
          <div class="stat-item">
            <span class="stat-label">总标签数</span>
            <span class="stat-value">${allTags.size}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总分类数</span>
            <span class="stat-value">${allCategories.size}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均每标签文章数</span>
            <span class="stat-value">${avgPostsPerTag}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最热门标签</span>
            <span class="stat-value">
              <a href="/tags/${encodeURIComponent(mostUsedTag[0])}/">${mostUsedTag[0]}</a>
              (${mostUsedTag[1].length}篇)
            </span>
          </div>
        </div>
      </div>
    `;

    sidebar.insertAdjacentHTML('beforeend', statsHTML);
  }

  // 初始化标签分类管理
  async function initTagCategoryManager() {
    await loadTagsCategoriesData();
    enhanceTagCloud();
    enhanceCategories();
    addTagSearch();
    addTagStatistics();
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTagCategoryManager);
  } else {
    initTagCategoryManager();
  }

})();
;
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
;
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
;
/*! https://github.com/xiazeyu/live2d-widget.js built@2019-4-6 09:38:17 */
var L2Dwidget=function(t){var n=window.webpackJsonpL2Dwidget;window.webpackJsonpL2Dwidget=function(e,o,i){for(var c,u,a=0,s=[];a<e.length;a++)u=e[a],r[u]&&s.push(r[u][0]),r[u]=0;for(c in o)Object.prototype.hasOwnProperty.call(o,c)&&(t[c]=o[c]);for(n&&n(e,o,i);s.length;)s.shift()()};var e={},r={1:0};function o(n){if(e[n])return e[n].exports;var r=e[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,o),r.l=!0,r.exports}return o.e=function(t){var n=r[t];if(0===n)return new Promise(function(t){t()});if(n)return n[2];var e=new Promise(function(e,o){n=r[t]=[e,o]});n[2]=e;var i=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.charset="utf-8",c.async=!0,c.timeout=12e4,o.nc&&c.setAttribute("nonce",o.nc),c.src=o.p+"L2Dwidget."+t+".min.js";var u=setTimeout(a,12e4);c.onerror=c.onload=a;function a(){c.onerror=c.onload=null,clearTimeout(u);var n=r[t];0!==n&&(n&&n[1](new Error("Loading chunk "+t+" failed.")),r[t]=void 0)}return i.appendChild(c),e},o.m=t,o.c=e,o.d=function(t,n,e){o.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:e})},o.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(n,"a",n),n},o.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},o.p="",o.oe=function(t){throw console.error(t),t},o(o.s=40)}([function(t,n,e){var r=e(24)("wks"),o=e(16),i=e(1).Symbol,c="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=c&&i[t]||(c?i:o)("Symbol."+t))}).store=r},function(t,n){var e=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=e)},function(t,n,e){var r=e(6);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,n,e){var r=e(11),o=e(26);t.exports=e(7)?function(t,n,e){return r.f(t,n,o(1,e))}:function(t,n,e){return t[n]=e,t}},function(t,n){var e=t.exports={version:"2.5.3"};"number"==typeof __e&&(__e=e)},function(t,n,e){var r=e(1),o=e(3),i=e(8),c=e(16)("src"),u="toString",a=Function[u],s=(""+a).split(u);e(4).inspectSource=function(t){return a.call(t)},(t.exports=function(t,n,e,u){var a="function"==typeof e;a&&(i(e,"name")||o(e,"name",n)),t[n]!==e&&(a&&(i(e,c)||o(e,c,t[n]?""+t[n]:s.join(String(n)))),t===r?t[n]=e:u?t[n]?t[n]=e:o(t,n,e):(delete t[n],o(t,n,e)))})(Function.prototype,u,function(){return"function"==typeof this&&this[c]||a.call(this)})},function(t,n){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,n,e){t.exports=!e(25)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,n){var e={}.hasOwnProperty;t.exports=function(t,n){return e.call(t,n)}},function(t,n){t.exports={}},function(t,n){var e={}.toString;t.exports=function(t){return e.call(t).slice(8,-1)}},function(t,n,e){var r=e(2),o=e(43),i=e(44),c=Object.defineProperty;n.f=e(7)?Object.defineProperty:function(t,n,e){if(r(t),n=i(n,!0),r(e),o)try{return c(t,n,e)}catch(t){}if("get"in e||"set"in e)throw TypeError("Accessors not supported!");return"value"in e&&(t[n]=e.value),t}},function(t,n,e){var r=e(1),o=e(4),i=e(3),c=e(5),u=e(13),a="prototype",s=function(t,n,e){var f,l,p,d,v=t&s.F,h=t&s.G,y=t&s.S,m=t&s.P,b=t&s.B,w=h?r:y?r[n]||(r[n]={}):(r[n]||{})[a],g=h?o:o[n]||(o[n]={}),x=g[a]||(g[a]={});h&&(e=n);for(f in e)p=((l=!v&&w&&void 0!==w[f])?w:e)[f],d=b&&l?u(p,r):m&&"function"==typeof p?u(Function.call,p):p,w&&c(w,f,p,t&s.U),g[f]!=p&&i(g,f,d),m&&x[f]!=p&&(x[f]=p)};r.core=o,s.F=1,s.G=2,s.S=4,s.P=8,s.B=16,s.W=32,s.U=64,s.R=128,t.exports=s},function(t,n,e){var r=e(14);t.exports=function(t,n,e){if(r(t),void 0===n)return t;switch(e){case 1:return function(e){return t.call(n,e)};case 2:return function(e,r){return t.call(n,e,r)};case 3:return function(e,r,o){return t.call(n,e,r,o)}}return function(){return t.apply(n,arguments)}}},function(t,n){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,n,e){var r=e(10),o=e(0)("toStringTag"),i="Arguments"==r(function(){return arguments}());t.exports=function(t){var n,e,c;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(e=function(t,n){try{return t[n]}catch(t){}}(n=Object(t),o))?e:i?r(n):"Object"==(c=r(n))&&"function"==typeof n.callee?"Arguments":c}},function(t,n){var e=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++e+r).toString(36))}},function(t,n,e){var r=e(6),o=e(1).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,n){var e=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:e)(t)}},function(t,n){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},function(t,n,e){var r=e(51),o=e(19);t.exports=function(t){return r(o(t))}},function(t,n,e){var r=e(24)("keys"),o=e(16);t.exports=function(t){return r[t]||(r[t]=o(t))}},function(t,n,e){var r=e(11).f,o=e(8),i=e(0)("toStringTag");t.exports=function(t,n,e){t&&!o(t=e?t:t.prototype,i)&&r(t,i,{configurable:!0,value:n})}},function(t,n,e){"use strict";var r=e(14);t.exports.f=function(t){return new function(t){var n,e;this.promise=new t(function(t,r){if(void 0!==n||void 0!==e)throw TypeError("Bad Promise constructor");n=t,e=r}),this.resolve=r(n),this.reject=r(e)}(t)}},function(t,n,e){var r=e(1),o="__core-js_shared__",i=r[o]||(r[o]={});t.exports=function(t){return i[t]||(i[t]={})}},function(t,n){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,n){t.exports=function(t,n){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:n}}},function(t,n,e){"use strict";var r=e(28),o=e(12),i=e(5),c=e(3),u=e(8),a=e(9),s=e(47),f=e(22),l=e(54),p=e(0)("iterator"),d=!([].keys&&"next"in[].keys()),v="values",h=function(){return this};t.exports=function(t,n,e,y,m,b,w){s(e,n,y);var g,x,_,S=function(t){if(!d&&t in O)return O[t];switch(t){case"keys":case v:return function(){return new e(this,t)}}return function(){return new e(this,t)}},k=n+" Iterator",P=m==v,j=!1,O=t.prototype,T=O[p]||O["@@iterator"]||m&&O[m],L=!d&&T||S(m),E=m?P?S("entries"):L:void 0,M="Array"==n?O.entries||T:T;if(M&&(_=l(M.call(new t)))!==Object.prototype&&_.next&&(f(_,k,!0),r||u(_,p)||c(_,p,h)),P&&T&&T.name!==v&&(j=!0,L=function(){return T.call(this)}),r&&!w||!d&&!j&&O[p]||c(O,p,L),a[n]=L,a[k]=h,m)if(g={values:P?L:S(v),keys:b?L:S("keys"),entries:E},w)for(x in g)x in O||i(O,x,g[x]);else o(o.P+o.F*(d||j),n,g);return g}},function(t,n){t.exports=!1},function(t,n,e){var r=e(50),o=e(31);t.exports=Object.keys||function(t){return r(t,o)}},function(t,n,e){var r=e(18),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},function(t,n){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,n,e){var r=e(1).document;t.exports=r&&r.documentElement},function(t,n,e){var r=e(2),o=e(14),i=e(0)("species");t.exports=function(t,n){var e,c=r(t).constructor;return void 0===c||void 0==(e=r(c)[i])?n:o(e)}},function(t,n,e){var r,o,i,c=e(13),u=e(66),a=e(32),s=e(17),f=e(1),l=f.process,p=f.setImmediate,d=f.clearImmediate,v=f.MessageChannel,h=f.Dispatch,y=0,m={},b="onreadystatechange",w=function(){var t=+this;if(m.hasOwnProperty(t)){var n=m[t];delete m[t],n()}},g=function(t){w.call(t.data)};p&&d||(p=function(t){for(var n=[],e=1;arguments.length>e;)n.push(arguments[e++]);return m[++y]=function(){u("function"==typeof t?t:Function(t),n)},r(y),y},d=function(t){delete m[t]},"process"==e(10)(l)?r=function(t){l.nextTick(c(w,t,1))}:h&&h.now?r=function(t){h.now(c(w,t,1))}:v?(i=(o=new v).port2,o.port1.onmessage=g,r=c(i.postMessage,i,1)):f.addEventListener&&"function"==typeof postMessage&&!f.importScripts?(r=function(t){f.postMessage(t+"","*")},f.addEventListener("message",g,!1)):r=b in s("script")?function(t){a.appendChild(s("script"))[b]=function(){a.removeChild(this),w.call(t)}}:function(t){setTimeout(c(w,t,1),0)}),t.exports={set:p,clear:d}},function(t,n){t.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},function(t,n,e){var r=e(2),o=e(6),i=e(23);t.exports=function(t,n){if(r(t),o(n)&&n.constructor===t)return n;var e=i.f(t);return(0,e.resolve)(n),e.promise}},function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.L2Dwidget=void 0;var r,o=function(){function t(t,n){for(var e=0;e<n.length;e++){var r=n[e];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(n,e,r){return e&&t(n.prototype,e),r&&t(n,r),n}}(),i=e(39),c=(r=i,r&&r.__esModule?r:{default:r}),u=e(38);var a=void 0,s=new(function(){function t(){!function(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}(this,t),this.eventHandlers={},this.config=u.config}return o(t,[{key:"on",value:function(t,n){if("function"!=typeof n)throw new TypeError("Event handler is not a function.");return this.eventHandlers[t]||(this.eventHandlers[t]=[]),this.eventHandlers[t].push(n),this}},{key:"emit",value:function(t){for(var n=arguments.length,e=Array(n>1?n-1:0),r=1;r<n;r++)e[r-1]=arguments[r];return this.eventHandlers[t]&&this.eventHandlers[t].forEach(function(t){"function"==typeof t&&t.apply(void 0,e)}),this.eventHandlers["*"]&&this.eventHandlers["*"].forEach(function(n){"function"==typeof n&&n.apply(void 0,[t].concat(e))}),this}},{key:"init",value:function(){var t=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};(0,u.configApplyer)(n),this.emit("config",this.config),!u.config.mobile.show&&c.default.mobile()||e.e(0).then(e.bind(null,76)).then(function(n){(a=n).theRealInit(t)}).catch(function(t){console.error(t)})}},{key:"captureFrame",value:function(t){return a.captureFrame(t)}},{key:"downloadFrame",value:function(){this.captureFrame(function(t){var n=document.createElement("a");document.body.appendChild(n),n.setAttribute("type","hidden"),n.href=t,n.download="live2d.png",n.click()})}}]),t}());n.L2Dwidget=s},function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.config=n.configApplyer=void 0;var r=i(e(74)),o=i(e(75));function i(t){return t&&t.__esModule?t:{default:t}}var c={};n.configApplyer=function(t){(0,o.default)(c,t,r.default)},n.config=c},function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},o=window.device,i={},c=[];window.device=i;var u=window.document.documentElement,a=window.navigator.userAgent.toLowerCase(),s=["googletv","viera","smarttv","internet.tv","netcast","nettv","appletv","boxee","kylo","roku","dlnadoc","roku","pov_tv","hbbtv","ce-html"];i.macos=function(){return f("mac")},i.ios=function(){return i.iphone()||i.ipod()||i.ipad()},i.iphone=function(){return!i.windows()&&f("iphone")},i.ipod=function(){return f("ipod")},i.ipad=function(){return f("ipad")},i.android=function(){return!i.windows()&&f("android")},i.androidPhone=function(){return i.android()&&f("mobile")},i.androidTablet=function(){return i.android()&&!f("mobile")},i.blackberry=function(){return f("blackberry")||f("bb10")||f("rim")},i.blackberryPhone=function(){return i.blackberry()&&!f("tablet")},i.blackberryTablet=function(){return i.blackberry()&&f("tablet")},i.windows=function(){return f("windows")},i.windowsPhone=function(){return i.windows()&&f("phone")},i.windowsTablet=function(){return i.windows()&&f("touch")&&!i.windowsPhone()},i.fxos=function(){return(f("(mobile")||f("(tablet"))&&f(" rv:")},i.fxosPhone=function(){return i.fxos()&&f("mobile")},i.fxosTablet=function(){return i.fxos()&&f("tablet")},i.meego=function(){return f("meego")},i.cordova=function(){return window.cordova&&"file:"===location.protocol},i.nodeWebkit=function(){return"object"===r(window.process)},i.mobile=function(){return i.androidPhone()||i.iphone()||i.ipod()||i.windowsPhone()||i.blackberryPhone()||i.fxosPhone()||i.meego()},i.tablet=function(){return i.ipad()||i.androidTablet()||i.blackberryTablet()||i.windowsTablet()||i.fxosTablet()},i.desktop=function(){return!i.tablet()&&!i.mobile()},i.television=function(){for(var t=0;t<s.length;){if(f(s[t]))return!0;t++}return!1},i.portrait=function(){return window.innerHeight/window.innerWidth>1},i.landscape=function(){return window.innerHeight/window.innerWidth<1},i.noConflict=function(){return window.device=o,this};function f(t){return-1!==a.indexOf(t)}function l(t){return u.className.match(new RegExp(t,"i"))}function p(t){var n=null;l(t)||(n=u.className.replace(/^\s+|\s+$/g,""),u.className=n+" "+t)}function d(t){l(t)&&(u.className=u.className.replace(" "+t,""))}i.ios()?i.ipad()?p("ios ipad tablet"):i.iphone()?p("ios iphone mobile"):i.ipod()&&p("ios ipod mobile"):i.macos()?p("macos desktop"):i.android()?i.androidTablet()?p("android tablet"):p("android mobile"):i.blackberry()?i.blackberryTablet()?p("blackberry tablet"):p("blackberry mobile"):i.windows()?i.windowsTablet()?p("windows tablet"):i.windowsPhone()?p("windows mobile"):p("windows desktop"):i.fxos()?i.fxosTablet()?p("fxos tablet"):p("fxos mobile"):i.meego()?p("meego mobile"):i.nodeWebkit()?p("node-webkit"):i.television()?p("television"):i.desktop()&&p("desktop"),i.cordova()&&p("cordova");function v(){i.landscape()?(d("portrait"),p("landscape"),h("landscape")):(d("landscape"),p("portrait"),h("portrait")),b()}function h(t){for(var n in c)c[n](t)}i.onChangeOrientation=function(t){"function"==typeof t&&c.push(t)};var y="resize";Object.prototype.hasOwnProperty.call(window,"onorientationchange")&&(y="onorientationchange"),window.addEventListener?window.addEventListener(y,v,!1):window.attachEvent?window.attachEvent(y,v):window[y]=v,v();function m(t){for(var n=0;n<t.length;n++)if(i[t[n]]())return t[n];return"unknown"}i.type=m(["mobile","tablet","desktop"]),i.os=m(["ios","iphone","ipad","ipod","android","blackberry","windows","fxos","meego","television"]);function b(){i.orientation=m(["portrait","landscape"])}b(),n.default=i},function(t,n,e){e(41),e(73),t.exports=e(37)},function(t,n,e){e(42),e(45),e(56),e(60),e(71),e(72),t.exports=e(4).Promise},function(t,n,e){"use strict";var r=e(15),o={};o[e(0)("toStringTag")]="z",o+""!="[object z]"&&e(5)(Object.prototype,"toString",function(){return"[object "+r(this)+"]"},!0)},function(t,n,e){t.exports=!e(7)&&!e(25)(function(){return 7!=Object.defineProperty(e(17)("div"),"a",{get:function(){return 7}}).a})},function(t,n,e){var r=e(6);t.exports=function(t,n){if(!r(t))return t;var e,o;if(n&&"function"==typeof(e=t.toString)&&!r(o=e.call(t)))return o;if("function"==typeof(e=t.valueOf)&&!r(o=e.call(t)))return o;if(!n&&"function"==typeof(e=t.toString)&&!r(o=e.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,n,e){"use strict";var r=e(46)(!0);e(27)(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,n=this._t,e=this._i;return e>=n.length?{value:void 0,done:!0}:(t=r(n,e),this._i+=t.length,{value:t,done:!1})})},function(t,n,e){var r=e(18),o=e(19);t.exports=function(t){return function(n,e){var i,c,u=String(o(n)),a=r(e),s=u.length;return a<0||a>=s?t?"":void 0:(i=u.charCodeAt(a))<55296||i>56319||a+1===s||(c=u.charCodeAt(a+1))<56320||c>57343?t?u.charAt(a):i:t?u.slice(a,a+2):c-56320+(i-55296<<10)+65536}}},function(t,n,e){"use strict";var r=e(48),o=e(26),i=e(22),c={};e(3)(c,e(0)("iterator"),function(){return this}),t.exports=function(t,n,e){t.prototype=r(c,{next:o(1,e)}),i(t,n+" Iterator")}},function(t,n,e){var r=e(2),o=e(49),i=e(31),c=e(21)("IE_PROTO"),u=function(){},a="prototype",s=function(){var t,n=e(17)("iframe"),r=i.length;for(n.style.display="none",e(32).appendChild(n),n.src="javascript:",(t=n.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),s=t.F;r--;)delete s[a][i[r]];return s()};t.exports=Object.create||function(t,n){var e;return null!==t?(u[a]=r(t),e=new u,u[a]=null,e[c]=t):e=s(),void 0===n?e:o(e,n)}},function(t,n,e){var r=e(11),o=e(2),i=e(29);t.exports=e(7)?Object.defineProperties:function(t,n){o(t);for(var e,c=i(n),u=c.length,a=0;u>a;)r.f(t,e=c[a++],n[e]);return t}},function(t,n,e){var r=e(8),o=e(20),i=e(52)(!1),c=e(21)("IE_PROTO");t.exports=function(t,n){var e,u=o(t),a=0,s=[];for(e in u)e!=c&&r(u,e)&&s.push(e);for(;n.length>a;)r(u,e=n[a++])&&(~i(s,e)||s.push(e));return s}},function(t,n,e){var r=e(10);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},function(t,n,e){var r=e(20),o=e(30),i=e(53);t.exports=function(t){return function(n,e,c){var u,a=r(n),s=o(a.length),f=i(c,s);if(t&&e!=e){for(;s>f;)if((u=a[f++])!=u)return!0}else for(;s>f;f++)if((t||f in a)&&a[f]===e)return t||f||0;return!t&&-1}}},function(t,n,e){var r=e(18),o=Math.max,i=Math.min;t.exports=function(t,n){return(t=r(t))<0?o(t+n,0):i(t,n)}},function(t,n,e){var r=e(8),o=e(55),i=e(21)("IE_PROTO"),c=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),r(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?c:null}},function(t,n,e){var r=e(19);t.exports=function(t){return Object(r(t))}},function(t,n,e){for(var r=e(57),o=e(29),i=e(5),c=e(1),u=e(3),a=e(9),s=e(0),f=s("iterator"),l=s("toStringTag"),p=a.Array,d={CSSRuleList:!0,CSSStyleDeclaration:!1,CSSValueList:!1,ClientRectList:!1,DOMRectList:!1,DOMStringList:!1,DOMTokenList:!0,DataTransferItemList:!1,FileList:!1,HTMLAllCollection:!1,HTMLCollection:!1,HTMLFormElement:!1,HTMLSelectElement:!1,MediaList:!0,MimeTypeArray:!1,NamedNodeMap:!1,NodeList:!0,PaintRequestList:!1,Plugin:!1,PluginArray:!1,SVGLengthList:!1,SVGNumberList:!1,SVGPathSegList:!1,SVGPointList:!1,SVGStringList:!1,SVGTransformList:!1,SourceBufferList:!1,StyleSheetList:!0,TextTrackCueList:!1,TextTrackList:!1,TouchList:!1},v=o(d),h=0;h<v.length;h++){var y,m=v[h],b=d[m],w=c[m],g=w&&w.prototype;if(g&&(g[f]||u(g,f,p),g[l]||u(g,l,m),a[m]=p,b))for(y in r)g[y]||i(g,y,r[y],!0)}},function(t,n,e){"use strict";var r=e(58),o=e(59),i=e(9),c=e(20);t.exports=e(27)(Array,"Array",function(t,n){this._t=c(t),this._i=0,this._k=n},function(){var t=this._t,n=this._k,e=this._i++;return!t||e>=t.length?(this._t=void 0,o(1)):o(0,"keys"==n?e:"values"==n?t[e]:[e,t[e]])},"values"),i.Arguments=i.Array,r("keys"),r("values"),r("entries")},function(t,n,e){var r=e(0)("unscopables"),o=Array.prototype;void 0==o[r]&&e(3)(o,r,{}),t.exports=function(t){o[r][t]=!0}},function(t,n){t.exports=function(t,n){return{value:n,done:!!t}}},function(t,n,e){"use strict";var r,o,i,c,u=e(28),a=e(1),s=e(13),f=e(15),l=e(12),p=e(6),d=e(14),v=e(61),h=e(62),y=e(33),m=e(34).set,b=e(67)(),w=e(23),g=e(35),x=e(36),_="Promise",S=a.TypeError,k=a.process,P=a[_],j="process"==f(k),O=function(){},T=o=w.f,L=!!function(){try{var t=P.resolve(1),n=(t.constructor={})[e(0)("species")]=function(t){t(O,O)};return(j||"function"==typeof PromiseRejectionEvent)&&t.then(O)instanceof n}catch(t){}}(),E=function(t){var n;return!(!p(t)||"function"!=typeof(n=t.then))&&n},M=function(t,n){if(!t._n){t._n=!0;var e=t._c;b(function(){for(var r=t._v,o=1==t._s,i=0,c=function(n){var e,i,c=o?n.ok:n.fail,u=n.resolve,a=n.reject,s=n.domain;try{c?(o||(2==t._h&&F(t),t._h=1),!0===c?e=r:(s&&s.enter(),e=c(r),s&&s.exit()),e===n.promise?a(S("Promise-chain cycle")):(i=E(e))?i.call(e,u,a):u(e)):a(r)}catch(t){a(t)}};e.length>i;)c(e[i++]);t._c=[],t._n=!1,n&&!t._h&&A(t)})}},A=function(t){m.call(a,function(){var n,e,r,o=t._v,i=C(t);if(i&&(n=g(function(){j?k.emit("unhandledRejection",o,t):(e=a.onunhandledrejection)?e({promise:t,reason:o}):(r=a.console)&&r.error&&r.error("Unhandled promise rejection",o)}),t._h=j||C(t)?2:1),t._a=void 0,i&&n.e)throw n.v})},C=function(t){return 1!==t._h&&0===(t._a||t._c).length},F=function(t){m.call(a,function(){var n;j?k.emit("rejectionHandled",t):(n=a.onrejectionhandled)&&n({promise:t,reason:t._v})})},N=function(t){var n=this;n._d||(n._d=!0,(n=n._w||n)._v=t,n._s=2,n._a||(n._a=n._c.slice()),M(n,!0))},R=function(t){var n,e=this;if(!e._d){e._d=!0,e=e._w||e;try{if(e===t)throw S("Promise can't be resolved itself");(n=E(t))?b(function(){var r={_w:e,_d:!1};try{n.call(t,s(R,r,1),s(N,r,1))}catch(t){N.call(r,t)}}):(e._v=t,e._s=1,M(e,!1))}catch(t){N.call({_w:e,_d:!1},t)}}};L||(P=function(t){v(this,P,_,"_h"),d(t),r.call(this);try{t(s(R,this,1),s(N,this,1))}catch(t){N.call(this,t)}},(r=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1}).prototype=e(68)(P.prototype,{then:function(t,n){var e=T(y(this,P));return e.ok="function"!=typeof t||t,e.fail="function"==typeof n&&n,e.domain=j?k.domain:void 0,this._c.push(e),this._a&&this._a.push(e),this._s&&M(this,!1),e.promise},catch:function(t){return this.then(void 0,t)}}),i=function(){var t=new r;this.promise=t,this.resolve=s(R,t,1),this.reject=s(N,t,1)},w.f=T=function(t){return t===P||t===c?new i(t):o(t)}),l(l.G+l.W+l.F*!L,{Promise:P}),e(22)(P,_),e(69)(_),c=e(4)[_],l(l.S+l.F*!L,_,{reject:function(t){var n=T(this);return(0,n.reject)(t),n.promise}}),l(l.S+l.F*(u||!L),_,{resolve:function(t){return x(u&&this===c?P:this,t)}}),l(l.S+l.F*!(L&&e(70)(function(t){P.all(t).catch(O)})),_,{all:function(t){var n=this,e=T(n),r=e.resolve,o=e.reject,i=g(function(){var e=[],i=0,c=1;h(t,!1,function(t){var u=i++,a=!1;e.push(void 0),c++,n.resolve(t).then(function(t){a||(a=!0,e[u]=t,--c||r(e))},o)}),--c||r(e)});return i.e&&o(i.v),e.promise},race:function(t){var n=this,e=T(n),r=e.reject,o=g(function(){h(t,!1,function(t){n.resolve(t).then(e.resolve,r)})});return o.e&&r(o.v),e.promise}})},function(t,n){t.exports=function(t,n,e,r){if(!(t instanceof n)||void 0!==r&&r in t)throw TypeError(e+": incorrect invocation!");return t}},function(t,n,e){var r=e(13),o=e(63),i=e(64),c=e(2),u=e(30),a=e(65),s={},f={};(n=t.exports=function(t,n,e,l,p){var d,v,h,y,m=p?function(){return t}:a(t),b=r(e,l,n?2:1),w=0;if("function"!=typeof m)throw TypeError(t+" is not iterable!");if(i(m)){for(d=u(t.length);d>w;w++)if((y=n?b(c(v=t[w])[0],v[1]):b(t[w]))===s||y===f)return y}else for(h=m.call(t);!(v=h.next()).done;)if((y=o(h,b,v.value,n))===s||y===f)return y}).BREAK=s,n.RETURN=f},function(t,n,e){var r=e(2);t.exports=function(t,n,e,o){try{return o?n(r(e)[0],e[1]):n(e)}catch(n){var i=t.return;throw void 0!==i&&r(i.call(t)),n}}},function(t,n,e){var r=e(9),o=e(0)("iterator"),i=Array.prototype;t.exports=function(t){return void 0!==t&&(r.Array===t||i[o]===t)}},function(t,n,e){var r=e(15),o=e(0)("iterator"),i=e(9);t.exports=e(4).getIteratorMethod=function(t){if(void 0!=t)return t[o]||t["@@iterator"]||i[r(t)]}},function(t,n){t.exports=function(t,n,e){var r=void 0===e;switch(n.length){case 0:return r?t():t.call(e);case 1:return r?t(n[0]):t.call(e,n[0]);case 2:return r?t(n[0],n[1]):t.call(e,n[0],n[1]);case 3:return r?t(n[0],n[1],n[2]):t.call(e,n[0],n[1],n[2]);case 4:return r?t(n[0],n[1],n[2],n[3]):t.call(e,n[0],n[1],n[2],n[3])}return t.apply(e,n)}},function(t,n,e){var r=e(1),o=e(34).set,i=r.MutationObserver||r.WebKitMutationObserver,c=r.process,u=r.Promise,a="process"==e(10)(c);t.exports=function(){var t,n,e,s=function(){var r,o;for(a&&(r=c.domain)&&r.exit();t;){o=t.fn,t=t.next;try{o()}catch(r){throw t?e():n=void 0,r}}n=void 0,r&&r.enter()};if(a)e=function(){c.nextTick(s)};else if(!i||r.navigator&&r.navigator.standalone)if(u&&u.resolve){var f=u.resolve();e=function(){f.then(s)}}else e=function(){o.call(r,s)};else{var l=!0,p=document.createTextNode("");new i(s).observe(p,{characterData:!0}),e=function(){p.data=l=!l}}return function(r){var o={fn:r,next:void 0};n&&(n.next=o),t||(t=o,e()),n=o}}},function(t,n,e){var r=e(5);t.exports=function(t,n,e){for(var o in n)r(t,o,n[o],e);return t}},function(t,n,e){"use strict";var r=e(1),o=e(11),i=e(7),c=e(0)("species");t.exports=function(t){var n=r[t];i&&n&&!n[c]&&o.f(n,c,{configurable:!0,get:function(){return this}})}},function(t,n,e){var r=e(0)("iterator"),o=!1;try{var i=[7][r]();i.return=function(){o=!0},Array.from(i,function(){throw 2})}catch(t){}t.exports=function(t,n){if(!n&&!o)return!1;var e=!1;try{var i=[7],c=i[r]();c.next=function(){return{done:e=!0}},i[r]=function(){return c},t(i)}catch(t){}return e}},function(t,n,e){"use strict";var r=e(12),o=e(4),i=e(1),c=e(33),u=e(36);r(r.P+r.R,"Promise",{finally:function(t){var n=c(this,o.Promise||i.Promise),e="function"==typeof t;return this.then(e?function(e){return u(n,t()).then(function(){return e})}:t,e?function(e){return u(n,t()).then(function(){throw e})}:t)}})},function(t,n,e){"use strict";var r=e(12),o=e(23),i=e(35);r(r.S,"Promise",{try:function(t){var n=o.f(this),e=i(t);return(e.e?n.reject:n.resolve)(e.v),n.promise}})},function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0});function r(){try{return document.currentScript.src}catch(n){var t=document.getElementsByTagName("script");return t[t.length-1].src}}e.p=r().replace(/[^/\\\\]+$/,""),n.getCurrentPath=r},function(t,n,e){"use strict";t.exports={model:{jsonPath:"https://unpkg.com/live2d-widget-model-shizuku@latest/assets/shizuku.model.json",scale:1},display:{superSample:2,width:200,height:400,position:"right",hOffset:0,vOffset:-20},mobile:{show:!0,scale:.8,motion:!0},name:{canvas:"live2dcanvas",div:"live2d-widget"},react:{opacity:1},dev:{border:!1},dialog:{enable:!1,hitokoto:!1}}},function(t,n,e){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};t.exports=function t(n,e){n=n||{};function o(n,e){for(var o in e)if(e.hasOwnProperty(o)){var i=e[o];if("__proto__"===o)continue;var c=n[o];null==c?n[o]=i:"object"===(void 0===c?"undefined":r(c))&&null!==c&&"object"===(void 0===i?"undefined":r(i))&&null!==i&&t(c,i)}}for(var i=arguments.length,c=0;c<i;){var u=arguments[c++];u&&o(n,u)}return n}}]).L2Dwidget;
//# sourceMappingURL=L2Dwidget.min.js.map