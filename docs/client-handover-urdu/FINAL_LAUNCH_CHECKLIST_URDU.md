# حتمی لانچ چیک لسٹ (Final Launch Checklist - Urdu)

یہ چیک لسٹ لانچ سے پہلے لازمی جانچ کے لیے ہے۔ ہر آئٹم کو **PASS** / **FAIL** / **BLOCKED** / **CLIENT ACTION REQUIRED** میں سے ایک حیثیت دیں۔

**حتمی اعلان:** اگر کوئی بھی لازمی (Mandatory) شق PASS نہ ہو تو لانچ کی حیثیت **NO-GO** ہے۔

> نوٹ: نیچے دی گئی ابتدائی حیثیتیں پروجیکٹ کی موجودہ تصدیق شدہ دستاویزات/حالت کے مطابق تجویز کردہ ہیں (کوڈ/ڈاکس آڈٹ کی بنیاد پر)۔ حقیقی لانچ سے پہلے کلائنٹ/آپریٹر کو اپنی ماحولیات میں دوبارہ تصدیق کرنی ہوگی۔

## A. ماحول اور کنفیگریشن (Environment & Configuration)
| # | لازمی چیک | ذمہ دار | حیثیت | نوٹ/ثبوت |
| --- | --- | --- | --- | --- |
| A1 | پروڈکشن سرور env میں تمام required ویلیوز درست سیٹ ہوں (`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, secrets, MFA key, blob token وغیرہ) | Client/Operator | CLIENT ACTION REQUIRED | `npm run env:check` پروڈکشن ماحول میں چلانا ضروری؛ اقدار اس دستاویز میں درج نہیں۔ |
| A2 | `NEXT_PUBLIC_SITE_URL` پروڈکشن https اور درست ڈومین ہو (localhost نہیں) | Client | CLIENT ACTION REQUIRED | ڈومین/ہوسٹنگ کلائنٹ پر منحصر۔ |
| A3 | ریٹ لمیٹنگ پروڈکشن کے مطابق (Upstash یا منظور شدہ متبادل) کنفیگر ہو | Client/Operator | CLIENT ACTION REQUIRED | پروڈکشن env میں تصدیق درکار۔ |

## B. بلڈ، کوالٹی، اور ایپ (Build & App Readiness)
| # | لازمی چیک | ذمہ دار | حیثیت | نوٹ/ثبوت |
| --- | --- | --- | --- | --- |
| B1 | مقامی/ریپو سطح پر `npm run build` کامیاب (تصدیق شدہ) | Developer | PASS | پروجیکٹ رپورٹ میں کامیاب بلڈ درج ہے (مقامی تصدیق). |
| B2 | `npm run lint` اور `npm run typecheck` کامیاب (تصدیق شدہ) | Developer | PASS | مقامی تصدیق رپورٹ کے مطابق۔ |
| B3 | پروڈکشن ڈیپلائمنٹ/ہوسٹنگ پر ایپ چلنے کی تصدیق | Client/Operator | CLIENT ACTION REQUIRED | ہوسٹنگ اکاؤنٹ/ڈیپلائمنٹ کلائنٹ کے پاس۔ |

## C. ڈیٹا بیس، مائیگریشن، بیک اپ
| # | لازمی چیک | ذمہ دار | حیثیت | نوٹ/ثبوت |
| --- | --- | --- | --- | --- |
| C1 | پروڈکشن PostgreSQL تیار، رسائی محفوظ، migrations کا پلان نافذ | Client/Operator | CLIENT ACTION REQUIRED | پروڈکشن DB/رسائی کلائنٹ فراہم کرے۔ |
| C2 | پروڈکشن ڈیٹا بیس کا بیک اپ لیا گیا ہو | Client/Operator | CLIENT ACTION REQUIRED | `npm run db:backup` اسکرپٹ موجود؛ پروڈکشن بیک اپ باقی۔ |
| C3 | الگ ڈیٹا بیس پر restore rehearsal کامیاب ہو | Client/Operator | CLIENT ACTION REQUIRED | رہنمائی `BACKUP_RECOVERY_GUIDE_URDU.md` میں؛ مشق باقی۔ |
| C4 | بیک اپ آف سائٹ، انکرپٹڈ، اور رسائی کنٹرول کے ساتھ محفوظ ہو | Client | CLIENT ACTION REQUIRED | پالیسی/اسٹوریج کلائنٹ نافذ کرے۔ |

## D. سیکیورٹی اور ایڈمن رسائی
| # | لازمی چیک | ذمہ دار | حیثیت | نوٹ/ثبوت |
| --- | --- | --- | --- | --- |
| D1 | پہلا Super Admin اکاؤنٹ محفوظ طریقے سے بنایا گیا ہو | Client | CLIENT ACTION REQUIRED | `/admin/setup` + `ADMIN_SETUP_SECRET` (ایک وقتی)۔ |
| D2 | `ADMIN_SETUP_SECRET` استعمال کے بعد ہٹایا/روٹیٹ کیا جائے | Client/Operator | CLIENT ACTION REQUIRED | سیٹ اپ مکمل ہونے کے بعد عمل کریں۔ |
| D3 | ایڈمن MFA/مضبوط پاس ورڈ اور رسائی کنٹرول نافذ ہوں | Client | CLIENT ACTION REQUIRED | اکاؤنٹ سیکیورٹی کلائنٹ لاگو کرے۔ |
| D4 | خفیہ اقدار (passwords, API keys, tokens) محفوظ اور غیر شیئر ہوں | Client/Developer | CLIENT ACTION REQUIRED | کسی دستاویز میں secrets شامل نہ کریں۔ |

## E. بزنس ڈیٹا اور آپریشنز
| # | لازمی چیک | ذمہ دار | حیثیت | نوٹ/ثبوت |
| --- | --- | --- | --- | --- |
| E1 | حقیقی سپلائرز، معاہدے، تصویر حقوق، قیمت/اسٹاک تصدیق شدہ ہوں | Client | CLIENT ACTION REQUIRED | فرضی ڈیٹا ممنوع؛ dropshipping تصدیقات ضروری۔ |
| E2 | ادائیگی اکاؤنٹس (Bank Transfer/Easypaisa) سرور پر درست کنفیگر اور دستیاب ہوں | Client/Operator | CLIENT ACTION REQUIRED | صرف configured طریقے checkout پر آئیں گے۔ |
| E3 | Payment Verification کا عمل (اصل اکاؤنٹ ریکارڈ سے) طے اور عملہ تربیت یافتہ ہو | Client | CLIENT ACTION REQUIRED | اسکرین شاٹ پر انحصار نہ کریں۔ |
| E4 | کورئیر کمپنی، اکاؤنٹ، زیورات قبولیت، اور منزلیں تصدیق شدہ ہوں | Client | CLIENT ACTION REQUIRED | شامل کرنا = منظوری نہیں۔ |
| E5 | COD غیر فعال رہے (approved scope) | Developer/Client | PASS | پروجیکٹ اسکوپ میں COD دستیاب نہیں۔ |
| E6 | پالیسی/رابطہ/ڈیلیوری معلومات درست اور شائع شدہ ہوں | Client | CLIENT ACTION REQUIRED | بزنس معلومات کلائنٹ کی تصدیق سے۔ |

## F. مشاہدہ اور آخری منظوری (Monitoring & Sign-off)
| # | لازمی چیک | ذمہ دار | حیثیت | نوٹ/ثبوت |
| --- | --- | --- | --- | --- |
| F1 | لانچ کے بعد مانیٹرنگ/الرٹس/سپورٹ عمل طے ہو | Client | CLIENT ACTION REQUIRED | آپریشنل منصوبہ درکار۔ |
| F2 | کلائنٹ کی حتمی تحریری منظوری (go-live sign-off) | Client | CLIENT ACTION REQUIRED | تمام پیشگی شرائط پورے ہونے کے بعد۔ |

## نتیجہ (Final Decision)
- **PASS:** تمام لازمی آئٹمز PASS ہوں۔
- **NO-GO:** اگر کوئی لازمی آئٹم FAIL, BLOCKED, یا CLIENT ACTION REQUIRED ہو۔

**موجودہ تجویز کردہ حالت (اس پیکج کی تیاری کے وقت): _NO-GO_** — پروڈکشن env/ڈیٹا بیس/بیک اپ-ریسٹور مشق/اکاؤنٹس اور کلائنٹ تصدیقات باقی ہیں۔
