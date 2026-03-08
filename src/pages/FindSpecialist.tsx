import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, ExternalLink, Leaf, MessageSquare } from 'lucide-react';

const resources = [
  { name: 'Institute of Trichologists', desc: 'Find a registered trichologist near you', link: '#' },
  { name: 'British Association of Dermatologists', desc: 'Search for a dermatologist', link: '#' },
  { name: 'NHS — Ask your GP for a referral', desc: 'Your GP can refer you to a dermatologist if needed', link: '#' },
  { name: 'Skin of Color Society', desc: 'Find dermatologists specialising in skin of colour', link: '#' },
];

const FindSpecialist = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showSuggestForm, setShowSuggestForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex items-center gap-1.5">
            <Leaf size={16} className="text-primary" strokeWidth={1.8} />
            <span className="text-xs font-semibold text-muted-foreground">ScalpSense</span>
          </div>
          <div className="w-10" />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="pb-24">
          <h1 className="text-2xl font-semibold mb-1">Find a Specialist</h1>
          <p className="text-muted-foreground text-sm mb-6">Professionals who understand textured hair and scalp health</p>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Enter your city or postcode"
              className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Coming soon card */}
          <div className="card-elevated p-5 mb-6">
            <h3 className="font-semibold text-foreground mb-2">Coming soon</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We're curating a directory of trichologists, dermatologists, and GPs with experience treating textured hair. In the meantime:
            </p>
          </div>

          {/* Resource cards */}
          <div className="space-y-3 mb-8">
            {resources.map(r => (
              <button
                key={r.name}
                className="card-elevated p-4 w-full text-left flex items-center gap-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
                <ExternalLink size={16} className="text-muted-foreground flex-shrink-0" strokeWidth={1.8} />
              </button>
            ))}
          </div>

          {/* Suggest a specialist */}
          <div className="rounded-2xl bg-accent p-5">
            <p className="text-sm text-muted-foreground mb-3">
              Know a great specialist? We'd love to add them to our directory.
            </p>
            {!showSuggestForm ? (
              <button
                onClick={() => setShowSuggestForm(true)}
                className="flex items-center gap-2 text-sm font-medium text-primary"
              >
                <MessageSquare size={16} strokeWidth={1.8} /> Suggest a specialist
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Specialist name"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <input
                  type="text"
                  placeholder="Location / website"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <button className="w-full h-10 bg-primary text-primary-foreground rounded-lg font-medium text-sm btn-press">
                  Submit suggestion
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FindSpecialist;
