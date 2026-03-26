import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ProductEntry {
  name: string;
  desc: string;
  tag: 'Scalp' | 'Hair' | 'Both';
}

interface ProductCategory {
  name: string;
  products: ProductEntry[];
}

const productDirectory: ProductCategory[] = [
  {
    name: 'Scalp oils',
    products: [
      { name: 'Tea tree oil', desc: 'Antimicrobial oil that helps with dandruff and buildup', tag: 'Scalp' },
      { name: 'Rosemary oil (e.g., Mielle Rosemary Mint)', desc: 'Stimulates circulation and may support hair growth', tag: 'Scalp' },
      { name: 'Castor oil (e.g., Jamaican Mango & Lime JBCO)', desc: 'Thick moisturising oil often used to support edge growth', tag: 'Scalp' },
      { name: 'Peppermint oil', desc: 'Cooling oil that stimulates the scalp and relieves itching', tag: 'Scalp' },
      { name: 'Jojoba oil (scalp use)', desc: 'Mimics natural sebum, balances scalp oil production', tag: 'Both' },
      { name: 'Neem oil', desc: 'Antifungal and antibacterial, helps with flaking and irritation', tag: 'Scalp' },
      { name: 'Coconut oil (scalp use)', desc: 'Moisturises and has antimicrobial properties', tag: 'Both' },
    ],
  },
  {
    name: 'Scalp treatments',
    products: [
      { name: 'Minoxidil (e.g., Rogaine, generic)', desc: 'FDA-approved topical treatment for hair regrowth', tag: 'Scalp' },
      { name: 'Multi-peptide serum (e.g., The Ordinary)', desc: 'Peptide-based scalp serum that supports hair density', tag: 'Scalp' },
      { name: 'Salicylic acid scalp treatment', desc: 'Exfoliates and clears buildup from the scalp', tag: 'Scalp' },
      { name: 'Ketoconazole shampoo (e.g., Nizoral)', desc: 'Antifungal shampoo for dandruff and seborrheic dermatitis', tag: 'Scalp' },
      { name: 'Coal tar shampoo', desc: 'Treats psoriasis, dandruff, and seborrheic dermatitis', tag: 'Scalp' },
      { name: 'Selenium sulfide shampoo', desc: 'Reduces flaking and controls fungal scalp conditions', tag: 'Scalp' },
      { name: 'Pyrithione zinc shampoo (e.g., Head & Shoulders Royal Oils)', desc: 'Anti-dandruff shampoo that reduces flaking and itching', tag: 'Scalp' },
      { name: 'Tea tree shampoo', desc: 'Gentle antimicrobial cleanse for itchy or irritated scalps', tag: 'Scalp' },
      { name: 'Clarifying shampoo (e.g., SheaMoisture, Neutrogena Anti-Residue)', desc: 'Deep-cleansing shampoo that removes product buildup', tag: 'Scalp' },
      { name: 'Sulfur-based scalp treatment', desc: 'Reduces inflammation and promotes scalp health', tag: 'Scalp' },
    ],
  },
  {
    name: 'Hair oils and butters',
    products: [
      { name: 'Argan oil (e.g., Moroccanoil)', desc: 'Lightweight oil that adds shine and reduces frizz', tag: 'Hair' },
      { name: 'Jojoba oil', desc: 'Light oil that moisturises without heaviness', tag: 'Hair' },
      { name: 'Hair oil blend (e.g., Mielle, The Ordinary)', desc: 'Multi-oil blend for moisture and shine', tag: 'Hair' },
      { name: 'Shea butter', desc: 'Rich moisturiser for dry, coily hair', tag: 'Hair' },
      { name: 'Mango butter', desc: 'Softening butter that helps with moisture retention', tag: 'Hair' },
      { name: 'Avocado oil', desc: 'Penetrating oil rich in vitamins for dry hair', tag: 'Hair' },
      { name: 'Grapeseed oil', desc: 'Light sealant that adds shine without weight', tag: 'Hair' },
      { name: 'Marula oil', desc: 'Fast-absorbing oil that strengthens and moisturises', tag: 'Hair' },
    ],
  },
  {
    name: 'Styling products',
    products: [
      { name: 'Edge control (e.g., Ebin, Got2b, Gorilla Snot)', desc: 'Holds edges in place with a smooth finish', tag: 'Hair' },
      { name: 'Styling gel (e.g., Eco Styler, Uncle Funky\'s Daughter)', desc: 'Flexible hold for wash-and-gos, twist-outs, and sets', tag: 'Hair' },
      { name: 'Curl cream (e.g., Eco Style, Twist by Ouidad, Cantu)', desc: 'Defines curls while adding moisture', tag: 'Hair' },
      { name: 'Mousse', desc: 'Lightweight hold and volume for curls and coils', tag: 'Hair' },
      { name: 'Twist butter', desc: 'Holds twists and adds moisture during protective styling', tag: 'Hair' },
      { name: 'Loc gel or butter', desc: 'Maintains and moisturises locs', tag: 'Hair' },
      { name: 'Heat protectant (e.g., Chi 44 Iron Guard, TRESemme, GHD)', desc: 'Shields hair from heat damage during styling', tag: 'Hair' },
    ],
  },
  {
    name: 'Treatments and conditioners',
    products: [
      { name: 'Deep conditioner, moisture (e.g., SheaMoisture Manuka Honey, Amika Soulfood)', desc: 'Intense hydration for dry, brittle hair', tag: 'Hair' },
      { name: 'Deep conditioner, protein (e.g., Aphogee, SheaMoisture Manuka Honey & Yogurt)', desc: 'Strengthens hair structure and reduces breakage', tag: 'Hair' },
      { name: 'Leave-in conditioner (e.g., SheaMoisture, Cantu, Aunt Jackie\'s)', desc: 'Daily moisture and detangling for hair', tag: 'Hair' },
      { name: 'Protein treatment (e.g., Aphogee Two-Step, Curlsmith)', desc: 'Reconstructs damaged hair with protein bonds', tag: 'Hair' },
      { name: 'Bond repair treatment (e.g., Olaplex No.3, K18)', desc: 'Repairs disulfide bonds damaged by chemicals or heat', tag: 'Hair' },
      { name: 'Hot oil treatment', desc: 'Warm oil applied to hair and scalp for deep conditioning', tag: 'Both' },
      { name: 'Rice water rinse', desc: 'Protein-rich rinse that strengthens and adds shine', tag: 'Hair' },
      { name: 'Apple cider vinegar rinse', desc: 'Clarifies buildup and balances scalp pH', tag: 'Both' },
    ],
  },
];

const ProductDirectory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromOnboarding = searchParams.get('from') === 'onboarding';
  const typeFilter = searchParams.get('type'); // 'scalp' | 'hair' | null
  const { onboardingData, setOnboardingData } = useApp();

  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<string[]>([productDirectory[0].name]);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  const userScalpProducts = onboardingData.scalpProducts || [];
  const userHairProducts = onboardingData.hairProducts || [];

  const toggleCategory = (name: string) => {
    setExpandedCats(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const addProduct = (product: ProductEntry) => {
    setAddedProducts(prev => new Set(prev).add(product.name));

    if (product.tag === 'Scalp' || product.tag === 'Both') {
      if (!userScalpProducts.includes(product.name)) {
        setOnboardingData({ ...onboardingData, scalpProducts: [...userScalpProducts, product.name] });
      }
    }
    if (product.tag === 'Hair' || product.tag === 'Both') {
      if (!userHairProducts.includes(product.name)) {
        setOnboardingData({ ...onboardingData, hairProducts: [...userHairProducts, product.name] });
      }
    }
  };

  const isAdded = (name: string) => {
    return addedProducts.has(name) || userScalpProducts.includes(name) || userHairProducts.includes(name);
  };

  const filteredDirectory = productDirectory
    .map(cat => ({
      ...cat,
      products: cat.products.filter(p => {
        const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
        const matchesType = !typeFilter || (typeFilter === 'scalp' && (p.tag === 'Scalp' || p.tag === 'Both')) || (typeFilter === 'hair' && (p.tag === 'Hair' || p.tag === 'Both'));
        return matchesSearch && matchesType;
      }),
    }))
    .filter(cat => cat.products.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        <div className="flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Product Guide</h1>
            <p className="text-xs text-muted-foreground">Browse common scalp and hair products</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by product name, type, or ingredient"
            className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Categories */}
        <div className="space-y-3 pb-24">
          {filteredDirectory.map(cat => (
            <div key={cat.name} className="card-elevated overflow-hidden">
              <button
                onClick={() => toggleCategory(cat.name)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="font-semibold text-foreground text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.products.length} products</p>
                </div>
                {expandedCats.includes(cat.name) ? (
                  <ChevronUp size={18} className="text-muted-foreground" strokeWidth={1.8} />
                ) : (
                  <ChevronDown size={18} className="text-muted-foreground" strokeWidth={1.8} />
                )}
              </button>

              {expandedCats.includes(cat.name) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-border"
                >
                  {cat.products.map(product => {
                    const added = isAdded(product.name);
                    return (
                      <div key={product.name} className="flex items-start gap-3 p-4 border-b border-border last:border-b-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{product.desc}</p>
                          <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            product.tag === 'Scalp' ? 'bg-sage-light text-primary' :
                            product.tag === 'Hair' ? 'bg-secondary text-foreground' :
                            'bg-accent text-foreground'
                          }`}>{product.tag}</span>
                        </div>
                        <button
                          onClick={() => !added && addProduct(product)}
                          disabled={added}
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                            added ? 'bg-primary/10' : 'bg-accent btn-press'
                          }`}
                        >
                          {added ? (
                            <Check size={16} className="text-primary" strokeWidth={2} />
                          ) : (
                            <Plus size={16} className="text-foreground" strokeWidth={2} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          ))}

          {filteredDirectory.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No products found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDirectory;
