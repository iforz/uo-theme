# uo-theme

WordPress 双栏博客主题，版本 **0.2.0**。支持 WordPress 6.6+、PHP 7.4+，GPL-2.0-or-later。

## 安装

1. 在仓库运行 `php scripts/package.php` 生成 ZIP，产物保存在公司根目录 `app_packages/uo-theme/wordpress/0.2.0/`。
2. 在 WordPress 后台进入「外观 → 主题 → 安装主题 → 上传主题」，选择 `uo-theme-0.2.0.zip`，安装并启用。
3. 进入「外观 → 编辑器」，设置站点名称、Logo、导航与样式。原生导航区块支持移动端折叠菜单。
4. 在「设置 → 阅读」选择首页显示最新文章，启用欢迎区与双栏文章列表；选择静态首页则使用常规页面模板。欢迎区、简介与区块内容可在站点编辑器内修改。

这是主题安装包，上传入口是「主题」。独立业务插件在有具体需求时另行开发。

## 已包含

- 最新文章首页、文章详情（评论/分类/标签/上一篇和下一篇）、普通页面、归档、搜索、404、空白页面模板。
- 可编辑页眉/页脚、Logo、导航、文章缩略图、分页、空结果提示。
- `theme.json` 配色、字体、间距与宽度；默认浅色和 Forest night 深色样式。
- 左侧文章流、右侧简介/分类/近文，手机单栏；明暗切换、阅读进度、回顶、搜索浮层与卡片动效。
- GPT、Claude、DeepSeek 社区动态看板娘，支持自由行走、鼠标/触屏拖拽、暂停、收起、静态对话与站内推荐。在「外观 → uo-theme 设置」选择形象、尺寸和活动方式；桌面主体1080px，左侧为管理员保留竖向快捷菜单。默认不调用 AI；扩展方式见 [COMPANION-API.md](docs/COMPANION-API.md)。
- 键盘焦点与减少动态支持；系统字体，无外部 CDN、追踪器或运行依赖。
- 展示文案以中文为主，PHP 翻译函数使用 `uo-theme` 文本域。

## 文件组织

```text
assets/css/     前端和编辑器共用 CSS
parts/          页眉与页脚
assets/js/      原生交互与陪伴适配器
assets/mascots/community/ 社区动画图集、固定来源与独立素材许可
patterns/       可翻译的欢迎、搜索与提示区块
styles/         全局样式变体
templates/      WordPress 模板层级
functions.php  主题初始化、样式加载
theme.json     全局样式和编辑器配置
scripts/       检查与封包（不进入安装包）
```

## 开发与验证

将源码目录复制或链接至本地 WordPress 的 `wp-content/themes/uo-theme` 后启用。

```sh
php scripts/check.php
php tests/settings.php
php scripts/check.php /path/to/wordpress
php scripts/package.php
```

第二条命令额外使用 WordPress 自身的区块解析器。检查涵盖 PHP 语法、JSON、元信息、区块嵌套与模板引用；不能替代运行站点、编辑器保存/刷新、移动端导航、分页/搜索和插件兼容测试。验证记录见 `docs/VALIDATION.md`。

后台修改模板会保存在数据库，优先于源码模板。更新源码后若页面未变，请先导出需要保留的修改，再在站点编辑器重置对应自定义模板。切换主题不会删除文章。

后续业务功能应通过插件实现，主题只负责展示。当前没有 WooCommerce 适配或演示内容导入器。

## 参考

- [WordPress Theme Structure](https://developer.wordpress.org/themes/core-concepts/theme-structure/)
- [theme.json Reference](https://developer.wordpress.org/block-editor/reference-guides/theme-json-reference/)

## 自动更新与发布

启用主题后，在主题详情中开启自动更新，或运行 `wp theme auto-updates enable uo-theme`。主题通过原生 WordPress 更新器和 GitHub 官方 API 读取此仓库的最新稳定 Release，校验最低 WordPress/PHP 版本及 ZIP 的 SHA-256。站点需能访问 GitHub，并具备主题目录写权限与正常的 WordPress 定时任务。网络失败时保留当前主题。

发布步骤：同步提高 `style.css` 的 Version 和 `readme.txt` 的 Stable tag，运行检查与 `php tests/updates.php`，提交后推送匹配的版本标签（例如 `v0.2.0`）。Release 工作流自动验证标签、打包并发布安装 ZIP、更新清单和校验文件。只有正式标签发布触发站点更新，普通开发提交不会触发。不要编辑已发布标签或替换其资产；修复应发布新版本。

WordPress 按自身定时任务检查与安装，更新存在间隔，不保证实时。当前更新回调随启用的主题加载；切换到无关主题后，不承诺后台继续更新 uo-theme。站点级定制请用子主题或站点编辑器，直接修改主题文件会被新版覆盖。

## 社区素材许可

当前动画来自 [savanna0425/llm-pet](https://github.com/savanna0425/llm-pet) 固定 commit `fdd821feb49b294ea8abe42c9cf41e6c52e3aacf`，原始文件未修改，哈希见 `assets/mascots/community/provenance.json`。形象作者 **ZipZipPipe**，DeepSeek 原设 **上善**。这些是非官方同人，要求署名、非商业使用；DeepSeek 另遵循 **CC BY-NC-SA 4.0**。请阅读包内 `assets/mascots/community/NOTICE.md`。美术不受主题代码的 GPL 许可覆盖，商业站点应停用/移除这些素材并换为有相应授权的角色。旧生成立绘保留于 Git 历史/源码，安装包不包含它们。

前端不从第三方域名加载角色，动画播放器为本主题的无依赖九行动作图集适配代码。减少动态时停止动画和游走；后台角色选择为站点默认值，不受旧浏览器角色偏好覆盖。
