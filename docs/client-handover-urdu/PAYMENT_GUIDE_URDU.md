# ادائیگی گائیڈ (Payment Guide - Urdu)

یہ گائیڈ JS Jewellers میں دستی ادائیگی (Manual Payment) کے طریقوں، گاہک کے سبمیشن، اور ایڈمن کی تصدیق (Payment Verification) کو آسان اردو میں بیان کرتی ہے۔

## 1) دستیاب ادائیگی کے طریقے (Available Payment Methods)
اس پروجیکٹ میں دستی/manual طریقے سپورٹڈ ہیں:
- **Bank Transfer (بینک ٹرانسفر)**
- **Easypaisa (ایزی پیسہ)**

اہم باتیں:
- **Cash on Delivery (COD)** اس approved scope میں دستیاب نہیں ہے۔
- Checkout پر صرف وہی طریقہ نظر آتا ہے جو سرور کنفیگریشن میں درست طور پر configured/enabled ہو۔
- ادائیگی کے اصل اکاؤنٹ نمبر/تفصیلات سرور کی محفوظ سیٹنگز (server-only configuration / environment variables) سے آتی ہیں؛ ایڈمن پینل میں یہ خفیہ اقدار دکھائی یا تبدیل نہیں کی جاتیں۔

## 2) گاہک کی طرف سے ادائیگی کا عمل (Customer Flow)
1. گاہک cart میں اشیاء شامل کرتا ہے۔
2. **Checkout** میں ڈیلیوری تفصیلات بھرتا ہے اور دستیاب ادائیگی طریقہ منتخب کرتا ہے۔
3. آرڈر بننے کے بعد آرڈر کی نجی تصدیقی صفحہ (`/orders/<orderNumber>?token=...`) پر جاتا ہے۔
4. صفحہ پر منتخب طریقے کی ہدایات، اکاؤنٹ تفصیلات (اگر configured ہوں)، **کل رقم (Total)**، اور **Payment Reference** دکھائی دیتی ہیں۔
5. گاہک درست رقم بھیجتا ہے اور Payment Reference شامل کرتا ہے۔
6. گاہک اپنا **transaction reference** (اور اختیاری نوٹ) سبمٹ کرتا ہے۔

اہم ہدایات گاہک کے لیے:
- صرف اسی اکاؤنٹ میں رقم بھیجیں جو آرڈر صفحہ پر دکھایا گیا ہو۔
- درست کل رقم بھیجیں۔
- Payment Reference شامل کریں تاکہ تصدیق آسان ہو۔

## 3) ادائیگی کی حالتیں (Payment Statuses - Real)
یہ سسٹم میں موجود اصل Payment States ہیں:

| Status (English) | آسان مطلب (Urdu) |
| --- | --- |
| `PENDING` (Pending payment) | ادائیگی ابھی موصول/سبمٹ نہیں ہوئی یا انتظار میں ہے |
| `SUBMITTED` (Payment submitted) | گاہک نے ٹرانزیکشن ریفرنس/تفصیل سبمٹ کر دی؛ دستی تصدیق باقی ہے |
| `VERIFIED` (Payment verified) | ایڈمن نے اصل ریکارڈ سے رقم موصولی کی تصدیق کر لی |
| `REJECTED` (Payment rejected) | سبمٹ شدہ تفصیل/ادائیگی درست ثابت نہیں ہوئی |
| `REFUNDED` (Refunded) | رقم واپس کی جا چکی ہے (ریکارڈ شدہ) |

### منتقلی کے اصول (Transitions - as implemented)
- گاہک: `PENDING -> SUBMITTED`، `REJECTED -> SUBMITTED` (دوبارہ درست تفصیل کے ساتھ)
- ایڈمن: `PENDING -> REJECTED`, `SUBMITTED -> VERIFIED`, `SUBMITTED -> REJECTED`, `VERIFIED -> REFUNDED`
- گاہک کبھی بھی ادائیگی کو خود `VERIFIED` نہیں کر سکتا۔
- ادائیگی کبھی خودکار طور پر موصول/Verified نہیں ہوتی۔

## 4) ایڈمن کی طرف سے Payment Verification (Admin Verification)
Admin Panel میں: **Sales → Orders → Manage** (آرڈر تفصیل صفحہ)

تصدیق سے پہلے ضروری چیک:
1. آرڈر نمبر اور گاہک کی تفصیل ملائیں۔
2. رقم کی مقدار آرڈر کے Total سے ملتی ہو۔
3. ادائیگی **اصل بینک/ایزی پیسہ اکاؤنٹ ریکارڈ** میں موصول ہوئی ہو (اسٹیٹمنٹ/اکاؤنٹ ہسٹری)۔
4. گاہک کا دیا گیا transaction reference اور Payment Reference مددگار ثبوت ہو سکتے ہیں، مگر **صرف اسکرین شاٹ پر اعتماد نہ کریں**۔

کارروائی:
- اگر رقم واقعی موصول اور درست ہے: ادائیگی کو **VERIFIED** کریں (سسٹم میں صرف اجازت شدہ منتقلی ممکن ہے)۔
- اگر تفصیل غلط/رقم نامکمل/موصول نہیں: **REJECTED** کریں اور نوٹ/وجہ درج کریں (جہاں سسٹم مانگے)۔
- اگر درست ریفنڈ ہو چکا ہو: متعلقہ عمل کے بعد **REFUNDED** ریکارڈ کریں (سسٹم کے مطابق)۔

اہم اصول:
- Payment Status اور Order Status الگ ہیں؛ ادائیگی verify کرنا خود بخود آرڈر کی ہر عملی حالت مکمل نہیں کرتا۔
- کسی ادائیگی کو بغیر حقیقی تصدیق کے Verified نہ کریں۔

## 5) ادائیگی سیٹنگز (Payment Settings - Admin)
Admin Panel میں: **Administration → Payment methods** (`/admin/settings/payments`)

یہاں کیا کیا جا سکتا ہے (جو سسٹم میں موجود ہے):
- ہر طریقے کا **Public label** سیٹ کرنا۔
- **Public instructions** (اختیاری) لکھنا — صرف عمومی ہدایات، اکاؤنٹ نمبر نہیں۔
- طریقہ **Enable/Disable** کرنا (اگر سرور credentials configured ہوں)۔
- کنفیگریشن اسٹیٹس دیکھنا (configured/not configured، missing environment variable names، last updated وغیرہ)۔

یہاں کیا نہیں کیا جا سکتا:
- اکاؤنٹ نمبر/اکاؤنٹ ہولڈر کی خفیہ اقدار ایڈمن UI میں داخل یا ظاہر نہیں ہوتیں۔

## 6) عام مسائل (Payment Related)
- **Checkout پر طریقہ نہیں دکھ رہا:** طریقہ configured/enabled نہیں، یا سرور env/سیٹنگ مکمل نہیں۔
- **آرڈر پر instructions نہیں دکھ رہیں:** متعلقہ طریقے کی سرور کنفیگریشن نامکمل ہے — گاہک کو غیر تصدیق شدہ اکاؤنٹ میں رقم نہ بھیجنے دیں۔
- **Payment SUBMITTED مگر VERIFIED نہیں:** اصل اکاؤنٹ ریکارڈ چیک کریں؛ موصول نہ ہو تو Reject کریں اور گاہک کو درست تفصیل دوبارہ بھیجنے کو کہیں۔

مزید دیکھیں: `ORDER_MANAGEMENT_URDU.md`, `WEBSITE_SETTINGS_GUIDE_URDU.md`, `TROUBLESHOOTING_URDU.md`۔
