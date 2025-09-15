
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
