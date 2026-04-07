import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ChatPage from '../pages/ChatPage';           // Consumer chat
import StylistChatPage from '../pages/StylistChatPage'; // We'll create this

const FloatingChat = () => {
  const location = useLocation();
  const { stylistMode, userName } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Hide only on auth and onboarding pages
  const hiddenPaths = [
    '/', '/signup', '/login', '/forgot-password', 
    '/onboarding', '/mid-cycle', '/wash-day', '/results', 
    '/baseline-response' ,'/stylist/login', '/stylist/signup', '/stylist/onboarding'
  ];

  const shouldHide = hiddenPaths.some(p => location.pathname === p) || 
                     location.pathname.startsWith('/onboarding/');

  // Show tooltip on home page
  useEffect(() => {
    if (location.pathname === '/home' && !isOpen) {
      const hasSeenTooltip = localStorage.getItem('follisense-chat-tooltip-shown');
      if (!hasSeenTooltip) {
        const timer = setTimeout(() => setShowTooltip(true), 1800);
        const dismiss = setTimeout(() => {
          setShowTooltip(false);
          localStorage.setItem('follisense-chat-tooltip-shown', 'true');
        }, 7000);

        return () => {
          clearTimeout(timer);
          clearTimeout(dismiss);
        };
      }
    }
  }, [location.pathname, isOpen]);

  if (shouldHide) return null;

  return (
    <>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-50 max-w-[220px]"
          >
            <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
              <p className="text-sm text-foreground">
                {stylistMode ? "Need help with client scalp concerns?" : "Got scalp or hair questions?"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Ask Folli anytime 👋</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button - Different color for stylists */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 text-white rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95 ${
          stylistMode 
            ? 'bg-violet-600 hover:bg-violet-700'   // Purple for stylists
            : 'bg-primary hover:bg-primary/90'      // Default gold/green for consumers
        }`}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[61] flex justify-center"
            >
              <div className="bg-white w-full max-w-[480px] h-[88vh] rounded-t-3xl overflow-hidden shadow-2xl flex flex-col">
                
                {/* Header - Different for stylist vs consumer */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      stylistMode ? 'bg-violet-600' : 'bg-primary'
                    }`}>
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {stylistMode ? "Folli Pro" : "Folli"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stylistMode 
                          ? "Professional Stylist Assistant" 
                          : "Smart Scalp Care Assistant"}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Render different chat component based on mode */}
                <div className="flex-1 overflow-hidden">
                  {stylistMode ? <StylistChatPage /> : <ChatPage />}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;