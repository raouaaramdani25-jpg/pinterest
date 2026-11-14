/**
 * Smart Cozy AI Image Generator & Prompt Matcher
 * Generates 100% fresh, unique AI images (Flux / Imagen style) for each item
 * via Pollinations AI API (Zero API cost, fully dynamic, unique every time).
 */

export interface ImageMatch {
  imageUrl: string;
  imagePrompt: string;
  category: string;
}

export function generateCozyAIImage(itemTitle: string, itemDesc: string = '', seedOffset: number = 0): ImageMatch {
  const cleanTitle = itemTitle.replace(/^[\d\.\s#\-]+/, '').trim();
  
  // Create a highly detailed architectural/aesthetic AI prompt
  const basePrompts = [
    `warm aesthetic interior photography of a ${cleanTitle.toLowerCase()}, cozy scandinavian living space, soft golden sunlight streaming through sheer curtains, neutral beige and cream tones, hyper-realistic, Architectural Digest style, 8k`,
    `dreamy cozy room styling featuring a ${cleanTitle.toLowerCase()}, warm ambient 2700K lighting, textured bouclé and linen fabrics, modern minimalist home, cinematic lighting, 8k resolution`,
    `aesthetic interior design shot of a ${cleanTitle.toLowerCase()} in a cozy sunlit apartment, earthy tones, natural wood, trailing plants, peaceful sanctuary aesthetic, professional photography`,
    `close-up aesthetic shot of a ${cleanTitle.toLowerCase()} styled in a warm modern cozy home, morning coffee ambiance, tactile textures, ultra high resolution`,
  ];

  const selectedPrompt = basePrompts[seedOffset % basePrompts.length];
  const seed = Math.floor(Math.random() * 900000) + 100000 + seedOffset;

  // Pollinations AI generates high-quality Flux AI images on the fly with no API key required
  const encodedPrompt = encodeURIComponent(selectedPrompt);
  const aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=800&nologo=true&enhance=true&seed=${seed}`;

  return {
    imageUrl: aiImageUrl,
    imagePrompt: selectedPrompt,
    category: 'Cozy Decor',
  };
}

export function matchCozyImage(title: string, desc: string = '', seedOffset: number = 0): ImageMatch {
  return generateCozyAIImage(title, desc, seedOffset);
}
