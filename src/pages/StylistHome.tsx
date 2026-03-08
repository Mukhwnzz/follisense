import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Leaf, Flame, Star, Play, Trophy, Zap, Timer, MapPin, ChevronDown, Brain, Target } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { dummyLeaderboard } from '@/data/quizQuestions';
import { useState, useEffect, useMemo } from 'react';

interface StylistProfile {
  role: string | string[]; businessName: string; [key: string]: any;
}

const loadStylistProfile = (): StylistProfile | null => {
  try {
    const saved = localStorage.getItem('follisense-stylist-profile');
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
};

const loadQuizState = () => {
  try {
    const saved = localStorage.getItem('follisense-quiz');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { totalPoints: 0, currentStreak: 0, bestStreak: 0, challengeHighScore: 0 };
};

const StylistHome = () => {
  const navigate = useNavigate();
  const { clientObservations, userName, stylistLocations } = useApp();
  const [quiz, setQuiz] = useState(loadQuizState);
  const [locationFilter, setLocationFilter] = useState('All locations');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [hasAttemptedQuiz, setHasAttemptedQuiz] = useState(false);

  useEffect(() => {
    const handler = () => setQuiz(loadQuizState());
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, []);

  useEffect(() => {
    setHasAttemptedQuiz(quiz.totalPoints > 0 || quiz.bestStreak > 0);
  }, [quiz]);

  const stylistProfile = loadStylistProfile();

  const locationNames = useMemo(() => {
    const names = new Set<string>();
    clientObservations.forEach(o => { if (o.location) names.add(o.location); });
    return ['All locations', ...Array.from(names)];
  }, [clientObservations]);

  const filteredObservations = useMemo(() => {
    if (locationFilter === 'All locations') return clientObservations;
    return clientObservations.filter(o => o.location === locationFilter);
  }, [clientObservations, locationFilter]);

  const userEntry = { rank: 5, name: 'You', points: quiz.totalPoints, bestStreak: quiz.bestStreak };
  const leaderboard = [...dummyLeaderboard, userEntry].sort((a, b) => b.points - a.points).map((e, i) => ({ ...e, rank: i + 1 }));
  const userRank = leaderboard.find(e => e.name === 'You')?.rank || 5;
  const motivation = userRank <= 3 ? "You're one of the most scalp-savvy stylists on FolliSense" : userRank <= 10 ? "You're building real clinical knowledge. Keep going." : "Every quiz makes you better at spotting problems early. Keep playing.";

  // Check if there's an active observation in progress (incomplete)
  const hasActiveCheckin = clientObservations.length > 0 && clientObservations.some(o => !o.notes);

  return (
    <div className="page-container pt-6 pb-28">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Leaf size={20} className="text-primary" strokeWidth={1.8} />
          <span className="text-sm font-semibold text-foreground">FolliSense</span>
          <span className="text-[10px] font-medium bg-secondary text-foreground px-2 py-0.5 rounded-full">Stylist</span>
        </div>
        <h1 className="text-2xl font-semibold mb-0.5">Hi {userName || 'there'}</h1>
        {stylistProfile?.role && (
          <p className="text-sm text-muted-foreground mb-1">
            {(() => {
              const roles = Array.isArray(stylistProfile.role) ? stylistProfile.role.filter(r => r !== 'Other') : [stylistProfile.role];
              if (stylistProfile.otherRole) roles.push(stylistProfile.otherRole);
              const display = roles.length > 2 ? `${roles.slice(0, 2).join(' and ')} + ${roles.length - 2} more` : roles.join(' and ');
              return `${display}${stylistProfile.businessName ? ` at ${stylistProfile.businessName}` : ''}`;
            })()}
          </p>
        )}
        <p className="text-muted-foreground text-sm mb-6">Document scalp observations for your clients</p>

        {/* New observation button */}
        <button onClick={() => navigate('/stylist/observation')} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press flex items-center justify-center gap-2 mb-5">
          <Plus size={20} strokeWidth={2} /> New client observation
        </button>

        {/* === HERO QUIZ CARD — primary CTA === */}
        <motion.div
          initial={!hasAttemptedQuiz ? { scale: 1 } : undefined}
          animate={!hasAttemptedQuiz ? { scale: [1, 1.01, 1] } : undefined}
          transition={!hasAttemptedQuiz ? { duration: 2, repeat: 2, ease: 'easeInOut' } : undefined}
          className="relative rounded-2xl overflow-hidden mb-5"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(155,25%,35%)] via-[hsl(155,20%,42%)] to-[hsl(165,18%,50%)]" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                {!hasAttemptedQuiz && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-white/90 bg-white/20 px-2.5 py-1 rounded-full mb-2">
                    New
                  </span>
                )}
                <h3 className="text-lg font-bold text-white mb-1">Test Your Scalp Knowledge</h3>
                <p className="text-sm text-white/80">
                  {hasAttemptedQuiz
                    ? 'Keep building your clinical eye. Every question makes you sharper.'
                    : 'How much do you really know about scalp conditions? Find out in 5 questions.'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Brain size={24} className="text-white" />
              </div>
            </div>

            {/* Stats row */}
            {hasAttemptedQuiz && (
              <div className="flex items-center gap-4 text-white/90 text-sm mb-4">
                <span className="flex items-center gap-1.5"><Star size={14} />{quiz.totalPoints} pts</span>
                <span className="flex items-center gap-1.5"><Flame size={14} />{quiz.currentStreak} streak</span>
                <span className="flex items-center gap-1.5"><Trophy size={14} />#{userRank}</span>
              </div>
            )}

            {/* Progress bar if attempted */}
            {hasAttemptedQuiz && quiz.totalPoints > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>Best streak: {quiz.bestStreak}</span>
                  <span>High score: {quiz.challengeHighScore || 0}</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/60 rounded-full" style={{ width: `${Math.min((quiz.totalPoints / 200) * 100, 100)}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => navigate('/stylist/quiz')} className="flex-1 h-11 bg-white text-[hsl(155,25%,35%)] rounded-xl font-bold text-sm btn-press flex items-center justify-center gap-2">
                <Play size={16} className="ml-0.5" /> {hasAttemptedQuiz ? 'Play Again' : 'Start Quiz'}
              </button>
              <button onClick={() => navigate('/stylist/quiz?mode=challenge')} className="h-11 px-4 bg-white/20 text-white rounded-xl font-semibold text-sm btn-press flex items-center justify-center gap-1.5 border border-white/30">
                <Zap size={14} /> Challenge
              </button>
            </div>
          </div>
        </motion.div>

        {/* Weekly Challenge card */}
        <div className="card-elevated p-4 mb-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-2 mb-1">
            <Timer size={15} className="text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Weekly Challenge</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2">10 seconds per question. Faster = more points. Can you beat your high score?</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">High score: <span className="font-semibold text-foreground">{quiz.challengeHighScore || 0}</span></span>
            <button onClick={() => navigate('/stylist/quiz?mode=challenge')} className="text-xs font-semibold text-primary flex items-center gap-1 btn-press">Play now <Zap size={11} /></button>
          </div>
        </div>

        {/* Leaderboard card */}
        <div className="card-elevated p-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={16} className="text-primary" />
            <h3 className="font-semibold text-foreground">Leaderboard</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Top stylists in the FolliSense community</p>
          <div className="space-y-2 mb-3">
            {leaderboard.slice(0, 5).map(entry => (
              <div key={entry.name} className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm ${entry.name === 'You' ? 'bg-primary/10 font-semibold' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="w-5 text-xs font-semibold text-muted-foreground">{entry.rank}</span>
                  <span className="text-foreground">{entry.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{entry.points} pts</span>
                  <span className="flex items-center gap-0.5"><Flame size={11} />{entry.bestStreak}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center italic">{motivation}</p>
        </div>

        {/* Recent observations */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Recent observations</h3>
          {locationNames.length > 2 && (
            <div className="relative">
              <button onClick={() => setShowLocationDropdown(!showLocationDropdown)} className="flex items-center gap-1 text-xs text-muted-foreground btn-press">
                <MapPin size={12} /> {locationFilter} <ChevronDown size={12} />
              </button>
              {showLocationDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-10 min-w-[160px]">
                  {locationNames.map(name => (
                    <button key={name} onClick={() => { setLocationFilter(name); setShowLocationDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-xs ${locationFilter === name ? 'text-primary font-medium' : 'text-foreground'} hover:bg-accent first:rounded-t-xl last:rounded-b-xl`}>
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-2">
          {filteredObservations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No observations yet. Tap "New client observation" to get started.</p>
          )}
          {filteredObservations.map(obs => (
            <div key={obs.id} className="card-elevated p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-semibold text-foreground">{obs.clientName.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{obs.clientName}{obs.location ? ` — ${obs.location}` : ''}</p>
                  <p className="text-xs text-muted-foreground">{obs.date}{obs.locationCity ? `, ${obs.locationCity}` : ''}</p>
                </div>
              </div>
              <span className={`status-dot ${obs.risk}`} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating Quiz FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        onClick={() => navigate('/stylist/quiz')}
        className="fixed bottom-24 right-5 z-40 flex items-center gap-2 bg-[hsl(155,25%,35%)] text-white pl-4 pr-5 py-3 rounded-full shadow-lg shadow-[hsl(155,25%,35%)]/30 btn-press hover:shadow-xl transition-shadow"
      >
        <Brain size={18} />
        <span className="text-sm font-semibold">Quiz</span>
        {!hasAttemptedQuiz && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">!</span>
        )}
      </motion.button>
    </div>
  );
};

export default StylistHome;
