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
