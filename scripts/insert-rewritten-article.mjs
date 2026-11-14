import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const TAG = 'cozyplace04-20';

function getPollinationsUrl(prompt, seed) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=800&nologo=true&enhance=true&seed=${seed}`;
}

const newArticle = {
  id: 'article-pantry-sliding-doors-' + Date.now(),
  slug: '10-pantry-sliding-barn-door-ideas-tight-kitchens',
  title: '10 Cozy Pantry Sliding Barn Door Ideas That Save Space & Elevate Tight Kitchens',
  metaDescription: 'Struggling with a cramped kitchen? Discover 10 stunning pantry sliding barn door ideas that save floor space, hide clutter, and bring warm architectural charm. Complete with Amazon shopping links & styling tips.',
  category: 'Kitchen Decor',
  tags: ['Kitchen Decor', 'Pantry Organization', 'Barn Doors', 'Amazon Home', 'Cozy Farmhouse', 'Aesthetic Home'],
  createdAt: new Date().toISOString(),
  status: 'draft',
  items: [
    {
      id: 'pantry-item-1',
      itemNumber: 1,
      title: 'Soft Arched Stone Pantry Entry with Warm Oak Sliding Slider',
      description: 'Standard rectangular doorways often feel boxy and uninspired. Introducing a soft architectural arch lined in limewash or warm natural stone creates an instant room-within-a-room sanctuary. Pair it with an interior sliding rail and natural oak floating shelves stacked with ribbed glass canisters and handwoven rattan storage trunks. It turns everyday pantry visits into an experience reminiscent of a sun-drenched European farmhouse.',
      imageUrl: getPollinationsUrl('Aesthetic kitchen pantry with an elegant soft arched stone doorway, natural oak sliding barn door pushed open, glowing warm recessed ambient light inside showing organized glass jars and wicker baskets, 8k photography, Architectural Digest', 784210),
      imagePrompt: 'Aesthetic kitchen pantry with an elegant soft arched stone doorway, natural oak sliding barn door pushed open, glowing warm recessed ambient light inside showing organized glass jars and wicker baskets, 8k photography, Architectural Digest',
      amazonKeyword: 'sliding barn door hardware kit matte black',
      amazonSearchUrl: `https://www.amazon.com/s?k=sliding+barn+door+hardware+kit+matte+black&tag=${TAG}`,
      ctaText: 'Shop Sliding Barn Door Hardware on Amazon',
      estimatedPrice: '$45 - $89'
    },
    {
      id: 'pantry-item-2',
      itemNumber: 2,
      title: 'French Frosted 3-Panel Glass Sliding Barn Door',
      description: 'If your kitchen suffers from limited natural light, heavy solid wood doors can make the room feel closed in. A crisp white sliding barn door featuring frosted tempered glass panels diffuses gentle light throughout the kitchen while artfully blurring colorful cereal boxes and pantry clutter. Hang a small preserved eucalyptus or olive leaf wreath from the top handle to bring an organic, welcoming touch that feels effortlessly curated.',
      imageUrl: getPollinationsUrl('Bright aesthetic kitchen featuring a white sliding barn door with 3 frosted glass panels, small green eucalyptus wreath hanging on black hardware, bright airy cozy kitchen, hyperrealistic 8k', 892341),
      imagePrompt: 'Bright aesthetic kitchen featuring a white sliding barn door with 3 frosted glass panels, small green eucalyptus wreath hanging on black hardware, bright airy cozy kitchen, hyperrealistic 8k',
      amazonKeyword: 'frosted glass sliding barn door 36x84',
      amazonSearchUrl: `https://www.amazon.com/s?k=frosted+glass+sliding+barn+door+36x84&tag=${TAG}`,
      ctaText: 'Check Frosted Glass Barn Doors on Amazon',
      estimatedPrice: '$280 - $420'
    },
    {
      id: 'pantry-item-3',
      itemNumber: 3,
      title: 'Classic White K-Brace Door with Brushed Brass Hardware',
      description: 'The timeless K-brace door design remains a staple for good reason: the diagonal timber cross-brace delivers structural depth and nostalgic farmhouse appeal. To elevate it beyond traditional rustic style, swap typical heavy iron for warm brushed brass or champagne bronze track hardware. When slid open across subway tile walls, it reveals organized dark gray pantry shelving lined with matching wire baskets.',
      imageUrl: getPollinationsUrl('Classic crisp white wooden K-brace sliding barn door gliding on sleek brushed brass overhead track rail, modern cozy farmhouse kitchen with butcher block island, editorial photography', 651239),
      imagePrompt: 'Classic crisp white wooden K-brace sliding barn door gliding on sleek brushed brass overhead track rail, modern cozy farmhouse kitchen with butcher block island, editorial photography',
      amazonKeyword: 'white k brace sliding barn door kit',
      amazonSearchUrl: `https://www.amazon.com/s?k=white+k+brace+sliding+barn+door+kit&tag=${TAG}`,
      ctaText: 'View White K-Brace Barn Doors on Amazon',
      estimatedPrice: '$160 - $260'
    },
    {
      id: 'pantry-item-4',
      itemNumber: 4,
      title: 'Raw Organic White Oak Door in a Warm Minimalist Kitchen',
      description: 'Modern kitchens with sleek flat-panel greige cabinetry and marble countertops often crave organic warmth. A raw, knotty white oak sliding barn door provides that crucial tactile balance. Sliding silently on heavy-duty matte black powder-coated rollers, the honest wood grain softens cold stone surfaces and conceals floor-to-ceiling pull-out pantry spice racks and produce baskets.',
      imageUrl: getPollinationsUrl('Natural raw white oak sliding barn door with heavy matte black steel hardware, modern warm minimalist kitchen, marble countertop, soft warm morning lighting, high-end interior architecture 8k', 312894),
      imagePrompt: 'Natural raw white oak sliding barn door with heavy matte black steel hardware, modern warm minimalist kitchen, marble countertop, soft warm morning lighting, high-end interior architecture 8k',
      amazonKeyword: 'solid white oak sliding barn door slab',
      amazonSearchUrl: `https://www.amazon.com/s?k=solid+white+oak+sliding+barn+door+slab&tag=${TAG}`,
      ctaText: 'Shop Natural Oak Barn Doors on Amazon',
      estimatedPrice: '$290 - $480'
    },
    {
      id: 'pantry-item-5',
      itemNumber: 5,
      title: 'Moody Charcoal Shiplap Barn Door with Brushed Nickel Pull',
      description: 'Embrace intentional contrast by painting your sliding pantry door in deep charcoal, rich espresso, or slate gray. The horizontal or vertical shiplap grooves create subtle shadow lines that anchor an open-plan kitchen. The dark facade creates an exciting visual reveal when pulled back to showcase a brightly lit white interior packed with glass storage jars, acacia wood turntables, and woven hyacinth baskets.',
      imageUrl: getPollinationsUrl('Moody charcoal gray shiplap sliding barn door with brushed nickel handle, pulled back to reveal a beautifully organized bright pantry with wicker baskets and glass jars, cozy evening warm light', 542199),
      imagePrompt: 'Moody charcoal gray shiplap sliding barn door with brushed nickel handle, pulled back to reveal a beautifully organized bright pantry with wicker baskets and glass jars, cozy evening warm light',
      amazonKeyword: 'charcoal black shiplap sliding barn door',
      amazonSearchUrl: `https://www.amazon.com/s?k=charcoal+black+shiplap+sliding+barn+door&tag=${TAG}`,
      ctaText: 'Find Charcoal Barn Doors on Amazon',
      estimatedPrice: '$190 - $310'
    },
    {
      id: 'pantry-item-6',
      itemNumber: 6,
      title: 'Artisan Chevron-Patterned Oak with Midnight Navy Pantry Interior',
      description: 'Treat your pantry door like a piece of bespoke fine furniture. An intricate herringbone or chevron wood-panel design turns a blank kitchen wall into a striking focal point. For maximum drama, paint the pantry interior walls and shelving behind it in deep midnight navy or forest green. The juxtaposition of light honey-oak chevron patterns and deep moody shelving makes every pantry item look like an apothecary curation.',
      imageUrl: getPollinationsUrl('Artisan chevron pattern natural wood sliding barn door revealing a luxurious dark navy blue walk-in pantry with amber apothecary bottles and warm LED under-shelf lighting, 8k interior', 874122),
      imagePrompt: 'Artisan chevron pattern natural wood sliding barn door revealing a luxurious dark navy blue walk-in pantry with amber apothecary bottles and warm LED under-shelf lighting, 8k interior',
      amazonKeyword: 'chevron wood pattern sliding barn door',
      amazonSearchUrl: `https://www.amazon.com/s?k=chevron+wood+pattern+sliding+barn+door&tag=${TAG}`,
      ctaText: 'Browse Chevron Barn Doors on Amazon',
      estimatedPrice: '$240 - $390'
    },
    {
      id: 'pantry-item-7',
      itemNumber: 7,
      title: 'Weathered Walnut Two-Panel Door with Pull-Out Wooden Drawers',
      description: 'Rich, weathered walnut tones instantly convey timeless character, looking as if reclaimed from a storied European estate. A substantial two-panel design keeps the look grounded without feeling busy. Behind the door, outfit your pantry with deep slide-out dovetail wooden drawers and tiered can organizers, allowing you to access heavy cast-iron cookware and pantry staples without having to bend or dig into dark corners.',
      imageUrl: getPollinationsUrl('Weathered dark walnut two-panel sliding barn door on rustic iron track, cozy kitchen with vintage patterned runner rug, open shelves inside with glass canisters and wooden drawers, warm lighting', 198452),
      imagePrompt: 'Weathered dark walnut two-panel sliding barn door on rustic iron track, cozy kitchen with vintage patterned runner rug, open shelves inside with glass canisters and wooden drawers, warm lighting',
      amazonKeyword: 'rustic dark walnut sliding barn door',
      amazonSearchUrl: `https://www.amazon.com/s?k=rustic+dark+walnut+sliding+barn+door&tag=${TAG}`,
      ctaText: 'Shop Walnut Barn Doors on Amazon',
      estimatedPrice: '$260 - $410'
    },
    {
      id: 'pantry-item-8',
      itemNumber: 8,
      title: 'Hidden Breakfast & Coffee Nook Concealed by a Sliding Frosted Door',
      description: 'Sliding barn doors are the ultimate secret weapon for creating dedicated breakfast nooks. Conceal an espresso machine, electric kettle, and stoneware mug collection behind a wide frosted glass slider. When morning arrives, slide the door back to reveal your private cafe bar complete with warm butcher block counters and floating mug racks—then close it to keep your kitchen completely clutter-free when guests arrive.',
      imageUrl: getPollinationsUrl('Cozy kitchen coffee bar hidden behind a sliding frosted glass barn door, espresso machine steaming, stoneware coffee mugs hanging on brass hooks, warm morning sunshine, 8k', 987114),
      imagePrompt: 'Cozy kitchen coffee bar hidden behind a sliding frosted glass barn door, espresso machine steaming, stoneware coffee mugs hanging on brass hooks, warm morning sunshine, 8k',
      amazonKeyword: 'sliding barn door coffee bar cabinet',
      amazonSearchUrl: `https://www.amazon.com/s?k=sliding+barn+door+coffee+bar+cabinet&tag=${TAG}`,
      ctaText: 'Explore Coffee Bar Barn Doors on Amazon',
      estimatedPrice: '$180 - $350'
    },
    {
      id: 'pantry-item-9',
      itemNumber: 9,
      title: 'Double Bypass Frosted French Barn Doors for Walk-In Pantries',
      description: 'For wider pantry openings, a single oversized door can overwhelm your kitchen wall. Double bypass sliding barn doors glide smoothly on a single track, parting down the center like grand French doors. The frosted glass panels obscure package branding while maintaining an open, airy silhouette that makes even tight galley kitchens feel expansive.',
      imageUrl: getPollinationsUrl('Double sliding French barn doors with frosted glass panes parting open on black dual tracks, revealing an expansive walk-in pantry with subway tile and organized glass canisters, luxury cozy kitchen', 452981),
      imagePrompt: 'Double sliding French barn doors with frosted glass panes parting open on black dual tracks, revealing an expansive walk-in pantry with subway tile and organized glass canisters, luxury cozy kitchen',
      amazonKeyword: 'double sliding barn door hardware bypass track',
      amazonSearchUrl: `https://www.amazon.com/s?k=double+sliding+barn+door+hardware+bypass+track&tag=${TAG}`,
      ctaText: 'Shop Double Barn Door Tracks on Amazon',
      estimatedPrice: '$65 - $130'
    },
    {
      id: 'pantry-item-10',
      itemNumber: 10,
      title: 'Farmhouse Chalkboard Panel Sliding Door for Grocery Lists & Menus',
      description: 'Inject interactive family charm into your cooking space with a dual-purpose chalkboard barn door. The lower half features classic vertical tongue-and-groove boards, while the upper framed panel is coated in matte chalkboard paint. Use it to jot down weekly meal plans, farmers\' market shopping lists, or sweet seasonal greetings. It marries playful farmhouse warmth with everyday utility.',
      imageUrl: getPollinationsUrl('Rustic gray wood sliding barn door with an upper chalkboard panel featuring handwritten coffee menu and grocery list in elegant chalk script, cozy farmhouse kitchen, warm ambient light', 238914),
      imagePrompt: 'Rustic gray wood sliding barn door with an upper chalkboard panel featuring handwritten coffee menu and grocery list in elegant chalk script, cozy farmhouse kitchen, warm ambient light',
      amazonKeyword: 'chalkboard sliding barn door kitchen',
      amazonSearchUrl: `https://www.amazon.com/s?k=chalkboard+sliding+barn+door+kitchen&tag=${TAG}`,
      ctaText: 'Check Chalkboard Barn Doors on Amazon',
      estimatedPrice: '$175 - $290'
    }
  ]
};

let articles = [];
if (fs.existsSync(ARTICLES_FILE)) {
  try {
    articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));
  } catch {}
}

articles.unshift(newArticle);
fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');

console.log('Successfully saved rewritten article: ' + newArticle.title);
