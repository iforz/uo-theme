# uo-theme

Independent WordPress block theme. Keep runtime code dependency-free and compatible with WordPress 6.6+ / PHP 7.4+. Prefix PHP functions and asset handles with `uo_theme`; use the `uo-theme` text domain and escape dynamic output. Site behavior and data features belong in a separate plugin when requested.

Run `php scripts/check.php` before packaging. With a WordPress source checkout, also run `php scripts/check.php /path/to/wordpress`. Build via `php scripts/package.php`; artifacts go to the company `app_packages/uo-theme/wordpress/<version>/` directory, outside this repository. Never package credentials, test data, Git history, or development scripts.
