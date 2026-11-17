# ویب سائٹ سیٹنگز گائیڈ (Website Settings Guide - Urdu)

یہ گائیڈ Admin Panel کی Settings اور Website انتظامی صفحات کی وضاحت کرتی ہے۔

## 1) Business settings (بزنس سیٹنگز)
راستہ: **Administration → Business settings** (`/admin/settings/business`)

- عوامی رابطہ معلومات اور ریٹرن/پالیسی متعلق متن/قدریں یہاں سے سنبھالی جا سکتی ہیں (جو فیلڈز سسٹم میں موجود ہوں)۔
- گروپس (مثلاً Store، Returns) صفحہ پر ظاہر ہوتے ہیں۔
- **اہم:** ادائیگی اکاؤنٹ نمبر، IBAN، بینک/والیٹ راز، یا پاس ورڈ یہاں درج نہ کریں۔
- تبدیلی کے بعد **Save business settings** استعمال کریں۔

## 2) Payment methods (ادائیگی طریقے)
راستہ: **Administration → Payment methods** (`/admin/settings/payments`)

- منظور شدہ دستی طریقے: **Bank Transfer**, **Easypaisa**۔
- ہر طریقے کے لیے: Public label، Public instructions (اختیاری)، Enable/Disable (اگر سرور credentials configured ہوں)۔
- کنفیگریشن اسٹیٹس، missing environment variable names، account holder record کی غیر خفیہ حالت، اور last updated دکھ سکتا ہے۔
- اکاؤنٹ نمبرز/خفیہ اقدار UI میں نہیں دکھتیں؛ یہ سرور env/config سے آتی ہیں۔
- تفصیل: `PAYMENT_GUIDE_URDU.md`

## 3) Shipping (شپنگ/ڈیلیوری)
راستہ: **Administration → Shipping** (`/admin/settings/shipping`)

### Delivery estimate
- پاکستان کے لیے منظور شدہ تخمینہ **4–7 دن** (ڈیفالٹ/منظور شدہ حد) — اصل اقدار سیٹنگ میں دیکھی/سیٹ کی جا سکتی ہیں۔
- عوامی ڈیلیوری نوٹ (public delivery note) درج کریں؛ یہ تخمینہ ہے، ضمانت نہیں۔

### Pakistan delivery zone
- پاکستان زون کی فعالیت (Active/Inactive)، چارج (PKR)، دنوں کی حد، اور داخلی نوٹ (اگر فیلڈ موجود ہو) سیٹ ہو سکتی ہے۔
- صرف پاکستان زون یہاں مینج ہوتا ہے؛ دیگر ممالک اسی زون سیکشن سے شامل نہیں ہوتے۔

### Courier companies
- کورئیر کمپنیاں شامل/منظم کرنا، اسٹیٹس/اکاؤنٹ/زیورات قبولیت/منزلیں (destinations) وغیرہ کا انتظام اسی صفحہ پر ہوتا ہے (جو فیچرز دستیاب ہوں)۔
- کورئیر شامل کرنا منظوری نہیں؛ تفصیلی قواعد: `SUPPLIER_COURIER_GUIDE_URDU.md`

## 4) Notifications (نوٹیفکیشن سیٹنگز)
راستہ: **Administration → Notifications** (`/admin/settings/notifications`)
- اس صفحہ پر جو آپشنز/فیلڈز موجود ہوں وہی استعمال کریں۔
- اگر کوئی بیرونی سروس (ای میل/SMS وغیرہ) درکار ہو تو وہ اس پروجیکٹ کی موجودہ کنفیگریشن/دستاویزات کے مطابق ہوگی؛ غیر موجود فیچر فرض نہ کریں۔

## 5) Website content/pages/navigation/media/SEO
- **Pages:** `/admin/content` — مواد صفحات۔
- **Homepage:** `/admin/content/homepage` — ہوم پیج سیکشنز۔
- **Navigation:** `/admin/navigation` — مینو/لنکس۔
- **Media:** `/admin/media` — میڈیا اثاثے۔
- **SEO:** `/admin/seo` — صفحاتی SEO میٹا ڈیٹا۔

ان صفحات پر کام کرتے وقت:
- صرف وہی مواد شائع کریں جو درست اور تصدیق شدہ ہو۔
- خالی یا غلط لنکس/میٹا سے گریز کریں۔
- تبدیلیوں کا اثر عوامی ویب سائٹ پر پڑ سکتا ہے؛ احتیاط سے محفوظ کریں۔

## 6) Admin users, Roles, Audit
- **Admin users / Roles:** Super Admin کے لیے (اجازت کے مطابق) — صارفین اور کرداروں کا انتظام۔
- **Audit log:** اہم کارروائیوں کا ریکارڈ دیکھنے کے لیے۔

## 7) محفوظ عملی مشورہ
- سیٹنگ بدلنے سے پہلے موجودہ قدر نوٹ کر لیں۔
- عوامی متن واضح اور درست رکھیں (ڈیلیوری تخمینہ = guarantee نہیں)۔
- ایسی سیٹنگ نہ لگائیں جس کی بزنس/قانونی تصدیق نہ ہو (خصوصاً ڈیلیوری، ریٹرن، بین الاقوامی)۔
