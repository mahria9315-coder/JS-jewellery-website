# بیک اپ اور بحالی گائیڈ (Backup & Recovery Guide - Urdu)

یہ گائیڈ پروجیکٹ میں موجود ڈیٹا بیس بیک اپ/ریسٹور اسکرپٹس اور محفوظ طریقہ کار بیان کرتی ہے۔ یہ دستاویز کسی لائیو بیک اپ یا ریسٹور کو خود انجام نہیں دیتی۔

## 1) اہم حقیقتیں
- بیک اپ/ریسٹور اسکرپٹس موجود ہیں، مگر پروڈکشن بیک اپ، ریسٹور مشق (rehearsal)، اور ہوسٹنگ/PITR تصدیق **کلائنٹ/مالک کی ذمہ داری** ہیں (جب تک پورے نہ ہوں)۔
- بیک اپ فائلز میں گاہک/آرڈر ڈیٹا ہو سکتا ہے: انہیں انکرپٹڈ، آف سائٹ، اور محدود رسائی کے ساتھ رکھیں۔ Git میں commit نہ کریں (`backups/` Git-ignored ہے)۔
- اسکرپٹس کنکشن اسٹرنگ/پاس ورڈ پرنٹ نہیں کرتیं۔
- **کبھی بھی لائیو/ایپلیکیشن ڈیٹا بیس پر بغیر تصدیق شدہ بیک اپ اور واضح اجازت کے ریسٹور نہ کریں۔**

## 2) دستیاب کمانڈز (Windows / project root میں)
> کمانڈز کو اسی طرح چلائیں (انگریزی میں):

```bash
npm run db:backup:check
npm run db:backup
npm run db:restore:check -- --file=backups\<backup-file>.dump
node scripts/database-restore.mjs --file=backups\<backup-file>.dump
```

اضافی (ضرورت کے مطابق):
```bash
node scripts/database-backup.mjs --run --output-dir=D:\secure-backups
node scripts/database-restore.mjs --check --file=backups\<file>.dump
node scripts/database-restore.mjs --run --confirm-restore --file=backups\<file>.dump
```

## 3) بیک اپ لینے سے پہلے (Prerequisites)
- PostgreSQL کلائنٹ ٹولز: `pg_dump`, `pg_restore` دستیاب ہوں (Windows پر PATH یا `PG_BIN` env کے ذریعے)۔
- `DATABASE_URL` (سرور/ماحول میں) درست ہو۔
- چیک کمانڈ: `npm run db:backup:check`

## 4) بیک اپ کیسے لیں (Safe plan)
1. پری چیک چلائیں: `npm run db:backup:check`
2. بیک اپ بنائیں: `npm run db:backup` (یہ custom-format, compressed dump بناتا ہے)
3. فائل کا نام/وقت نوٹ کریں اور انکرپٹڈ آف سائٹ کاپی بنائیں۔
4. کاپی کی تصدیق کے بعد ہی مقامی صفائی کے بارے میں فیصلہ کریں۔

نوٹ: بیک اپ ڈیٹا بیس کو صرف پڑھتا ہے؛ ڈیٹا تبدیل نہیں کرتا۔

## 5) ریسٹور کی محفوظ مشق (Restore Rehearsal) - لانچ سے پہلے ضروری
1. ایک **الگ/isolated** خالی PostgreSQL ڈیٹا بیس بنائیں (ایپلیکیشن ڈیٹا بیس نہیں)۔
2. `RESTORE_DATABASE_URL` کو اسی isolated ڈیٹا بیس پر سیٹ کریں (کمانڈ لائن پر نہ دیں)۔
3. پلان/چیک: `node scripts/database-restore.mjs --check --file=backups\<file>.dump`
4. واضح تصدیق کے ساتھ ریسٹور: `node scripts/database-restore.mjs --run --confirm-restore --file=backups\<file>.dump`
5. read-only تصدیق کریں (row counts، معلوم ریکارڈز، migration status وغیرہ)۔
6. تصدیق ریکارڈ کرنے کے بعد ٹیسٹ ڈیٹا بیس کو منظم طریقے سے ہٹانے کا فیصلہ کریں۔

حفاظتی رویہ (اسکرپٹس میں موجود):
- بغیر `--run` اور `--confirm-restore` کے ریسٹور شروع نہیں ہوتا۔
- اگر `RESTORE_DATABASE_URL` اور `DATABASE_URL` ایک ہی DB ہوں تو اسکرپٹ عام طور پر روک دیتا ہے (خاص اووررائیڈ کے بغیر)۔
- موجودہ objects صرف `--allow-overwrite` پر ڈراپ ہو سکتے ہیں؛ عام طور پر fresh isolated target استعمال کریں۔
- ریسٹور single transaction میں چلتا ہے۔

## 6) Rollback/Restore فیصلہ (Owner/Client)
لانچ سے پہلے مالک/آپریٹر طے کریں:
- کون ریسٹور کی اجازت دے گا
- بیک اپ کی تصدیق کیسے ہوگی
- ریسٹور کے دوران ایپلیکیشن کیسے روکیں گے/پاز کریں گے
- ناکامی کی صورت میں rollback پلان کیا ہے
- بیک اپ کہاں اور کس رسائی کنٹرول کے ساتھ رکھا جائے گا

## 7) Hosting provider backups / PITR (مثلاً Neon)
- ہوسٹنگ فراہم کنندہ کے بیک اپ/PITR پلان پر منحصر ہوتے ہیں اور اس ریپو سے تصدیق شدہ نہیں۔
- PITR کو دستیاب نہ مانیں جب تک کنسول/پلان میں تصدیق، ونڈو، اقدامات، اور ریسٹور مشق ریکارڈ نہ ہو۔
- پروڈکشن برانچ/ڈیٹا بیس پر ریسٹور مالک کی اجازت کے بغیر نہ کریں۔

## 8) ابھی کلائنٹ کے ذمہ کام (اگر باقی ہوں)
- پروڈکشن ڈیٹا بیس بیک اپ لینا اور شیڈول طے کرنا۔
- کم از کم ایک ریسٹور مشق مکمل کرنا۔
- آف سائٹ انکرپٹڈ اسٹوریج اور رسائی کنٹرول نافذ کرنا۔
- RPO/RTO اور ذمہ دار افراد دستاویزی کرنا۔
