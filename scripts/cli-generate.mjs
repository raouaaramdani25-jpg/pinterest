/**
 * CozySpace CLI Article & Pin Generator
 * Usage: node scripts/cli-generate.mjs "Topic Title" "Category"
 */
import fs from 'fs';
import path from 'path';

const topic = process.argv[2] || '10 Aesthetic Home Office Ideas for Small Spaces';
const category = process.argv[3] || 'Home Office';

const DATA_DIR = path.join(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');

const TAG = 'cozyplace04-20';

function buildSearchUrl(kw) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(kw)}&tag=${TAG}`;
}

const newArticle = {
  id: `article-${Date.now()}`,
  slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  title: topic,
  metaDescription: `Discover beautiful and cozy ${category.toLowerCase()} ideas to transform your home with aesthetic comfort and practical Amazon finds.`,
  category,
  tags: ['Cozy Decor', category, 'Amazon Home', 'Pinterest Aesthetic'],
  createdAt: new Date().toISOString(),
  status: 'draft',
  items: [
    {
      id: `item-${Date.now()}-1`,
      itemNumber: 1,
      title: 'Warm Wood Monitor Stand with Storage Drawer',
      description: 'Elevate your screen to eye level while concealing notebooks and pens. Solid bamboo or walnut wood introduces instant organic warmth to your desk setup.',
      imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80',
      imagePrompt: 'Aesthetic minimalist wooden desk setup with natural light, warm neutral tones',
      amazonKeyword: 'wooden monitor stand riser drawer',
      amazonSearchUrl: buildSearchUrl('wooden monitor stand riser drawer'),
      ctaText: 'Shop Monitor Risers on Amazon',
      estimatedPrice: '$28 - $45',
    },
    {
      id: `item-${Date.now()}-2`,
      itemNumber: 2,
      title: 'Faux Fur Ergonomic Desk Chair Cushion',
      description: 'Upgrade any standard chair with a plush sherpa or faux rabbit fur seat cushion. It delivers cloud-level softness during long creative sessions.',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
      imagePrompt: 'Cozy home office desk chair with cream faux fur cushion and knitted throw',
      amazonKeyword: 'faux fur seat cushion desk chair',
      amazonSearchUrl: buildSearchUrl('faux fur seat cushion desk chair'),
      ctaText: 'View Plush Chair Cushions on Amazon',
      estimatedPrice: '$22 - $35',
    },
    {
      id: `item-${Date.now()}-3`,
      itemNumber: 3,
      title: 'Amber Glass Ultrasonic Essential Oil Diffuser',
      description: 'Diffusing sweet orange, cedarwood, and vanilla fills your work space with a calming aroma while adding a gentle golden glow to your desktop.',
      imageUrl: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1000&q=80',
      imagePrompt: 'Amber glass aroma diffuser with soft mist on a wooden desk, aesthetic desk accessories',
      amazonKeyword: 'amber glass essential oil diffuser quiet',
      amazonSearchUrl: buildSearchUrl('amber glass essential oil diffuser quiet'),
      ctaText: 'Find Amber Diffusers on Amazon',
      estimatedPrice: '$25 - $38',
    },
  ],
};

let articles = [];
if (fs.existsSync(ARTICLES_FILE)) {
  try {
    articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));
  } catch {}
}

articles.unshift(newArticle);
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');

console.log(`✅ Generated article: "${topic}"! Added to Dashboard.`);
