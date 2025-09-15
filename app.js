
// 配置信息
const config = {
    repoOwner: '1ningbo1',
    repoName: 'blog',
    postsPath: 'posts',
    postsPerPage: 5,
    cdnBaseUrl: 'https://cdn.jsdelivr.net/gh', // 使用jsDelivr CDN
    fallbackUrl: 'https://raw.githubusercontent.com' // 备用原始地址
};

// 全局变量
let allPosts = [];
let currentPage = 1;
let searchIndex = [];
let categories = {};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 移动端菜单切换
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });

    // 初始化分页事件
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPosts();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(allPosts.length / config.postsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderPosts();
        }
    });

    // 加载文章数据
    await loadPosts();
    // 初始化搜索
    initSearch();
});

// 加载文章数据
async function loadPosts() {
    try {
        // 优先尝试通过CDN获取
        let response = await fetch(`${config.cdnBaseUrl}/${config.repoOwner}/${config.repoName}@main/${config.postsPath}/index.json`);
        
        // 如果CDN不可用，回退到原始GitHub地址
        if (!response.ok) {
            response = await fetch(`${config.fallbackUrl}/${config.repoOwner}/${config.repoName}/main/${config.postsPath}/index.json`);
        }
        
        const data = await response.json();
        allPosts = data.posts;
        
        // 构建分类信息
        buildCategories();
        // 渲染文章
        renderPosts();
        // 初始化搜索索引
        initSearchIndex();
    } catch (error) {
        console.error('加载文章失败:', error);
        document.getElementById('posts-container').innerHTML = `
            <div class="p-8 text-center text-gray-500">
                <p>加载文章失败，请稍后重试</p>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">刷新页面</button>
            </div>
        `;
    }
}

// 构建分类信息
function buildCategories() {
    categories = {};
    allPosts.forEach(post => {
        const category = post.category || '未分类';
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(post);
    });
    renderCategories();
}

// 渲染分类目录
function renderCategories() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';

    Object.keys(categories).forEach(category => {
        const li = document.createElement('li');
        li.className = 'cursor-pointer hover:text-blue-600 transition-colors';
        li.innerHTML = `
            <span class="flex items-center justify-between">
                <span>${category}</span>
                <span class="text-xs bg-gray-200 rounded-full px-2 py-1">${categories[category].length}</span>
            </span>
        `;
        li.addEventListener('click', () => filterByCategory(category));
        categoryList.appendChild(li);
    });
}


// 增强的文章加载函数
async function loadPostContent(slug) {
    try {
        // 优先尝试CDN加速源
        let response = await fetchWithTimeout(
            `${config.cdnBaseUrl}/${config.repoOwner}/${config.repoName}@main/${config.postsPath}/${slug}.md`,
            { timeout: 5000 }
        );
        
        // CDN失败时回退到原始GitHub源
        if (!response.ok) {
            response = await fetchWithTimeout(
                `${config.fallbackUrl}/${config.repoOwner}/${config.repoName}/main/${config.postsPath}/${slug}.md`,
                { timeout: 8000 }
            );
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        return await response.text();
    } catch (error) {
        console.error('加载文章内容失败:', error);
        throw error; // 向上抛出错误以便调用方处理
    }
}

// 带超时的fetch封装
function fetchWithTimeout(url, { timeout = 8000 } = {}) {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('请求超时')), timeout)
        )
    ]);
}

// 增强的错误处理
async function renderPost() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    
    if (!slug) {
        showError('缺少文章标识参数');
        return;
    }

    try {
        document.getElementById('post-loading').classList.remove('hidden');
        
        const markdown = await loadPostContent(slug);
        const html = new showdown.Converter({
            tables: true,
            tasklists: true,
            strikethrough: true
        }).makeHtml(markdown);
        
        document.getElementById('post-content').innerHTML = html;
        document.title = `${slug.replace(/-/g, ' ')} - ${document.title}`;
        
        // 高亮代码块
        if (window.Prism) {
            Prism.highlightAll();
        }
    } catch (error) {
        showError(`加载文章失败: ${error.message}`);
    } finally {
        document.getElementById('post-loading').classList.add('hidden');
    }
}

function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'p-4 bg-red-100 text-red-700 rounded-lg';
    errorEl.innerHTML = `
        <p class="font-semibold">错误</p>
        <p>${message}</p>
        <button onclick="location.reload()" class="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm">
            重试
        </button>
    `;
    document.getElementById('post-content').innerHTML = '';
    document.getElementById('post-content').appendChild(errorEl);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载必要的polyfill
    if (!window.Promise) {
        loadScript('https://cdn.jsdelivr.net/npm/promise-polyfill@8.2.3/dist/polyfill.min.js')
            .then(renderPost);
    } else {
        renderPost();
    }
});

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

    // 更新分页状态
    updatePagination();
}

// 更新分页控件状态
function updatePagination() {
    const totalPages = Math.ceil(allPosts.length / config.postsPerPage);
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

// 按分类筛选文章
function filterByCategory(category) {
    allPosts = [...categories[category]];
    currentPage = 1;
    renderPosts();
}

// 初始化搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', _.debounce((e) => {
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        const results = searchIndex.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.content.toLowerCase().includes(query) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
        ).slice(0, 5);

        if (results.length > 0) {
            searchResults.innerHTML = results.map(result => `
                <div class="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0">
                    <div class="font-semibold">${result.title}</div>
                    <div class="text-xs text-gray-500 mb-1">${result.category} • ${result.date}</div>
                    <div class="text-sm text-gray-600 truncate">${highlightQuery(result.content, query)}</div>
                </div>
            `).join('');
            
            searchResults.querySelectorAll('div').forEach((div, index) => {
                div.addEventListener('click', () => {
                    window.location.href = `post.html?slug=${results[index].slug}`;
                });
            });
            
            searchResults.classList.remove('hidden');
        } else {
            searchResults.innerHTML = '<div class="p-3 text-gray-500 text-sm">没有找到匹配的文章</div>';
            searchResults.classList.remove('hidden');
        }
    }, 300));

    // 点击页面其他区域关闭搜索结果
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
}

// 高亮搜索关键词
function highlightQuery(text, query) {
    if (!query) return text;
    const regex = new RegExp(query, 'gi');
    return text.replace(regex, match => `<span class="bg-yellow-200">${match}</span>`);
}

// 初始化搜索索引
async function initSearchIndex() {
    try {
        // 优先从CDN加载预构建的搜索索引
        let response = await fetch(`${config.cdnBaseUrl}/${config.repoOwner}/${config.repoName}@main/${config.postsPath}/search.json`);
        
        if (!response.ok) {
            // 回退到原始GitHub地址
            response = await fetch(`${config.fallbackUrl}/${config.repoOwner}/${config.repoName}/main/${config.postsPath}/search.json`);
        }
        
        searchIndex = await response.json();
    } catch (error) {
        console.error('加载搜索索引失败:', error);
        // 如果预构建索引不可用，则动态构建
        searchIndex = allPosts.map(post => ({
            title: post.title,
            slug: post.slug,
            category: post.category,
            date: post.date,
            content: post.excerpt || '',
            tags: post.tags || []
        }));
    }
}
