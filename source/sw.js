// Service Worker for caching optimization
const CACHE_NAME = 'uwakeme-blog-v1.0';
const urlsToCache = [
  '/',
  '/css/custom.css',
  '/css/performance.css',
  '/js/custom.js',
  '/js/performance.js',
  '/img/favicon.png',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@latest/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/jquery@latest/dist/jquery.min.js'
];

// 安装事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活事件
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有响应，返回缓存的版本
        if (response) {
          return response;
        }

        // 否则，发起网络请求
        return fetch(event.request).then(response => {
          // 检查是否收到有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// 后台同步
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // 执行后台同步任务
  return Promise.resolve();
}

// 推送通知
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '新文章发布了！',
    icon: '/img/favicon.png',
    badge: '/img/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看文章',
        icon: '/img/checkmark.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/img/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Uwakeme Blog', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
