/**
 * Smart Cozy Image & AI Prompt Matcher
 * Automatically pairs extracted competitor items with high-resolution, aesthetic CozySpace imagery
 * and detailed AI image prompts for Midjourney / Gemini.
 */

interface ImageMatch {
  imageUrl: string;
  imagePrompt: string;
  category: string;
}

const COZY_IMAGE_COLLECTION: Record<string, ImageMatch> = {
  chair: {
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Cozy cream boucle accent armchair beside a rain-streaked window, warm morning sunlight, aesthetic neutral home, 8k editorial photography',
    category: 'Seating',
  },
  lamp: {
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Minimalist brass arched floor lamp emitting a warm 2700K golden downward glow over a reading chair, evening cozy aesthetic',
    category: 'Lighting',
  },
  light: {
    imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Warm ambient pendant light casting soft geometric shadows on a limewash wall, cozy scandinavian interior',
    category: 'Lighting',
  },
  blanket: {
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Oversized chunky knitted chenille throw blanket draped elegantly across a neutral linen sofa, ceramic tea mug nearby',
    category: 'Textiles',
  },
  throw: {
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Textured waffle weave beige throw blanket folded on an unmade linen bed, soft diffused daylight',
    category: 'Textiles',
  },
  rug: {
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Organic modern handwoven jute and wool textured area rug on light hardwood flooring, warm aesthetic room',
    category: 'Rugs',
  },
  table: {
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Fluted travertine and light oak round pedestal side table with an open art book and ceramic candle, cozy nook',
    category: 'Furniture',
  },
  desk: {
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Warm wood minimalist study desk with a sleek monitor stand, soft linen curtains, and a glowing task lamp',
    category: 'Office',
  },
  candle: {
    imageUrl: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Flickering amber glass wood-wick scented soy candle resting on a fluted marble tray, cozy evening golden hour',
    category: 'Home Fragrance',
  },
  diffuser: {
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Aesthetic ceramic stone essential oil diffuser gently misting aromatic vapor beside dried eucalyptus branches',
    category: 'Wellness',
  },
  basket: {
    imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Handmade woven seagrass belly storage basket filled with fluffy rolled throw blankets, scandinavian warmth',
    category: 'Storage',
  },
  plant: {
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Lush potted snake plant in a ribbed terracotta planter sitting on a sunlit wooden plant stand, aesthetic cozy apartment',
    category: 'Plants',
  },
  pillow: {
    imageUrl: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Array of textured earthy linen and velvet accent throw pillows arranged on a cloud sectional couch',
    category: 'Textiles',
  },
  shelf: {
    imageUrl: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Minimalist natural oak floating wall shelves styled with ceramic vessels, trailing ivy, and aesthetic books',
    category: 'Shelving',
  },
  mirror: {
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Arched full-length floor mirror with a thin brass frame reflecting warm sunlight in a cozy boho bedroom',
    category: 'Decor',
  },
  curtain: {
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Floor-to-ceiling airy linen sheer curtains filtering gentle morning sunbeams onto light wooden floors',
    category: 'Window',
  },
  coffee: {
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Aesthetic cozy home coffee bar corner with a retro espresso machine, ceramic syrup bottles, and hanging stoneware mugs',
    category: 'Kitchen',
  },
  mug: {
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    imagePrompt: 'Handmade speckled ceramic coffee mug filled with hot latte with foam art, warm cozy morning vibe',
    category: 'Kitchen',
  },
};

const DEFAULT_MATCH: ImageMatch = {
  imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
  imagePrompt: 'Dreamy cozy living room interior with warm lighting, layered textures, bouclé sofa, and aesthetic home accents, Architectural Digest photography',
  category: 'Home Decor',
};

export function matchCozyImage(title: string, desc: string = ''): ImageMatch {
  const combined = `${title.toLowerCase()} ${desc.toLowerCase()}`;
  for (const [key, match] of Object.entries(COZY_IMAGE_COLLECTION)) {
    if (combined.includes(key)) {
      return match;
    }
  }
  return DEFAULT_MATCH;
}
