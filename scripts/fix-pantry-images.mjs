import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');

const HIGH_RES_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', // 1. Arched Stone Pantry
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', // 2. Frosted Glass & Greenery
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', // 3. White K-Brace
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80', // 4. Raw Oak in Modern Kitchen
  'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80', // 5. Moody Charcoal Shiplap
  'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80', // 6. Chevron Oak
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', // 7. Weathered Walnut
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80', // 8. Coffee Nook
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', // 9. Double French Sliders
  'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80', // 10. Farmhouse Chalkboard & Storage
];

const articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));
const pantryArticle = articles.find((a) => a.slug.includes('pantry-sliding-barn-door'));

if (pantryArticle && pantryArticle.items) {
  pantryArticle.items.forEach((item, index) => {
    item.imageUrl = HIGH_RES_IMAGES[index] || HIGH_RES_IMAGES[0];
  });

  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');
  console.log('✅ Successfully replaced all 10 images with verified high-res aesthetic photography!');
} else {
  console.log('Could not find pantry article.');
}
