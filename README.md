# CozySpace Automation Studio 🌿☕
> **Pinterest Traffic + Amazon Affiliate Growth Engine for [cozyspace.company](https://cozyspace.company)**

A complete, automated system designed specifically for **CozySpace** to turn Pinterest viral traffic into consistent Amazon Affiliate earnings and prepare the website for top-tier ad networks (Mediavine / Journey).

---

## 🚀 Quick Start (كيفاش تخدم السيستيم)

### 1. تشغيل الواجهة (Launch Dashboard)
- كليكي مرتين (Double Click) على الملف: **`start.bat`**
- أولا حل الـ Terminal فـ هاد الدوسي وكتب:
  ```bash
  pnpm run dev
  ```
- حل المتصفح فـ الرابط: **`http://localhost:3000`**

---

## 💎 Features & Capabilities (المميزات)

### 1. 📊 Pinterest Trends Explorer (`/trends`)
- يحلل أقوى كلمات البحث المتصاعدة فـ Pinterest (مثلاً: *Cozy Sunroom +930%*, *Air Purifying Plants +850%*, *Floral Candle Bouquets +720%*).
- كليك واحد على أي تراند باش يعمر ليك مقال واجد عليه فوراً!

### 2. ✨ Article & Listicle Creator (`/generator`)
- يولد مقالات مقسمة لـ 7 إلى 12 فقرة (Listicle).
- كل فقرة فيها:
  - صورة عالية الدقة بـ ستايل Cozy مريح وجمالي.
  - وصف عملي وممتع.
  - زر شراء أمازون مع الكلمة المفتاحية المربحة و التاغ ديالك: `cozyplace04-20`.
  - تنبيه الشفافية القانوني الإجباري لـ أمازون (FTC Disclosure) فـ أول المقال.

### 3. 📌 Pinterest Pin Studio (`/pin-studio`)
- محرك لتصميم صور Pinterest عمودية (9:16 - 1000x1500px) بجودة خارقة.
- 3 ستايلات فيروسية (Hero Badge, Split Duo, Triple Moodboard Collage).
- أشرطة نصوص جذابة ترفع نسبة الكليك (High CTR).
- زر تحميل الصورة (Download PNG) + نسخ العنوان والوصف والهاشتاغات بـ كليك واحد.

### 4. 🌐 WordPress 1-Click Publisher (`/wordpress`)
- ربط مباشر مع موقعك `cozyspace.company` عبر WordPress REST API.
- تختار واش ترفع المقال كـ **Draft** (باش تراجعو فـ wp-admin براحتك) أولا **Publish Live** ديريكت!
- تنسيق أوتوماتيكي بـ Gutenberg Blocks متوافق 100% مع قالب **Astra Theme**.

### 5. 🛡️ Amazon Operating Agreement Compliance (الأمان القانوني 100%)
- جميع الروابط تتضمن `rel="nofollow sponsored noopener"` وتفتح فـ نافذة جديدة `target="_blank"`.
- صندوق الإفصاح القانوني (*"As an Amazon Associate I earn from qualifying purchases"*) مضاف أوتوماتيكياً فـ كل مقال.
- صور حصرية وغير مأخوذة مباشرة من أمازون لحماية الحساب من الإغلاق.

---

## 📁 Settings & Credentials

جميع الإعدادات مسجلة ومحفوظة فـ الملف `.env.local`:
- **WordPress URL:** `https://cozyspace.company`
- **WordPress Username:** `CozySpaceApp`
- **Application Password:** `WfSP R4rl v3Aq DDaD jksn Iy2l`
- **Amazon Tag:** `cozyplace04-20`
- **OpenRouter:** Set `OPENROUTER_API_KEY` in `.env.local` to enable AI rewriting with `nvidia/nemotron-3.5-super-vl:free`.
- **AI Images:** Set `GEMINI_API_KEY` (or `GOOGLE_GEMINI_API_KEY`), `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_API_TOKEN` to generate replacement images automatically. Optional `HUGGINGFACE_API_KEY` (or `HF_TOKEN`) enables Hugging Face FLUX.1-schnell. The fallback order is Google Gemini, Cloudflare Workers AI, Hugging Face FLUX, Pollinations, Recraft V4.1 Flash V2, then the original image. Gemini image-generation models may require image-generation quota even when the Gemini API key itself is free; Pollinations availability and limits can change.

تقدر تبدلهم أو تيستي الاتصال من صفحة **Settings** فـ الـ Dashboard فـ أي وقت!
