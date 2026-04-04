import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { articles, categories, getArticleById } from '@/data/learnArticles';
import { useApp } from '@/contexts/AppContext';
import ArticleView from '@/components/ArticleView';
import ConditionGuidePage from '@/pages/ConditionGuidePage';

const mont     = "'Montserrat', sans-serif";
const playfair = "'Playfair Display', serif";

// ─── Pure white + gold palette ────────────────────────────────────────────────
const C = {
  bg:         '#FAF8F5',
  surface:    '#F5F0EB',
  ink:        '#1C1C1C',
  gold:       '#D4A866',
  goldDeep:   '#B8893E',
  gold10:     'rgba(212,168,102,0.10)',
  goldBorder: 'rgba(212,168,102,0.22)',
  mid:        '#EBEBEB',
  muted:      '#999999',
  warm:       '#666666',
  white:      '#FFFFFF',
};

// ─── Category colours — all gold-family tones ─────────────────────────────────
const categoryColor: Record<string, string> = {
  'Scalp health':   '#B8893E',
  'Hair care':      '#A07840',
  "Men's hair":     '#887060',
  'Ingredients':    '#C89A48',
  'Know the signs': '#906040',
  'All':            '#B8893E',
};

const HERO_IMG = 'https://i.pinimg.com/1200x/21/df/fe/21dffea6ca5d2c69edb5c8b926e41b50.jpg';

// ─── Article image sets — replace placeholders with real URLs ─────────────────
const articleImageSets: Record<string, string[]> = {
  'scalp-buildup': [
    'scalp-health-image-url-1',
    'scalp-health-image-url-2',
    'scalp-health-image-url-3',
  ],
  'hair-porosity': [
    'second-article-image-url-1',
    'second-article-image-url-2',
  ],
  'scalp-massage': [
    'third-article-image-url-1',
    'third-article-image-url-2',
    'third-article-image-url-3',
  ],
  // 'your-article-id': ['url-a', 'url-b'],
};

const sessionSeed = Math.random();
const getArticleImage = (id: string): string | null => {
  const set = articleImageSets[id];
  if (!set || set.length === 0) return null;
  const idx = Math.floor(sessionSeed * set.length) % set.length;
  const url = set[idx];
  const isPlaceholder = url.includes('-url-') || url.startsWith('scalp-') || url.startsWith('second-') || url.startsWith('third-');
  return isPlaceholder ? null : url;
};

const allCategories = ['All', ...categories, 'Know the signs'];

// ─── Hover-aware list card ────────────────────────────────────────────────────
const ArticleRow = ({
  article, onClick,
}: { article: any; onClick: () => void }) => {
  const [hovered, setHovered] = useState(false);
  const accent = categoryColor[article.category] || C.goldDeep;
  const img    = getArticleImage(article.id);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        width: '100%', textAlign: 'left',
        background: C.white,
        borderRadius: 18, marginBottom: 10,
        border: hovered ? `1.5px solid ${C.goldBorder}` : `1.5px solid ${C.mid}`,
        cursor: 'pointer',
        display: 'flex', overflow: 'hidden',
        boxShadow: hovered
          ? `0 6px 20px rgba(212,168,102,0.14), 0 2px 8px rgba(0,0,0,0.05)`
          : '0 2px 10px rgba(0,0,0,0.05)',
        transition: 'border 0.18s, box-shadow 0.18s',
      }}
    >
      <div style={{
        width: hovered ? 4 : 3, flexShrink: 0,
        background: accent,
        opacity: hovered ? 1 : 0.45,
        transition: 'width 0.18s, opacity 0.18s',
      }} />
      {img && (
        <div style={{
          width: 88, flexShrink: 0,
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
      )}
      <div style={{ flex: 1, padding: '14px 14px' }}>
        <span style={{
          fontFamily: mont, fontSize: 9, fontWeight: 700,
          color: accent, display: 'block', marginBottom: 5,
          letterSpacing: '0.07em', textTransform: 'uppercase',
        }}>
          {article.category}
        </span>
        <h3 style={{
          fontFamily: mont, fontSize: 13, fontWeight: 700,
          color: hovered ? C.goldDeep : C.ink,
          margin: '0 0 5px', lineHeight: 1.35,
          transition: 'color 0.18s',
        }}>
          {article.title}
        </h3>
        <p style={{
          fontFamily: mont, fontSize: 11, fontWeight: 400,
          color: C.warm, margin: '0 0 10px', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.preview}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.muted, fontFamily: mont, fontSize: 10 }}>
          <Clock size={10} />
          <span>{article.readTime} min read</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', paddingRight: 14 }}>
        <ChevronRight size={14} color={hovered ? C.gold : C.mid} style={{ transition: 'color 0.18s' }} />
      </div>
    </motion.button>
  );
};

const FeaturedCard = ({
  article, onClick,
}: { article: any; onClick: () => void }) => {
  const [hovered, setHovered] = useState(false);
  const featuredImg = getArticleImage(article.id);

  return (
    <motion.button
      key={article.id + '-featured'} layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)} onBlur={() => setHovered(false)}
      style={{
        width: '100%', textAlign: 'left',
        background: C.white, borderRadius: 22, overflow: 'hidden', marginBottom: 12,
        border: hovered ? `1.5px solid ${C.goldBorder}` : `1.5px solid ${C.mid}`,
        cursor: 'pointer',
        boxShadow: hovered
          ? `0 8px 28px rgba(212,168,102,0.16), 0 2px 8px rgba(0,0,0,0.05)`
          : '0 3px 14px rgba(0,0,0,0.06)',
        transition: 'border 0.18s, box-shadow 0.18s',
      }}
    >
      <div style={{
        height: 160,
        background: featuredImg
          ? `url(${featuredImg}) center/cover no-repeat`
          : `linear-gradient(135deg, ${C.gold10} 0%, ${C.surface} 100%)`,
        position: 'relative',
        display: 'flex', alignItems: 'flex-end', padding: '12px 16px',
      }}>
        <span style={{
          position: 'relative', zIndex: 1,
          fontFamily: mont, fontSize: 9, fontWeight: 700,
          padding: '3px 10px', borderRadius: 100, letterSpacing: '0.06em',
          background: featuredImg ? 'rgba(255,255,255,0.9)' : C.gold10,
          color: categoryColor[article.category] || C.goldDeep,
          border: `1px solid ${C.goldBorder}`,
          textTransform: 'uppercase',
        }}>
          {article.category}
        </span>
      </div>
      <div style={{ padding: '14px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
          <Sparkles size={11} color={C.gold} />
          <span style={{ fontFamily: mont, fontSize: 9, fontWeight: 700, color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Featured
          </span>
        </div>
        <h3 style={{
          fontFamily: mont, fontSize: 16, fontWeight: 700,
          color: hovered ? C.goldDeep : C.ink,
          margin: '0 0 7px', lineHeight: 1.3, transition: 'color 0.18s',
        }}>
          {article.title}
        </h3>
        <p style={{
          fontFamily: mont, fontSize: 12, fontWeight: 400,
          color: C.warm, margin: '0 0 12px', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.preview}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.muted, fontFamily: mont, fontSize: 10 }}>
            <Clock size={11} />
            <span>{article.readTime} min read</span>
          </div>
          <ChevronRight size={14} color={hovered ? C.gold : C.mid} style={{ transition: 'color 0.18s' }} />
        </div>
      </div>
    </motion.button>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const LearnPage = () => {
  const { onboardingData } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(searchParams.get('article'));
  const [showConditionGuide, setShowConditionGuide] = useState(!!searchParams.get('condition'));
  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams.get('condition')) setShowConditionGuide(true);
    const article = searchParams.get('article');
    if (article) setSelectedArticleId(article);
  }, [searchParams]);

  const isMale = onboardingData.gender === 'man';

  const sortedArticles = useMemo(() => {
    let filtered = articles;
    if (activeCategory !== 'All' && activeCategory !== 'Know the signs')
      filtered = filtered.filter(a => a.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.preview.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.content.some((p: string) => p.toLowerCase().includes(q))
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
          onNavigate={(id) => { setSelectedArticleId(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      </div>
    );
  }

  if (showConditionGuide || activeCategory === 'Know the signs') {
    return (
      <div className="page-container pt-6">
        <ConditionGuidePage onBack={() => {
          setShowConditionGuide(false);
          setActiveCategory('All');
          setSearchParams({});
        }} />
      </div>
    );
  }

  const featuredArticle = sortedArticles[0];
  const restArticles    = sortedArticles.slice(1);
  const featuredImg     = featuredArticle ? getArticleImage(featuredArticle.id) : null;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 100, fontFamily: mont }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@500;600&display=swap');
        input::placeholder { color: #BBBBBB; font-family: 'Montserrat', sans-serif; }
      `}</style>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#C4B090' }}>
          <img
            src={HERO_IMG} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }}
          />
          {/* Top dark band for text */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
            background: 'linear-gradient(to bottom, rgba(28,28,28,0.55), transparent)',
          }} />
          {/* Bottom fade to white */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: `linear-gradient(to top, ${C.bg}, transparent)`,
          }} />
          <div style={{ position: 'absolute', top: 52, left: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.gold }} />
              <span style={{ fontFamily: mont, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                FolliSense
              </span>
            </div>
            <h1 style={{ fontFamily: playfair, fontSize: 26, fontWeight: 500, color: '#fff', margin: 0, lineHeight: 1.2, textShadow: '0 1px 8px rgba(0,0,0,0.25)' }}>
              Learn
            </h1>
          </div>
        </div>

        <div style={{ padding: '16px 20px 0' }}>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
            <input
              type="text" placeholder="Search topics…"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
                borderRadius: 14, background: C.surface,
                border: `1.5px solid ${C.mid}`, color: C.ink,
                fontFamily: mont, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            />
          </div>

          {/* Category pills */}
          <div ref={pillsRef} style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
            {allCategories.map(cat => {
              const active = activeCategory === cat;
              const accent = categoryColor[cat] || C.goldDeep;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                  flexShrink: 0, padding: '7px 16px', borderRadius: 100,
                  fontFamily: mont, fontSize: 11, fontWeight: 700,
                  border: active ? 'none' : `1.5px solid ${C.mid}`,
                  cursor: 'pointer', transition: 'all 0.18s',
                  background: active ? accent : C.white,
                  color: active ? C.ink : C.warm,
                  boxShadow: active ? `0 2px 10px rgba(212,168,102,0.35)` : '0 1px 4px rgba(0,0,0,0.05)',
                  letterSpacing: '0.02em',
                }}>
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Articles */}
          <AnimatePresence mode="popLayout">
            {sortedArticles.length === 0 ? (
              <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: 'center', color: C.muted, padding: '48px 0', fontFamily: mont, fontSize: 13 }}>
                No articles found. Try a different search or category.
              </motion.p>
            ) : (
              <>
                {/* Featured card */}
                {featuredArticle && (
                  <FeaturedCard article={featuredArticle} onClick={() => setSelectedArticleId(featuredArticle.id)} />
                )}

                {/* Article list */}
                {restArticles.map((article, i) => (
                  <motion.div key={article.id} transition={{ duration: 0.18, delay: i * 0.04 }}>
                    <ArticleRow article={article} onClick={() => setSelectedArticleId(article.id)} />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LearnPage;