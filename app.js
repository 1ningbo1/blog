
// 配置信息
const config = {
    repoOwner: '1ningbo1',
    repoName: 'blog',
    postsPath: 'posts',
    postsPerPage: 6,
    cdnBaseUrl: 'https://cdn.jsdelivr.net/gh',
    fallbackUrl: 'https://raw.githubusercontent.com'
};

// 全局变量
let allPosts = [];
let currentPage = 1;
let searchIndex = [];
let categories = {};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
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
        // 尝试通过CDN获取文章列表
        let response = await fetch(`${config.cdnBaseUrl}/${config.repoOwner}/${config.repoName}@main/${config.postsPath}/list.json`);
        
        // 如果CDN不可用，回退到原始GitHub地址
        if (!response.ok) {
            response = await fetch(`${config.fallbackUrl}/${config.repoOwner}/${config.repoName}/main/${config.postsPath}/list.json`);
        }
        
        if (!response.ok) throw new Error('获取文章列表失败');
        
        const data = await response.json();
        allPosts = data.posts || [];
        
        if (allPosts.length === 0) {
            document.getElementById('posts-loading').innerHTML = `
                <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                    <p class="text-gray-600 mb-4">暂无文章</p>
                    <a href="https://github.com/${config.repoOwner}/${config.repoName}/tree/main/${config.postsPath}" 
                       target="_blank" 
                       class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        添加文章
                    </a>
                </div>
            `;
            return;
        }

        // 构建分类信息
        buildCategories();
        // 渲染文章
        renderPosts();
        // 初始化搜索索引
        initSearchIndex();
        
        // 显示内容区域
        document.getElementById('posts-container').classList.remove('hidden');
        document.getElementById('pagination').classList.remove('hidden');
        document.getElementById('posts-loading').classList.add('hidden');
    } catch (error) {
        console.error('加载文章失败:', error);
        document.getElementById('posts-loading').innerHTML = `
            <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                <p class="text-red-500 mb-2">加载文章失败: ${error.message}</p>
                <p class="text-gray-600 mb-4">请检查网络连接或稍后重试</p>
                <button onclick="location.reload()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    刷新页面
                </button>
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

    // 添加"全部"选项
    const allLi = document.createElement('li');
    allLi.className = 'cursor-pointer font-medium text-blue-600 hover:text-blue-800 mb-2';
    allLi.textContent = '全部文章';
    allLi.addEventListener('click', () => {
        allPosts = [...allPosts]; // 恢复原始数据
        currentPage = 1;
        renderPosts();
    });
    categoryList.appendChild(allLi);

    // 添加分类选项
    Object.keys(categories).forEach(category => {
        const li = document.createElement('li');
        li.className = 'cursor-pointer text-gray-700 hover:text-blue-600 transition-colors mb-1';
        li.innerHTML = `
            <span class="flex items-center justify-between">
                <span>${category}</span>
                <span class="text-xs bg-gray-200 rounded-full px-2 py-1">${categories[category].length}</span>
            </span>
        `;
        li.addEventListener('click', () => {
            allPosts = [...categories[category]];
            currentPage = 1;
            renderPosts();
        });
        categoryList.appendChild(li);
    });
}

// 渲染文章列表
function renderPosts() {
    const postsContainer = document.getElementById('posts-container');
    const startIdx = (currentPage - 1) * config.postsPerPage;
    const endIdx = startIdx + config.postsPerPage;
    const postsToShow = allPosts.slice(startIdx, endIdx);

    postsContainer.innerHTML = '';

    postsToShow.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow';
        postElement.innerHTML = `
            <div class="p-6">
                <div class="flex items-center space-x-2 mb-3">
                    <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">${post.category || '未分类'}</span>
                    ${post.date ? `<time class="text-xs text-gray-500">${post.date}</time>` : ''}
                </div>
                <h2 class="text-xl font-semibold mb-2">
                    <a href="post.html?slug=${post.slug}" class="hover:text-blue-600">${post.title}</a>
                </h2>
                ${post.excerpt ? `<p class="text-gray-600 mb-3 line-clamp-2">${post.excerpt}</p>` : ''}
                <a href="post.html?slug=${post.slug}" class="inline-flex items-center text-blue-500 hover:text-blue-700 text-sm">
                    阅读全文
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });

    // 更新分页状态
    updatePagination();
}

// 更新分页控件状态
function updatePagination() {
    const totalPages = Math.ceil(allPosts.length / config.postsPerPage);
    document.getElementById('page-info').textContent = `第${currentPage}页 / 共${totalPages}页`;
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
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
                    <div class="text-xs text-gray-500 mb-1">${result.category || '未分类'}</div>
                    <div class="text-sm text-gray-600 truncate">${result.excerpt || ''}</div>
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

// 初始化搜索索引
async function initSearchIndex() {
    try {
        // 尝试通过CDN获取搜索索引
        let response = await fetch(`${config.cdnBaseUrl}/${config.repoOwner}/${config.repoName}@main/${config.postsPath}/search.json`);
        
        if (!response.ok) {
            // 回退到原始GitHub地址
            response = await fetch(`${config.fallbackUrl}/${config.repoOwner}/${config.repoName}/main/${config.postsPath}/search.json`);
        }
        
        if (response.ok) {
            searchIndex = await response.json();
        } else {
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
    } catch (error) {
        console.error('加载搜索索引失败:', error);
        searchIndex = [];
    }
}
