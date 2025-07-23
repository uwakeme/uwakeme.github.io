// 增强搜索功能
(function() {
  'use strict';

  let searchData = [];
  let searchIndex = null;

  // 初始化搜索数据
  async function initSearchData() {
    try {
      const response = await fetch('/local-search.xml');
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const entries = xmlDoc.querySelectorAll('entry');

      searchData = Array.from(entries).map(entry => ({
        title: entry.querySelector('title')?.textContent || '',
        content: entry.querySelector('content')?.textContent || '',
        url: entry.querySelector('url')?.textContent || '',
        categories: entry.querySelector('categories')?.textContent || '',
        tags: entry.querySelector('tags')?.textContent || ''
      }));

      console.log('搜索数据加载完成:', searchData.length, '篇文章');
    } catch (error) {
      console.error('搜索数据加载失败:', error);
    }
  }

  // 搜索函数
  function performSearch(query) {
    if (!query || query.length < 2) return [];

    const results = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);

    searchData.forEach(item => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const contentLower = item.content.toLowerCase();
      const categoriesLower = item.categories.toLowerCase();
      const tagsLower = item.tags.toLowerCase();

      // 标题匹配权重最高
      queryWords.forEach(word => {
        if (titleLower.includes(word)) {
          score += 10;
        }
        if (categoriesLower.includes(word)) {
          score += 5;
        }
        if (tagsLower.includes(word)) {
          score += 3;
        }
        if (contentLower.includes(word)) {
          score += 1;
        }
      });

      // 完整查询匹配
      if (titleLower.includes(queryLower)) {
        score += 20;
      }
      if (contentLower.includes(queryLower)) {
        score += 5;
      }

      if (score > 0) {
        results.push({
          ...item,
          score,
          highlight: highlightText(item.title, query),
          excerpt: generateExcerpt(item.content, query)
        });
      }
    });

    return results.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  // 高亮文本
  function highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // 生成摘要
  function generateExcerpt(content, query, maxLength = 150) {
    if (!content) return '';
    
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const index = contentLower.indexOf(queryLower);
    
    let start = 0;
    if (index !== -1) {
      start = Math.max(0, index - 50);
    }
    
    let excerpt = content.substring(start, start + maxLength);
    if (start > 0) excerpt = '...' + excerpt;
    if (start + maxLength < content.length) excerpt += '...';
    
    return highlightText(excerpt, query);
  }

  // 创建搜索结果HTML
  function createSearchResultHTML(results) {
    if (results.length === 0) {
      return '<div class="search-no-results">未找到相关内容</div>';
    }

    return results.map(result => `
      <div class="search-result-item">
        <h3 class="search-result-title">
          <a href="${result.url}">${result.highlight}</a>
        </h3>
        <div class="search-result-excerpt">${result.excerpt}</div>
        <div class="search-result-meta">
          ${result.categories ? `<span class="category">${result.categories}</span>` : ''}
          ${result.tags ? `<span class="tags">${result.tags}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  // 搜索建议功能
  function generateSearchSuggestions(query) {
    if (!query || query.length < 2) return [];

    const suggestions = new Set();
    const queryLower = query.toLowerCase();

    searchData.forEach(item => {
      // 从标题提取建议
      const titleWords = item.title.toLowerCase().split(/\s+/);
      titleWords.forEach(word => {
        if (word.includes(queryLower) && word.length > 2) {
          suggestions.add(word);
        }
      });

      // 从标签提取建议
      if (item.tags) {
        const tags = item.tags.toLowerCase().split(',');
        tags.forEach(tag => {
          const cleanTag = tag.trim();
          if (cleanTag.includes(queryLower) && cleanTag.length > 1) {
            suggestions.add(cleanTag);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }

  // 搜索历史管理
  const searchHistory = {
    key: 'blog_search_history',
    maxItems: 10,

    get() {
      try {
        return JSON.parse(localStorage.getItem(this.key) || '[]');
      } catch {
        return [];
      }
    },

    add(query) {
      if (!query || query.length < 2) return;
      
      let history = this.get();
      history = history.filter(item => item !== query);
      history.unshift(query);
      history = history.slice(0, this.maxItems);
      
      localStorage.setItem(this.key, JSON.stringify(history));
    },

    clear() {
      localStorage.removeItem(this.key);
    }
  };

  // 增强搜索框功能
  function enhanceSearchBox() {
    const searchInput = document.querySelector('#local-search-input, .search-input');
    const searchResults = document.querySelector('#local-search-result, .search-results');
    
    if (!searchInput) return;

    let searchTimeout;

    // 实时搜索
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.trim();
      
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (query.length >= 2) {
          const results = performSearch(query);
          if (searchResults) {
            searchResults.innerHTML = createSearchResultHTML(results);
          }
        } else {
          if (searchResults) {
            searchResults.innerHTML = '';
          }
        }
      }, 300);
    });

    // 搜索提交
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
          searchHistory.add(query);
          // 这里可以添加搜索统计
        }
      }
    });

    // 搜索建议
    const suggestionContainer = document.createElement('div');
    suggestionContainer.className = 'search-suggestions';
    searchInput.parentNode.appendChild(suggestionContainer);

    searchInput.addEventListener('focus', function() {
      const history = searchHistory.get();
      if (history.length > 0) {
        suggestionContainer.innerHTML = `
          <div class="suggestion-section">
            <div class="suggestion-title">搜索历史</div>
            ${history.map(item => `<div class="suggestion-item" data-query="${item}">${item}</div>`).join('')}
          </div>
        `;
        suggestionContainer.style.display = 'block';
      }
    });

    // 点击建议项
    suggestionContainer.addEventListener('click', function(e) {
      if (e.target.classList.contains('suggestion-item')) {
        const query = e.target.dataset.query;
        searchInput.value = query;
        searchInput.dispatchEvent(new Event('input'));
        suggestionContainer.style.display = 'none';
      }
    });

    // 点击外部隐藏建议
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !suggestionContainer.contains(e.target)) {
        suggestionContainer.style.display = 'none';
      }
    });
  }

  // 初始化
  async function initEnhancedSearch() {
    await initSearchData();
    enhanceSearchBox();
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancedSearch);
  } else {
    initEnhancedSearch();
  }

})();
