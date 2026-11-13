# 静态陪伴与 AI 扩展

0.2.0 内置 GPT「小缇」、Claude「小柯」、DeepSeek「小鲸」三位原创拟人角色。默认只在浏览器本地匹配预设文字，提供轻触招呼、灵感、鼓励和站内文章推荐。主题不会调用模型服务，也不保存对话；本地存储仅保存角色和明暗偏好。角色不是相关公司的官方形象。

## 前端适配器

`assets/js/theme.js` 在页脚加载，初始化后触发 `uo-theme:companion:ready`。插件可在主题脚本之后加载自己的脚本，或监听该事件，注册：

```js
window.UOTheme.companion.setAdapter(async ({ model, message, context, signal }) => {
  // URL、权限、限流和身份验证由独立插件实现。密钥只保存在服务器。
  const response = await fetch('/wp-json/your-plugin/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, message, context }),
    signal
  });
  if (!response.ok) throw new Error('Chat request failed');
  return response.json(); // { reply: '纯文本回复' }，也可直接返回字符串
});
```

这只是接入示例；主题不注册上述路由。插件应提供真实的后端验证、模型映射、超时、限流与隐私说明。

- `model`：`gpt`、`claude`、`deepseek`；`message`：最多 500 字符。
- `context`：当前页面 `title`、`url` 与 `site`；`signal`：切换角色/替换适配器时取消请求。
- 回复按纯文本呈现，最多 1500 字符；迟到的旧回复不会覆盖新角色。
- `setAdapter(null)` 恢复静态模式；注册适配器后角标显示「在线陪伴」。
- `select(model)`、`open()`、`close()`、`getModel()`、`getMode()` 可供插件控制。`getMode()` 返回 `static` 或 `adapter`。
- 事件：`uo-theme:companion:model` 的 detail 为 `{model}`；`uo-theme:companion:message` 为 `{model,message,reply}`。主题不会把事件发送至服务器，插件不要未经说明记录访客输入。

PHP 过滤器 `uo_theme_companion_settings` 可以调整前端配置中的角色图片 `characters[id].image`、上下文 `context` 和站内推荐 `recentPosts`。主题会 JSON 转义配置；推荐链接只允许本站 HTTP(S) 地址。

## 交互与无障碍

手机端为浮动入口，桌面端为右栏角色卡。弹窗支持 Escape、Tab 焦点循环和关闭后恢复焦点；系统减少动态偏好会关闭动画及逐字效果。回复只向辅助技术完整播报一次。无 JavaScript 时保留默认角色与欢迎文字，输入框保持禁用。

## 0.3.0 社区动画

角色图集在 `assets/mascots/community/`；素材来源/许可见同目录 NOTICE.md 和 provenance.json。后台「外观 → uo-theme 设置」管理启用、角色、尺寸与游走；每次访问从站点配置选择模型。`select()` 仍可供插件临时选择当前页面角色。`options.enabled=0` 时不初始化陪伴 API。`roaming.js` 播放八列九行图集，有效帧数依次为 6/8/8/4/5/8/6/6/6；不读取远程代码/模型，不发送消息至 AI 服务。
