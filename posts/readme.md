
# GitHub Markdown 静态博客

## 使用说明

1. 在GitHub上创建一个新仓库
2. 在仓库中创建`posts`文件夹用于存放Markdown文章
3. 将本项目的HTML文件上传到仓库根目录
4. 启用GitHub Pages功能(设置 -> Pages -> 选择main分支)
5. 通过GitHub网页界面或Git命令上传Markdown文章到`posts`目录

## 文章管理

- 直接在GitHub仓库中创建/编辑/删除Markdown文件
- 文件命名建议使用英文和连字符(如`my-first-post.md`)
- 支持标准Markdown语法和GFM(GitHub Flavored Markdown)

## 自定义配置

修改`index.html`和`post.html`中的以下变量：
- `repoOwner`: 您的GitHub用户名
- `repoName`: 仓库名称
- `postsPath`: 存放文章的目录路径
