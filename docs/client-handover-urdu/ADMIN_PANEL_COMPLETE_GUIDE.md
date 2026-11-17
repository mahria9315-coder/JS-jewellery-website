# ایڈمن پینل مکمل گائیڈ (Admin Panel Complete Guide - Urdu)

یہ گائیڈ JS Jewellers کے **Admin Panel (ایڈمن پینل)** کے تمام حصوں، صفحات، اور بنیادی کاموں کا جائزہ دیتی ہے۔

## 1) رسائی اور لاگ ان (Access)
- لاگ ان صفحہ: `/admin/login`
- پہلا ایڈمن سیٹ اپ (اگر کوئی ایڈمن اکاؤنٹ موجود نہ ہو): `/admin/setup`
- MFA/توثیق صفحات (اگر فعال/لاگو ہوں): `/admin/mfa`, `/admin/mfa/verify`, `/admin/mfa/codes`
- ڈیش بورڈ: `/admin` (لاگ ان کے بعد)

اہم:
- ایڈمن علاقہ نجی ہے؛ صرف مجاز عملہ استعمال کرے۔
- ہر صفحہ سرور پر اجازت (permission) چیک کرتا ہے۔ مینو میں وہی آئٹمز نظر آئیں گے جن کی اجازت آپ کے رول کو ہو۔

## 2) نیویگیشن/سیکشنز (Admin Sections - موجودہ)
نیویگیشن گروپس اور صفحات (راستے) درج ذیل ہیں:

### Overview
- **Dashboard** (`/admin`) — خلاصہ اعدادوشمار، ادائیگی کنفیگریشن اسٹیٹس، اور آپریشنل گزرگاہیں۔
- **Reports** (`/admin/reports`) — رپورٹس (دستیاب ڈیٹا کے مطابق)۔

### Catalogue
- **Products** (`/admin/products`) — پروڈکٹ لسٹ، نیا پروڈکٹ (`/admin/products/new`)، ایڈٹ (`/admin/products/[id]`)، پری ویو (`/admin/products/[id]/preview`)۔
- **Categories** (`/admin/categories`, `/admin/categories/[id]`)۔
- **Brands** (`/admin/brands`, `/admin/brands/[id]`)۔
- **Inventory** (`/admin/inventory`, `/admin/inventory/[id]`) — اسٹاک/انوینٹری ریکارڈز۔

### Sales
- **Orders** (`/admin/orders`, `/admin/orders/[id]`) — آرڈر لسٹ/فلٹر اور تفصیلی مینجمنٹ۔
- **Returns** (`/admin/returns`) — واپسی درخواستیں۔
- **Customers** (`/admin/customers`, `/admin/customers/[id]`) — گاہک ریکارڈز۔

### Suppliers
- **Suppliers** (`/admin/suppliers`, `/admin/suppliers/[id]`) — سپلائر ریکارڈز، تصدیق، معاہدہ/نوٹس وغیرہ۔

### Website
- **Pages** (`/admin/content`, `/admin/content/[id]`) — مواد/صفحات کی مینجمنٹ۔
- **Homepage** (`/admin/content/homepage`)۔
- **Navigation** (`/admin/navigation`)۔
- **Media** (`/admin/media`)۔
- **SEO** (`/admin/seo`)۔

### Administration
- **Business settings** (`/admin/settings/business`) — اسٹور/رابطہ اور ریٹرن متعلق سیٹنگز۔
- **Payment methods** (`/admin/settings/payments`) — دستی ادائیگی طریقوں کی سیٹنگز۔
- **Shipping** (`/admin/settings/shipping`) — ڈیلیوری تخمینہ، زون، اور کورئیر کمپنیاں۔
- **Notifications** (`/admin/settings/notifications`)۔
- **Admin users** (`/admin/users`, `/admin/users/[id]`) — صرف Super Admin (اگر اجازت ہو)۔
- **Roles** (`/admin/roles`) — صرف Super Admin۔
- **Audit log** (`/admin/audit`) — سرگرمیوں کا ریکارڈ۔
- **My account** (`/admin/account`) — اپنا اکاؤنٹ/سیکیورٹی اقدامات۔

### دیگر
- **Search** (`/admin/search`) — ایڈمن تلاش (اگر دستیاب ہو)۔

## 3) Dashboard (ڈیش بورڈ) پر کیا ملتا ہے
- ڈیٹا بیس دستیاب ہو تو خلاصہ شمار (مثلاً Suppliers, Products, Published products, Orders, Payments to verify, Open return requests)۔
- ادائیگی کنفیگریشن کا اسٹیٹس (صرف کنفیگرڈ/نامکمل اور env key ناموں جیسی غیر خفیہ معلومات)۔
- آپریشنل قواعد کی یاددہانی: ادائیگی خودکار verify نہیں ہوتی، پروڈکٹ اشاعت کے گزرگاہیں، ریٹرن کٹوتی سرور رولز سے، بین الاقوامی ڈیلیوری/ریٹرن تب تک نہیں جب تک ترتیب نہ ہو۔

## 4) عام کاموں کا خلاصہ
- **پروڈکٹ شامل/اپڈیٹ:** Catalogue → Products (تفصیل `PRODUCT_MANAGEMENT_URDU.md`)
- **آرڈر دیکھنا/اسٹیٹس اپڈیٹ/ادائیگی تصدیق:** Sales → Orders (`ORDER_MANAGEMENT_URDU.md`, `PAYMENT_GUIDE_URDU.md`)
- **سپلائر/کورئیر:** Suppliers اور Administration → Shipping (`SUPPLIER_COURIER_GUIDE_URDU.md`)
- **سیٹنگز:** Administration → Settings صفحات (`WEBSITE_SETTINGS_GUIDE_URDU.md`)
- **اکاؤنٹ/سیکیورٹی:** My account اور لاگ ان/MFA (`ACCOUNT_SECURITY_GUIDE_URDU.md`)

## 5) اجازتیں اور کردار (Roles & Permissions)
- سسٹم میں مختلف ایڈمن رولز/اجازتیں موجود ہیں (مثلاً سپر ایڈمن اور دیگر انتظامی کردار)۔
- جو صفحہ/ایکشن آپ کے رول کو اجازت نہیں دیتا، وہ مینو میں نہیں آئے گا یا رسائی روک دی جائے گی۔
- **Admin users** اور **Roles** مینجمنٹ Super Admin تک محدود ہے۔

## 6) محفوظ استعمال کے اصول
- ہر اہم تبدیلی (اسٹیٹس، قیمت، اشاعت، ادائیگی تصدیق) سے پہلے حقیقت کی تصدیق کریں۔
- نجی معلومات (گاہک ڈیٹا، سپلائر لاگت، اکاؤنٹ راز) محفوظ رکھیں۔
- کسی خفیہ قدر (password, API key, token) کو دستاویز/اسکرین شاٹ میں شیئر نہ کریں۔
- اگر کوئی بٹن/سیکشن آپ کے ورژن میں نہ ہو تو اندازہ نہ لگائیں؛ دستیاب اختیارات ہی استعمال کریں۔
