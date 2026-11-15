# CozySpace Automation Studio 🌿☕
> **Pinterest Traffic + Amazon Affiliate Growth Engine for [cozyspace.company](https://cozyspace.company)**

A complete, automated system designed specifically for **CozySpace** to turn Pinterest viral traffic into consistent Amazon Affiliate earnings and prepare the website for top-tier ad networks (Mediavine / Journey).

## Dashboard authentication

Set these server-side environment variables in Vercel for both **Production** and **Preview**:

```env
DASHBOARD_USERNAME=your-admin-username
DASHBOARD_PASSWORD=use-a-long-random-password
DASHBOARD_AUTH_SECRET=use-a-long-random-secret
```

Never commit these values or WordPress application passwords. Dashboard sessions use signed, HttpOnly cookies.

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
- **WordPress credentials:** Configure these through environment variables or the dashboard Settings page. Do not commit credentials.
- **Amazon Tag:** `cozyplace04-20`
- **Article rewriting:** The Article Generator has a direct provider selector for Google Gemini, Groq, Cerebras, Cloudflare Workers AI, and OpenRouter. Text rewriting uses only the provider you select and reports an error instead of silently switching providers. Configure the providers you want:
  - `GEMINI_API_KEY` (or `GOOGLE_GEMINI_API_KEY` / `GOOGLE_API_KEY`) with optional `GEMINI_TEXT_MODEL` (default: `gemini-2.5-flash`)
  - `GROQ_API_KEY` with optional `GROQ_TEXT_MODEL` (default: `openai/gpt-oss-120b`; the retired `llama-3.3-70b-versatile` value is automatically replaced)
  - `CEREBRAS_API_KEY` with optional `CEREBRAS_TEXT_MODEL` (default: `llama-3.3-70b`)
  - `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` with optional `CLOUDFLARE_TEXT_REWRITE_MODEL` (default: `@cf/meta/llama-3.1-8b-instruct`)
  - `OPENROUTER_API_KEY` with optional `OPENROUTER_TEXT_MODEL` (default: `nvidia/nemotron-3.5-super-vl:free`)
  The generated article records the provider and model actually used.
- **AI Images:** Set `GEMINI_API_KEY` (or `GOOGLE_GEMINI_API_KEY`), `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_API_TOKEN` to generate replacement images automatically. Optional `HUGGINGFACE_API_KEY` (or `HF_TOKEN`) enables Hugging Face FLUX.1-schnell. The fallback order is Google Gemini, Cloudflare Workers AI, Hugging Face FLUX, Pollinations, Recraft V4.1 Flash V2, then the original image. Gemini image-generation models may require image-generation quota even when the Gemini API key itself is free; Pollinations availability and limits can change.

تقدر تبدلهم أو تيستي الاتصال من صفحة **Settings** فـ الـ Dashboard فـ أي وقت!
