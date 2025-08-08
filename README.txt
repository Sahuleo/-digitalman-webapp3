
# DigitalMan - app.js v4 (Strict PIN + Lockout)

**چه چیزهایی عوض شد؟**
- اعتبارسنجی سختگیرانه PIN از روی `assets/data.json`
- حذف ورود خودکار (auto-login)
- قفل ۳۰ ثانیه‌ای بعد از ۳ تلاش ناموفق
- تحمل هر دو ساختار داده: `{"employees":[...]}` یا آرایه‌ی ساده

**چگونه جایگزین کنم؟**
1) این زیپ را Extract کنید.
2) در GitHub: **Add file → Upload files**
3) فایل `assets/app.js` را بکشید و روی ریپو رها کنید تا **Overwrite** شود.
4) **Commit changes**
5) صفحه را با یکی از راه‌های زیر تازه کنید:
   - اضافه کردن `?v=4` به آخر URL: `/assets/app.js?v=4`
   - یا **Ctrl+F5**
   - یا DevTools → Application → Service Workers → Unregister → Refresh

**پیش‌نیازها**
- در HTML باید این شناسه‌ها وجود داشته باشد: `#userSelect`, `#pinInput`, `#btnLogin`, `#loginError`
- داده‌ها باید در `assets/data.json` با کلید `employees` (یا آرایه مستقیم) و فیلدهای `username`, `pin`, `full_name`, `role` باشند.
