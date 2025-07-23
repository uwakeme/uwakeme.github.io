---
title: 分类
date: 2025-07-22 09:40:13
type: "categories"
top_img: false
aside: true
---

<div id="categories-page-container">
  <div class="categories-header">
    <h1 class="categories-title">
      <i class="fas fa-folder-open"></i>
      文章分类
    </h1>
    <p class="categories-subtitle">探索不同主题的技术文章</p>
  </div>

  <div class="categories-stats">
    <div class="stat-item">
      <span class="stat-number" id="total-categories">0</span>
      <span class="stat-label">个分类</span>
    </div>
    <div class="stat-item">
      <span class="stat-number" id="total-posts">0</span>
      <span class="stat-label">篇文章</span>
    </div>
  </div>

  <div class="categories-grid" id="categories-grid">
    <!-- 分类卡片将通过JavaScript动态生成 -->
  </div>
</div>

<style>
/* 分类页面专用样式 */
#categories-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.categories-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  position: relative;
  overflow: hidden;
}

.categories-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.categories-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  position: relative;
  z-index: 1;
}

.categories-title i {
  margin-right: 15px;
  color: #ffd700;
}

.categories-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  position: relative;
  z-index: 1;
}

.categories-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.category-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--category-color, #667eea);
  transition: height 0.3s ease;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.15);
}

.category-card:hover::before {
  height: 8px;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.category-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 1.2rem;
  color: white;
  background: var(--category-color, #667eea);
}

.category-count {
  background: var(--category-color, #667eea);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.category-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 15px;
}

.category-posts {
  margin-top: 20px;
}

.category-posts-title {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.category-posts-title::before {
  content: '';
  width: 20px;
  height: 2px;
  background: var(--category-color, #667eea);
  margin-right: 8px;
  border-radius: 1px;
}

.recent-posts {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fafafa;
  border-radius: 12px;
  padding: 15px;
  border: 1px solid #f0f0f0;
}

.recent-post-item {
  padding: 12px 15px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.recent-post-item:last-child {
  margin-bottom: 0;
}

.recent-post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-color: var(--category-color, #667eea);
}

.recent-post-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--category-color, #667eea);
  border-radius: 0 3px 3px 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.recent-post-item:hover::before {
  opacity: 1;
}

.recent-post-link {
  color: #333;
  text-decoration: none;
  font-size: 0.9rem;
  line-height: 1.5;
  display: block;
  font-weight: 500;
  transition: color 0.3s ease;
}

.recent-post-link:hover {
  color: var(--category-color, #667eea);
}

.recent-post-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.8rem;
  color: #999;
}

.post-date {
  display: flex;
  align-items: center;
}

.post-date i {
  margin-right: 4px;
}

.post-tags {
  display: flex;
  gap: 4px;
}

.post-tag {
  background: rgba(102, 126, 234, 0.1);
  color: var(--category-color, #667eea);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  color: var(--category-color, #667eea);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 10px;
  transition: all 0.2s ease;
}

.view-all-link:hover {
  transform: translateX(3px);
}

.view-all-link i {
  margin-left: 5px;
  font-size: 0.8rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #categories-page-container {
    padding: 15px;
  }

  .categories-header {
    padding: 30px 20px;
    margin-bottom: 30px;
  }

  .categories-title {
    font-size: 2rem;
  }

  .categories-stats {
    gap: 20px;
    padding: 15px;
  }

  .stat-number {
    font-size: 2rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .category-card {
    padding: 20px;
  }
}

/* 暗色主题适配 */
[data-theme="dark"] #categories-page-container {
  color: #e1e1e1;
}

[data-theme="dark"] .categories-stats {
  background: #1e1e1e;
  border: 1px solid #333;
}

[data-theme="dark"] .category-card {
  background: #1e1e1e;
  border-color: #333;
}

[data-theme="dark"] .category-name {
  color: #e1e1e1;
}

[data-theme="dark"] .category-description {
  color: #aaa;
}

[data-theme="dark"] .recent-post-link {
  color: #ccc;
}

[data-theme="dark"] .recent-post-item {
  border-bottom-color: #333;
}

[data-theme="dark"] .recent-post-item:hover {
  background: #2a2a2a;
}
</style>
