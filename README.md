# uo-theme

WordPress 区块主题基础模板，版本 **0.1.1**。支持 WordPress 6.6+、PHP 7.4+，GPL-2.0-or-later。

## 安装

1. 在仓库运行 `php scripts/package.php` 生成 ZIP，产物保存在公司根目录 `app_packages/uo-theme/wordpress/0.1.1/`。
2. 在 WordPress 后台进入「外观 → 主题 → 安装主题 → 上传主题」，选择 `uo-theme-0.1.1.zip`，安装并启用。
3. 进入「外观 → 编辑器」，设置站点名称、Logo、导航与样式。原生导航区块支持移动端折叠菜单。
4. 在「设置 → 阅读」选择首页显示最新文章，启用欢迎区与文章网格；选择静态首页则使用常规页面模板。模板中的文字为可翻译的英文默认文案，可在站点编辑器内修改。

这是主题安装包，上传入口是「主题」。独立业务插件在有具体需求时另行开发。

## 已包含

- 最新文章首页、文章详情（评论/分类/标签/上一篇和下一篇）、普通页面、归档、搜索、404、空白页面模板。
- 可编辑页眉/页脚、Logo、导航、文章缩略图、分页、空结果提示。
- `theme.json` 配色、字体、间距与宽度；默认浅色和 Forest night 深色样式。
- 响应式文章网格、键盘焦点样式、系统字体，无外部 CDN、追踪器或运行依赖。
- 翻译函数统一使用 `uo-theme` 文本域；暂未提供中文语言包。

## 文件组织

```text
assets/css/     前端和编辑器共用 CSS
parts/          页眉与页脚
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

启用主题后，在主题详情中开启自动更新，或运行 `wp theme auto-updates enable uo-theme`。主题通过原生 WordPress 更新器读取此仓库的最新稳定 Release，校验最低 WordPress/PHP 版本及 ZIP 的 SHA-256。站点需能访问 GitHub，并具备主题目录写权限与正常的 WordPress 定时任务。网络失败时保留当前主题。

发布步骤：同步提高 `style.css` 的 Version 和 `readme.txt` 的 Stable tag，运行检查与 `php tests/updates.php`，提交后推送匹配的版本标签（例如 `v0.1.1`）。Release 工作流自动验证标签、打包并发布安装 ZIP、更新清单和校验文件。只有正式标签发布触发站点更新，普通开发提交不会触发。不要编辑已发布标签或替换其资产；修复应发布新版本。

WordPress 按自身定时任务检查与安装，更新存在间隔，不保证实时。当前更新回调随启用的主题加载；切换到无关主题后，不承诺后台继续更新 uo-theme。站点级定制请用子主题或站点编辑器，直接修改主题文件会被新版覆盖。
