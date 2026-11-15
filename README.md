# uo-theme

编辑部风格的博客主题，版本 **0.6.1**。WordPress 6.6+ / PHP 7.4+，GPL-2.0-or-later。

- **前台**：暖纸色调 + 衬线标题，主题色可换；首页标题区、头条大卡、卡片网格 / 简洁列表两种布局、分类快捷筛选；文章页阅读时长、右侧目录（滚动高亮，窄屏浮动按钮）、代码复制、图片放大、复制正文 / 链接 / 分享、上一篇下一篇、相关文章、评论；`⌘K` / `/` 搜索面板（实时结果）；深色模式；无刷新页面切换；看板娘（社区角色）。
- **管理面板浮窗**：登录后左下角出现「管理」浮标（`⌘/Ctrl + .`），在当前页面打开管理窗口，不再跳转 wp-admin：
  - 概览（统计、快速草稿、最近草稿 / 发布）
  - 文章 / 页面：列表、搜索、状态与分类筛选、回收站；可视化编辑器 + HTML 源码模式，Markdown 快捷输入（`## ` `> ` `- ` `1. ` ```` ``` ```` `---`），粘贴清洗，图片粘贴 / 拖拽上传，本机草稿恢复，定时发布、分类、标签、封面、摘要、评论开关、置顶，`⌘S` 保存
  - 评论审核：通过、驳回、回复、垃圾、回收站
  - 媒体库：拖拽上传、替代文本、复制链接、删除
  - 分类与标签、外观（主题色、默认深浅、布局、首页文案、导航菜单、作者卡片与社交链接、看板娘、页脚备案）、站点设置
  - 窗口可拖动、缩放、最大化，写作时自动全屏；手机端为全屏面板 + 底部标签栏
- **跨引擎**：样式与交互在 `assets/core/`，只依赖[标记约定](docs/MARKUP-CONTRACT.md)；管理面板只调用 [`window.UOAdapter`](docs/ADAPTER.md)。WordPress 适配器在 `assets/adapters/wordpress.js`，`ports/static/` 是不依赖后端的参考实现（mock 适配器）。移植说明见 [ports/README.md](ports/README.md)。

## 安装与更新

主题通过 WordPress 原生更新器读取本仓库 GitHub 最新稳定 Release（校验 SHA-256）。发布：同步提高 `style.css` 的 Version 与 `readme.txt` 的 Stable tag，运行检查，推送匹配标签（如 `v0.6.0`），Release 工作流自动打包发布；站点按定时任务更新，也可在后台手动更新。手动安装：「外观 → 主题 → 上传主题」。

> 0.6.0 起改为经典 PHP 模板，站点编辑器里保存过的旧区块模板不再生效（文章、评论、设置不受影响）。导航默认读取已有的 WordPress 菜单，可在面板「外观 → 导航菜单」覆盖。

## 权限与安全

面板只对已登录且具备 `edit_posts` 的用户输出；各标签按能力显示（`publish_posts`、`moderate_comments`、`upload_files`、`manage_categories`、`manage_options`），所有写操作由 WordPress REST 校验 Cookie + nonce 与能力。登录页面响应加 `nocache` 头，匿名 HTML 不含任何管理信息。主题自身只新增两个路由：`uo-theme/v1/settings`（`manage_options`）与 `uo-theme/v1/overview`（`edit_posts`）。可视化编辑器载入文章时会隔离脚本、内嵌框架和内联事件，保存时原样还原。

## 文件组织

```text
assets/core/        跨引擎：uo.css / uo.js（前台）、panel.css / panel.js（管理面板）
assets/adapters/    引擎适配器（wordpress.js）
assets/css|js/      看板娘样式与脚本
*.php, template-parts/  WordPress 经典模板（标记约定的参考实现）
inc/                设置、REST、模板函数、更新器
ports/              其他引擎移植说明与静态参考实现（不进入安装包）
docs/               标记约定、适配器接口、验证记录
scripts/ tests/     检查、封包与测试（不进入安装包）
```

## 开发与验证

```sh
php scripts/check.php && php tests/settings.php && php tests/reading.php && php tests/updates.php
node tests/core.mjs
php scripts/package.php   # 产物：../app_packages/uo-theme/wordpress/<version>/
```

## 社区素材许可

看板娘动画来自 [savanna0425/llm-pet](https://github.com/savanna0425/llm-pet) 固定 commit `fdd821feb49b294ea8abe42c9cf41e6c52e3aacf`，形象作者 **ZipZipPipe**，DeepSeek 原设 **上善**；非官方同人，署名、非商业使用，DeepSeek 另遵循 **CC BY-NC-SA 4.0**，见 `assets/mascots/community/NOTICE.md`。美术不受主题代码 GPL 覆盖，商业站点应停用这些素材。示意封面见 `assets/images/NOTICE.md`。
