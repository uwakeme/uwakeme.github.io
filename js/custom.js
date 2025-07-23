// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 创建页面加载动画 - 已移除
  // createPageLoading();
  
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
}; 