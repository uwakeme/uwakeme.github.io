# AGENTS.md - Hexo Blog Project Guidelines

## Project Overview

This is a Hexo-based static blog project using the Butterfly theme. It focuses on technical content sharing across various domains including Java, AI, frontend, backend, and more.

- **Framework**: Hexo 7.3.0
- **Theme**: Butterfly 5.4.2
- **Language**: Chinese (zh-CN)
- **Node.js**: Required for build process

## Build Commands

```bash
# Development
npm run server          # Start local dev server at http://localhost:4000
npm run server:debug    # Start with debug mode

# Build
npm run build           # Generate static site
npm run build:prod      # Clean and build for production
npm run clean           # Clean generated files

# Deployment
npm run deploy          # Deploy to GitHub Pages
npm run optimize        # Clean + build for production

# Utilities
npm run publish         # Publish a draft post
npm run wechat          # WeChat-specific publishing
npm run analyze         # Build with analysis
npm run lighthouse      # Run Lighthouse audit
```

## Project Structure

```
hexo_blog/
├── source/_posts/      # Blog posts organized by category folders
│   ├── Java/           # Java-related articles
│   ├── AI/             # AI/ML articles
│   ├── 前端/            # Frontend articles
│   ├── 后端/            # Backend articles
│   └── ...
├── themes/             # Theme files (butterfly)
├── scaffolds/          # Post templates
├── _config.yml         # Main Hexo config
├── _config.butterfly.yml  # Theme config
└── _config.production.yml # Production overrides
```

## Content Style Guidelines

### Frontmatter Format

```yaml
---
title: 【分类】具体标题
categories: 分类
date: yyyy-MM-dd HH:mm:ss
tags:
  - 标签1
  - 标签2
series: 
cover: 
---
```

### Document Structure

- **Level 1**: Chinese numerals (一、二、三)
- **Level 2**: Chinese parentheses (（一）、（二）、（三）)
- **Level 3+**: Numbers (1、2、3) or letters (a、b、c)

### Categories

Use these standard categories in title format `【分类】标题`:
- 【LINUX】Linux system content
- 【Java】Java programming
- 【学习】Learning notes
- 【BUG】Problem solving
- 【数据库】Database content
- 【前端】Frontend development
- 【算法】Algorithms
- 【博客】Blog-related
- 【后端】Backend development
- 【AI】Artificial Intelligence
- 【求职】Career/job hunting
- 【大数据】Big data

### Writing Style

- Use first-person ("笔者") perspective
- Clear, professional technical language
- Explain unfamiliar concepts with analogies
- Avoid outdated technologies
- Include detailed Chinese comments in all code blocks

### Code Block Guidelines

**Include in code blocks:**
- Actual code (Java, Kotlin, JS, Python, etc.)
- Config files (XML, JSON, YAML)
- Directory structures
- Commands and SQL

**Do NOT include in code blocks:**
- Step-by-step instructions
- Installation guides
- Pure text explanations
- Concept descriptions

### Code Comments

```java
// Stream API: Java 8 functional programming, similar to JS array methods
List<String> filtered = list.stream()
    .filter(s -> s.contains("a"))  // Filter elements containing 'a'
    .collect(Collectors.toList()); // Collect to new list
```

## Creating New Posts

### Using Hexo CLI

```bash
# Create new post
hexo new "【分类】文章标题"

# Create draft
hexo new draft "文章标题"

# Publish draft
hexo publish "文章标题"
```

### Post Template (scaffolds/post.md)

```yaml
---
title: {{ title }}
date: {{ date }}
tags:
---
```

## Theme Features

The Butterfly theme supports:
- **Buttons**: Use markdown button syntax
- **Series**: Group related articles
- **Mermaid diagrams**: Flowcharts, sequence diagrams
- **Lazy loading**: Images load on scroll
- **Local search**: Full-text search capability
- **Code highlighting**: highlight.js with line numbers

## SEO & Performance

- Sitemap auto-generated at `/sitemap.xml`
- RSS feed at `/atom.xml`
- Canonical links enabled
- Open Graph meta tags
- Image lazy loading enabled
- Structured data (BlogPosting)

## Deployment

Deploys to GitHub Pages via:
```bash
npm run deploy
```

Configured in `_config.yml`:
```yaml
deploy:
  type: 'git'
  repo: 'https://github.com/uwakeme/uwakeme.github.io.git'
  branch: 'master'
```

## Quick Deployment Script

Use `./hexo.sh` for one-click deployment (runs clean, generate, deploy).

## Important Notes

1. **Memory**: Build uses `--max-old-space-size=8192` for large sites
2. **Theme**: Config is split between `_config.yml` and `_config.butterfly.yml`
3. **Images**: Use `post_asset_folder: true` - images go in post-specific folders
4. **Comments**: All code must have detailed Chinese comments explaining functionality
5. **References**: Always cite sources at the end of articles
