
export type Glassware = {
  id: string;
  name: string;
  imagePath: string;
  description: string;
};

export const GLASSWARE: Glassware[] = [
  {
    id: 'martini',
    name: 'Martini Glass',
    imagePath: '/glassware/martini.png',
    description: 'Classic V-shaped bowl, long stem. Used for drinks served "up".',
  },
  {
    id: 'coupe',
    name: 'Coupe Glass',
    imagePath: '/glassware/coupe.png',
    description: 'Broad, shallow saucer shape. Elegant alternative to the Martini glass.',
  },
  {
    id: 'rocks',
    name: 'Rocks Glass',
    imagePath: '/glassware/rocks.png',
    description: 'Short tumbler with a thick base. Also known as an Old Fashioned glass.',
  },
  {
    id: 'highball',
    name: 'Highball Glass',
    imagePath: '/glassware/highball.png',
    description: 'Tall, cylindrical tumbler. Used for mixed drinks with plenty of ice.',
  },
  {
    id: 'margarita',
    name: 'Margarita Glass',
    imagePath: '/glassware/margarita.png',
    description: 'Distinctive double-bowl shape with a wide rim for salt.',
  },
  {
    id: 'hurricane',
    name: 'Hurricane Glass',
    imagePath: '/glassware/hurricane.png',
    description: 'Tall, curvy lamp-shade shape. Typical for tropical drinks.',
  },
  {
    id: 'modern-tumbler',
    name: 'Modern Curve Tumbler',
    imagePath: '/glassware/modern-tumbler.png',
    description: 'A stout, wide-base tumbler with a unique tapered mouth. Contemporary and fun.',
  },
  {
    id: 'stemless-martini',
    name: 'Stemless Martini',
    imagePath: '/glassware/stemless-martini.png',
    description: 'A modern, stable take on the classic V-shape without the stem.',
  },
  {
    id: 'nick-and-nora',
    name: 'Nick & Nora Glass',
    imagePath: '/glassware/nick-and-nora.png',
    description: 'A deep, curved bowl on a stem. Elegant and smaller than a coupe.',
  },
  {
    id: 'shot',
    name: 'Shot Glass',
    imagePath: '/glassware/shot.png',
    description: 'Small glass designed to hold a single measure of liquor.',
  },
];

export type AngleOption = { id: string; label: string; promptTemplate: string; };

export const ANGLES: AngleOption[] = [
  {
    id: 'match-asset',
    label: 'Match Photo Asset',
    promptTemplate: 'CRITICAL: Match the exact camera angle, perspective, vanishing points, and horizon line of the provided background image. The subject must appear naturally integrated into the scene as if photographed together. Do not alter the scene geometry or camera position.'
  },
  {
    id: 'straight-on',
    label: 'The Straight-On (Frontal)',
    promptTemplate: ', CAMERA ANGLE: straight-on frontal view. Camera positioned at exact eye-level with the subject, facing directly forward. Zero camera tilt. Horizon line at vertical center. Perfectly symmetrical left-right composition. The viewer looks directly at the front face of the glass/bottle. No top surface visible. Classic product photography angle showing the label and front details clearly.'
  },
  {
    id: 'hero',
    label: 'The Hero (Low Angle)',
    promptTemplate: ', CAMERA ANGLE: dramatic low angle hero shot. Camera positioned BELOW the subject, tilted upward 15-30 degrees, looking UP at the glass/bottle from below table level. The subject towers above the viewer, appearing powerful and imposing. Bottom of glass/bottle prominent in frame. Ceiling or sky visible behind. Creates a sense of grandeur and importance. The drink looks monumental.'
  },
  {
    id: 'flat-lay',
    label: 'The Flat Lay (Overhead)',
    promptTemplate: ', CAMERA ANGLE: true overhead flat lay, perfect 90-degree birds-eye view. Camera positioned DIRECTLY ABOVE looking straight down. The surface/table fills the frame horizontally. Only the top surface of the glass visible - looking down into the drink. No side walls of the glass visible. Zero perspective distortion. All objects appear as if pressed flat. Organized, graphic composition typical of food magazine overhead shots.'
  },
  {
    id: 'three-quarter',
    label: 'The Standard Commercial (Three-Quarter)',
    promptTemplate: ', CAMERA ANGLE: classic three-quarter commercial angle. Camera positioned at approximately 30-45 degrees above the subject, angled slightly to one side. This is the standard beverage photography angle showing both the front face AND the top of the drink simultaneously. The glass rim is visible as an ellipse. Depth and dimension clearly rendered. Most common angle for product catalogs and menus.'
  },
  {
    id: 'pov',
    label: 'The POV (First-Person)',
    promptTemplate: ', CAMERA ANGLE: first-person POV perspective. Shot from the exact viewpoint of someone about to pick up or drink the beverage. Camera at human seated eye-level, approximately 12-18 inches from the glass. Slight downward tilt as if looking at a drink on a table in front of you. May include partial view of hands, bar edge, or table surface entering the frame. Intimate and immersive.'
  },
  {
    id: 'macro',
    label: 'The Macro (Detail)',
    promptTemplate: ', CAMERA ANGLE: extreme macro close-up detail shot. Camera positioned just 2-6 inches from the subject with macro lens. Frame filled entirely with a small portion of the drink - perhaps just the rim, ice cubes, bubbles, garnish detail, or condensation droplets. Shallow depth of field with razor-thin focus plane. Reveals textures invisible to naked eye. Abstract and artistic.'
  },
  {
    id: 'dutch',
    label: 'The Dutch Angle (Tilted)',
    promptTemplate: ', CAMERA ANGLE: dutch angle with 15-25 degree camera roll/tilt. The horizon line runs diagonally across the frame rather than horizontally. Creates dynamic tension and energy. The glass appears to lean. Edgy, modern, artistic composition. Often used in contemporary cocktail photography for visual interest and movement.'
  },
  {
    id: 'high-angle',
    label: 'The High Angle (Looking Down)',
    promptTemplate: ', CAMERA ANGLE: high angle looking down. Camera positioned at standing human height (5-6 feet), angled downward at approximately 45-60 degrees toward the subject on the table/bar. The drink appears smaller and more approachable. More of the top surface and surrounding context visible. Casual, documentary style. Shows the drink in its environment from a natural viewing position.'
  },
  {
    id: 'profile',
    label: 'The Profile (Side View)',
    promptTemplate: ', CAMERA ANGLE: pure side profile view at exact 90-degree angle. Camera at subject eye-level, positioned perpendicular to the front of the glass. Only one side of the glass visible - no front label. Emphasizes the silhouette, the shape of the glass, the liquid level line, and any layered drink effects. Architectural and precise. Shows the elegant contour of glassware.'
  },
  {
    id: 'wide',
    label: 'The Wide Context (Environmental)',
    promptTemplate: ', CAMERA ANGLE: wide environmental establishing shot. Camera pulled back significantly, using wide focal length. The drink/bottle occupies only 20-30% of the frame, surrounded by extensive background context - the bar, restaurant, outdoor setting, or styled scene. Tells a story about where and how the drink is enjoyed. Lifestyle photography approach showing atmosphere and mood.'
  }
];

export type LightingOption = { id: string; label: string; promptTemplate: string; prompt?: string; };

export const LIGHTING_MOODS: LightingOption[] = [
  {
    id: 'match-asset',
    label: 'Match Photo Asset',
    promptTemplate: 'Analyze the lighting direction, intensity, and color temperature from the provided scene image. Replicate this lighting exactly on the [SUBJECT] to ensure perfect compositing integration.'
  },
  {
    id: 'studio-dramatic',
    label: 'Studio Dramatic (Default)',
    promptTemplate: ', professional studio lighting, high contrast, dramatic shadows, rim lighting to separate subject from background, sculpted light.'
  },
  {
    id: 'natural-daylight',
    label: 'Soft Daylight (Bright)',
    promptTemplate: ', soft natural daylight, large window light source, diffuse illumination, soft shadows, bright and airy atmosphere, neutral color temperature.'
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour (Warm)',
    promptTemplate: ', golden hour lighting, warm sun flare, low angle sun, rich orange and gold tones, long shadows, magical atmosphere, backlit.'
  },
  {
    id: 'moody-bar',
    label: 'Speakeasy (Dark & Ambient)',
    promptTemplate: ', low key lighting, dim ambient light, moody atmosphere, deep shadows, pockets of light, cinematic noir aesthetic.'
  },
  {
    id: 'neon-club',
    label: 'Neon Club (Vibrant)',
    promptTemplate: ', colorful gel lighting, neon pink and cyan lights, club atmosphere, vibrant saturation, cool tones, mixed lighting sources.'
  },
  {
    id: 'flash-hard',
    label: 'Direct Flash (Edgy)',
    promptTemplate: ', hard on-camera flash, harsh shadows, high contrast, paparazzi aesthetic, bright foreground, dark fall-off in background.'
  },
  {
    id: 'cinematic',
    label: 'Cinematic (Teal & Orange)',
    promptTemplate: ', cinematic lighting, color graded teal and orange, complementary colors, dramatic mood, volumetric atmosphere, movie production quality.'
  },
  {
    id: 'luxury-clean',
    label: 'Ultra Clean (E-Comm)',
    promptTemplate: ', high-key commercial lighting, even illumination, minimized shadows, pure clean look, product-focused lighting.'
  },
  {
    id: 'rembrandt',
    label: 'Rembrandt (Classic)',
    promptTemplate: ', Rembrandt lighting style, single directional light source, triangle of light on the shadow side, classic artistic portrait lighting, painterly feel.'
  },
  {
    id: 'volumetric',
    label: 'Hazy Rays (Volumetric)',
    promptTemplate: ', volumetric lighting, god rays, light beams cutting through haze/fog, atmospheric depth, dreamy and ethereal.'
  },
  {
    id: 'studio-bw',
    label: 'Studio B&W (Monochrome)',
    promptTemplate: ', black and white photography, monochrome, high contrast, rich blacks and pure whites, Ansel Adams style, timeless aesthetic.'
  }
];

export type BackgroundOption = {
  id: string;
  name: string;
  texturePath?: string; // Optional path to specific texture image
  colorCode?: string; // Hex code for color overlay/base
  type: 'texture' | 'solid';
  prompt?: string;
};

export const BACKGROUNDS: BackgroundOption[] = [
  { id: 'leather-green', name: 'Tufted Leather (Forest Green)', texturePath: '/textures/tufted-leather-green.png', type: 'texture' },
  { id: 'leather-black', name: 'Tufted Leather (Midnight Black)', texturePath: '/textures/tufted-leather-black.png', type: 'texture' },
  { id: 'leather-red', name: 'Tufted Leather (Deep Red)', texturePath: '/textures/tufted-leather-red.png', type: 'texture' },
  { id: 'velvet-blue', name: 'Velvet (Royal Blue)', texturePath: '/textures/velvet-blue.png', type: 'solid' },
  { id: 'concrete-grey', name: 'Concrete (Industrial Grey)', texturePath: '/textures/concrete-grey.png', type: 'solid' },
];

export type CountertopOption = {
  id: string;
  name: string;
  texturePath?: string;
  colorCode?: string;
  type: 'material';
  prompt?: string;
};

export const COUNTERTOPS: CountertopOption[] = [
  { id: 'marble-white', name: 'Marble (Carrara White)', texturePath: '/textures/marble-white.png', type: 'material' },
  { id: 'marble-black', name: 'Marble (Nero Marquina)', texturePath: '/textures/marble-black.png', type: 'material' },
  { id: 'wood-walnut', name: 'Wood (Dark Walnut)', texturePath: '/textures/wood-walnut.png', type: 'material' },
  { id: 'wood-oak', name: 'Wood (Light Oak)', texturePath: '/textures/wood-light-oak.png', type: 'material' },
  { id: 'granite-grey', name: 'Granite (Speckled Grey)', texturePath: '/textures/granite-grey.png', type: 'material' },
];

export type GarnishPlacement = 'rim' | 'in-glass' | 'side' | 'around' | 'scattered' | 'floating';

export const GARNISH_PLACEMENTS: { id: GarnishPlacement; label: string }[] = [
  { id: 'rim', label: 'On The Rim' },
  { id: 'in-glass', label: 'In The Glass' },
  { id: 'floating', label: 'Floating On Top' },
  { id: 'side', label: 'Next To Glass' },
  { id: 'around', label: 'Around the Glass' },
  { id: 'scattered', label: 'Scattered' },
];

export type GarnishSection =
  | 'Citrus'
  | 'Fruit'
  | 'Tropical'
  | 'Herbs & Greens'
  | 'Vegetables & Savory'
  | 'Spices, Salts & Sugars'
  | 'Edible Flowers & Specialty'
  | 'Nuts & Seeds'
  | 'Fun & Retro';

export type GarnishOption = {
  id: string;
  name: string;
  section: GarnishSection;
};

export const GARNISHES: GarnishOption[] = [
  // Citrus
  { id: 'lemon-twist', name: 'Lemon Twist', section: 'Citrus' },
  { id: 'lemon-wheel', name: 'Lemon Wheel', section: 'Citrus' },
  { id: 'lemon-wedge', name: 'Lemon Wedge', section: 'Citrus' },
  { id: 'lime-wedge', name: 'Lime Wedge', section: 'Citrus' },
  { id: 'lime-wheel', name: 'Lime Wheel', section: 'Citrus' },
  { id: 'lime-peel', name: 'Lime Peel', section: 'Citrus' },
  { id: 'orange-peel', name: 'Orange Peel', section: 'Citrus' },
  { id: 'orange-twist', name: 'Orange Twist', section: 'Citrus' },
  { id: 'orange-wheel', name: 'Orange Wheel', section: 'Citrus' },
  { id: 'grapefruit-peel', name: 'Grapefruit Peel', section: 'Citrus' },
  { id: 'grapefruit-wheel', name: 'Grapefruit Wheel', section: 'Citrus' },
  { id: 'dehydrated-citrus', name: 'Dehydrated Citrus Wheels', section: 'Citrus' },
  { id: 'blood-orange-wheel', name: 'Blood Orange Wheel', section: 'Citrus' },
  { id: 'blood-orange-twist', name: 'Blood Orange Twist', section: 'Citrus' },
  { id: 'yuzu-peel', name: 'Yuzu Peel', section: 'Citrus' },
  { id: 'kumquat', name: 'Kumquat (Whole/Sliced)', section: 'Citrus' },
  { id: 'mandarin-segment', name: 'Mandarin Segment', section: 'Citrus' },
  { id: 'bergamot-peel', name: 'Bergamot Peel', section: 'Citrus' },
  { id: 'dried-lime', name: 'Dried Lime Wheel', section: 'Citrus' },

  // Fruit
  { id: 'cocktail-cherry', name: 'Cocktail Cherry (Luxardo)', section: 'Fruit' },
  { id: 'maraschino-cherry', name: 'Maraschino Cherry', section: 'Fruit' },
  { id: 'fresh-cherry', name: 'Fresh Cherry', section: 'Fruit' },
  { id: 'orange-slice', name: 'Orange Slice', section: 'Fruit' },
  { id: 'strawberry', name: 'Strawberry', section: 'Fruit' },
  { id: 'raspberry', name: 'Raspberry', section: 'Fruit' },
  { id: 'blackberry', name: 'Blackberry', section: 'Fruit' },
  { id: 'blueberry', name: 'Blueberry', section: 'Fruit' },
  { id: 'grapes', name: 'Grapes', section: 'Fruit' },
  { id: 'apple-slice', name: 'Apple Slice/Fan', section: 'Fruit' },
  { id: 'pear-slice', name: 'Pear Slice', section: 'Fruit' },
  { id: 'pomegranate', name: 'Pomegranate Arils', section: 'Fruit' },
  { id: 'watermelon', name: 'Watermelon Cube/Spear', section: 'Fruit' },
  { id: 'melon-ball', name: 'Cantaloupe/Honeydew Balls', section: 'Fruit' },
  { id: 'peach-slice', name: 'Peach Slice', section: 'Fruit' },
  { id: 'fig', name: 'Fresh Fig (Half)', section: 'Fruit' },
  { id: 'cranberries', name: 'Fresh Cranberries', section: 'Fruit' },
  { id: 'dried-cranberries', name: 'Dried Cranberries', section: 'Fruit' },

  // Tropical
  { id: 'pineapple-wedge', name: 'Pineapple Wedge', section: 'Tropical' },
  { id: 'pineapple-leaf', name: 'Pineapple Leaf', section: 'Tropical' },
  { id: 'kiwi-slice', name: 'Kiwi Slice', section: 'Tropical' },
  { id: 'mango-slice', name: 'Mango Slice', section: 'Tropical' },
  { id: 'passion-fruit', name: 'Passion Fruit Half', section: 'Tropical' },
  { id: 'dragon-fruit', name: 'Dragon Fruit Slice', section: 'Tropical' },
  { id: 'lychee', name: 'Lychee', section: 'Tropical' },
  { id: 'coconut-wedge', name: 'Coconut Wedge', section: 'Tropical' },
  { id: 'coconut-flakes', name: 'Toasted Coconut Flakes', section: 'Tropical' },
  { id: 'starfruit', name: 'Starfruit Slice', section: 'Tropical' },
  { id: 'papaya-slice', name: 'Papaya Slice', section: 'Tropical' },
  { id: 'guava-slice', name: 'Guava Slice', section: 'Tropical' },
  { id: 'banana-chip', name: 'Banana Chip', section: 'Tropical' },

  // Herbs & Greens
  { id: 'mint-sprig', name: 'Mint Sprig', section: 'Herbs & Greens' },
  { id: 'basil-leaf', name: 'Basil Leaf', section: 'Herbs & Greens' },
  { id: 'thai-basil', name: 'Thai Basil', section: 'Herbs & Greens' },
  { id: 'rosemary-sprig', name: 'Rosemary Sprig', section: 'Herbs & Greens' },
  { id: 'thyme-sprig', name: 'Thyme Sprig', section: 'Herbs & Greens' },
  { id: 'sage-leaf', name: 'Sage Leaf', section: 'Herbs & Greens' },
  { id: 'bay-leaf', name: 'Bay Leaf', section: 'Herbs & Greens' },
  { id: 'lavender-sprig', name: 'Lavender Sprig', section: 'Herbs & Greens' },
  { id: 'cilantro-sprig', name: 'Cilantro Sprig', section: 'Herbs & Greens' },
  { id: 'tarragon-sprig', name: 'Tarragon Sprig', section: 'Herbs & Greens' },
  { id: 'lemongrass', name: 'Lemongrass Stalk', section: 'Herbs & Greens' },
  { id: 'dill-sprig', name: 'Dill Sprig', section: 'Herbs & Greens' },
  { id: 'shiso-leaf', name: 'Shiso Leaf', section: 'Herbs & Greens' },
  { id: 'fennel-frond', name: 'Fennel Frond', section: 'Herbs & Greens' },
  { id: 'parsley-sprig', name: 'Parsley Sprig', section: 'Herbs & Greens' },
  { id: 'chives', name: 'Chives', section: 'Herbs & Greens' },
  { id: 'eucalyptus', name: 'Eucalyptus Sprig', section: 'Herbs & Greens' },

  // Vegetables & Savory
  { id: 'green-olives', name: 'Green Olives', section: 'Vegetables & Savory' },
  { id: 'stuffed-olives', name: 'Stuffed Olives (Blue Cheese/Garlic)', section: 'Vegetables & Savory' },
  { id: 'black-olives', name: 'Black Olives', section: 'Vegetables & Savory' },
  { id: 'cocktail-onions', name: 'Cocktail Onions', section: 'Vegetables & Savory' },
  { id: 'pickled-onions', name: 'Pickled Onions', section: 'Vegetables & Savory' },
  { id: 'pearl-onions', name: 'Pearl Onions', section: 'Vegetables & Savory' },
  { id: 'celery-stalk', name: 'Celery Stalk', section: 'Vegetables & Savory' },
  { id: 'celery-leaf', name: 'Celery Leaf', section: 'Vegetables & Savory' },
  { id: 'cucumber-slice', name: 'Cucumber Slice', section: 'Vegetables & Savory' },
  { id: 'cucumber-ribbon', name: 'Cucumber Ribbon', section: 'Vegetables & Savory' },
  { id: 'pickle-spear', name: 'Pickle Spear', section: 'Vegetables & Savory' },
  { id: 'cornichon', name: 'Cornichon', section: 'Vegetables & Savory' },
  { id: 'jalapeno-slice', name: 'Jalapeño Slice', section: 'Vegetables & Savory' },
  { id: 'chili-pepper', name: 'Chili Pepper', section: 'Vegetables & Savory' },
  { id: 'bell-pepper', name: 'Bell Pepper Strip', section: 'Vegetables & Savory' },
  { id: 'carrot-ribbon', name: 'Carrot Ribbon', section: 'Vegetables & Savory' },
  { id: 'cherry-tomato', name: 'Cherry Tomato', section: 'Vegetables & Savory' },
  { id: 'asparagus-spear', name: 'Asparagus Spear', section: 'Vegetables & Savory' },
  { id: 'radish-slice', name: 'Radish Slice', section: 'Vegetables & Savory' },
  { id: 'pickled-ginger', name: 'Pickled Ginger', section: 'Vegetables & Savory' },
  { id: 'caper-berries', name: 'Caper Berries', section: 'Vegetables & Savory' },
  { id: 'pepperoncini', name: 'Pepperoncini', section: 'Vegetables & Savory' },
  { id: 'habanero', name: 'Habanero Pepper', section: 'Vegetables & Savory' },

  // Spices, Salts & Sugars
  { id: 'salt-rim', name: 'Salt Rim', section: 'Spices, Salts & Sugars' },
  { id: 'flaky-salt', name: 'Flaky Sea Salt', section: 'Spices, Salts & Sugars' },
  { id: 'smoked-salt', name: 'Smoked Salt', section: 'Spices, Salts & Sugars' },
  { id: 'black-lava-salt', name: 'Black Lava Salt', section: 'Spices, Salts & Sugars' },
  { id: 'himalayan-salt', name: 'Himalayan Pink Salt', section: 'Spices, Salts & Sugars' },
  { id: 'sugar-rim', name: 'Sugar Rim', section: 'Spices, Salts & Sugars' },
  { id: 'cinnamon-sugar', name: 'Cinnamon Sugar Rim', section: 'Spices, Salts & Sugars' },
  { id: 'chili-salt', name: 'Chili Salt Rim', section: 'Spices, Salts & Sugars' },
  { id: 'tajin-rim', name: 'Tajín Rim', section: 'Spices, Salts & Sugars' },
  { id: 'matcha-rim', name: 'Matcha Powder Rim', section: 'Spices, Salts & Sugars' },
  { id: 'cocoa-rim', name: 'Cocoa Powder Rim', section: 'Spices, Salts & Sugars' },
  { id: 'everything-bagel-rim', name: 'Everything Bagel Rim', section: 'Spices, Salts & Sugars' },
  { id: 'toasted-coconut-rim', name: 'Toasted Coconut Rim', section: 'Spices, Salts & Sugars' },
  { id: 'cinnamon-stick', name: 'Cinnamon Stick', section: 'Spices, Salts & Sugars' },
  { id: 'star-anise', name: 'Star Anise', section: 'Spices, Salts & Sugars' },
  { id: 'clove', name: 'Clove', section: 'Spices, Salts & Sugars' },
  { id: 'nutmeg', name: 'Fresh Grated Nutmeg', section: 'Spices, Salts & Sugars' },
  { id: 'allspice', name: 'Allspice Berries', section: 'Spices, Salts & Sugars' },
  { id: 'black-pepper', name: 'Black Pepper', section: 'Spices, Salts & Sugars' },
  { id: 'pink-peppercorns', name: 'Pink Peppercorns', section: 'Spices, Salts & Sugars' },
  { id: 'cardamom-pods', name: 'Cardamom Pods', section: 'Spices, Salts & Sugars' },
  { id: 'juniper-berries', name: 'Juniper Berries', section: 'Spices, Salts & Sugars' },
  { id: 'saffron-threads', name: 'Saffron Threads', section: 'Spices, Salts & Sugars' },

  // Edible Flowers & Specialty
  { id: 'edible-flowers', name: 'Edible Flowers (Orchid/Pansy)', section: 'Edible Flowers & Specialty' },
  { id: 'dried-flowers', name: 'Dried Flowers', section: 'Edible Flowers & Specialty' },
  { id: 'rose-petals', name: 'Rose Petals', section: 'Edible Flowers & Specialty' },
  { id: 'hibiscus-flower', name: 'Hibiscus Flower', section: 'Edible Flowers & Specialty' },
  { id: 'butterfly-pea', name: 'Butterfly Pea Flower', section: 'Edible Flowers & Specialty' },
  { id: 'nasturtium', name: 'Nasturtium', section: 'Edible Flowers & Specialty' },
  { id: 'violets', name: 'Violets', section: 'Edible Flowers & Specialty' },
  { id: 'borage-flower', name: 'Borage Flower', section: 'Edible Flowers & Specialty' },
  { id: 'chamomile', name: 'Chamomile Flowers', section: 'Edible Flowers & Specialty' },
  { id: 'elderflower', name: 'Elderflower', section: 'Edible Flowers & Specialty' },
  { id: 'marigold-petals', name: 'Marigold Petals', section: 'Edible Flowers & Specialty' },
  { id: 'dehydrated-fruit', name: 'Dehydrated Fruit Slices', section: 'Edible Flowers & Specialty' },
  { id: 'freeze-dried-berries', name: 'Freeze-Dried Berries', section: 'Edible Flowers & Specialty' },
  { id: 'candied-ginger', name: 'Candied Ginger', section: 'Edible Flowers & Specialty' },
  { id: 'candied-citrus', name: 'Candied Citrus Peel', section: 'Edible Flowers & Specialty' },
  { id: 'chocolate-shavings', name: 'Chocolate Shavings', section: 'Edible Flowers & Specialty' },
  { id: 'cocoa-dust', name: 'Cocoa Powder Dust', section: 'Edible Flowers & Specialty' },
  { id: 'coffee-beans', name: 'Coffee Beans', section: 'Edible Flowers & Specialty' },
  { id: 'vanilla-bean', name: 'Vanilla Bean', section: 'Edible Flowers & Specialty' },
  { id: 'honeycomb', name: 'Honeycomb', section: 'Edible Flowers & Specialty' },
  { id: 'gold-leaf', name: 'Gold Leaf', section: 'Edible Flowers & Specialty' },
  { id: 'edible-glitter', name: 'Edible Glitter', section: 'Edible Flowers & Specialty' },
  { id: 'smoke-bubble', name: 'Smoke Bubble', section: 'Edible Flowers & Specialty' },
  { id: 'foam', name: 'Foam Topping', section: 'Edible Flowers & Specialty' },
  { id: 'whipped-cream', name: 'Whipped Cream', section: 'Edible Flowers & Specialty' },
  { id: 'meringue', name: 'Meringue', section: 'Edible Flowers & Specialty' },
  { id: 'caviar-pearls', name: 'Caviar Pearls (Molecular)', section: 'Edible Flowers & Specialty' },

  // Nuts & Seeds
  { id: 'pistachios', name: 'Pistachios', section: 'Nuts & Seeds' },
  { id: 'almonds', name: 'Almonds (Whole/Sliced)', section: 'Nuts & Seeds' },
  { id: 'hazelnuts', name: 'Hazelnuts', section: 'Nuts & Seeds' },
  { id: 'walnuts', name: 'Walnuts', section: 'Nuts & Seeds' },
  { id: 'pecans', name: 'Pecans', section: 'Nuts & Seeds' },
  { id: 'macadamia', name: 'Macadamia Nuts', section: 'Nuts & Seeds' },
  { id: 'peanuts', name: 'Peanuts', section: 'Nuts & Seeds' },
  { id: 'sesame-seeds', name: 'Sesame Seeds', section: 'Nuts & Seeds' },
  { id: 'pepitas', name: 'Pepitas (Pumpkin Seeds)', section: 'Nuts & Seeds' },
  { id: 'chia-seeds', name: 'Chia Seeds', section: 'Nuts & Seeds' },

  // Fun & Retro
  { id: 'cocktail-umbrella', name: 'Cocktail Umbrella', section: 'Fun & Retro' },
  { id: 'cocktail-pick', name: 'Cocktail Pick/Skewer', section: 'Fun & Retro' },
  { id: 'bamboo-pick', name: 'Bamboo Pick', section: 'Fun & Retro' },
  { id: 'logo-pick', name: 'Custom Logo Pick', section: 'Fun & Retro' },
  { id: 'paper-straw', name: 'Paper Straw (Colorful)', section: 'Fun & Retro' },
  { id: 'bacon', name: 'Bacon Strip', section: 'Fun & Retro' },
  { id: 'shrimp', name: 'Shrimp', section: 'Fun & Retro' },
  { id: 'beef-jerky', name: 'Beef Jerky', section: 'Fun & Retro' },
  { id: 'candy', name: 'Candy (Gummies/Sour Belts)', section: 'Fun & Retro' },
  { id: 'gummy-bears', name: 'Gummy Bears', section: 'Fun & Retro' },
  { id: 'swedish-fish', name: 'Swedish Fish', section: 'Fun & Retro' },
  { id: 'rock-candy', name: 'Rock Candy Stick', section: 'Fun & Retro' },
  { id: 'pop-rocks-rim', name: 'Pop Rocks Rim', section: 'Fun & Retro' },
  { id: 'marshmallow', name: 'Marshmallows', section: 'Fun & Retro' },
  { id: 'toasted-marshmallow', name: 'Toasted Marshmallow', section: 'Fun & Retro' },
  { id: 'cotton-candy', name: 'Cotton Candy', section: 'Fun & Retro' },
  { id: 'lollipop', name: 'Lollipop', section: 'Fun & Retro' },
  { id: 'pretzel-stick', name: 'Pretzel Stick', section: 'Fun & Retro' },
  { id: 'cookie', name: 'Cookie Garnish', section: 'Fun & Retro' },
  { id: 'wafer', name: 'Wafer Cookie', section: 'Fun & Retro' },
  { id: 'graham-cracker-rim', name: 'Graham Cracker Rim', section: 'Fun & Retro' },
  { id: 'mini-donut', name: 'Mini Donut', section: 'Fun & Retro' },
  { id: 'macaron', name: 'Macaron', section: 'Fun & Retro' },
];

export type IceOption = {
  id: string;
  name: string;
  detail: string;
};

export const ICE_OPTIONS: IceOption[] = [
  { id: 'cubed', name: 'Ice Cubes', detail: 'filled with fresh standard ice cubes' },
  { id: 'crushed', name: 'Crushed Ice', detail: 'filled with finely crushed ice, frosty look' },
  { id: 'round', name: 'Round Ice', detail: 'containing a single clear large spherical ice ball' },
  { id: 'king-cube', name: 'Large Square Cube', detail: 'containing a single large crystal clear king cube' },
  { id: 'block', name: 'Clear Block Ice', detail: 'containing a single massive clear block of ice' },
  { id: 'none', name: 'No Ice', detail: 'served neat without ice' },
];

export type IceType = 'cubed' | 'crushed' | 'king-cube' | 'none';

export type TequilaSku = {
  clientId?: string; // For Multi-Tenancy
  id: string;
  name: string;
  sku: string; // Changed from strict union to string to allow custom IDs
  colorDescription: string;
  bottlePath: string; // Path to high-res bottle asset
  isCustom?: boolean; // New: Flag for custom brand
  customDescription?: string; // New: User-defined prompt details for this bottle
  heightCategory?: 'short' | 'standard' | 'tall'; // New: physical stature for scale
  variants?: { id: string; name: string; imagePath: string }[]; // New: Additional views (Back, Side, etc.)
  bottleText?: string; // New: Text label enforcement
  labelInstructions?: string; // New: Detailed prompt instructions from Brand Config
};

export const TEQUILA_SKUS: TequilaSku[] = [
  {
    id: 'blanco', name: 'Blanco (Silver)', sku: 'blanco', bottlePath: '/bottles/blanco.png',
    colorDescription: 'crystal clear liquid',
    bottleText: 'YAVE BLANCO TEQUILA',
    labelInstructions: 'No colored band at the bottom. The text "BLANCO TEQUILA" appears directly below the main YaVe logo in small dark letters. Bottom text: "HECHO EN MEXICO" and "100% PURO AGAVE". **BACK LABEL VISIBILITY**: The bottle has a back label visible through the clear glass featuring a REPETITIVE PATTERN OF SMALL SKELETON KEYS arranged in a grid. This label is OPAQUE white/grey and blocks the background.'
  },
  {
    id: 'reposado', name: 'Reposado', sku: 'reposado', bottlePath: '/bottles/reposado.png',
    colorDescription: 'golden amber colored liquid',
    bottleText: 'YAVE REPOSADO TEQUILA',
    labelInstructions: 'No colored band at the bottom. The text "REPOSADO TEQUILA" appears directly below the main YaVe logo in light blue-grey letters. Bottom text: "HECHO EN MEXICO" and "100% PURO AGAVE". **BACK LABEL VISIBILITY**: The bottle has a back label visible through the glass (tinted by the amber liquid) featuring a REPETITIVE PATTERN OF SMALL SKELETON KEYS. This label is OPAQUE and blocks the background.'
  },
  {
    id: 'jalapeno', name: 'Jalapeño', sku: 'jalapeno', bottlePath: '/bottles/jalapeno.png',
    colorDescription: 'crystal clear liquid',
    bottleText: 'YAVE JALAPEÑO TEQUILA',
    labelInstructions: 'At the bottom, a distinct green horizontal color band containing the text "JALAPEÑO" in bold white capital letters. Below the band: "HECHO EN MEXICO" and "100% PURO AGAVE". **BACK LABEL VISIBILITY**: The bottle has a back label visible through the clear glass featuring a REPETITIVE PATTERN OF SMALL SKELETON KEYS arranged in a grid. This label is OPAQUE white/grey and blocks the background.'
  },
  {
    id: 'mango', name: 'Mango', sku: 'mango', bottlePath: '/bottles/mango.png',
    colorDescription: 'crystal clear liquid',
    bottleText: 'YAVE MANGO TEQUILA',
    labelInstructions: 'At the bottom, a distinct bright orange horizontal color band containing the text "MANGO" in bold white capital letters. Below the band: "HECHO EN MEXICO" and "100% PURO AGAVE". **BACK LABEL VISIBILITY**: The bottle has a back label visible through the clear glass featuring a REPETITIVE PATTERN OF SMALL SKELETON KEYS arranged in a grid. This label is OPAQUE white/grey and blocks the background.'
  },
  {
    id: 'coconut', name: 'Coconut', sku: 'coconut', bottlePath: '/bottles/coconut.png',
    colorDescription: 'crystal clear liquid',
    bottleText: 'YAVE COCONUT TEQUILA',
    labelInstructions: 'At the bottom, a distinct brown horizontal color band containing the text "COCONUT" in bold white capital letters. Below the band: "HECHO EN MEXICO" and "100% PURO AGAVE". **BACK LABEL VISIBILITY**: The bottle has a back label visible through the clear glass featuring a REPETITIVE PATTERN OF SMALL SKELETON KEYS arranged in a grid. This label is OPAQUE white/grey and blocks the background.'
  },
];

// Keeping strictly for types if needed, but UI will move to text input
export type RecipeOption = {
  id: string;
  name: string;
  liquor: 'blanco' | 'reposado' | 'jalapeno' | 'mango' | 'coconut';
  glasswareId: string; // We might want to remove this constraint or keep it as a suggestion
  ice: IceType;
  visualDescription: string;
};

export const RECIPES: RecipeOption[] = [
  // 1. CLASSICS & BASICS
  {
    id: 'ranch-water',
    name: 'YaVe Ranch Water',
    liquor: 'blanco',
    glasswareId: 'highball',
    ice: 'cubed',
    visualDescription: 'Crystal clear liquid with effervescent bubbles, condensation on glass, crisp and refreshing look'
  },
  {
    id: 'paloma',
    name: 'Classic Paloma',
    liquor: 'blanco',
    glasswareId: 'highball',
    ice: 'cubed',
    visualDescription: 'Pale pink grapefruit soda color, bubbly and refreshing'
  },
  {
    id: 'tommys-marg',
    name: "Tommy's Margarita",
    liquor: 'blanco',
    glasswareId: 'rocks',
    ice: 'king-cube',
    visualDescription: 'Golden lime color, clean and minimalist'
  },
  {
    id: 'tequila-sunrise',
    name: 'Tequila Sunrise',
    liquor: 'blanco',
    glasswareId: 'highball',
    ice: 'cubed',
    visualDescription: 'Gradient layers of orange juice fading into red grenadine at the bottom'
  },
  {
    id: 'mexican-mule',
    name: 'Mexican Mule',
    liquor: 'blanco',
    glasswareId: 'highball', // or copper mug
    ice: 'crushed',
    visualDescription: 'Cloudy pale ginger beer color, lots of ice, condensation'
  },

  // 2. SPICY (JALAPEÑO)
  {
    id: 'spicy-margarita',
    name: 'Spicy Jalapeño Margarita',
    liquor: 'jalapeno',
    glasswareId: 'rocks',
    ice: 'king-cube',
    visualDescription: 'Pale green-yellow tint, slightly cloudy'
  },
  {
    id: 'pineapple-jalapeno',
    name: 'Pineapple Jalapeño Marg',
    liquor: 'jalapeno',
    glasswareId: 'rocks',
    ice: 'cubed',
    visualDescription: 'Vibrant yellow pineapple color, frothy top'
  },
  {
    id: 'bloody-maria',
    name: 'Bloody Maria',
    liquor: 'jalapeno',
    glasswareId: 'highball',
    ice: 'cubed',
    visualDescription: 'Rich tomato red, textured and savory'
  },
  {
    id: 'cucumber-spicy',
    name: 'Spicy Cucumber Smash',
    liquor: 'jalapeno',
    glasswareId: 'rocks',
    ice: 'crushed',
    visualDescription: 'Pale green tint, fresh and cooling visual'
  },
  {
    id: 'watermelon-spicy',
    name: 'Spicy Watermelon Marg',
    liquor: 'jalapeno',
    glasswareId: 'margarita', // or rocks
    ice: 'cubed',
    visualDescription: 'Bright pink-red watermelon juice color'
  },

  // 3. FRUITY (MANGO)
  {
    id: 'mangorita',
    name: 'Classic Mangorita',
    liquor: 'mango',
    glasswareId: 'margarita',
    ice: 'crushed',
    visualDescription: 'Vibrant golden-orange color, opaque and smooth'
  },
  {
    id: 'mango-mojito',
    name: 'Mango Mojito Twist',
    liquor: 'mango',
    glasswareId: 'highball',
    ice: 'cubed',
    visualDescription: 'Orange-yellow liquid, muddled mint leaves visible, soda bubbles'
  },
  {
    id: 'mango-chili',
    name: 'Mango Chili Smash',
    liquor: 'mango',
    glasswareId: 'rocks',
    ice: 'king-cube',
    visualDescription: 'Deep orange color, condensation'
  },
  {
    id: 'frozen-mango',
    name: 'Frozen Mango Daiquiri Style',
    liquor: 'mango',
    glasswareId: 'coupe', // or marg
    ice: 'none', // blended
    visualDescription: 'Thick slushy texture, bright orange, frost on glass'
  },
  {
    id: 'mango-sunrise',
    name: 'Mango Sunrise',
    liquor: 'mango',
    glasswareId: 'highball',
    ice: 'cubed',
    visualDescription: 'Tropical orange fading to red grenadine, exotic vibe'
  },

  // 4. TROPICAL (COCONUT)
  {
    id: 'w-colada',
    name: 'YaVe Colada',
    liquor: 'coconut',
    glasswareId: 'hurricane',
    ice: 'crushed',
    visualDescription: 'Creamy white texture, rich and tropical, frosty glass'
  },
  {
    id: 'coco-lime',
    name: 'Coconut Lime Splash',
    liquor: 'coconut',
    glasswareId: 'highball',
    ice: 'cubed',
    visualDescription: 'Cloudy white coconut water look, hydrating aesthetic'
  },
  {
    id: 'coco-espresso',
    name: 'Coco Espresso Martini',
    liquor: 'coconut',
    glasswareId: 'martini',
    ice: 'none',
    visualDescription: 'Dark coffee color with creamy foam head, sophisticated'
  },
  {
    id: 'coco-pineapple',
    name: 'Coconut Pineapple Punch',
    liquor: 'coconut',
    glasswareId: 'punch-bowl', // fallback to hurricane/highball in logic? Used tall glass.
    ice: 'cubed',
    visualDescription: 'Bright yellow-white gradient, tiki style'
  },
  {
    id: 'coco-blue',
    name: 'Electric Coconut',
    liquor: 'coconut',
    glasswareId: 'highball',
    ice: 'cubed',
    visualDescription: 'Electric blue curacao color, neon party vibe'
  },

  // 5. AGED (REPOSADO)
  {
    id: 'repo-neat',
    name: 'Reposado Neat',
    liquor: 'reposado',
    glasswareId: 'rocks', // snifter better but rocks works
    ice: 'none',
    visualDescription: 'Rich golden amber liquid, oily viscosity, diamond-like clarity, elegant'
  },
  {
    id: 'repo-rocks',
    name: 'Reposado on the Rocks',
    liquor: 'reposado',
    glasswareId: 'rocks',
    ice: 'king-cube',
    visualDescription: 'Rich golden amber liquid, light refraction'
  },
  {
    id: 'repo-old-fashioned',
    name: 'Tequila Old Fashioned',
    liquor: 'reposado',
    glasswareId: 'rocks',
    ice: 'king-cube',
    visualDescription: 'Amber liquid'
  },
  {
    id: 'oaxaca-old-fashioned',
    name: 'Oaxaca Old Fashioned',
    liquor: 'reposado',
    glasswareId: 'rocks',
    ice: 'king-cube',
    visualDescription: 'Dark amber, smoky atmosphere hint'
  },
  {
    id: 'tequila-sour',
    name: 'Reposado Sour',
    liquor: 'reposado',
    glasswareId: 'coupe', // or rocks
    ice: 'none',
    visualDescription: 'Golden liquid, thick white egg white foam layer'
  },

  // 6. ADVENTUROUS MIX
  {
    id: 'batanga',
    name: 'The Batanga',
    liquor: 'blanco',
    glasswareId: 'highball',
    ice: 'cubed',
    visualDescription: 'Dark cola color, knife stirred aesthetic'
  },
  {
    id: 'cantarito',
    name: 'Cantarito',
    liquor: 'reposado',
    glasswareId: 'highball', // traditionally clay jar
    ice: 'cubed',
    visualDescription: 'Citrus juice orange-pink blend, bubbly soda'
  },
  {
    id: 'el-diablo',
    name: 'El Diablo',
    liquor: 'reposado',
    glasswareId: 'highball',
    ice: 'cubed',
    visualDescription: 'Red cassis bleeding into ginger beer'
  },
  {
    id: 'matador',
    name: 'Matador',
    liquor: 'blanco',
    glasswareId: 'coupe',
    ice: 'none',
    visualDescription: 'pale yellow pineapple juice mix, elegant'
  },
  {
    id: 'siesta',
    name: 'Siesta Cocktail',
    liquor: 'blanco',
    glasswareId: 'coupe',
    ice: 'none',
    visualDescription: 'Pale red-pink (Campari/Grapefruit mix), sophisticated'
  }
];

export type CameraOption = {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  previewImage: string;
  group?: string; // New
  defaultSettings?: CameraSettings;
};

export type CameraSettings = {
  lens: string;
  aperture: string;
  iso: string;
  shutter: string;
};

export const LENSES = ['16mm Wide', '24mm Wide', '35mm Standard', '50mm Prime', '85mm Portrait', '100mm Macro', '200mm Telephoto'];
export const APERTURES = ['f/1.2 (Dreamy)', 'f/1.8', 'f/2.8', 'f/4.0', 'f/5.6', 'f/8.0 (Sharp)', 'f/11', 'f/16'];
export const ISOS = ['ISO 50', 'ISO 100', 'ISO 200', 'ISO 400', 'ISO 800', 'ISO 1600', 'ISO 3200 (Grainy)'];
export const SHUTTERS = ['1/8000s (Freeze)', '1/1000s', '1/500s', '1/250s', '1/125s', '1/60s', '1/30s', '1/15s (Motion Blur)', '1s (Long Exp)'];

export const CAMERA_TYPES: CameraOption[] = [
  // Group A: Selling
  {
    id: "ecommerce",
    name: "E-Commerce (White BG)",
    description: "Pure white, high fidelity, packshot",
    promptTemplate: ", commercial product photography, shot on Hasselblad H6D-100c. Pure white background (RGB 255, 255, 255), soft even lighting, no hard shadows. High fidelity, crystal clear details, center composition. Packshot style, no distractions, professional retouching.",
    previewImage: "/camera-styles/ecommerce.png",
    group: "Selling (Clean & Pro)",
    defaultSettings: { lens: '85mm Portrait', aperture: 'f/8.0 (Sharp)', iso: 'ISO 100', shutter: '1/125s' }
  },
  {
    id: "studio-pop",
    name: "Studio Pop (Color)",
    description: "Vibrant, hard light, geometric",
    promptTemplate: ", studio pop photography, solid pastel color background. Hard light source creating sharp, defined shadows. Minimalist composition, geometric props (cubes, cylinders). Trendy, vibrant, playful aesthetic, high contrast. Shot on high-resolution digital medium format.",
    previewImage: "/camera-styles/studio-pop.png",
    group: "Selling (Clean & Pro)",
    defaultSettings: { lens: '50mm Prime', aperture: 'f/5.6', iso: 'ISO 100', shutter: '1/250s' }
  },
  {
    id: "pro-studio",
    name: "Pro Studio (DSLR)",
    description: "Softbox lighting, sharp, bokeh",
    promptTemplate: ", captured on a Canon EOS R5 with an 85mm f/1.2 lens. Professional studio photography, softbox lighting setup, rim lighting to separate subject from background. Razor sharp focus on the subject, creamy bokeh background blur. High resolution, commercial aesthetic, 8k, neutral color grading.",
    previewImage: "/camera-styles/dslr.png",
    group: "Selling (Clean & Pro)",
    defaultSettings: { lens: '85mm Portrait', aperture: 'f/1.2 (Dreamy)', iso: 'ISO 100', shutter: '1/125s' }
  },
  // Group B: Lifestyle
  {
    id: "modern-home",
    name: "Modern Home",
    description: "Interior, natural light, cozy",
    promptTemplate: ", interior lifestyle product photography. Product placed in a beautiful modern home environment (such as a marble kitchen counter or oak coffee table). Soft natural window light, depth of field to blur the room background. Cozy atmosphere, architectural digest style.",
    previewImage: "/camera-styles/modern-home.png",
    group: "Lifestyle (Vibe & Context)",
    defaultSettings: { lens: '35mm Standard', aperture: 'f/2.8', iso: 'ISO 400', shutter: '1/60s' }
  },
  {
    id: "organic",
    name: "Organic (Sunlight)",
    description: "Dappled light, fresh, botanical",
    promptTemplate: ", natural product photography, hard sunlight with window shadow gobo effects. Shot on Sony A7R IV. Natural stone or wooden surface, botanical props (leaves, flowers) slightly out of focus in background. Warm golden hour tones, organic vibe, fresh and airy, dappled light.",
    previewImage: "/camera-styles/organic.png",
    group: "Lifestyle (Vibe & Context)",
    defaultSettings: { lens: '50mm Prime', aperture: 'f/4.0', iso: 'ISO 200', shutter: '1/125s' }
  },
  {
    id: "luxury",
    name: "Luxury (Moody)",
    description: "Dark, cinematic, rim light",
    promptTemplate: ", high-end editorial product photography, dark moody lighting, cinematic atmosphere. Shot on Phase One XF IQ4. Textured background (slate, marble, or velvet), dramatic rim lighting, spotlight on the product. Luxurious aesthetic, rich colors, deep shadows, glossy reflections.",
    previewImage: "/camera-styles/luxury.png",
    group: "Lifestyle (Vibe & Context)",
    defaultSettings: { lens: '100mm Macro', aperture: 'f/2.8', iso: 'ISO 100', shutter: '1/125s' }
  },
  {
    id: "action",
    name: "Action (Levitation)",
    description: "Frozen motion, dynamic, energy",
    promptTemplate: ", dynamic high-speed product photography, product suspended in mid-air (levitation). Frozen motion, zero gravity look. Dynamic camera angle, dramatic lighting. Motion blur elements in background, sharp focus on product. Commercial advertising style, high energy.",
    previewImage: "/camera-styles/action.png",
    group: "Lifestyle (Vibe & Context)",
    defaultSettings: { lens: '50mm Prime', aperture: 'f/5.6', iso: 'ISO 400', shutter: '1/1000s' }
  },
  // Group C: Camera FX
  {
    id: "smartphone",
    name: "Smartphone (Candid)",
    description: "Authentic, social media vibe",
    promptTemplate: ", shot on iPhone 15 Pro Max, 24mm wide angle lens. Candid lifestyle photography, natural lighting, slightly harsh highlights, mobile photography aesthetic. Deep depth of field, slight digital noise, auto-white balance. Posted on social media, authentic, unpolished.",
    previewImage: "/camera-styles/iphone.png",
    group: "Camera FX (Artistic & Retro)",
    defaultSettings: { lens: '24mm Wide', aperture: 'f/1.8', iso: 'ISO 400', shutter: '1/1000s' }
  },
  {
    id: "vintage-film",
    name: "Vintage Film (35mm)",
    description: "Grain, nostalgic, warm",
    promptTemplate: ", analog photography, shot on Kodak Portra 400 35mm film. Leica M6 camera. Visible film grain, warm nostalgic color tones, slight soft focus, light leak, vintage aesthetic. Authentic film texture, rich shadows, slightly desaturated greens. 1990s vacation vibe.",
    previewImage: "/camera-styles/film.png",
    group: "Camera FX (Artistic & Retro)",
    defaultSettings: { lens: '35mm Standard', aperture: 'f/2.8', iso: 'ISO 400', shutter: '1/60s' }
  },
  {
    id: "polaroid",
    name: "Polaroid (Instant)",
    description: "Flash, vignette, retro",
    promptTemplate: ", Polaroid 600 instant film photo. Direct on-camera flash, harsh shadows behind the subject, soft definition, vignetting around the corners. Washed out blacks, greenish-magenta color shift, high contrast. Retro instant camera aesthetic, chemical film texture.",
    previewImage: "/camera-styles/polaroid.png",
    group: "Camera FX (Artistic & Retro)",
    defaultSettings: { lens: '35mm Standard', aperture: 'f/11', iso: 'ISO 800', shutter: '1/60s' }
  },
  {
    id: "neon",
    name: "Neon (Cyberpunk)",
    description: "Futuristic, glow, vibrant",
    promptTemplate: ", futuristic product photography, neon lighting setup (cyan and magenta). Shot on Nikon Z9. Dark reflective surface, glowing backlights, smoke or fog elements. High contrast, vibrant saturation, tech-noir aesthetic, sharp details, energetic composition.",
    previewImage: "/camera-styles/neon.png",
    group: "Camera FX (Artistic & Retro)",
    defaultSettings: { lens: '50mm Prime', aperture: 'f/1.8', iso: 'ISO 800', shutter: '1/60s' }
  },
  {
    id: "disposable",
    name: "Disposable (Party)",
    description: "Direct flash, chaotic, gritty",
    promptTemplate: ", shot on a Fujifilm QuickSnap disposable camera. Harsh direct flash, dark background, high contrast, cheap lens distortion, heavy vignette. 1998 party aesthetic, chaotic energy, overexposed foreground subject, gritty texture.",
    previewImage: "/camera-styles/disposable.png",
    group: "Camera FX (Artistic & Retro)"
  }
];

export type PropOption = {
  id: string;
  name: string;
  value: string;
  section: string;
  requiresColor?: boolean;
};

export const PROPS: PropOption[] = [
  // Elements (FX & Atmosphere) - 15 options
  { id: 'water-splash', name: 'Water Splash', value: 'dynamic crystal clear water splash, high speed liquid capture, droplets frozen in air', section: 'Elements (FX & Atmosphere)' },
  { id: 'ice-burst', name: 'Ice Burst', value: 'exploding ice shards, frost particles, cold blue texture, frozen motion', section: 'Elements (FX & Atmosphere)' },
  { id: 'fire-sparks', name: 'Fire / Sparks', value: 'flying embers and fire sparks, warm bokeh, heat distortion, dynamic energy', section: 'Elements (FX & Atmosphere)' },
  { id: 'colored-smoke', name: 'Colored Smoke', value: 'wispy colored smoke plumes, ethereal soft flowing mist, gradient colors', section: 'Elements (FX & Atmosphere)', requiresColor: true },
  { id: 'electric-arcs', name: 'Electric Arcs', value: 'crackling lightning bolts, electric energy arcs, blue plasma, high voltage', section: 'Elements (FX & Atmosphere)' },
  { id: 'dust-particles', name: 'Dust Particles', value: 'floating golden dust particles, sun motes, atmospheric depth', section: 'Elements (FX & Atmosphere)' },
  { id: 'fog-haze', name: 'Fog / Haze', value: 'dense low-lying fog, atmospheric haze, mysterious mood', section: 'Elements (FX & Atmosphere)' },
  { id: 'confetti', name: 'Confetti', value: 'falling metallic confetti, celebration vibe, reflective glitter', section: 'Elements (FX & Atmosphere)' },
  { id: 'bubbles', name: 'Bubbles', value: 'floating iridescent soap bubbles, rainbow reflections, dreamy whimsical atmosphere', section: 'Elements (FX & Atmosphere)' },
  { id: 'rain-drops', name: 'Rain Drops', value: 'falling rain droplets, wet streaks, moody rainy day atmosphere, water beads on surfaces', section: 'Elements (FX & Atmosphere)' },
  { id: 'snow-flurries', name: 'Snow Flurries', value: 'gentle falling snowflakes, winter wonderland, soft white particles, cold crisp atmosphere', section: 'Elements (FX & Atmosphere)' },
  { id: 'light-rays', name: 'Light Rays', value: 'dramatic god rays, volumetric light beams, sun shafts cutting through atmosphere', section: 'Elements (FX & Atmosphere)' },
  { id: 'glitter', name: 'Glitter', value: 'sparkling glitter particles, shimmering metallic flecks, glamorous sparkle effect', section: 'Elements (FX & Atmosphere)' },
  { id: 'lens-flare', name: 'Lens Flare', value: 'cinematic lens flare, anamorphic light streaks, warm sun flare artifacts', section: 'Elements (FX & Atmosphere)' },
  { id: 'bokeh-lights', name: 'Bokeh Lights', value: 'soft circular bokeh light orbs, out of focus light points, dreamy background blur', section: 'Elements (FX & Atmosphere)' },

  // Nature (Organic) - 15 options
  { id: 'tropical-leaves', name: 'Tropical Leaves', value: 'large green monstera leaves, tropical foliage, vibrant nature details', section: 'Nature (Organic)' },
  { id: 'mossy-rocks', name: 'Mossy Rocks', value: 'natural slate rocks covered in green moss, forest floor aesthetic', section: 'Nature (Organic)' },
  { id: 'sand-dunes', name: 'Sand Dunes', value: 'rippled desert sand, fine grain texture, warm beige tones', section: 'Nature (Organic)' },
  { id: 'flower-petals', name: 'Flower Petals', value: 'falling soft flower petals, delicate floral details, romantic vibe', section: 'Nature (Organic)' },
  { id: 'dried-wheat', name: 'Dried Wheat', value: 'dried pampas grass and wheat stalks, beige neutral tones, boho aesthetic', section: 'Nature (Organic)' },
  { id: 'river-stones', name: 'River Stones', value: 'smooth wet river stones, zen garden arrangement, balanced composition', section: 'Nature (Organic)' },
  { id: 'tree-bark', name: 'Tree Bark', value: 'textured rough tree bark, raw wood details, rustic nature', section: 'Nature (Organic)' },
  { id: 'clouds', name: 'Clouds', value: 'fluffy white cumulus clouds, blue sky atmosphere, airy feel', section: 'Nature (Organic)' },
  { id: 'succulents', name: 'Succulents', value: 'small potted succulent plants, jade green rosettes, modern botanical aesthetic', section: 'Nature (Organic)' },
  { id: 'ferns', name: 'Ferns', value: 'delicate fern fronds, lush green foliage, forest understory aesthetic', section: 'Nature (Organic)' },
  { id: 'pine-branches', name: 'Pine Branches', value: 'fresh pine tree branches, green needles, winter evergreen aesthetic, subtle woody scent implied', section: 'Nature (Organic)' },
  { id: 'seashells', name: 'Seashells', value: 'scattered seashells, ocean treasures, beach coastal vibes, pearlescent textures', section: 'Nature (Organic)' },
  { id: 'coral', name: 'Coral', value: 'natural coral pieces, ocean reef textures, organic branching forms, coastal decor', section: 'Nature (Organic)' },
  { id: 'bamboo', name: 'Bamboo', value: 'bamboo stalks, zen asian aesthetic, natural green segments, peaceful spa vibes', section: 'Nature (Organic)' },
  { id: 'lavender', name: 'Lavender', value: 'dried lavender sprigs, purple floral clusters, aromatic herbs, provence aesthetic', section: 'Nature (Organic)' },

  // Objects (Stage & Decor) - 15 options
  { id: 'concrete-pedestal', name: 'Concrete Pedestal', value: 'minimalist concrete cylinder pedestal, raw architectural texture', section: 'Objects (Stage & Decor)' },
  { id: 'marble-slab', name: 'Marble Slab', value: 'polished Carrara marble slab, white with grey veins, luxury surface', section: 'Objects (Stage & Decor)' },
  { id: 'silk-fabric', name: 'Silk Fabric', value: 'flowing silk fabric, elegant drapery, soft folds, satin finish', section: 'Objects (Stage & Decor)', requiresColor: true },
  { id: 'neon-rings', name: 'Neon Rings', value: 'glowing glowing neon ring light, futuristic geometry, cyber aesthetic', section: 'Objects (Stage & Decor)', requiresColor: true },
  { id: 'glass-prisms', name: 'Glass Prisms', value: 'crystal glass prisms, dispersion effects, rainbow light refraction', section: 'Objects (Stage & Decor)' },
  { id: 'mirror', name: 'Mirror', value: 'reflective mirror surface, perfect reflection, symmetry', section: 'Objects (Stage & Decor)' },
  { id: 'geometric-cubes', name: 'Geometric Cubes', value: 'scattered matte geometric cubes, abstract composition, modern art vibe', section: 'Objects (Stage & Decor)' },
  { id: 'tech-cables', name: 'Tech Cables', value: 'messy colorful modular synthesizer cables, tech clutter, cyberpunk detail', section: 'Objects (Stage & Decor)' },
  { id: 'ceramic-vases', name: 'Ceramic Vases', value: 'artisan ceramic vases, handmade pottery, organic sculptural forms, earthy tones', section: 'Objects (Stage & Decor)' },
  { id: 'stacked-books', name: 'Stacked Books', value: 'vintage stacked books, leather bound spines, intellectual aesthetic, warm library vibes', section: 'Objects (Stage & Decor)' },
  { id: 'candles', name: 'Candles', value: 'lit pillar candles, warm flickering flame, melted wax drips, cozy ambient glow', section: 'Objects (Stage & Decor)' },
  { id: 'metal-spheres', name: 'Metal Spheres', value: 'polished metal spheres, chrome or brass balls, reflective orbs, modern sculptural', section: 'Objects (Stage & Decor)' },
  { id: 'terrazzo-surface', name: 'Terrazzo Surface', value: 'terrazzo material surface, colorful stone chips in concrete, modern Italian design', section: 'Objects (Stage & Decor)' },
  { id: 'acrylic-blocks', name: 'Acrylic Blocks', value: 'clear acrylic display blocks, transparent lucite risers, modern gallery aesthetic', section: 'Objects (Stage & Decor)' },
  { id: 'vintage-frames', name: 'Vintage Frames', value: 'ornate vintage picture frames, gilded gold baroque details, antique gallery aesthetic', section: 'Objects (Stage & Decor)' },

  // Food & Ingredients - 14 options
  { id: 'citrus-fruits', name: 'Citrus Fruits', value: 'fresh citrus fruits, sliced lemons limes oranges, vibrant yellow and orange, juicy fresh', section: 'Food & Ingredients' },
  { id: 'mixed-berries', name: 'Mixed Berries', value: 'fresh mixed berries, raspberries blueberries strawberries, vibrant reds and blues, dewy fresh', section: 'Food & Ingredients' },
  { id: 'chocolate-pieces', name: 'Chocolate Pieces', value: 'broken dark chocolate pieces, rich cocoa shards, luxurious confection, glossy tempered surface', section: 'Food & Ingredients' },
  { id: 'coffee-beans', name: 'Coffee Beans', value: 'scattered roasted coffee beans, rich brown tones, artisan cafe aesthetic, aromatic implied', section: 'Food & Ingredients' },
  { id: 'spices', name: 'Spices', value: 'exotic spices arrangement, cinnamon sticks star anise cardamom, warm earthy tones, aromatic', section: 'Food & Ingredients' },
  { id: 'honey-drizzle', name: 'Honey Drizzle', value: 'golden honey drizzle, viscous amber liquid, natural sweetness, organic apiary aesthetic', section: 'Food & Ingredients' },
  { id: 'salt-crystals', name: 'Salt Crystals', value: 'coarse sea salt crystals, flaky Maldon salt, mineral texture, culinary detail', section: 'Food & Ingredients' },
  { id: 'sugar-cubes', name: 'Sugar Cubes', value: 'white sugar cubes, geometric sweetness, classic cafe aesthetic, crystalline texture', section: 'Food & Ingredients' },
  { id: 'fresh-herbs', name: 'Fresh Herbs', value: 'fresh culinary herbs, basil mint rosemary thyme, aromatic greens, farm to table aesthetic', section: 'Food & Ingredients' },
  { id: 'cheese-wedges', name: 'Cheese Wedges', value: 'artisan cheese wedges, aged parmesan brie camembert, gourmet dairy, charcuterie aesthetic', section: 'Food & Ingredients' },
  { id: 'crackers-bread', name: 'Crackers & Bread', value: 'artisan crackers and bread slices, rustic baguette, bakery fresh, carb aesthetic', section: 'Food & Ingredients' },
  { id: 'mixed-nuts', name: 'Mixed Nuts', value: 'scattered mixed nuts, almonds walnuts pistachios, natural snacking, earthy tones', section: 'Food & Ingredients' },
  { id: 'vanilla-pods', name: 'Vanilla Pods', value: 'split vanilla bean pods, exotic spice, black aromatic seeds, gourmet baking ingredient', section: 'Food & Ingredients' },
  { id: 'olives', name: 'Olives', value: 'mediterranean olives, green and kalamata, briny appetizer, tuscan aesthetic', section: 'Food & Ingredients' },
  { id: 'tropical-fruits', name: 'Tropical Fruits', value: 'exotic tropical fruits, pineapple mango papaya passion fruit, vibrant colors, vacation paradise vibes', section: 'Food & Ingredients' },

  // Textures & Materials - 15 options
  { id: 'velvet-fabric', name: 'Velvet Fabric', value: 'rich velvet fabric, plush luxurious texture, deep saturated color, opulent drapery', section: 'Textures & Materials', requiresColor: true },
  { id: 'leather-texture', name: 'Leather', value: 'premium leather material, natural grain texture, rich brown or black, luxury goods aesthetic', section: 'Textures & Materials' },
  { id: 'linen-fabric', name: 'Linen', value: 'natural linen fabric, woven flax texture, neutral cream tones, organic textile aesthetic', section: 'Textures & Materials' },
  { id: 'burlap-jute', name: 'Burlap / Jute', value: 'rough burlap or jute fabric, natural fiber weave, rustic farmhouse aesthetic', section: 'Textures & Materials' },
  { id: 'terrazzo', name: 'Terrazzo', value: 'terrazzo composite material, colorful aggregate chips, Italian design, speckled surface', section: 'Textures & Materials' },
  { id: 'brushed-metal', name: 'Brushed Metal', value: 'brushed stainless steel surface, linear grain texture, industrial modern aesthetic', section: 'Textures & Materials' },
  { id: 'copper-patina', name: 'Copper Patina', value: 'aged copper with green patina, oxidized metal surface, vintage industrial character', section: 'Textures & Materials' },
  { id: 'woven-rattan', name: 'Woven Rattan', value: 'woven rattan or wicker material, natural cane weave, bohemian tropical aesthetic', section: 'Textures & Materials' },
  { id: 'cork-surface', name: 'Cork', value: 'natural cork material, sustainable texture, warm earthy bulletin board aesthetic', section: 'Textures & Materials' },
  { id: 'kraft-paper', name: 'Kraft Paper', value: 'brown kraft paper, recycled cardboard texture, eco packaging aesthetic, rustic minimal', section: 'Textures & Materials' },
  { id: 'ceramic-glaze', name: 'Ceramic Glaze', value: 'glossy ceramic glaze surface, kiln-fired pottery finish, artisan handmade aesthetic', section: 'Textures & Materials' },
  { id: 'raw-concrete', name: 'Raw Concrete', value: 'raw poured concrete, brutalist texture, industrial architectural surface, grey minimal', section: 'Textures & Materials' },
  { id: 'gold-leaf', name: 'Gold Leaf', value: 'delicate gold leaf sheets, gilded metallic surface, luxury art restoration aesthetic', section: 'Textures & Materials' },
  { id: 'resin-surface', name: 'Resin', value: 'poured epoxy resin surface, glossy transparent layers, modern art furniture aesthetic', section: 'Textures & Materials', requiresColor: true },
  { id: 'marble-veins', name: 'Marble Veins', value: 'natural marble stone with dramatic veining, organic mineral patterns, luxury material aesthetic', section: 'Textures & Materials' },

  // Lifestyle & Context - 15 options
  { id: 'vintage-books', name: 'Vintage Books', value: 'antique leather-bound books, aged pages, library study aesthetic, intellectual warmth', section: 'Lifestyle & Context' },
  { id: 'lit-candles', name: 'Lit Candles', value: 'burning scented candles, warm ambient glow, cozy hygge atmosphere, relaxation vibes', section: 'Lifestyle & Context' },
  { id: 'jewelry', name: 'Jewelry', value: 'elegant jewelry pieces, gold chains rings earrings, luxury accessories, glamour detail', section: 'Lifestyle & Context' },
  { id: 'sunglasses', name: 'Sunglasses', value: 'designer sunglasses, stylish eyewear, summer fashion accessory, cool lifestyle', section: 'Lifestyle & Context' },
  { id: 'luxury-watch', name: 'Luxury Watch', value: 'premium wristwatch, mechanical timepiece, luxury horology, sophisticated accessory', section: 'Lifestyle & Context' },
  { id: 'potted-plants', name: 'Potted Plants', value: 'decorative potted plants, indoor greenery, plant parent aesthetic, living decor', section: 'Lifestyle & Context' },
  { id: 'coffee-cup', name: 'Coffee Cup', value: 'steaming coffee cup, ceramic mug, morning ritual, cafe lifestyle aesthetic', section: 'Lifestyle & Context' },
  { id: 'wine-glass', name: 'Wine Glass', value: 'elegant wine glass, crystal stemware, sophisticated evening, sommelier aesthetic', section: 'Lifestyle & Context' },
  { id: 'magazine', name: 'Magazine', value: 'glossy lifestyle magazine, editorial publication, coffee table reading, curated taste', section: 'Lifestyle & Context' },
  { id: 'perfume-bottle', name: 'Perfume Bottle', value: 'luxury perfume bottle, designer fragrance, crystal flacon, beauty vanity aesthetic', section: 'Lifestyle & Context' },
  { id: 'fresh-flowers-vase', name: 'Flowers in Vase', value: 'fresh cut flowers in vase, floral arrangement, botanical beauty, living decor', section: 'Lifestyle & Context' },
  { id: 'fruit-bowl', name: 'Fruit Bowl', value: 'decorative fruit bowl, fresh produce display, kitchen counter styling, healthy lifestyle', section: 'Lifestyle & Context' },
  { id: 'artisan-bread', name: 'Artisan Bread', value: 'fresh baked artisan bread loaf, crusty sourdough, bakery aesthetic, homemade warmth', section: 'Lifestyle & Context' },
  { id: 'charcuterie-board', name: 'Charcuterie Board', value: 'styled charcuterie board, cured meats cheeses, entertaining spread, gourmet gathering', section: 'Lifestyle & Context' },
  { id: 'headphones', name: 'Headphones', value: 'premium over-ear headphones, audiophile equipment, music lifestyle, sleek modern design', section: 'Lifestyle & Context' },
];

export type PropPlacement = string;

export const PROP_PLACEMENTS: { id: string; label: string; value: string }[] = [
  { id: 'surrounding', label: 'Surrounding (Orbit)', value: 'surrounded by' },
  { id: 'background', label: 'Background (Blur)', value: 'with a background of' },
  { id: 'foreground', label: 'Foreground (Depth)', value: 'with foreground elements of' },
  { id: 'under', label: 'Under (Base/Surface)', value: 'resting on a' },
  { id: 'floating', label: 'Floating (Levitation)', value: 'floating amidst' },
  { id: 'behind', label: 'Behind (Backdrop)', value: 'set against a backdrop of' },
  { id: 'impact', label: 'Impact (Interaction)', value: 'colliding with' },
];

export type BottlePlacement = string;

export const BOTTLE_X_POSITIONS: { id: string; label: string; prompt: string }[] = [
  { id: 'left', label: 'Left', prompt: 'on the left side of the frame' },
  { id: 'center', label: 'Center', prompt: 'in the center of the frame' },
  { id: 'right', label: 'Right', prompt: 'on the right side of the frame' },
];

export const BOTTLE_DEPTH_POSITIONS: { id: string; label: string; prompt: string }[] = [
  { id: 'foreground', label: 'Foreground', prompt: 'in the immediate foreground' },
  { id: 'midground', label: 'Standard (Mid)', prompt: 'placed naturally in the composition' },
  { id: 'background', label: 'Background', prompt: 'in the background, slightly out of focus' },
];

export const SURFACE_PLACEMENTS: { id: string; label: string; prompt: string }[] = [
  { id: 'front-edge', label: 'Front Edge', prompt: 'placed at the very front edge of the surface' },
  { id: 'center', label: 'Center', prompt: 'placed in the center of the surface' },
  { id: 'back-edge', label: 'Back Edge', prompt: 'placed deeply back on the surface away from the camera, leaving a significant amount of empty foreground surface visible' },
];

// Seasonal/Holiday Presets
export type SeasonalPreset = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  lightingId: string;
  propIds: string[];
  suggestedGarnishIds: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  backgroundSuggestion?: string;
  countertopSuggestion?: string;
};

export const SEASONAL_PRESETS: SeasonalPreset[] = [
  {
    id: 'valentines',
    name: "Valentine's Day",
    emoji: '💕',
    description: 'Romantic pinks and reds, rose petals, soft dramatic lighting',
    lightingId: 'studio-dramatic',
    propIds: ['flower-petals', 'candles', 'silk-fabric'],
    suggestedGarnishIds: ['rose-petals', 'strawberry', 'edible-flowers', 'hibiscus-flower'],
    colorScheme: { primary: '#FF6B8A', secondary: '#FFD4E5', accent: '#FF1744' },
    backgroundSuggestion: 'velvet-blue',
    countertopSuggestion: 'marble-white'
  },
  {
    id: 'summer',
    name: 'Summer Vibes',
    emoji: '🌴',
    description: 'Bright tropical colors, citrus, beach elements',
    lightingId: 'natural-daylight',
    propIds: ['tropical-leaves', 'citrus-fruits', 'seashells'],
    suggestedGarnishIds: ['pineapple-wedge', 'lime-wedge', 'mango-slice', 'coconut-flakes', 'mint-sprig'],
    colorScheme: { primary: '#00BCD4', secondary: '#FFEB3B', accent: '#FF9800' },
    countertopSuggestion: 'wood-oak'
  },
  {
    id: 'halloween',
    name: 'Halloween',
    emoji: '🎃',
    description: 'Spooky vibes, dark moody lighting, orange and black',
    lightingId: 'moody-bar',
    propIds: ['fog-haze', 'candles', 'colored-smoke'],
    suggestedGarnishIds: ['blackberry', 'cocktail-cherry', 'edible-glitter', 'black-lava-salt'],
    colorScheme: { primary: '#FF6600', secondary: '#1A1A1A', accent: '#800080' },
    backgroundSuggestion: 'leather-black',
    countertopSuggestion: 'marble-black'
  },
  {
    id: 'holiday-winter',
    name: 'Holiday/Winter',
    emoji: '❄️',
    description: 'Festive reds and greens, cinnamon, cranberries, warm glow',
    lightingId: 'golden-hour',
    propIds: ['pine-branches', 'candles', 'snow-flurries'],
    suggestedGarnishIds: ['cinnamon-stick', 'cranberries', 'rosemary-sprig', 'star-anise', 'sugar-rim'],
    colorScheme: { primary: '#C41E3A', secondary: '#228B22', accent: '#FFD700' },
    countertopSuggestion: 'wood-walnut'
  },
  {
    id: 'spring',
    name: 'Spring Garden',
    emoji: '🌸',
    description: 'Fresh florals, pastels, light and airy',
    lightingId: 'natural-daylight',
    propIds: ['flower-petals', 'fresh-flowers-vase', 'lavender'],
    suggestedGarnishIds: ['elderflower', 'lavender-sprig', 'edible-flowers', 'cucumber-ribbon', 'mint-sprig'],
    colorScheme: { primary: '#FFB7C5', secondary: '#E8F5E9', accent: '#BA68C8' },
    countertopSuggestion: 'marble-white'
  },
  {
    id: 'new-years',
    name: "New Year's Eve",
    emoji: '🥂',
    description: 'Glamorous gold and black, sparkle, celebration',
    lightingId: 'studio-dramatic',
    propIds: ['confetti', 'glitter', 'bokeh-lights'],
    suggestedGarnishIds: ['gold-leaf', 'edible-glitter', 'cocktail-cherry', 'sugar-rim'],
    colorScheme: { primary: '#FFD700', secondary: '#1A1A1A', accent: '#C0C0C0' },
    backgroundSuggestion: 'leather-black',
    countertopSuggestion: 'marble-black'
  }
];
