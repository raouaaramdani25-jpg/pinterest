import fs from 'fs';
import path from 'path';
import { Article } from '@/types';
import { buildAmazonSearchUrl } from './amazon';

const DATA_DIR = path.join(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const IS_SERVERLESS = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

const INITIAL_ARTICLES: Article[] = [
  {
    id: 'cozy-reading-nooks-2025',
    slug: '10-cozy-reading-nook-ideas',
    title: '10 Cozy Reading Nook Ideas That Will Make You Never Want to Leave Your House',
    metaDescription: 'Transform any forgotten corner into an aesthetic, warm reading nook. From plush boucle accent chairs to warm amber lighting, here are 10 cozy essentials you can get right now.',
    category: 'Home Decor',
    tags: ['Cozy Decor', 'Reading Nook', 'Amazon Home', 'Aesthetic Room'],
    createdAt: new Date().toISOString(),
    status: 'draft',
    items: [
      {
        id: 'item-1',
        itemNumber: 1,
        title: 'Plush Bouclé Swivel Accent Chair',
        description: 'The foundation of every dreamy reading nook is the chair. A creamy, textured bouclé swivel chair offers the perfect balance of cloud-like comfort and high-end aesthetic appeal. Pair it with an oversized throw blanket for immediate warmth.',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
        imagePrompt: 'Cozy cream boucle swivel chair beside a sunlit window with a warm knitted throw blanket, aesthetic minimalist interior, 8k',
        amazonKeyword: 'boucle swivel accent chair cream',
        amazonSearchUrl: buildAmazonSearchUrl('boucle swivel accent chair cream'),
        ctaText: 'Shop Bouclé Accent Chairs on Amazon',
        estimatedPrice: '$180 - $290',
      },
      {
        id: 'item-2',
        itemNumber: 2,
        title: 'Minimalist Arc Floor Lamp with Warm Fabric Shade',
        description: 'Overhead bright lighting kills cozy ambiance instantly. Opt for an elegant brass or matte black arc floor lamp with a soft 2700K warm LED bulb. It casts a gentle downward glow that is easy on the eyes while you get lost in your favorite book.',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
        imagePrompt: 'Warm glowing arched floor lamp leaning over a comfortable reading armchair, evening golden hour ambiance, cozy interior',
        amazonKeyword: 'brass arc floor lamp warm lighting',
        amazonSearchUrl: buildAmazonSearchUrl('brass arc floor lamp warm lighting'),
        ctaText: 'Find Matching Arc Lamps on Amazon',
        estimatedPrice: '$45 - $89',
      },
      {
        id: 'item-3',
        itemNumber: 3,
        title: 'Natural Handwoven Jute & Wool Textured Area Rug',
        description: 'Grounding your nook with a soft, textured rug creates an intimate room-within-a-room feeling. A blend of organic jute and soft braided wool adds tactile richness that feels heavenly under bare feet on chilly mornings.',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        imagePrompt: 'High texture woven wool and jute bohemian area rug in a sunlit cozy nook, scandinavian interior style',
        amazonKeyword: 'braided wool jute rug 4x6',
        amazonSearchUrl: buildAmazonSearchUrl('braided wool jute rug 4x6'),
        ctaText: 'Browse Textured Area Rugs on Amazon',
        estimatedPrice: '$60 - $120',
      },
      {
        id: 'item-4',
        itemNumber: 4,
        title: 'Chunky Knit Chenille Throw Blanket',
        description: 'No cozy nook is complete without a blanket you can genuinely bury yourself in. Breathable chenille knit gives you that hefty weighted feel without trapping excess heat, and the oversized cable loops look effortlessly stylish draped over your chair.',
        imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80',
        imagePrompt: 'Oversized beige chunky knit blanket draped elegantly across a neutral linen armchair, warm cup of coffee nearby',
        amazonKeyword: 'chunky knit throw blanket beige',
        amazonSearchUrl: buildAmazonSearchUrl('chunky knit throw blanket beige'),
        ctaText: 'View Chunky Knit Throws on Amazon',
        estimatedPrice: '$35 - $65',
      },
      {
        id: 'item-5',
        itemNumber: 5,
        title: 'Fluted Ceramic Side Table for Your Hot Beverage',
        description: 'You need a dedicated perch for your matcha latte, aromatic candle, and stack of current reads. A fluted pedestal side table adds architectural interest and subtle European cafe vibes while taking up less than 15 inches of floor space.',
        imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1000&q=80',
        imagePrompt: 'Fluted travertine and ceramic round end table with a ceramic mug and stacked paperback books, cozy sunlight',
        amazonKeyword: 'fluted round side table living room',
        amazonSearchUrl: buildAmazonSearchUrl('fluted round side table living room'),
        ctaText: 'Check Fluted End Tables on Amazon',
        estimatedPrice: '$55 - $95',
      },
      {
        id: 'item-6',
        itemNumber: 6,
        title: 'Amber Glass Scented Soy Candle (Amber & Sandalwood)',
        description: 'Engage all your senses. Lighting a crackling wood-wick candle infused with warm amber, cedarwood, and vanilla transforms the atmosphere in seconds. Amber glass jars cast a dreamy flickering glow against your walls.',
        imageUrl: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1000&q=80',
        imagePrompt: 'Glowing amber glass jar candle on a wooden tray with dried botanicals, soft golden candlelight, cozy evening setting',
        amazonKeyword: 'amber glass wood wick candle sandalwood',
        amazonSearchUrl: buildAmazonSearchUrl('amber glass wood wick candle sandalwood'),
        ctaText: 'Shop Scented Amber Candles on Amazon',
        estimatedPrice: '$18 - $28',
      },
      {
        id: 'item-7',
        itemNumber: 7,
        title: 'Woven Seagrass Book & Magazine Basket',
        description: 'Keep your to-be-read stack neat and aesthetic. A natural woven belly basket or leather magazine holder keeps clutter off the floor while adding that earthy, organic modern texture Pinterest loves.',
        imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=80',
        imagePrompt: 'Handmade seagrass storage basket filled with hardback books and cozy rolled blankets beside a chair',
        amazonKeyword: 'woven seagrass storage basket handles',
        amazonSearchUrl: buildAmazonSearchUrl('woven seagrass storage basket handles'),
        ctaText: 'Find Woven Storage Baskets on Amazon',
        estimatedPrice: '$22 - $40',
      },
    ],
  },
];

function ensureDirExists() {
  if (IS_SERVERLESS) return;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

let volatileArticles: Article[] | null = null;

export function getArticles(): Article[] {
  if (IS_SERVERLESS) {
    return volatileArticles || INITIAL_ARTICLES;
  }

  ensureDirExists();
  if (!fs.existsSync(ARTICLES_FILE)) {
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(INITIAL_ARTICLES, null, 2), 'utf-8');
    return INITIAL_ARTICLES;
  }
  try {
    const raw = fs.readFileSync(ARTICLES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return INITIAL_ARTICLES;
  }
}

export function saveArticle(article: Article): void {
  if (IS_SERVERLESS) {
    const articles = [...(volatileArticles || INITIAL_ARTICLES)];
    const existingIndex = articles.findIndex((a) => a.id === article.id);

    if (existingIndex >= 0) {
      articles[existingIndex] = article;
    } else {
      articles.unshift(article);
    }

    volatileArticles = articles;
    return;
  }

  ensureDirExists();
  const articles = getArticles();
  const existingIndex = articles.findIndex((a) => a.id === article.id);

  if (existingIndex >= 0) {
    articles[existingIndex] = article;
  } else {
    articles.unshift(article);
  }

  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');
}

export function deleteArticle(id: string): void {
  if (IS_SERVERLESS) {
    volatileArticles = (volatileArticles || INITIAL_ARTICLES).filter((article) => article.id !== id);
    return;
  }

  ensureDirExists();
  const articles = getArticles().filter((a) => a.id !== id);
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');
}
