export interface Article {
  id: string;
  category: string;
  title: string;
  preview: string;
  readTime: number;
  content: string[];
  relatedIds: string[];
}

export const categories = [
  'All',
  'Scalp health',
  'Hair health',
  'Nutrition',
  'Conditions',
  'Styling and protection',
  "Men's hair",
  'Myth busting',
];

export const articles: Article[] = [
  // ── SCALP HEALTH ──
  {
    id: 'scalp-matters',
    category: 'Scalp health',
    title: 'Why your scalp matters more than you think',
    preview: 'Your scalp is skin — and it needs care just like your face does',
    readTime: 2,
    content: [
      'Your scalp is skin. It needs care just like your face does. It has oil glands, sweat glands, a microbiome, and blood supply that feeds your hair follicles.',
      'When your scalp is inflamed, clogged, or irritated, your hair suffers. Most people treat the hair and ignore the scalp. That\'s backwards.',
      'Think about it this way: you wouldn\'t expect a garden to thrive if you only paid attention to the flowers and ignored the soil. Your scalp is the soil. Healthy hair starts there.',
    ],
    relatedIds: ['scalp-ph', 'scalp-microbiome', 'dandruff-vs-dry'],
  },
  {
    id: 'under-protective-style',
    category: 'Scalp health',
    title: "What's actually happening under your protective style",
    preview: 'Why monitoring between installs matters more than you think',
    readTime: 2,
    content: [
      'When a protective style is installed, your scalp is covered and largely left alone for weeks. Sweat, oil, product buildup, and dead skin cells accumulate. Without regular cleansing, this can create an environment where inflammation builds quietly.',
      'The style itself can also apply constant tension to your follicles, especially around the hairline, temples, and nape.',
      'None of this is visible until you take the style down, which is why monitoring between installs matters. A quick mid-cycle check-in can catch problems before they become visible damage.',
    ],
    relatedIds: ['scalp-matters', 'sweat-scalp', 'how-tight'],
  },
  {
    id: 'scalp-ph',
    category: 'Scalp health',
    title: 'Scalp pH: why it matters and how products affect it',
    preview: 'That tight, dry feeling after washing might be a pH problem',
    readTime: 2,
    content: [
      'Your scalp naturally sits at a pH of about 4.5 to 5.5, which is slightly acidic. This acidity protects against bacteria and fungal overgrowth.',
      'Some products, especially harsh shampoos, can disrupt this balance. Apple cider vinegar rinses became popular partly because they help restore acidic pH.',
      'Signs your pH might be off: persistent flaking, irritation that doesn\'t respond to moisturising, or a scalp that feels tight and dry after washing. Switching to a pH-balanced or sulphate-free shampoo can make a noticeable difference.',
    ],
    relatedIds: ['scalp-microbiome', 'dandruff-vs-dry', 'scalp-matters'],
  },
  {
    id: 'sweat-scalp',
    category: 'Scalp health',
    title: 'Sweat and your scalp: what to do after working out',
    preview: "You don't need to wash every time — but you do need a plan",
    readTime: 1,
    content: [
      'Sweat itself isn\'t harmful to your scalp. But when sweat mixes with product buildup and sits under a style for days, it can irritate and inflame.',
      'You don\'t need to wash every time you exercise. Options: a scalp refresh spray, a rinse with water only, or blotting with a microfibre cloth.',
      'If you exercise daily and wear protective styles, mid-cycle scalp cleansing is worth building into your routine. Your scalp will thank you.',
    ],
    relatedIds: ['under-protective-style', 'scalp-matters', 'between-styles'],
  },
  {
    id: 'dandruff-vs-dry',
    category: 'Scalp health',
    title: "Dandruff vs dry scalp: they're not the same thing",
    preview: 'The treatments are completely different — and mixing them up makes it worse',
    readTime: 2,
    content: [
      'Dandruff (seborrheic dermatitis) produces oily, yellowish flakes and is caused by an overgrowth of a yeast called Malassezia. Dry scalp produces smaller, white, dry flakes and is caused by lack of moisture.',
      'The treatments are completely different. Dandruff responds to antifungal ingredients like ketoconazole, zinc pyrithione, or selenium sulfide. Dry scalp responds to gentle moisturising and less frequent washing.',
      'If you\'re treating one but it\'s actually the other, you\'ll make it worse. Antifungal shampoo on a dry scalp will strip it further. Heavy oils on a dandruff scalp will feed the yeast and worsen the condition. Figuring out which one you have is the first step.',
    ],
    relatedIds: ['seb-derm', 'scalp-ph', 'scalp-microbiome'],
  },
  {
    id: 'scalp-microbiome',
    category: 'Scalp health',
    title: 'The scalp microbiome: what it is and why it matters',
    preview: "Think of it like gut health — but for your head",
    readTime: 2,
    content: [
      'Your scalp has its own ecosystem of bacteria and fungi that help keep it healthy. When this balance is disrupted — whether from over-washing, harsh products, antibiotics, or stress — you can get inflammation, flaking, or sensitivity.',
      'Think of it like gut health but for your head. Gentle, pH-balanced cleansing and not over-treating your scalp are the best ways to keep the microbiome happy.',
      'Ironically, the most common way people disrupt their scalp microbiome is by trying too hard to "fix" their scalp. Sometimes less really is more.',
    ],
    relatedIds: ['scalp-ph', 'dandruff-vs-dry', 'scalp-matters'],
  },

  // ── HAIR HEALTH ──
  {
    id: 'hair-breakage',
    category: 'Hair health',
    title: 'Why your hair breaks and what to do about it',
    preview: 'There are 5 types of breakage — and each one has a different fix',
    readTime: 3,
    content: [
      'Hair breaks for a few main reasons, and knowing which one you\'re dealing with changes the solution.',
      'Mechanical breakage is caused by manipulation, tight styling, rough detangling, or friction from cotton pillowcases and towel drying. The fix: gentler handling, satin accessories, finger detangling or a wide-tooth comb on conditioned hair.',
      'Moisture deficit breakage means hair feels dry, straw-like, and snaps easily. The fix: deep conditioning, leave-in conditioner, and ensuring your hair retains moisture between washes.',
      'Protein deficit breakage means hair feels limp, stretchy, and mushy when wet. The fix: a protein treatment like Aphogee, rice water rinse, or a protein-based deep conditioner. Be careful though — too much protein causes the opposite problem.',
      'Chemical breakage comes from relaxers, colour, or bleach weakening the hair\'s internal structure. The fix: bond repair treatments like K18 or Olaplex, and time. Severely chemically damaged hair may need to be cut.',
      'Heat damage comes from flat irons, blow dryers, or hot combs used too frequently or at too high a temperature. This is usually permanent — damaged sections need to be trimmed out over time.',
    ],
    relatedIds: ['shedding-vs-breakage', 'protein-moisture', 'porosity'],
  },
  {
    id: 'porosity',
    category: 'Hair health',
    title: 'Understanding hair porosity and why it matters',
    preview: 'Why the same product works for your friend but not for you',
    readTime: 2,
    content: [
      'Porosity is how easily your hair absorbs and holds moisture. Low porosity hair repels water and product tends to sit on top. High porosity hair absorbs quickly but loses moisture fast.',
      'Most chemically processed or heat damaged hair is high porosity. Knowing your porosity helps you choose the right products.',
      'Low porosity: use lighter products, apply to damp warm hair, avoid heavy butters. High porosity: use heavier creams and butters on the hair shaft, layer products using the LOC or LCO method.',
    ],
    relatedIds: ['hair-breakage', 'protein-moisture', 'dry-ends'],
  },
  {
    id: 'hair-growth-rate',
    category: 'Hair health',
    title: 'How fast does hair actually grow?',
    preview: "If your hair's been the same length for years, the issue probably isn't growth",
    readTime: 2,
    content: [
      'On average, hair grows about half an inch (1.25 cm) per month, or about 6 inches per year. This is roughly the same across all hair types.',
      'But here\'s the thing: growth rate and length retention are different. Your hair might be growing at a normal rate but breaking at the same speed, so it seems like it\'s not growing.',
      'If your hair has been the same length for years, the issue is almost certainly breakage, not growth. Focus on retaining the length you grow by reducing mechanical damage, keeping hair moisturised, and protecting the ends.',
    ],
    relatedIds: ['hair-breakage', 'dry-ends', 'natural-hair-myth'],
  },
  {
    id: 'shedding-vs-breakage',
    category: 'Hair health',
    title: 'Shedding vs breakage: how to tell the difference',
    preview: 'One has a white bulb at the end. The other doesn\'t. It matters.',
    readTime: 2,
    content: [
      'Shedding is a full strand of hair falling out from the root. You\'ll see a small white bulb at one end. This is normal — you lose 50 to 100 hairs a day.',
      'Breakage is a piece of hair snapping off along the shaft. No white bulb. The broken pieces are shorter.',
      'Excessive shedding can indicate hormonal changes, stress, nutritional deficiency, or a scalp condition. Excessive breakage indicates a hair care or styling problem. The fix for each is completely different, which is why knowing which one you\'re seeing matters.',
    ],
    relatedIds: ['hair-breakage', 'telogen-effluvium', 'protein-moisture'],
  },
  {
    id: 'protein-moisture',
    category: 'Hair health',
    title: 'Protein-moisture balance explained simply',
    preview: 'Too much of either one is a problem — here\'s how to tell',
    readTime: 2,
    content: [
      'Your hair needs both protein (for strength and structure) and moisture (for flexibility and softness). Too much protein and your hair feels hard, brittle, and stiff. Too much moisture and it feels limp, mushy, and stretchy.',
      'The goal is a balance where your hair feels strong but flexible. If your hair snaps when you stretch it: you need moisture. If it stretches and stretches without bouncing back: you need protein.',
      'Most people with textured hair lean toward needing more moisture, but after chemical processing or colour treatment, protein is often what\'s missing.',
    ],
    relatedIds: ['hair-breakage', 'porosity', 'rice-water'],
  },
  {
    id: 'dry-ends',
    category: 'Hair health',
    title: 'Why your ends are always dry',
    preview: 'A strand at shoulder length might be 2 to 3 years old',
    readTime: 1,
    content: [
      'The ends of your hair are the oldest part. A strand at shoulder length might be 2 to 3 years old. It\'s been through thousands of washes, styling sessions, environmental exposure, and manipulation. Of course it\'s drier and more fragile than the hair near your root.',
      'This is why protective styling works: it reduces daily manipulation on those fragile ends. Keeping your ends moisturised, tucking them away, and trimming when they start to split are the best things you can do.',
    ],
    relatedIds: ['hair-breakage', 'hair-growth-rate', 'protective-styling-truth'],
  },

  // ── NUTRITION ──
  {
    id: 'eat-for-hair',
    category: 'Nutrition',
    title: 'What to eat for healthier hair',
    preview: 'Your body prioritises vital organs over hair growth — feed it right',
    readTime: 3,
    content: [
      'Your hair is built from protein (keratin) and fuelled by nutrients carried in your blood supply to the follicle. If your diet is lacking, your hair is one of the first places to show it, because your body prioritises vital organs over hair growth.',
      'Iron carries oxygen to hair follicles. Low iron is one of the most common causes of hair shedding in women. Found in red meat, spinach, lentils, fortified cereals. Pair with vitamin C for better absorption.',
      'Vitamin D: low levels are linked to hair loss and alopecia. Found in sunlight, oily fish, fortified milk, egg yolks. Supplementation is often needed, especially in the UK or for people with darker skin who synthesise less vitamin D from sunlight.',
      'Zinc supports hair tissue growth and repair. Found in oysters, beef, pumpkin seeds, chickpeas. Deficiency causes shedding.',
      'B12 is essential for red blood cell production which feeds hair follicles. Found in meat, fish, dairy, eggs. Vegans and vegetarians are at higher risk of deficiency.',
      'Biotin (B7) is the famous "hair vitamin." Found in eggs, nuts, seeds, sweet potatoes. Actual biotin deficiency is rare — most supplements are unnecessary if your diet is varied.',
      'Omega-3 fatty acids support scalp health and reduce inflammation. Found in oily fish, flaxseeds, walnuts, chia seeds.',
      'Protein: your hair is literally made of it. If you\'re not eating enough, your body won\'t prioritise hair growth. Aim for a palm-sized serving at every meal.',
    ],
    relatedIds: ['supplements', 'crash-diets', 'hydration'],
  },
  {
    id: 'hydration',
    category: 'Nutrition',
    title: 'Water and hair: does hydration actually matter?',
    preview: 'Yes — but not as dramatically as social media suggests',
    readTime: 1,
    content: [
      'Yes, but not as dramatically as social media suggests. Dehydration can make your hair drier and more brittle, and your scalp less healthy.',
      'But drinking 4 litres a day won\'t transform your hair if your diet is otherwise poor or you have a nutritional deficiency. Aim for about 2 litres a day as a baseline and focus on the nutrients that actually matter for real results.',
    ],
    relatedIds: ['eat-for-hair', 'supplements', 'dry-ends'],
  },
  {
    id: 'supplements',
    category: 'Nutrition',
    title: "Supplements: what works and what's marketing",
    preview: 'Get a blood test before spending money on pills',
    readTime: 2,
    content: [
      'The supplement industry loves selling hair growth pills. Here\'s what the evidence actually says.',
      'Worth taking if you\'re deficient (get a blood test first): Iron, Vitamin D, B12, Zinc. These have real evidence behind them for hair loss when levels are low.',
      'Possibly helpful: Omega-3 supplements if you don\'t eat fish. Vitamin C if your iron absorption is poor.',
      'Probably unnecessary: Biotin (unless you\'re actually deficient, which is rare). Collagen supplements (the evidence for hair specifically is weak). "Hair, skin, and nails" multivitamins (usually just expensive biotin and zinc you could get from food).',
      'The bottom line: supplements fix deficiencies. They don\'t override genetics, hormonal changes, or mechanical damage. Get a blood test before spending money on pills.',
    ],
    relatedIds: ['eat-for-hair', 'crash-diets', 'hydration'],
  },
  {
    id: 'crash-diets',
    category: 'Nutrition',
    title: 'Crash diets and hair loss: the connection',
    preview: 'Rapid weight loss can trigger shedding 2 to 4 months later',
    readTime: 1,
    content: [
      'Rapid weight loss or extreme caloric restriction can trigger telogen effluvium — a form of temporary hair shedding that happens 2 to 4 months after the stressor. Your body redirects resources away from hair growth to keep vital organs running.',
      'If you\'ve recently lost a lot of weight quickly and you\'re noticing shedding, that\'s likely the cause. It usually resolves on its own within 6 to 12 months as your body adjusts, but only if you\'re now eating adequately. If the restrictive eating continues, so will the shedding.',
    ],
    relatedIds: ['telogen-effluvium', 'eat-for-hair', 'shedding-vs-breakage'],
  },

  // ── CONDITIONS ──
  {
    id: 'traction-alopecia',
    category: 'Conditions',
    title: 'Traction alopecia: the basics',
    preview: 'Reversible if caught early — permanent if you wait too long',
    readTime: 3,
    content: [
      'Traction alopecia is hair loss caused by repeated pulling or tension on the hair follicle. It\'s most common around the hairline, temples, and nape, where styles tend to be installed tightest.',
      'Who it affects: anyone who wears tight hairstyles repeatedly. This includes braids, cornrows, tight ponytails, locs that are retwisted too tightly, weave or sew-in installations, and even headbands or durags worn very tightly over time.',
      'The critical thing to know: traction alopecia is reversible if caught early. In the early stages, the follicle is inflamed but still alive. Remove the tension, give it time, and the hair can grow back. But if the tension continues for too long, the follicle scars over permanently and that hair is gone.',
      'Signs to watch for: soreness or bumps around the hairline after installation, gradual thinning of edges over months or years, baby hairs that used to be there and aren\'t anymore.',
      'What to do: if you notice early signs, reduce tension immediately. Ask your stylist for a looser installation. Alternate between tight and loose styles. Give your hair breaks between protective styles. And if thinning has already started, see a trichologist or dermatologist sooner rather than later.',
    ],
    relatedIds: ['edges-grow-back', 'how-tight', 'ccca'],
  },
  {
    id: 'ccca',
    category: 'Conditions',
    title: 'CCCA: what every woman with textured hair should know',
    preview: 'A scarring hair loss condition that starts at the crown and spreads outward',
    readTime: 2,
    content: [
      'Central centrifugal cicatricial alopecia is a form of scarring hair loss that starts at the crown and spreads outward. It primarily affects women of African descent. The exact cause isn\'t fully understood, but it\'s linked to genetics, styling practices, and possibly certain hair products.',
      'Unlike traction alopecia, CCCA starts at the top of the head, not the edges. Early symptoms include tenderness or a tingling sensation at the crown, gradual thinning that starts centrally, and sometimes small bumps.',
      'Early detection matters because CCCA causes permanent scarring of the hair follicle. Treatment can slow or stop progression but can\'t reverse scarring that\'s already happened. If you notice unexplained thinning at your crown, see a dermatologist. This is one of the reasons FolliSense tracks the crown area specifically.',
    ],
    relatedIds: ['traction-alopecia', 'androgenetic', 'alopecia-areata'],
  },
  {
    id: 'telogen-effluvium',
    category: 'Conditions',
    title: 'Telogen effluvium: when stress makes your hair fall out',
    preview: 'It shows up 2–4 months after the trigger — and it\'s almost always temporary',
    readTime: 2,
    content: [
      'Telogen effluvium is a temporary form of diffuse hair shedding triggered by a shock to the body. Common triggers: childbirth, major surgery, severe illness, extreme stress, rapid weight loss, starting or stopping hormonal contraception, thyroid dysfunction.',
      'It typically shows up 2 to 4 months after the trigger, which is why people often don\'t connect the cause. You might suddenly notice more hair in the shower, on your pillow, or in your brush.',
      'The reassuring news: it\'s almost always temporary. Once the trigger resolves, normal growth resumes within 6 to 12 months. The shedding can be alarming, but you will not go bald from TE.',
      'When to seek help: if the shedding continues beyond 6 months, if you can\'t identify a trigger, or if you\'re seeing patterned thinning rather than diffuse shedding. A blood test checking iron, vitamin D, thyroid function, and B12 can help identify underlying causes.',
    ],
    relatedIds: ['crash-diets', 'shedding-vs-breakage', 'eat-for-hair'],
  },
  {
    id: 'seb-derm',
    category: 'Conditions',
    title: 'Seborrheic dermatitis: the itchy, flaky scalp condition',
    preview: "It's not caused by poor hygiene — and it tends to flare under protective styles",
    readTime: 2,
    content: [
      'Seborrheic dermatitis is a chronic inflammatory skin condition that causes red, itchy, flaky patches on the scalp. It\'s caused by an overgrowth of Malassezia yeast combined with your body\'s inflammatory response. It\'s not caused by poor hygiene.',
      'It tends to flare in cold weather, during stress, or when the scalp is left unwashed for long periods — which is why it can be particularly problematic under protective styles.',
      'Treatment: medicated shampoos containing ketoconazole, zinc pyrithione, or selenium sulfide. For mild cases, alternating a medicated shampoo with your regular routine once or twice a week is usually enough. For persistent cases, a dermatologist may prescribe a topical steroid or antifungal.',
    ],
    relatedIds: ['dandruff-vs-dry', 'scalp-microbiome', 'scalp-ph'],
  },
  {
    id: 'alopecia-areata',
    category: 'Conditions',
    title: 'Alopecia areata: the autoimmune kind',
    preview: 'Smooth, round patches of hair loss that appear suddenly',
    readTime: 2,
    content: [
      'Alopecia areata is an autoimmune condition where your immune system attacks hair follicles, causing round, smooth patches of hair loss. It can happen anywhere on the body but is most noticeable on the scalp.',
      'It\'s different from traction alopecia (caused by tension) and CCCA (caused by scarring). Alopecia areata patches are typically smooth and round, with no scarring or broken hairs at the edges.',
      'It can resolve on its own, or it can be treated with corticosteroid injections, topical immunotherapy, or newer JAK inhibitor medications. If you notice smooth, coin-sized bald patches appearing suddenly, see a dermatologist.',
    ],
    relatedIds: ['traction-alopecia', 'androgenetic', 'telogen-effluvium'],
  },
  {
    id: 'androgenetic',
    category: 'Conditions',
    title: 'Androgenetic alopecia: what you need to know',
    preview: 'The most common form of hair loss in both men and women',
    readTime: 2,
    content: [
      'Androgenetic alopecia, also called pattern hair loss, is the most common form of hair loss in both men and women. In men, it typically starts with a receding hairline and thinning at the crown. In women, it usually presents as diffuse thinning along the part line.',
      'It\'s driven by genetics and hormones (specifically DHT, a derivative of testosterone). It\'s progressive, meaning it gets worse over time without treatment.',
      'Treatment options: Minoxidil (topical, available over the counter) can slow progression and sometimes regrow hair. Finasteride (oral, prescription only, primarily for men) blocks DHT. Low-level laser therapy has some evidence. Hair transplantation is an option for advanced cases.',
      'Early treatment gives better results. If you\'re noticing a gradually widening part or a slowly receding hairline, it\'s worth getting assessed sooner rather than later.',
    ],
    relatedIds: ['traction-alopecia', 'male-pattern-vs-traction', 'edges-grow-back'],
  },

  // ── STYLING AND PROTECTION ──
  {
    id: 'how-tight',
    category: 'Styling and protection',
    title: 'How tight is too tight?',
    preview: 'If it hurts, it\'s too tight. That\'s the simplest rule.',
    readTime: 1,
    content: [
      'If it hurts, it\'s too tight. That\'s the simplest rule. Pain or soreness after installation means the follicles are under excessive tension.',
      'Pimple-like bumps around the hairline are a sign of follicular inflammation from traction. If you consistently feel relief when you take a style down, your installations are probably too tight.',
      'Talk to your stylist. A good stylist can install neatly without excessive tension. If they can\'t, find a different stylist. Your hairline is not worth sacrificing for a "snatched" look.',
    ],
    relatedIds: ['traction-alopecia', 'between-styles', 'edge-control'],
  },
  {
    id: 'between-styles',
    category: 'Styling and protection',
    title: 'Giving your hair a break between styles',
    preview: 'Your follicles need recovery time — here\'s a good rule of thumb',
    readTime: 1,
    content: [
      'Your follicles need recovery time between protective styles, especially tight ones. A good rule of thumb: take at least 1 to 2 weeks between installations.',
      'During the break, keep your hair in a low-manipulation style (loose twists, bun, or just out). Deep condition. Assess your edges and hairline.',
      'If you notice thinning, extend the break or switch to a looser style for the next installation.',
    ],
    relatedIds: ['how-tight', 'traction-alopecia', 'protective-styling-truth'],
  },
  {
    id: 'silk-press',
    category: 'Styling and protection',
    title: "Silk press and heat damage: where's the line?",
    preview: 'Occasional heat is fine — but frequency and temperature are everything',
    readTime: 2,
    content: [
      'A silk press uses heat to temporarily straighten textured hair. Done occasionally with proper heat protection and temperature control, it\'s generally fine.',
      'The damage comes from frequency and temperature. Using flat irons above 190°C (375°F) repeatedly can permanently alter your curl pattern.',
      'If your curls aren\'t bouncing back after washing out a silk press, that\'s heat damage — and it\'s not reversible. Limit silk presses to once every few months, always use a heat protectant, and ask your stylist what temperature they\'re using.',
    ],
    relatedIds: ['hair-breakage', 'how-tight', 'protective-styling-truth'],
  },
  {
    id: 'edge-control',
    category: 'Styling and protection',
    title: 'The truth about edge control',
    preview: "It's not the product — it's the daily brushing and pulling",
    readTime: 1,
    content: [
      'Edge control products themselves aren\'t inherently damaging. The damage comes from how edges are styled: repeated brushing, pulling, slicking, and tension on the finest, most fragile hairs on your head.',
      'If you\'re applying edge control and brushing your edges flat daily, that\'s daily mechanical stress on hairs that are already vulnerable.',
      'Try reducing how often you manipulate your edges, and when you do style them, be gentle. If your edges are already thinning, stop using edge control on them entirely until they recover.',
    ],
    relatedIds: ['traction-alopecia', 'how-tight', 'edges-grow-back'],
  },
  {
    id: 'protective-styling-truth',
    category: 'Styling and protection',
    title: "Protective styling: what it protects and what it doesn't",
    preview: 'A style can protect your ends while damaging your hairline at the same time',
    readTime: 2,
    content: [
      'Protective styles protect your ends from daily manipulation, friction, and environmental damage. That\'s their purpose: length retention.',
      'What they don\'t protect: your scalp, your hairline, or your edges. In fact, many protective styles actively stress these areas through tension at the point of installation.',
      'The name is slightly misleading. A style can protect your ends while damaging your hairline at the same time. Good protective styling means: not too tight at the root, reasonable duration, scalp care during the style, and breaks between installations.',
    ],
    relatedIds: ['how-tight', 'between-styles', 'under-protective-style'],
  },

  // ── MEN'S HAIR ──
  {
    id: 'traction-men',
    category: "Men's hair",
    title: "Traction alopecia isn't just a women's issue",
    preview: 'Braids, locs, and durags can affect your hairline too',
    readTime: 2,
    content: [
      'Men who wear cornrows, braids, locs, or tight durags for waves can experience traction alopecia just like women. The hairline and temples are the most vulnerable areas.',
      'If you\'re noticing your hairline creeping back and you wear tight styles regularly, traction is a likely cause.',
      'The fix is the same: reduce tension, vary your styles, and see a specialist if thinning has already started. Catching it early makes the difference between reversible and permanent.',
    ],
    relatedIds: ['traction-alopecia', 'waves-durags', 'male-pattern-vs-traction'],
  },
  {
    id: 'waves-durags',
    category: "Men's hair",
    title: 'Waves and durags: caring for your scalp underneath',
    preview: "Your waves won't disappear from one day off — but your hairline might not come back",
    readTime: 2,
    content: [
      'Wave culture involves consistent brushing and compression with a durag or wave cap. The brushing stimulates the curl pattern, and the compression trains it.',
      'But daily brushing is mechanical stress, and a tight durag applies constant pressure to your hairline.',
      'If you\'re noticing your temples thinning or your hairline looking different, ease up on the durag tension and reduce brushing frequency. Your waves won\'t disappear from one day off, but your hairline might not come back if you push it too far.',
    ],
    relatedIds: ['traction-men', 'barber-visits', 'male-pattern-vs-traction'],
  },
  {
    id: 'barber-visits',
    category: "Men's hair",
    title: 'Barber visits and scalp health',
    preview: "Your barber sees your scalp more regularly than anyone else",
    readTime: 1,
    content: [
      'Your barber sees your scalp more regularly than anyone else. A good barber will notice thinning, inflammation, or unusual patches before you do.',
      'Don\'t be afraid to ask them: "Does my hairline look different?" or "Have you noticed any changes?" They\'re a frontline observer for your scalp health.',
      'If they flag something, take it seriously and follow up with a specialist.',
    ],
    relatedIds: ['traction-men', 'loc-maintenance', 'male-pattern-vs-traction'],
  },
  {
    id: 'loc-maintenance',
    category: "Men's hair",
    title: 'Loc maintenance and scalp care',
    preview: "Retwists should never be painful — if they are, your loctician is going too tight",
    readTime: 2,
    content: [
      'Locs are a long-term commitment that requires ongoing scalp attention. Common issues: too-tight retwists causing traction along the hairline and part lines, product buildup at the root, and reduced scalp cleansing frequency because of concerns about disturbing the locs.',
      'Retwists should never be painful. If they are, your loctician is going too tight. You can and should wash your scalp with locs.',
      'Diluted shampoo, scalp-specific cleansers, or even just water rinsing between full washes helps prevent buildup and inflammation. Focus on the scalp, not the locs themselves, when cleansing.',
    ],
    relatedIds: ['traction-men', 'how-tight', 'between-styles'],
  },
  {
    id: 'male-pattern-vs-traction',
    category: "Men's hair",
    title: 'Male pattern hair loss vs traction: how to tell the difference',
    preview: 'Both cause hairline recession — but they behave differently',
    readTime: 2,
    content: [
      'Both cause hairline recession, but they behave differently.',
      'Male pattern hair loss (androgenetic alopecia) is genetic and hormonal. It typically thins gradually at the temples and crown in a predictable pattern. It happens whether or not you wear tight styles.',
      'Traction alopecia is caused by styling tension. It\'s concentrated where styles pull hardest — which can be the temples, but also the nape, part lines, or wherever your installations grip.',
      'If you wear your hair short with no tension and your hairline is still receding, that\'s likely androgenetic. If you wear braids or locs and the thinning matches where they\'re installed tightest, that\'s likely traction.',
      'You can have both at the same time. A specialist can help sort it out.',
    ],
    relatedIds: ['androgenetic', 'traction-men', 'traction-alopecia'],
  },

  // ── MYTH BUSTING ──
  {
    id: 'shaving-myth',
    category: 'Myth busting',
    title: 'Does shaving your head make hair grow back thicker?',
    preview: "No. Here's why it feels that way though.",
    readTime: 1,
    content: [
      'No. This is one of the most persistent hair myths. When hair grows back after shaving, the blunt cut end feels coarser than a naturally tapered tip, which creates the illusion of thickness.',
      'But the follicle itself hasn\'t changed. The hair isn\'t thicker, darker, or growing faster. If you want to shave your head for a fresh start, go for it — but do it because you want to, not because you think it\'ll change your hair.',
    ],
    relatedIds: ['natural-hair-myth', 'rice-water', 'scalp-massage'],
  },
  {
    id: 'edges-grow-back',
    category: 'Myth busting',
    title: 'Can you grow your edges back?',
    preview: 'It depends on whether the follicle is still alive',
    readTime: 2,
    content: [
      'It depends on whether the follicle is still alive. In early-stage traction alopecia, the follicle is inflamed and weakened but not destroyed. Remove the tension, treat gently, possibly use minoxidil (consult a doctor), and yes, edges can recover. It takes time — often 6 to 12 months to see real regrowth.',
      'But if traction has been happening for years and the area is smooth and shiny with no fine hairs visible at all, the follicle may be permanently scarred. At that point, the hair won\'t come back on its own, and options are limited to things like hair transplantation.',
      'This is why early detection matters so much.',
    ],
    relatedIds: ['traction-alopecia', 'edge-control', 'how-tight'],
  },
  {
    id: 'rice-water',
    category: 'Myth busting',
    title: 'Does rice water actually work?',
    preview: "It's a mild protein treatment at best — not a miracle cure",
    readTime: 1,
    content: [
      'Rice water contains inositol, a carbohydrate that can temporarily strengthen hair and reduce surface friction. Some studies support this. It can make hair feel stronger and smoother after use.',
      'But it\'s not a miracle cure for hair loss, growth, or damage. It\'s a mild protein treatment at best. If your hair responds well to protein, rice water rinses can be a nice addition to your routine. If your hair is already protein-overloaded, it\'ll make things worse.',
      'It won\'t regrow your hairline or reverse traction alopecia. Manage your expectations.',
    ],
    relatedIds: ['protein-moisture', 'shaving-myth', 'supplements'],
  },
  {
    id: 'scalp-massage',
    category: 'Myth busting',
    title: 'Do scalp massages grow hair?',
    preview: 'The evidence is limited — but it probably helps a little',
    readTime: 1,
    content: [
      'There\'s limited evidence that regular scalp massage increases blood flow to follicles and may slightly improve hair thickness over time. One small study showed modest improvement after 24 weeks of daily 4-minute scalp massages.',
      'It\'s not going to transform your hair, but it probably helps a little, it feels good, and it costs nothing. Think of it as one small piece of a larger picture, not a standalone solution.',
    ],
    relatedIds: ['shaving-myth', 'rice-water', 'natural-hair-myth'],
  },
  {
    id: 'natural-hair-myth',
    category: 'Myth busting',
    title: "Natural hair doesn't grow long",
    preview: 'False. The issue is almost always breakage, not growth rate.',
    readTime: 1,
    content: [
      'This is false. Textured hair grows at the same rate as all other hair types — roughly half an inch per month.',
      'The difference is shrinkage and breakage. 4c hair can shrink up to 75% of its actual length, making it look much shorter than it is. And because textured hair is more fragile at the bends of each curl, it\'s more prone to breakage, which limits length retention.',
      'Your hair is growing. The goal is to keep what grows by minimising breakage. That\'s what protective styling, moisturising, and gentle handling are all about.',
    ],
    relatedIds: ['hair-growth-rate', 'hair-breakage', 'shaving-myth'],
  },
];

export const getArticleById = (id: string): Article | undefined =>
  articles.find(a => a.id === id);

export const getRelatedArticles = (article: Article): Article[] =>
  article.relatedIds.map(id => articles.find(a => a.id === id)).filter(Boolean) as Article[];
