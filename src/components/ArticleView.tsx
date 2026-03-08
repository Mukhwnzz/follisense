import { motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import { Article, getRelatedArticles } from '@/data/learnArticles';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  onNavigate: (id: string) => void;
}

const ArticleView = ({ article, onBack, onNavigate }: ArticleViewProps) => {
  const related = getRelatedArticles(article);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="pb-24"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground mb-6 -ml-1">
        <ArrowLeft size={20} />
        <span className="text-sm">Back to articles</span>
      </button>

      <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-sage-light text-primary mb-3">
        {article.category}
      </span>

      <h1 className="text-2xl font-semibold text-foreground mb-2 leading-tight">
        {article.title}
      </h1>

      <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-8">
        <Clock size={14} />
        <span>{article.readTime} min read</span>
      </div>

      <div className="space-y-4">
        {article.content.map((paragraph, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-foreground/90">
            {paragraph}
          </p>
        ))}
      </div>

      {related.length > 0 && (
        <div className="mt-10 pt-8 border-t border-border">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Related articles
          </h3>
          <div className="space-y-3">
            {related.map((r) => (
              <button
                key={r.id}
                onClick={() => onNavigate(r.id)}
                className="card-elevated p-4 w-full text-left flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground leading-snug">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.readTime} min read</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Got more questions about this topic?</p>
        <p className="text-sm text-primary font-medium">Tap the chat button to ask FolliSense</p>
      </div>
    </motion.div>
  );
};

export default ArticleView;
