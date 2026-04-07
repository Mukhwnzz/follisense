import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Clock, BookOpen, User, Users } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import FloatingChat from '@/components/FloatingChat';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const consumerTabs = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/history', icon: Clock, label: 'History' },
  { path: '/learn', icon: BookOpen, label: 'Learn' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const stylistTabs = [
  { path: '/stylist', icon: Home, label: 'Home' },
  { path: '/stylist/learn', icon: BookOpen, label: 'Learn' },
  { path: '/stylist/clients', icon: Users, label: 'Clients' },
  { path: '/stylist/profile', icon: User, label: 'Profile' },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stylistMode } = useApp();
  const prevPathRef = useRef(location.pathname);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const prev = prevPathRef.current;
    // Simple heuristic: back if navigating to a "parent" or earlier path
    if (prev !== location.pathname) {
      setDirection(location.pathname.length < prev.length ? -1 : 1);
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  const hiddenNavPaths = ['/', '/signup', '/login', '/onboarding', '/mid-cycle', '/wash-day', '/results', '/clinician-summary', '/stylist/observation', '/stylist/quiz', '/find-specialist', '/forgot-password', '/salon-checkin', '/stylist/onboarding', '/stylist/signup', '/stylist/login', '/stylist/quick-intake', '/spot-it'];
  const showNav = !hiddenNavPaths.some(p => location.pathname === p) && !location.pathname.startsWith('/onboarding/');

  const tabs = stylistMode ? stylistTabs : consumerTabs;

  const isAuthPage = ['/', '/login', '/signup', '/forgot-password', '/stylist/login', '/stylist/signup', '/onboarding'].includes(location.pathname);
  const isWelcomePage = location.pathname === '/';
  const isOnboarding = location.pathname === '/onboarding' || location.pathname.startsWith('/onboarding/');

  return (
    <div className="min-h-screen" style={{ backgroundColor: isWelcomePage ? undefined : '#FAF8F5' }}>
      <div className={`mx-auto min-h-screen relative ${isWelcomePage ? 'w-full max-w-none' : isAuthPage ? 'max-w-[620px]' : 'max-w-[430px]'}`}>
        {children}

        {isOnboarding ? (
          children
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        )}
        {showNav && (
          <nav className="fixed bottom-0 left-0 right-0 z-50">
            <div className="max-w-[430px] mx-auto bg-card border-t border-border">
              <div className="flex items-center justify-around py-2 px-2">
                {tabs.map(({ path, icon: Icon, label }) => {
                  const active = location.pathname === path;
                  return (
                    <button
                      key={path}
                      onClick={() => navigate(path)}
                      className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${
                        active ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                      <span className="text-[11px] font-medium">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        )}

        {/* Floating chat for BOTH consumers and stylists */}
        <FloatingChat />
        {!stylistMode && <FloatingChat />}
      </div>
    </div>
  );
};

export default Layout;