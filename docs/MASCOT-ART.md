# GPT / Claude / DeepSeek 看板娘美术

日期：2026-11-12。任务：为博客的静态交互制作三套统一画风的次元角色立绘。全部使用内建 `image_gen.imagegen` 生成，透明背景；生成后使用系统 `cwebp` 做网站格式转换，不用 Python 改图。Python/Pillow 仅用于读取尺寸和 alpha 统计。

## 参考与设计依据

参考链接用于了解近期社区拟人化的识别元素，没有下载、临摹或直接使用链接中的作者原图。最终是为本项目另行生成的新造型，不声明为模型公司的官方形象。

- [AI 娘化图鉴](https://genderswapai.com/zh-CN/ai-gijinka)：GPT 银白发龙娘、Claude 橘发花饰、DeepSeek 蓝发鲸鱼娘。
- [AI 品牌与角色形象](https://genderswapai.com/zh-CN/ai-gijinka/brand-to-character)：用于区分各模型的主要识别元素。
- [AI Girls 素材说明](https://github.com/shuaizenge/ai-girls/blob/main/NOTICE.md)：来源作者及素材说明仅作研究，项目不搬用仓库原图。
- [社区角色素材署名](https://models.jianlong.it/credits/)：确认这些属于社区拟人化创作，而非官方统一人物设定。

## 交付约定

- 三角色均为明确成年女性、正常成人动漫比例，统一 2:3 竖幅透明全身站姿。不是儿童、Q 版或 Live2D 模型。
- GPT：银白长发、小龙角、编结发饰、白绿衣裙，举手欢迎；Claude：暖橘长发、花朵与星芒、杏橘米白衣裙、手持闭合书本；DeepSeek：深蓝长发、鲸鱼发饰、鲸尾缎带、蓝白衣裙、摊手引导。
- PNG 为完整生成源图；WebP 为页面优先加载的同名优化版本。图片实际裁切与动画由前端决定，推荐 `object-fit: contain`，不将其当成可编辑骨骼/Live2D 资产。
- 本次不生成额外表情图集。静态角色的呼吸、悬停、切换等效果由 CSS/JavaScript 完成。

## 最终提示词与工具参数

### GPT

工具：内建 `image_gen.imagegen`；`transparent_background: true`；全新生成，无参考输入。

```text
Use case: stylized-concept. Asset type: transparent full-body anime desktop website companion sprite, one character only. Primary request: create an ORIGINAL adult female personification of GPT, part of a cohesive set of three refined cel-shaded anime AI companions for a clean sophisticated personal blog. Not an official mascot, not a copy of any existing artist's character. Subject: clearly adult woman, elegant normal adult anime proportions, standing full body with ALL hair, small horns, hands, and shoes fully inside the frame. Silver-white long hair with a subtly mint-tinted underside, two small pearly dragon horns, a tiny simple mint braided-knot hair ornament (not a logo). Emerald green eyes, intelligent gentle smile. Wardrobe: tasteful white structured coat-dress with a high neckline over a sage-green skirt, mint ribbon accents, simple white ankle boots; polished contemporary fantasy librarian aesthetic, modest and practical, no cleavage. Her right hand is raised in a small welcoming open-palm wave, her left hand rests naturally at waist level. Pose nearly frontal, slight three-quarter toward viewer's left. Composition: vertical 2:3 canvas, character occupies about 90% height, centered, generous clean silhouette and a little transparent space around all limbs, no crop. Style: exquisite Japanese light-novel character illustration, clean thin expressive linework, soft cel shading with restrained gradients, luminous eyes, detailed but uncluttered garments. Palette: ivory white, pale mint, emerald, tiny warm-gold accents. Soft even studio-like lighting with no cast shadow outside the figure. Background: truly transparent alpha, cutout, not white, no checkerboard pattern. Text: none. Avoid: extra characters, props, scenery, floating particles, logos, letters, labels, watermark, UI, frame, busy ornament, childlike proportions, chibi, sexualization.
```

### Claude

工具：内建 `image_gen.imagegen`；`transparent_background: true`；输入 `assets/mascots/gpt.png` 仅作自有图的画风与构图参考，不作身份复制。

```text
Use case: stylized-concept. Input image is STYLE AND FRAMING REFERENCE ONLY, not an edit target. Generate a NEW different character: an ORIGINAL adult female personification of Claude, the warm literary companion in the same three-character website sprite set. Preserve the reference's exquisite light-novel cel-shaded drawing quality, thin clean lines, normal adult anime body proportions, full-body standing composition and soft shading, but use a distinct orange/cream character design. Subject: clearly adult woman, warm amber eyes, long soft copper-orange hair with a loose braid over one shoulder, a small apricot flower / simple starburst hair ornament (not an actual logo), NO horns and NO cat ears. Gentle thoughtful smile. Wardrobe: elegant ivory blouse with long sleeves and high collar, soft apricot cardigan with restrained fine embroidery, a flowing rust/apricot calf-length skirt, cream low boots. Tasteful professional literary fashion, modest, no cleavage. She cradles one CLOSED small cream book against her waist with her left arm, right hand lifts with one finger near the book as if about to share an idea. Pose nearly frontal, slight three-quarter toward viewer's left. Composition: vertical 2:3 canvas, figure from the top of her hair to the bottom of both boots entirely inside image, about 90% canvas height, no crop. Palette: copper orange, warm apricot, cream white, muted brown, tiny gold details. Lighting soft and even, no glow or shadow outside the silhouette. Background MUST be truly fully transparent alpha outside the character, clean isolated cutout, no black/gray/white backdrop, no vignette or gray mist, no checkerboard. Text: none, book cover blank. No watermark, logos, labels, UI, border, scenery, particles, extra characters, chibi, childlike body or sexualization.
```

### DeepSeek

工具：内建 `image_gen.imagegen`；`transparent_background: true`；输入 `assets/mascots/gpt.png`、`assets/mascots/claude.png` 仅作自有图的统一画风与构图参考。

```text
Use case: stylized-concept. The two input images are STYLE, ADULT PROPORTIONS, FULL-BODY FRAMING and QUALITY REFERENCES ONLY. Create a NEW third distinct character for the same set: an ORIGINAL adult female personification of DeepSeek with an ocean/whale design. Do not copy an existing artist's character or maid outfit; do not reuse either input character's face or outfit. Subject: clearly adult woman with normal adult anime proportions, sparkling blue eyes, midnight-blue long hair with soft blue gradients at the ends, a small white whale-shaped hair clip, a separate simple blue fin-like ribbon accessory. Friendly lively gentle smile. Wardrobe: elegant modest contemporary white blouse with a navy sailor-like collar under a cropped pale-blue jacket, tasteful navy/blue flowing below-knee skirt with a subtle wave hem, neat white ankle boots; clean oceanic researcher/guide aesthetic, no cleavage, no maid headdress. A small decorative whale-tail ribbon drapes visibly from her waist to one side, not a huge background object. Her left palm is open in a light inviting presenting gesture and her right hand rests near her heart, distinct from the other two poses. Nearly frontal, slight three-quarter toward viewer's left. Composition: vertical 2:3 canvas, standing full body from the highest hair ornament to both shoes completely inside the frame, centered and about 90% of image height, nothing cropped. Same refined Japanese light-novel cel-shading, delicate expressive linework, luminous eyes, clean readable silhouette and soft garment shading as the reference sprites. Palette: midnight blue, clear sky blue, ivory white, tiny silver accents. Soft even light without drop shadow, glow or vignette. Background: true transparent alpha outside the figure, clean isolated cutout, no white/gray/black background, no haze or ocean scenery. Text: absolutely none. No logos, letters, captions, watermark, UI, border, scenery, particles, extra characters, childlike proportions, chibi, or sexualization.
```

## 网站转换

```sh
cwebp -quiet -q 86 -m 6 -resize 640 960 -alpha_q 100 assets/mascots/gpt.png -o assets/mascots/gpt.webp
cwebp -quiet -q 86 -m 6 -resize 640 960 -alpha_q 100 assets/mascots/claude.png -o assets/mascots/claude.webp
cwebp -quiet -q 86 -m 6 -resize 640 960 -alpha_q 100 assets/mascots/deepseek.png -o assets/mascots/deepseek.webp
```

## 目检与透明度验证

- 已逐张在美术子窗口查看原图，画风一致，人物头部、手部、裙摆和双脚均完整，无文字、UI、水印或额外角色。
- GPT 的龙角、绿色编结；Claude 的橘发花饰、书本；DeepSeek 的蓝发鲸鱼发饰和鲸尾缎带均可辨识。
- PNG 文件为 RGBA，alpha 实测范围 0–254，四角 alpha=0；全透明像素比例约 GPT 59.71%、Claude 65.67%、DeepSeek 58.36%。带柔和抗锯齿边缘。图像工具的黑底预览不代表素材有黑底。
- 三张均为 PNG 1024×1536，页面优化版 WebP 640×960，保持透明通道。
- 网页截图视觉验收由主窗口提供真实预览后，在同一美术子窗口继续完成，尚未将资产目检写成整页视觉通过。

| 角色 | PNG 源文件（字节） | WebP 页面文件（字节） |
| --- | ---: | ---: |
| GPT | `assets/mascots/gpt.png` — 1,829,952 | `assets/mascots/gpt.webp` — 98,678 |
| Claude | `assets/mascots/claude.png` — 1,812,045 | `assets/mascots/claude.webp` — 80,390 |
| DeepSeek | `assets/mascots/deepseek.png` — 1,916,304 | `assets/mascots/deepseek.webp` — 97,560 |

生成源文件仍保留在 `$CODEX_HOME/generated_images/01a1ced9-8918-7040-ba1d-bb0c555218c8/`；项目消费文件已经复制进入本仓库，不依赖该缓存目录。

## 网页视觉 QA：第一轮

2026-11-12，子窗口目检 `studio/projects/uo-theme/evidence/UOT-003/desktop-v1.png`：浅青白配色、品牌区、圆角卡片与双栏布局方向协调。但此截图**未通过**页面视觉验收：文章卡片整体处于几乎透明状态，角色舞台没有显示立绘。已将这两项作为必须修复问题回交主窗口；要求内容默认可见并确认图片加载/decode后再取稳态截图。辅助文字对比和角色切换文字字号可进一步提高。

## 网页视觉 QA：第二轮

子窗口目检真实 WordPress 预览截图：

- `studio/projects/uo-theme/evidence/UOT-003/desktop-light-v2.png`
- `studio/projects/uo-theme/evidence/UOT-003/desktop-dark.png`
- `studio/projects/uo-theme/evidence/UOT-003/mobile-v1.png`
- `studio/projects/uo-theme/evidence/UOT-003/mobile-companion-v1.png`

第一轮两项阻断问题已解决：文章标题与摘要恢复正常可读，DeepSeek 立绘完整显示且透明边缘干净。桌面双栏比例、白天/夜间色调与卡片层级协调；手机文章卡片未横溢，角色弹层的角色、对话、快捷按钮、输入栏与关闭按钮均在屏内。未发现必须阻断本轮交付的美术问题，可作为用户审核候选；本记录不是用户最终视觉验收。

可选细化：移动端摘要可从 12px 提至 13px；陪伴弹层开启时可隐藏外部启动按钮以减少重复入口；浅色截图的角色略柔，若存在额外模糊滤镜可酌情移除。未以这些建议扩大本轮必做范围。
