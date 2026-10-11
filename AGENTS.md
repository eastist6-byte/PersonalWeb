# 公开静态仓库约定
- 此仓库由本地维护副本 E:\systempack\desk\GPT\personal-site-pages 导出，仅包含公开网站源码和已验证的转换结果。
- 页面文字在 content/pages/，文章清单在 content/site.yaml，正文、SVG 和 PDF 在 content/generated/。尊重作者文字，新增提示使用平实表述。
- 留言板入口保留，标题下必须为空白；不添加提交、查询、回复、管理、口令解锁或 API。
- npm run build 只生成 outputs/pages/，npm test 检查公开发布边界。GitHub 工作流只上传 outputs/pages/。
- status: draft 或设置 accessGroup 的文章不能公开。不要把数据库、凭证、备份、原稿、受保护文件或运行记录添加到仓库。
- 原稿修改和 TeX 转换应在完整本地维护副本进行，再重新导出。此公开仓库不含 TeX 转换工具。
- 仓库子路径来自 PAGES_BASE；GitHub Actions 使用 configure-pages 的 base_path，不写死用户名或仓库名。
- 中间文件放在 work/，输出放在 outputs/。在 Windows 上验收时，网页用 Chrome，Markdown 用 Typora。
- 不得因维护此仓库而改动原完整项目 E:\systempack\desk\GPT\personal-site 或原归档 PersonalWeb0.1.zip。
