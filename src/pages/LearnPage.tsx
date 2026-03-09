import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Eye } from 'lucide-react';
import { articles, categories, getArticleById, Article } from '@/data/learnArticles';
import { useApp } from '@/contexts/AppContext';
import ArticleView from '@/components/ArticleView';
import ConditionGuidePage from '@/pages/ConditionGuidePage';

const allCategories = [...categories, 'Know the signs', 'Spot It'];

const LearnPage = () => {
  const { onboardingData } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(searchParams.get('article'));
  const [showConditionGuide, setShowConditionGuide] = useState(!!searchParams.get('condition'));
  const pillsRef = useRef<HTMLDivElement>(null);

  // Handle URL params for deep linking from Spot It
  useEffect(() => {
    const condition = searchParams.get('condition');
    if (condition) {
      setShowConditionGuide(true);
    }
    const article = searchParams.get('article');
    if (article) {
      setSelectedArticleId(article);
    }
  }, [searchParams]);

  const isMale = onboardingData.gender === 'man';

  const sortedArticles = useMemo(() => {
    let filtered = articles;

    if (activeCategory !== 'All' && activeCategory !== 'Know the signs') {
      filtered = filtered.filter(a => a.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.preview.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.content.some(p => p.toLowerCase().includes(q))
      );
    }

    if (isMale && activeCategory === 'All' && !searchQuery.trim()) {
      const mens = filtered.filter(a => a.category === "Men's hair");
      const rest = filtered.filter(a => a.category !== "Men's hair");
      return [...mens, ...rest];
    }

    return filtered;
  }, [activeCategory, searchQuery, isMale]);

  const selectedArticle = selectedArticleId ? getArticleById(selectedArticleId) : null;

  if (selectedArticle) {
    return (
      <div className="page-container pt-6">
        <ArticleView
          article={selectedArticle}
          onBack={() => setSelectedArticleId(null)}
          onNavigate={(id) => {
            setSelectedArticleId(id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  if (showConditionGuide || activeCategory === 'Know the signs') {
    return (
      <div className="page-container pt-6">
        <ConditionGuidePage onBack={() => { setShowConditionGuide(false); setActiveCategory('All'); setSearchParams({}); }} />
      </div>
    );
  }

  if (activeCategory === 'Spot It') {
    // Navigate to Spot It page
    return (
      <div className="page-container pt-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <button onClick={() => setActiveCategory('All')} className="flex items-center gap-1 text-sm text-primary font-medium mb-4">
            ← Back to Learn
          </button>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Eye size={28} className="text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Spot It — Scalp Check Guide</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-[300px] mx-auto">See something on your scalp? Use reference images to identify what it could be.</p>
            <button
              onClick={() => { window.location.href = '/spot-it'; }}
              className="h-14 px-8 bg-primary text-primary-foreground rounded-xl font-semibold text-base"
            >
              Start guided check
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold mb-1">Learn</h1>
        <p className="text-muted-foreground mb-5">Bite-sized guides for healthier hair and scalp</p>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search topics"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Category pills */}
        <div
          ref={pillsRef}
          className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide -mx-1 px-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground hover:bg-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-3 mb-20">
          <AnimatePresence mode="popLayout">
            {sortedArticles.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-12 text-sm"
              >
                No articles found. Try a different search or category.
              </motion.p>
            ) : (
              sortedArticles.map((article) => (
                <motion.button
                  key={article.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedArticleId(article.id)}
                  className="card-elevated p-5 w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-sage-light text-primary mb-2">
                        {article.category}
                      </span>
                      <h3 className="font-semibold text-foreground text-[15px] leading-snug mb-1">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {article.preview}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-3">
                    <Clock size={12} />
                    <span>{article.readTime} min read</span>
                  </div>
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LearnPage;
