import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Clock, BookOpen, User, Users, MessageCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const consumerTabs = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/history', icon: Clock, label: 'History' },
  { path: '/learn', icon: BookOpen, label: 'Learn' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const stylistTabs = [
  { path: '/stylist', icon: Home, label: 'Home' },
  { path: '/stylist/clients', icon: Users, label: 'Clients' },
  { path: '/stylist/profile', icon: User, label: 'Profile' },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stylistMode } = useApp();

  const hiddenNavPaths = ['/', '/onboarding', '/mid-cycle', '/wash-day', '/results', '/clinician-summary', '/stylist/observation'];
  const showNav = !hiddenNavPaths.some(p => location.pathname === p);

  const tabs = stylistMode ? stylistTabs : consumerTabs;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto min-h-screen relative">
        {children}
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
      </div>
    </div>
  );
};

export default Layout;
