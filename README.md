# 个人静态博客系统

这是一个基于Markdown的纯静态博客系统，无需后端，可直接部署到GitHub Pages。

## 特点

- 纯静态HTML/CSS实现，仅使用少量必要JavaScript
- 以Markdown文件管理文章内容
- 按文件名自动分类（格式：[分类名]-[文章标题].md）
- 支持文章搜索、分类浏览和分页功能
- 响应式设计，自动适配移动端和桌面端
- 简单易用，无需数据库

## 目录结构
/
├── index.html           # 博客首页
├── articles/            # 存放所有Markdown文章
│   ├── index.json       # 文章索引文件
│   ├── tech-hello_world.md  # 示例文章1
│   └── life-my_first_post.md # 示例文章2
└── README.md            # 说明文档
## 发布文章方法

1. 编写Markdown格式的文章
2. 按照命名规范命名文件：`[分类名]-[文章标题].md`
   - 分类名和文章标题中不要使用 `-` 符号
   - 空格使用 `_` 代替
   - 例如：`travel-japan_2023.md` 表示分类为 "travel"，标题为 "japan 2023"
3. 在文章开头添加日期元数据：
   ```
   ---
   date: 2023-06-15
   ---
   ```
4. 将文件放入 `articles` 目录
5. 更新 `articles/index.json`，添加新文章的文件名

## GitHub Pages部署教程

### 前提条件

- 拥有GitHub账号
- 安装Git客户端

### 部署步骤

1. 在GitHub上创建一个新仓库
   - 仓库名建议使用 `username.github.io`（username替换为你的GitHub用户名）
   - 勾选 "Initialize this repository with a README"

2. 克隆仓库到本地
   ```bash
   git clone https://github.com/username/username.github.io.git
   cd username.github.io
   ```

3. 将博客系统文件复制到仓库目录
   ```bash
   # 假设你下载的博客系统文件在 ~/Downloads/blog 目录
   cp -r ~/Downloads/blog/* .
   ```

4. 提交并推送代码
   ```bash
   git add .
   git commit -m "Initial commit of blog system"
   git push origin main
   ```

5. 启用GitHub Pages
   - 进入仓库的Settings页面
   - 点击左侧菜单中的 "Pages"
   - 在 "Source" 部分，选择分支为 "main"，目录为 "/"
   - 点击 "Save"
   - 等待几分钟，你的博客就会部署在 https://username.github.io

### 更新文章

1. 按照"发布文章方法"添加新文章
2. 提交并推送更新
   ```bash
   git add .
   git commit -m "Add new article: article-title"
   git push origin main
   ```
3. 等待几分钟，更新会自动部署

## CDN优化建议

1. 使用GitHub Pages默认的CDN加速
2. 对于自定义域名，可以配置Cloudflare等CDN服务
3. 确保所有外部资源（如Tailwind、Font Awesome）使用CDN版本

## 自定义设置

- 可以修改 `index.html` 中的标题、颜色等样式
- 调整 `CONFIG` 中的 `articlesPerPage` 来改变每页显示的文章数量
- 修改导航栏和页脚的内容以符合个人需求
