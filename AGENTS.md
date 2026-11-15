# uo-theme

Independent WordPress theme (classic PHP templates over an engine-agnostic core in assets/core; see docs/MARKUP-CONTRACT.md and docs/ADAPTER.md). Keep runtime code dependency-free and compatible with WordPress 6.6+ / PHP 7.4+. Prefix PHP functions and asset handles with `uo_theme`; use the `uo-theme` text domain and escape dynamic output. The in-page management panel uses core REST only (plus uo-theme/v1 settings/overview); other site behavior belongs in a separate plugin. Keep assets/core free of WordPress references.

Run `php scripts/check.php`, the PHP tests and `node tests/core.mjs` before packaging. Build via `php scripts/package.php`; artifacts go to the company `app_packages/uo-theme/wordpress/<version>/` directory, outside this repository. Never package credentials, test data, Git history, or development scripts.
