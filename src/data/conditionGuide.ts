export interface SelfCheckQuestion {
  question: string;
}

export interface PhotoPlaceholder {
  label: string;
  description: string;
}

export interface ConsumerCondition {
  id: string;
  name: string;
  summary: string;
  whatIsIt: string;
  selfCheck: SelfCheckQuestion[];
  photoGallery: PhotoPlaceholder[];
  actionSteps: string[];
  dontDo: string[];
  whenToSee: string;
  relatedArticleId?: string;
  dermnetUrl: string;
  externalLinkLabel: string;
  externalLinkUrl: string;
  chatPrompts: string[];
}

export const consumerConditions: ConsumerCondition[] = [
  {
    id: 'traction-alopecia',
    name: 'Traction alopecia',
    summary: 'Hair loss from tight or repeated pulling on the hair follicle. Reversible if caught early.',
    whatIsIt: "Traction alopecia is hair loss caused by repeated tension on the hair follicle — from tight braids, cornrows, ponytails, weaves, or even headbands. It usually shows up around the hairline, temples, and nape where styles pull hardest. The good news: it's reversible if caught early.",
    selfCheck: [
      { question: 'Is the thinning concentrated around your hairline, temples, or where your style grips?' },
      { question: 'Do you regularly wear tight braids, cornrows, weaves, or ponytails?' },
      { question: 'Have you noticed it getting gradually worse over months?' },
      { question: 'Is the affected area sore or tender after a new installation?' },
    ],
    photoGallery: [
      { label: 'Early stage — hairline', description: 'Early stage traction alopecia showing thinning at the hairline and temples' },
      { label: 'Moderate — temple recession', description: 'Moderate traction alopecia with visible recession at the temples from tight braids' },
      { label: 'Advanced — follicle scarring', description: 'Advanced traction alopecia with smooth, shiny skin and no visible follicles at hairline' },
    ],
    actionSteps: [
      'Reduce tension immediately — ask your stylist for a looser installation',
      'Give your hair breaks between protective styles (at least 1–2 weeks)',
      'Alternate between tight and loose styles',
    ],
    dontDo: [
      "Don't reinstall a tight style over thinning areas",
      "Don't ignore soreness after installation — pain is a warning sign",
    ],
    whenToSee: "If you've noticed visible thinning or bare patches, see a trichologist or dermatologist. Early intervention can mean the difference between regrowth and permanent loss.",
    relatedArticleId: 'traction-alopecia',
    dermnetUrl: 'https://dermnetnz.org/topics/traction-alopecia',
    externalLinkLabel: 'British Association of Dermatologists',
    externalLinkUrl: 'https://www.bad.org.uk',
    chatPrompts: ['Could I have traction alopecia?', "What's the difference between traction alopecia and normal shedding?", 'What should I tell my doctor about this?'],
  },
  {
    id: 'seborrheic-dermatitis',
    name: 'Seborrheic dermatitis',
    summary: 'Chronic flaking and irritation caused by yeast overgrowth. Manageable with the right products.',
    whatIsIt: "Seborrheic dermatitis causes oily, yellowish flakes and itchy, irritated patches on the scalp. It's caused by an overgrowth of a yeast called Malassezia — not poor hygiene. It tends to flare under protective styles and during cold weather or stress.",
    selfCheck: [
      { question: 'Are the flakes yellowish or oily rather than dry and white?' },
      { question: 'Is it worse behind your ears or along your hairline?' },
      { question: 'Does it come and go but never fully clear up?' },
      { question: 'Is it itchy?' },
    ],
    photoGallery: [
      { label: 'Mild — oily flaking', description: 'Mild seborrheic dermatitis with yellowish, oily flakes along the part line' },
      { label: 'Moderate — with irritation', description: 'Moderate seborrheic dermatitis with flaking and visible irritation on darker skin' },
      { label: 'Behind the ears', description: 'Seborrheic dermatitis presenting behind the ear on textured hair' },
    ],
    actionSteps: [
      'Try a medicated shampoo with ketoconazole or zinc pyrithione',
      'Cleanse your scalp regularly, even under protective styles',
      "Avoid heavy oils and butters on the scalp — they can feed the yeast",
    ],
    dontDo: [
      "Don't apply heavy oils to an inflamed or flaking scalp",
      "Don't confuse it with dry scalp — the treatments are completely different",
    ],
    whenToSee: "If over-the-counter medicated shampoos aren't helping after 2–3 weeks, see a dermatologist for a prescription-strength treatment.",
    relatedArticleId: 'seb-derm',
    dermnetUrl: 'https://dermnetnz.org/topics/seborrhoeic-dermatitis',
    externalLinkLabel: 'DermNet NZ — Seborrheic dermatitis',
    externalLinkUrl: 'https://dermnetnz.org',
    chatPrompts: ['Could I have seborrheic dermatitis?', "What's the difference between dandruff and seb derm?", 'What should I tell my doctor about this?'],
  },
  {
    id: 'alopecia-areata',
    name: 'Alopecia areata',
    summary: 'Smooth, round patches of sudden hair loss from an autoimmune response.',
    whatIsIt: "Alopecia areata is an autoimmune condition where your immune system attacks hair follicles, causing smooth, round patches of complete hair loss. It's not caused by anything you did. It can resolve on its own or be treated with medication.",
    selfCheck: [
      { question: 'Is the bald patch completely smooth with no broken hairs?' },
      { question: 'Is it round or oval shaped?' },
      { question: 'Did it appear suddenly?' },
      { question: 'Is the rest of your hair unaffected?' },
    ],
    photoGallery: [
      { label: 'Single smooth patch', description: 'Alopecia areata presenting as a single smooth, round bald patch on the scalp' },
      { label: 'Multiple patches', description: 'Multiple patches of alopecia areata on darker skin' },
      { label: 'Exclamation point hairs', description: 'Close-up showing exclamation point hairs at the edge of an alopecia areata patch' },
    ],
    actionSteps: [
      'See a dermatologist for confirmation and treatment options',
      "Don't panic — many cases resolve on their own",
      'Document the size and location to track changes',
    ],
    dontDo: [
      "Don't try to cover it with a tight style — that adds tension to already stressed follicles",
      "Don't pick at or irritate the area",
    ],
    whenToSee: 'See a dermatologist if you notice smooth, round bald patches appearing. Treatment is most effective when started early.',
    relatedArticleId: 'alopecia-areata',
    dermnetUrl: 'https://dermnetnz.org/topics/alopecia-areata',
    externalLinkLabel: 'DermNet NZ — Alopecia areata',
    externalLinkUrl: 'https://dermnetnz.org',
    chatPrompts: ['Could I have alopecia areata?', "What's the difference between alopecia areata and traction alopecia?", 'What should I tell my doctor about this?'],
  },
  {
    id: 'ccca',
    name: 'CCCA',
    summary: 'A scarring hair loss condition that starts at the crown and spreads outward.',
    whatIsIt: "Central centrifugal cicatricial alopecia (CCCA) is a form of scarring hair loss that starts at the crown and spreads outward. It primarily affects women of African descent. Early detection matters because CCCA causes permanent scarring — treatment can slow progression but can't reverse existing damage.",
    selfCheck: [
      { question: 'Is the thinning at the very top or crown of your head?' },
      { question: 'Does the affected area feel tender or tingly?' },
      { question: 'Has it been spreading outward over time?' },
    ],
    photoGallery: [
      { label: 'Early — crown thinning', description: 'Early CCCA showing subtle thinning at the crown on textured hair' },
      { label: 'Moderate — spreading', description: 'Moderate CCCA with visible spreading from the centre of the crown' },
      { label: 'Advanced — scarring', description: 'Advanced CCCA with smooth scarred scalp at the vertex' },
    ],
    actionSteps: [
      'See a dermatologist as soon as possible — early treatment is critical',
      'Avoid tension and heat at the crown area',
      'Track changes with photos to share with your doctor',
    ],
    dontDo: [
      "Don't ignore crown thinning — it won't resolve on its own",
      "Don't apply heavy products or tight styles to the affected area",
    ],
    whenToSee: 'Any unexplained thinning at the crown should be assessed by a dermatologist. CCCA requires medical treatment.',
    relatedArticleId: 'ccca',
    dermnetUrl: 'https://dermnetnz.org/topics/central-centrifugal-cicatricial-alopecia',
    externalLinkLabel: 'American Academy of Dermatology',
    externalLinkUrl: 'https://www.aad.org',
    chatPrompts: ['Could I have CCCA?', "What's the difference between CCCA and normal thinning?", 'What should I tell my doctor about this?'],
  },
  {
    id: 'scalp-psoriasis',
    name: 'Scalp psoriasis',
    summary: 'Thick, raised patches with silvery scales and defined borders.',
    whatIsIt: "Scalp psoriasis causes raised, red patches covered with thick silvery-white scales. It has clearly defined borders and can extend beyond the hairline. It's a chronic condition but very manageable with the right treatment.",
    selfCheck: [
      { question: 'Are the patches raised with thick silvery or white scales?' },
      { question: 'Do the patches have a clear defined border?' },
      { question: 'Do you have psoriasis anywhere else on your body?' },
    ],
    photoGallery: [
      { label: 'Mild — scalp plaque', description: 'Mild scalp psoriasis showing a defined silvery plaque near the hairline' },
      { label: 'Moderate — multiple plaques', description: 'Moderate scalp psoriasis with multiple raised plaques on darker skin' },
      { label: 'Extending beyond hairline', description: 'Scalp psoriasis extending beyond the hairline onto the forehead' },
    ],
    actionSteps: [
      'See a dermatologist for proper diagnosis and treatment',
      'Use gentle, fragrance-free products on the scalp',
      "Don't pick at or scrape the scales",
    ],
    dontDo: [
      "Don't pick at or scrape the scales — it can worsen inflammation",
      "Don't use harsh products on the affected areas",
    ],
    whenToSee: 'Always see a dermatologist. Psoriasis is a chronic condition that benefits from medical management.',
    relatedArticleId: undefined,
    dermnetUrl: 'https://dermnetnz.org/topics/scalp-psoriasis',
    externalLinkLabel: 'DermNet NZ — Scalp psoriasis',
    externalLinkUrl: 'https://dermnetnz.org',
    chatPrompts: ['Could I have scalp psoriasis?', "What's the difference between psoriasis and dandruff?", 'What should I tell my doctor about this?'],
  },
  {
    id: 'folliculitis',
    name: 'Folliculitis',
    summary: 'Inflamed bumps at hair follicles, often after a new style installation.',
    whatIsIt: "Folliculitis is inflammation of the hair follicles that looks like small red bumps or pimple-like spots. It often appears after getting a new style installed, especially if the style is tight or tools weren't sanitised. Most cases clear up on their own.",
    selfCheck: [
      { question: 'Are there small bumps or pimple-like spots on your scalp?' },
      { question: 'Did they appear after getting a new style installed or a haircut?' },
      { question: 'Are they concentrated along where the style sits?' },
    ],
    photoGallery: [
      { label: 'Mild — small bumps', description: 'Mild folliculitis showing small bumps at hair follicles on the scalp' },
      { label: 'Post-installation', description: 'Folliculitis bumps along the installation line after a fresh protective style' },
      { label: 'Moderate — at nape', description: 'Moderate folliculitis at the nape of the neck after a lineup on darker skin' },
    ],
    actionSteps: [
      'Keep the area clean and avoid touching it',
      'Loosen or remove the style if it\'s causing irritation',
      'A warm compress can help with inflammation',
    ],
    dontDo: [
      "Don't squeeze or pop the bumps",
      "Don't reinstall a tight style over the affected area",
    ],
    whenToSee: "If the bumps are spreading, painful, pus-filled, or don't clear up within 1–2 weeks, see a doctor.",
    relatedArticleId: undefined,
    dermnetUrl: 'https://dermnetnz.org/topics/folliculitis',
    externalLinkLabel: 'DermNet NZ — Folliculitis',
    externalLinkUrl: 'https://dermnetnz.org',
    chatPrompts: ['Could I have folliculitis?', 'Is folliculitis contagious?', 'What should I tell my doctor about this?'],
  },
  {
    id: 'tinea-capitis',
    name: 'Fungal infection (tinea capitis)',
    summary: 'Ringworm of the scalp causing patchy hair loss with black dots.',
    whatIsIt: "Tinea capitis is a fungal infection of the scalp that causes patchy hair loss with tiny black dots where hairs have broken off. It can be itchy and scaly. It's contagious and requires oral medication to clear — topical treatments alone won't work.",
    selfCheck: [
      { question: 'Can you see tiny black dots where hair has broken off at the scalp?' },
      { question: 'Is the area scaly or flaky?' },
      { question: 'Is it itchy?' },
      { question: 'Has anyone in your household had a similar patch?' },
    ],
    photoGallery: [
      { label: 'Black dot pattern', description: 'Tinea capitis showing characteristic black dot pattern where hairs have broken at the scalp' },
      { label: 'Scaling with hair loss', description: 'Tinea capitis with scaling and patchy hair loss on darker skin' },
      { label: 'Ring-shaped border', description: 'Tinea capitis showing a raised ring-shaped border on the scalp' },
    ],
    actionSteps: [
      'See a doctor as soon as possible — this requires prescription medication',
      'Avoid sharing combs, brushes, pillowcases, or hats',
      'Wash towels and pillowcases frequently',
    ],
    dontDo: [
      "Don't try to treat it with topical products alone — oral medication is required",
      "Don't share hair tools or accessories until it's cleared",
    ],
    whenToSee: 'See a doctor promptly. Tinea capitis is contagious and requires oral antifungal treatment.',
    relatedArticleId: undefined,
    dermnetUrl: 'https://dermnetnz.org/topics/tinea-capitis',
    externalLinkLabel: 'DermNet NZ — Tinea capitis',
    externalLinkUrl: 'https://dermnetnz.org',
    chatPrompts: ['Could I have a scalp fungal infection?', 'Is tinea capitis contagious?', 'What should I tell my doctor about this?'],
  },
  {
    id: 'chemical-damage',
    name: 'Chemical or heat damage',
    summary: 'Scalp irritation or scarring from relaxers, colour, bleach, or excessive heat.',
    whatIsIt: "Chemical and heat damage to the scalp can range from temporary irritation to permanent scarring. It happens when relaxers, bleach, or heat tools are applied too aggressively or too frequently. Fresh burns may appear as redness, rawness, or blistering.",
    selfCheck: [
      { question: 'Did the irritation appear after a chemical treatment or heat styling?' },
      { question: 'Is the area red, raw, or sore?' },
      { question: 'Can you see a clear boundary between affected and normal scalp?' },
    ],
    photoGallery: [
      { label: 'Chemical irritation', description: 'Chemical irritation on the scalp after a relaxer treatment on darker skin' },
      { label: 'Chemical burn', description: 'Active chemical burn showing rawness and blistering at the hairline' },
      { label: 'Scarring from repeated burns', description: 'Permanent scarring and hair loss from repeated chemical burns on darker skin' },
    ],
    actionSteps: [
      'Stop all chemical and heat treatments on the affected area immediately',
      'Let it heal completely before any further processing',
      'Use gentle, soothing products — aloe vera or a fragrance-free moisturiser',
    ],
    dontDo: [
      "Don't apply any further chemicals to irritated or damaged scalp",
      "Don't install a tight style over damaged areas",
    ],
    whenToSee: "If there's blistering, open wounds, or persistent rawness, see a doctor. If you're seeing permanent bare patches from repeated damage, a dermatologist can assess.",
    relatedArticleId: undefined,
    dermnetUrl: 'https://dermnetnz.org/topics/chemical-burn',
    externalLinkLabel: 'DermNet NZ — Chemical burns',
    externalLinkUrl: 'https://dermnetnz.org',
    chatPrompts: ['Could this be chemical damage?', 'Will my hair grow back after a chemical burn?', 'What should I tell my doctor about this?'],
  },
  {
    id: 'frontal-fibrosing-alopecia',
    name: 'Frontal fibrosing alopecia (FFA)',
    summary: 'A scarring hair loss condition causing the hairline to gradually recede.',
    whatIsIt: "Frontal fibrosing alopecia (FFA) is a form of scarring hair loss where the hairline slowly recedes backward. It can also affect the eyebrows and body hair. It primarily affects post-menopausal women but can occur earlier. Unlike traction alopecia, there's often no history of tight styling — it's thought to be autoimmune. Early treatment can slow progression but can't reverse existing loss.",
    selfCheck: [
      { question: 'Has your hairline been gradually moving backward over months or years?' },
      { question: 'Is the skin along your hairline smooth and pale or shiny?' },
      { question: 'Have you noticed thinning or loss of your eyebrows as well?' },
      { question: 'Is the recession happening evenly across the front, not just at the temples?' },
    ],
    photoGallery: [
      { label: 'Early — hairline recession', description: 'Early FFA showing subtle, even recession of the frontal hairline' },
      { label: 'Moderate — band-like loss', description: 'Moderate FFA with a visible band of smooth, scarred skin at the hairline' },
      { label: 'With eyebrow loss', description: 'FFA presenting with both hairline recession and partial eyebrow loss' },
    ],
    actionSteps: [
      'See a dermatologist as soon as possible — early treatment is critical',
      'Document your hairline with photos to track changes over time',
      'Avoid harsh chemicals or tight styles along the hairline',
    ],
    dontDo: [
      "Don't assume it's normal ageing — FFA is a specific, treatable condition",
      "Don't delay seeking professional advice — scarring is permanent once established",
    ],
    whenToSee: 'If your hairline is receding and you can see smooth, pale skin where hair used to be, see a dermatologist. If your eyebrows are also thinning, mention that too — it helps with diagnosis.',
    relatedArticleId: undefined,
    dermnetUrl: 'https://dermnetnz.org/topics/frontal-fibrosing-alopecia',
    externalLinkLabel: 'British Association of Dermatologists — FFA',
    externalLinkUrl: 'https://www.bad.org.uk',
    chatPrompts: ['Could I have frontal fibrosing alopecia?', "What's the difference between FFA and traction alopecia?", 'What should I tell my doctor about this?'],
  },
];

export const getConsumerConditionById = (id: string) => consumerConditions.find(c => c.id === id);
