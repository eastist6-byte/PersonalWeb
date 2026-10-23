# PersonalWeb：公开静态仓库

这是 GitHub Pages 使用的公开源码与转换结果。包含个人简介、文库、公式、图示、分篇 PDF、下载、关于和空白留言板。没有留言接口、数据库、管理员或口令保护功能。

## 构建

需要 Node.js 24.13 或以上。

~~~powershell
npm ci
npm run build
npm test
~~~

生成网页在 outputs/pages。GitHub Actions 在 main 更新后自动构建并部署；仓库 Settings → Pages 的 Source 选择 GitHub Actions。发布路径由工作流读取，支持普通仓库子路径。

## 内容维护

原始文章与目录元数据在完整本地 Web 工作区的 Article 中维护，执行 Web/更新两个网站.ps1 后导出此仓库。当前本机维护根目录为 E:\systempack\desk\GPT\Web。

此公开仓库不含 TeX 原稿或转换工具，不能替代整个 Web 工作区备份。仅克隆此仓库可以继续修改网页前端、界面配置与已转换正文；要重新转换文章应取得 Article 和完整维护环境。

页面文字位于 content/pages，文章清单位于 content/site.yaml，已转换正文与 PDF 位于 content/generated。直接在线修改文件后，需要同步回本地维护副本，否则下一次导出会覆盖。

不要加入数据库、凭证、原稿、私密资料、备份、日志或 node_modules。只发布已明确公开的内容。
