export interface ConditionStage {
  label: string;
  annotation: string;
}

export interface StylistCondition {
  id: string;
  name: string;
  tag: 'Common' | 'Less common' | 'Urgent';
  summary: string;
  stages: ConditionStage[];
  whatItLooksLike: string;
  whereToLook: string;
  whatToTell: string;
  whatYouCanDo: string;
  severityGuide: string;
  darkerSkinNote: string;
}

export const stylistConditions: StylistCondition[] = [
  {
    id: 'traction-alopecia',
    name: 'Traction alopecia',
    tag: 'Common',
    summary: 'Hair loss from repeated tension on the follicle',
    stages: [
      { label: 'Early stage', annotation: 'Thinning at temples' },
      { label: 'Moderate stage', annotation: 'Recession progressing' },
      { label: 'Advanced stage', annotation: 'Follicle scarring, no regrowth possible' },
    ],
    whatItLooksLike: 'Thinning or recession at the hairline, temples, and nape. May see broken short hairs at the margins. In early stages, the area may look sparse but still have fine baby hairs. In late stages, the skin looks smooth and shiny with no visible follicles.',
    whereToLook: 'Hairline, temples, nape, along part lines, wherever the style grips tightest.',
    whatToTell: '"I\'ve noticed some thinning around your temples. It might be worth getting that checked by a trichologist or dermatologist, especially if it\'s been getting worse. Catching it early makes a big difference."',
    whatYouCanDo: 'Loosen the installation in affected areas. Suggest a break between styles. Don\'t reinstall tightly over an area that\'s already thinning.',
    severityGuide: 'Early (sparse but baby hairs visible) = reversible with intervention. Late (smooth, shiny, no fine hairs) = likely permanent scarring. Refer urgently.',
    darkerSkinNote: 'On darker skin: Early thinning may be harder to spot visually because the contrast between skin and hair is lower. Feel for it: run your fingertip along the hairline and temples. If the hair density is noticeably thinner or you feel smooth skin where there used to be fine hairs, that\'s your signal. Redness may present as darker patches or slight hyperpigmentation rather than pink or red.',
  },
  {
    id: 'ccca',
    name: 'Central centrifugal cicatricial alopecia (CCCA)',
    tag: 'Less common',
    summary: 'Scarring hair loss starting at the crown',
    stages: [
      { label: 'Mild thinning at crown', annotation: 'Thinning begins at crown' },
      { label: 'Moderate spread', annotation: 'Spreading from centre' },
      { label: 'Advanced', annotation: 'Scarring alopecia' },
    ],
    whatItLooksLike: 'Gradual thinning that starts at the crown and spreads outward in a circular pattern. The scalp may look shiny or feel smooth in the affected area. Client may mention tenderness, tingling, or itching at the crown.',
    whereToLook: 'Crown and vertex. Part the hair at the top of the head.',
    whatToTell: '"I\'m seeing some thinning at your crown that looks like it might need a professional opinion. A dermatologist can take a closer look. It\'s better to check early."',
    whatYouCanDo: 'Don\'t apply tension to the crown area. Avoid tight styles that pull from the centre. Note the observation in FolliSense and share with the client.',
    severityGuide: 'Any unexplained crown thinning should be referred. CCCA causes permanent scarring and early treatment is critical.',
    darkerSkinNote: 'On darker skin: The shiny, smooth appearance of scarring at the crown may be easier to spot than on lighter skin because of the contrast. But early thinning can be subtle. Part the hair at the crown and look straight down. Compare density at the centre to the sides. If the centre is noticeably sparser, flag it.',
  },
  {
    id: 'seborrheic-dermatitis',
    name: 'Seborrheic dermatitis',
    tag: 'Common',
    summary: 'Chronic flaking and irritation caused by yeast overgrowth',
    stages: [
      { label: 'Mild flaking', annotation: 'Oily, yellowish flakes' },
      { label: 'Moderate with redness', annotation: 'Flaking with irritation' },
      { label: 'Severe crusting', annotation: 'Crusting at hairline' },
    ],
    whatItLooksLike: 'Yellowish, oily, or waxy flakes. Redness or pink patches on the scalp. May see crusting along the hairline or behind the ears. Different from dry scalp: seborrheic dermatitis flakes are larger, oilier, and often yellowish.',
    whereToLook: 'Hairline, behind the ears, crown, anywhere the scalp is oilier.',
    whatToTell: '"You\'ve got some flaking and irritation that looks like it could be seborrheic dermatitis. A medicated shampoo with ketoconazole or zinc pyrithione usually helps. If it doesn\'t clear up, a doctor can prescribe something stronger."',
    whatYouCanDo: 'Recommend gentle cleansing. Don\'t cover with heavy products. Note it in FolliSense.',
    severityGuide: 'Mild (some flaking) = self-manageable with OTC products. Moderate to severe (persistent, spreading, painful) = refer.',
    darkerSkinNote: 'On darker skin: Flakes tend to be more visible against dark hair and skin. But the redness that typically accompanies it on lighter skin may appear as hyperpigmentation (darker patches) or a slight purple or ashy tone on brown and dark brown skin. Don\'t look for pink. Look for colour change from the client\'s normal skin tone.',
  },
  {
    id: 'scalp-psoriasis',
    name: 'Scalp psoriasis',
    tag: 'Less common',
    summary: 'Thick, silvery scales with defined borders',
    stages: [
      { label: 'Mild scalp psoriasis', annotation: 'Defined silvery plaque' },
      { label: 'Moderate plaques', annotation: 'Multiple plaques' },
      { label: 'Extending beyond hairline', annotation: 'Extends beyond hairline' },
    ],
    whatItLooksLike: 'Raised, red patches covered with thick silvery-white scales. Often has clearly defined borders unlike seborrheic dermatitis which is more diffuse. Can extend beyond the hairline onto the forehead or behind the ears. May crack and bleed.',
    whereToLook: 'Hairline, behind ears, nape, can be anywhere on the scalp.',
    whatToTell: '"These patches look like they could be psoriasis. It\'s not contagious and it\'s manageable, but it does need proper treatment from a dermatologist."',
    whatYouCanDo: 'Don\'t pick at or scrape the scales. Be gentle when styling around affected areas. Don\'t apply products directly on plaques.',
    severityGuide: 'Always refer. Psoriasis is a chronic condition that benefits from medical management.',
    darkerSkinNote: 'On darker skin: Plaques may appear more purple or dark brown rather than the classic pink-red shown in most textbooks. The silvery scaling is usually still visible. The defined borders of the plaque are your best diagnostic clue regardless of skin tone.',
  },
  {
    id: 'alopecia-areata',
    name: 'Alopecia areata',
    tag: 'Less common',
    summary: 'Smooth, round bald patches from an autoimmune response',
    stages: [
      { label: 'Single patch', annotation: 'Smooth, round patch' },
      { label: 'Multiple patches', annotation: 'Multiple patches' },
      { label: 'Exclamation point hairs', annotation: 'Exclamation point hairs at edge' },
    ],
    whatItLooksLike: 'Smooth, round or oval patches of complete hair loss. No scarring, no redness, no scaling. The skin looks normal, just bald. May see "exclamation point hairs" at the edges: short broken hairs that are thinner at the base.',
    whereToLook: 'Can appear anywhere on the scalp. Often discovered during styling or washing.',
    whatToTell: '"I\'ve found a smooth bald patch on your scalp. It looks like it could be alopecia areata, which is an autoimmune condition. It\'s not caused by anything you did. A dermatologist can confirm and discuss treatment options."',
    whatYouCanDo: 'Don\'t style over it tightly. Document the size and location in FolliSense. Note whether it\'s new or getting larger.',
    severityGuide: 'Always refer. Can be self-limiting but can also progress.',
    darkerSkinNote: 'On darker skin: The smooth, round patches are usually easy to spot because the contrast between bald skin and surrounding hair is clear. The key feature, exclamation point hairs at the edges, looks the same on all skin tones. These are short broken hairs that taper toward the root.',
  },
  {
    id: 'folliculitis',
    name: 'Folliculitis',
    tag: 'Common',
    summary: 'Inflamed or infected hair follicles, looks like small bumps or pimples',
    stages: [
      { label: 'Mild folliculitis', annotation: 'Small bumps at follicles' },
      { label: 'Post-installation bumps', annotation: 'Along style installation' },
      { label: 'Infected folliculitis', annotation: 'Infected, needs attention' },
    ],
    whatItLooksLike: 'Small red bumps or white-headed pimples around hair follicles. Can be tender or itchy. Often appears after a fresh installation, especially if the style is tight or tools weren\'t sanitised.',
    whereToLook: 'Along the hairline, nape, anywhere the style creates friction or tension. In men: common on the back of the neck after a lineup.',
    whatToTell: '"You\'ve got some bumps that look like folliculitis, which is inflammation of the hair follicles. It usually clears up on its own if the area isn\'t irritated further. If it gets worse or doesn\'t clear up in a week or two, see a doctor."',
    whatYouCanDo: 'Don\'t install tightly over affected areas. Ensure your tools are sanitised between clients. Recommend the client keep the area clean and avoid touching it.',
    severityGuide: 'Mild (a few bumps) = usually self-resolving. Moderate (spreading, painful, pus-filled) = refer. Recurrent = refer.',
    darkerSkinNote: 'On darker skin: Bumps may appear darker than surrounding skin rather than red. They can also leave dark marks (post-inflammatory hyperpigmentation) after they heal. In severe cases, you may see keloid scarring at the nape, especially in male clients after lineups.',
  },
  {
    id: 'tinea-capitis',
    name: 'Fungal infection (tinea capitis)',
    tag: 'Less common',
    summary: 'Ringworm of the scalp, causes patchy hair loss with scaling',
    stages: [
      { label: 'Patchy loss with black dots', annotation: 'Black dot pattern' },
      { label: 'Scaling with hair loss', annotation: 'Scaling with broken hairs' },
      { label: 'Ring-shaped border', annotation: 'Ring-shaped border' },
    ],
    whatItLooksLike: 'Patchy hair loss with black dots where hairs have broken off at the scalp. May have scaling, redness, and sometimes a raised, ring-shaped border. Can be itchy. More common in children but occurs in adults too.',
    whereToLook: 'Can appear anywhere. Look for unusual patches with black dots (broken hair stubs).',
    whatToTell: '"I\'m seeing a patch with some unusual scaling and broken hairs that could be a fungal infection. This needs to be seen by a doctor because it usually requires oral medication to clear. It\'s also contagious, so getting it treated quickly is important."',
    whatYouCanDo: 'Do not style over the affected area. Sanitise all tools that touched the area. Refer immediately. Be honest that it needs medical attention.',
    severityGuide: 'Always refer. Requires oral antifungal treatment. Topical treatments alone are insufficient for scalp fungal infections.',
    darkerSkinNote: 'On darker skin: The ring-shaped border may be harder to see. Focus on the black dot pattern, which is broken hair stubs at the scalp surface. This is the most reliable visual sign regardless of skin tone. Scaling may appear ashy or greyish.',
  },
  {
    id: 'chemical-damage',
    name: 'Burns or chemical damage',
    tag: 'Common',
    summary: 'Damage from relaxers, colour, bleach, or heat applied too close to the scalp',
    stages: [
      { label: 'Chemical irritation', annotation: 'Chemical irritation' },
      { label: 'Chemical burn', annotation: 'Chemical burn' },
      { label: 'Scarring from repeated burns', annotation: 'Permanent scarring from repeated burns' },
    ],
    whatItLooksLike: 'Redness, rawness, blistering, or scabbing on the scalp. Client may report burning or stinging. In chronic cases, scarring and permanent hair loss in the affected area.',
    whereToLook: 'Wherever chemical or heat was applied. Common along the hairline and at the crown.',
    whatToTell: '"Your scalp looks irritated from the chemical treatment. Let it heal completely before any further processing. If it\'s blistering or weeping, see a doctor."',
    whatYouCanDo: 'Do not apply any further chemicals to the area. Do not install a tight style over damaged scalp. Allow full healing before any styling.',
    severityGuide: 'Mild redness = monitor. Blistering, open wounds, or persistent rawness = refer.',
    darkerSkinNote: 'On darker skin: Fresh chemical burns may appear darker, ashy, or slightly purple rather than red. In severe cases you may see lighter patches where the skin has been damaged. Scarring from repeated burns often presents as hypopigmented (lighter) smooth patches on brown skin.',
  },
  {
    id: 'frontal-fibrosing-alopecia',
    name: 'Frontal fibrosing alopecia (FFA)',
    tag: 'Less common',
    summary: 'Scarring hair loss causing gradual, even recession of the frontal hairline',
    stages: [
      { label: 'Early recession', annotation: 'Subtle hairline moving back' },
      { label: 'Moderate band-like loss', annotation: 'Visible smooth band at hairline' },
      { label: 'Advanced with eyebrow loss', annotation: 'Significant recession + eyebrow thinning' },
    ],
    whatItLooksLike: 'Gradual, even recession of the entire frontal hairline. The skin where hair has been lost appears smooth, pale or shiny, with no visible follicles. May also see eyebrow thinning or loss. Unlike traction alopecia, it affects the entire front evenly rather than just the temples.',
    whereToLook: 'Frontal hairline — look for even recession across the whole front, not just temples. Also check eyebrows.',
    whatToTell: '"Your hairline looks like it may be receding in a pattern that could be frontal fibrosing alopecia. It\'s different from traction alopecia because it\'s not caused by tight styles. A dermatologist can diagnose and help slow it down."',
    whatYouCanDo: 'Don\'t install tight styles along the hairline. Note the observation in FolliSense. Compare to previous visits if available.',
    severityGuide: 'Always refer. FFA causes permanent scarring and early treatment is critical to slow progression.',
    darkerSkinNote: 'On darker skin: The smooth, pale band where hair has been lost may appear as a lighter strip along the hairline that contrasts with the surrounding skin. Look for a clean, even line of recession rather than the patchy pattern seen in traction alopecia. Eyebrow loss is a helpful secondary sign that applies regardless of skin tone.',
  },
];

export const getConditionById = (id: string): StylistCondition | undefined =>
  stylistConditions.find(c => c.id === id);
