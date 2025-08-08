
# Cache Reset Kit (dm-v7)

این بسته برای حل مشکل لود شدن `app.js` قدیمی است.

## فایل‌ها
- `purge.html`: همهٔ کش‌ها را حذف و Service Worker را Unregister می‌کند.
- `sw.js`: سرویس‌ورکر جدید با کلید **dm-v7** که برای `assets/app.js` و `assets/data.json` سیاست **Network-First** دارد.

## مراحل
1) این دو فایل را در ریشهٔ GitHub Pages خودتان **آپلود و جایگزین** کنید:
   - `purge.html`
   - `sw.js`
2) آدرس `purge.html` را باز کنید و دکمهٔ «پاکسازی الان» را بزنید:
   `https://YOUR-PAGES/purge.html`
3) صفحهٔ اصلی اپ را رفرش کنید (CTRL+F5). حالا باید `assets/app.js?v=5` از شبکه بیاید.
4) برای اطمینان، `diagnostics_v2.html` را باز کنید؛ باید «contains v5 features» سبز باشد.
