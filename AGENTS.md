# 公开静态仓库约定

- 本仓库由本地 Web/personal-site-pages 导出。文库原稿与文章元数据统一维护在 Web/Article。
- 本仓库只含公开网页源码及已验证的 HTML、SVG、PDF；不含原始 TeX、数据库、凭证、后台服务或备份。
- npm ci、npm run build、npm test 可在本仓库独立执行；不需要父目录或 TeX。
- 留言板仅保留标题与空白区域；不增加提交、查询、管理、解锁或 API。
- 本地导出会更新此目录并保留 .git。日常维护以 Web 工作区为准；网页上的改动须同步回维护副本。
- GitHub Actions 从 Pages 元数据读取 base_path，只发布 outputs/pages。
- 尊重作者文字；网页用 Chrome，Markdown 用 Typora。
