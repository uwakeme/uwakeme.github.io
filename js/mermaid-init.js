// Mermaid 图表初始化脚本
(function() {
  'use strict';

  // 检查是否已经加载了 Mermaid
  if (typeof mermaid !== 'undefined') {
    initMermaid();
    return;
  }

  // 动态加载 Mermaid
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
  script.onload = function() {
    initMermaid();
  };
  script.onerror = function() {
    console.error('Failed to load Mermaid library');
  };
  document.head.appendChild(script);

  function initMermaid() {
    // 配置 Mermaid
    const config = {
      startOnLoad: false,
      theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
      themeVariables: {
        primaryColor: '#49b1f5',
        primaryTextColor: '#333',
        primaryBorderColor: '#49b1f5',
        lineColor: '#666',
        secondaryColor: '#f8f9fa',
        tertiaryColor: '#e9ecef'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35
      },
      gantt: {
        useMaxWidth: true,
        barHeight: 20,
        fontSize: 11,
        fontFamily: '"Open Sans", sans-serif',
        numberSectionStyles: 4,
        axisFormat: '%Y-%m-%d'
      }
    };

    mermaid.initialize(config);

    // 渲染所有 Mermaid 图表
    renderMermaidDiagrams();

    // 监听主题变化
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
          config.theme = newTheme;
          mermaid.initialize(config);
          renderMermaidDiagrams();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  function renderMermaidDiagrams() {
    // 查找所有 Mermaid 代码块
    const mermaidBlocks = document.querySelectorAll('code.language-mermaid, pre code.mermaid, .mermaid');
    
    mermaidBlocks.forEach((block, index) => {
      // 避免重复渲染
      if (block.classList.contains('mermaid-rendered')) {
        return;
      }

      let mermaidCode = '';
      
      // 获取 Mermaid 代码
      if (block.tagName === 'CODE') {
        mermaidCode = block.textContent || block.innerText;
        
        // 创建容器
        const container = document.createElement('div');
        container.className = 'mermaid-container';
        container.style.cssText = `
          text-align: center;
          margin: 20px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        `;
        
        // 创建 Mermaid 元素
        const mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        mermaidDiv.textContent = mermaidCode;
        
        container.appendChild(mermaidDiv);
        
        // 替换原来的代码块
        const pre = block.closest('pre');
        if (pre) {
          pre.parentNode.replaceChild(container, pre);
        } else {
          block.parentNode.replaceChild(container, block);
        }
        
        block.classList.add('mermaid-rendered');
      } else if (block.classList.contains('mermaid')) {
        mermaidCode = block.textContent || block.innerText;
        block.classList.add('mermaid-rendered');
      }

      // 渲染图表
      if (mermaidCode.trim()) {
        try {
          const id = 'mermaid-' + Date.now() + '-' + index;
          
          mermaid.render(id, mermaidCode).then(({svg}) => {
            const targetElement = block.classList.contains('mermaid') ? block : 
                                 document.querySelector('.mermaid-container:last-of-type .mermaid');
            
            if (targetElement) {
              targetElement.innerHTML = svg;
              
              // 添加响应式样式
              const svgElement = targetElement.querySelector('svg');
              if (svgElement) {
                svgElement.style.maxWidth = '100%';
                svgElement.style.height = 'auto';
              }
            }
          }).catch(error => {
            console.error('Mermaid rendering error:', error);
            
            // 显示错误信息
            const errorDiv = document.createElement('div');
            errorDiv.className = 'mermaid-error';
            errorDiv.style.cssText = `
              color: #dc3545;
              background: #f8d7da;
              border: 1px solid #f5c6cb;
              border-radius: 4px;
              padding: 10px;
              margin: 10px 0;
              font-family: monospace;
            `;
            errorDiv.innerHTML = `
              <strong>Mermaid 渲染错误:</strong><br>
              <code>${error.message}</code><br>
              <details>
                <summary>原始代码</summary>
                <pre>${mermaidCode}</pre>
              </details>
            `;
            
            const targetElement = block.classList.contains('mermaid') ? block : 
                                 document.querySelector('.mermaid-container:last-of-type .mermaid');
            
            if (targetElement) {
              targetElement.parentNode.replaceChild(errorDiv, targetElement);
            }
          });
        } catch (error) {
          console.error('Mermaid initialization error:', error);
        }
      }
    });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // 延迟一点时间确保其他脚本加载完成
      setTimeout(() => {
        if (typeof mermaid === 'undefined') {
          // 如果还没有加载，手动加载
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
          script.onload = initMermaid;
          document.head.appendChild(script);
        } else {
          initMermaid();
        }
      }, 500);
    });
  } else {
    setTimeout(() => {
      if (typeof mermaid === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
        script.onload = initMermaid;
        document.head.appendChild(script);
      } else {
        initMermaid();
      }
    }, 500);
  }

})();
