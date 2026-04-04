export interface DidYouKnowFact {
  text: string;
  topics: string[]; // maps to user goals/priorities for weighting
}

export const didYouKnowFactsTagged: DidYouKnowFact[] = [
  { text: "Traction alopecia affects up to 1 in 3 people who regularly wear tight hairstyles. Early intervention can reverse it.", topics: ['thinning', 'edge'] },
  { text: "Scalp buildup under braids can lead to folliculitis if left unchecked. A mid-cycle cleanse makes a difference.", topics: ['itching', 'flaking', 'bumps'] },
  { text: "Postpartum hair shedding usually peaks at 3 to 4 months and resolves by 12 months. It's almost always temporary.", topics: ['shedding', 'thinning'] },
  { text: "Your scalp produces sebum at the same rate regardless of hair texture. Coiled hair just distributes it differently.", topics: ['dryness', 'flaking'] },
  { text: "Washing your hair more often doesn't cause dryness. The wrong products do.", topics: ['dryness'] },
  { text: "Low iron is one of the most common causes of hair shedding in women, and it's easily tested with a blood test.", topics: ['shedding', 'thinning'] },
  { text: "Vitamin D deficiency is more common in people with darker skin and has been linked to hair loss. Get your levels checked.", topics: ['thinning', 'shedding'] },
  { text: "The average person sheds 50 to 100 hairs a day. After a protective style, weeks of shed come out at once. That's normal.", topics: ['shedding'] },
  { text: "Your hairline has the thinnest, most fragile follicles on your head. They're the first to show traction damage.", topics: ['edge', 'thinning'] },
  { text: "Sleeping on a satin or silk pillowcase reduces friction by up to 40% compared to cotton. Your edges will thank you.", topics: ['edge', 'breakage', 'dryness'] },
  { text: "Scalp health and hair growth are directly connected. A healthy scalp environment supports stronger follicles.", topics: ['thinning', 'itching'] },
  { text: "Heat damage is cumulative. You might not see it after one flat-iron, but repeated use without protection adds up.", topics: ['breakage', 'dryness'] },
  { text: "Stress-related hair shedding (telogen effluvium) usually appears 2 to 3 months after the stressful event, not during it.", topics: ['shedding', 'thinning'] },
  { text: "Most scalp conditions are treatable, especially when caught early. Tracking symptoms over time helps you spot patterns.", topics: ['itching', 'flaking', 'bumps'] },
  { text: "Tight ponytails and high buns cause the same traction damage as braids. Any style that pulls can affect your hairline.", topics: ['edge', 'thinning'] },
  { text: "CCCA (Central Centrifugal Cicatricial Alopecia) starts at the crown and works outward. Early detection matters because scarring alopecia is permanent if untreated.", topics: ['thinning'] },
  { text: "Your scalp has more blood vessels per square centimetre than almost any other part of your body. That's why scalp cuts bleed so much, and why circulation matters for growth.", topics: ['thinning'] },
  { text: "Seborrheic dermatitis is not caused by poor hygiene. It's driven by an overgrowth of a yeast that naturally lives on your skin.", topics: ['flaking', 'itching'] },
];

// Legacy export for backward compat
export const didYouKnowFacts = didYouKnowFactsTagged.map(f => f.text);

/**
 * Get a prioritised fact based on user goals.
 * Priority-related facts rotate first, then general ones.
 */
export const getPrioritisedFact = (goals: string[], dayIndex: number): string => {
  if (goals.length === 0) return didYouKnowFacts[dayIndex % didYouKnowFacts.length];

  const goalKeywords = goals.map(g => g.toLowerCase());

  const priorityFacts = didYouKnowFactsTagged.filter(f =>
    f.topics.some(t => goalKeywords.some(g =>
      g.includes(t) || t.includes(g) ||
      (g.includes('thin') && t.includes('thin')) ||
      (g.includes('itch') && t.includes('itch')) ||
      (g.includes('flak') && t.includes('flak')) ||
      (g.includes('break') && t.includes('break')) ||
      (g.includes('edge') && t.includes('edge')) ||
      (g.includes('dry') && t.includes('dry')) ||
      (g.includes('shed') && t.includes('shed'))
    ))
  );

  const generalFacts = didYouKnowFactsTagged.filter(f => !priorityFacts.includes(f));

  // Show priority facts first, then general
  const ordered = [...priorityFacts, ...generalFacts];
  return ordered[dayIndex % ordered.length].text;
};
