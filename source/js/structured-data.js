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
