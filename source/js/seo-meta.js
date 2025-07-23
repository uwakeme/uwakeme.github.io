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
