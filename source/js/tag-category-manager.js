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
