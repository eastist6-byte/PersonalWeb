# 临时或永远：GitHub Pages 版本

这个仓库是个人网站的公开静态版本，包含首页、文库、下载区、空白留言板和关于页面。十篇李群和李代数笔记提供网页全文与 PDF，MathJax 渲染公式，交换图使用 SVG。

留言板只保留标题和空白区域。没有提交、查询、回复、管理员登录、访问口令或数据库。源文件与静态输出均不包含账号凭证或受保护文章。

## 发布

将全部文件放在仓库根目录，包括 .github/。默认分支使用 main。到 Settings → Pages，将 Source 选择为 GitHub Actions，再推送或手动运行 Deploy GitHub Pages 工作流。

工作流读取 GitHub Pages 的 base_path，自动适配普通仓库子路径、用户名.github.io 根路径或已配置的自定义域名。部署只上传 outputs/pages/，不把构建脚本和维护文件当作网页托管。

官方说明：[配置发布源](https://docs.github.com/zh/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)、[自定义工作流](https://docs.github.com/zh/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 在本机预览

需要 Node.js 24.13 或以上。

~~~powershell
npm ci
npm run build
npm start
~~~

默认地址为 http://127.0.0.1:4333/personal-site/ 。本地验证自己的仓库名时，构建前可设置 $env:PAGES_BASE='/仓库名/'；根路径使用 '/'。线上工作流自动设置路径。

## 更新

页面文字逐页放在 content/pages/。文章目录、标题、简介、顺序和附件清单在 content/site.yaml。头像是 content/images/avatar.png。正文及图示来自 content/generated/ 下的已验证转换结果。npm run build 后可运行 npm test 检查发布文件；npm run test:browser 使用本机 Chrome 验收。

完整维护副本位于 E:\systempack\desk\GPT\personal-site-pages。修改 TeX 应在该副本中进行，先转换再导出本公开仓库；本仓库不含 TeX 原稿及转换工具。维护副本再次导出时会覆盖本目录中的网页源文件，并保留 .git，因此以维护副本中的修改为准。

数学公式和三个交换图沿用已验证版本。未经作者允许，请勿转载本站文章和文件。
