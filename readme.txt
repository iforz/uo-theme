=== uo-theme ===
Contributors: iforz
Requires at least: 6.6
Requires PHP: 7.4
Stable tag: 0.6.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

== Description ==
An editorial, dependency-free blog theme with a floating in-page management panel: write and publish posts, moderate comments, upload media, manage categories/tags and customise the site without opening wp-admin. The presentation core (assets/core) is engine-agnostic and documented in docs/MARKUP-CONTRACT.md and docs/ADAPTER.md; WordPress is wired through a small adapter using core REST and nonces. Uses system fonts. Community mascot artwork is separately licensed for attributed noncommercial use; see assets/mascots/community/NOTICE.md. Decorative cover photos are separately under the Unsplash License; see assets/images/NOTICE.md.

== Installation ==
Upload the ZIP under Appearance > Themes > Add New and activate. Sign in, return to the site and use the "管理" dock (bottom-left, or Cmd/Ctrl + .) for all daily management.

== Changelog ==
= 0.6.1 =
* Pick decorative fallback covers server-side (random, no repeats per page) so each image downloads once; smaller floating buttons on phones.

= 0.6.0 =
* Complete redesign: editorial typography, warm paper palette, configurable accent colour, feature story, card grid or list layout, category chips, reading-time metadata, table of contents with scroll spy, code copy buttons, image zoom, related posts, restyled comments and footer.
* New floating management panel for signed-in editors: overview, posts/pages with a visual + HTML editor (Markdown shortcuts, paste cleanup, image upload/drag-drop, local draft recovery, scheduling, categories/tags/cover/excerpt), comment moderation and replies, media library, categories/tags, appearance and site settings with live preview. Replaces the public admin rail and wp-admin iframe.
* Classic PHP templates with a documented markup contract; engine-agnostic core plus WordPress adapter; static reference port with a mock adapter.
* Search palette (Cmd/Ctrl + K, "/") with live results; progressive navigation retained.

= 0.5.1 =
* Add three original AI-generated cartoon illustrations to the rotating cover pool; preserve authored featured images.

= 0.5.0 =
Consolidate legal notices and credits in the footer, add article copy/share controls, style native comments and image previews, and provide local fallback cover photos with provenance.
= 0.4.0 =
Fix clicks outside the theme toggle changing the palette. Add in-page native admin dialogs, aligned desktop reading rails, an optional pointer halo, progressive HTML navigation with history and View Transitions, and content refresh.
= 0.3.2 =
Read saved dark mode before first paint. Deliver complete styles and basic controls with HTML, load optional companion scripts after page load, use native emoji, and version companion URLs for caching.
= 0.3.1 =
Hide the public WordPress toolbar while keeping the admin rail; open article entry points in a new tab. Defer optional character atlases until after page load, avoid repeated unchanged style writes, and schedule idle animation at its actual frame rate.
= 0.3.0 =
Narrow reading canvas, administrator-only left menu, native theme settings and movable community GPT/Claude/DeepSeek sprite companions.

= 0.2.0 =
Two-column journal design, original GPT/Claude/DeepSeek companions, static conversation, adapter extension point, dark mode, reading progress, and reduced-motion support.
= 0.1.2 =
Fetch stable release assets through the official GitHub API for restricted server networks.
Use the configured site title and tagline in the home hero.
= 0.1.1 =
Stable GitHub release updates through the native WordPress updater, with SHA-256 verification.
= 0.1.0 =
Initial starter template. Full browser/editor compatibility acceptance remains pending.

== Copyright ==
Copyright 2026 uo. All theme code is GPLv2 or later.

Community animation packs: savanna0425/llm-pet at fdd821feb49b294ea8abe42c9cf41e6c52e3aacf. Character art: ZipZipPipe; DeepSeek original design: Shangshan (上善). Unofficial fan art. Attribution and noncommercial use required; DeepSeek additionally CC BY-NC-SA 4.0. These artwork terms do not replace the code license.
