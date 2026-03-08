import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 0) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[430px] w-full"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <Leaf size={24} className="text-primary" strokeWidth={1.8} />
          <span className="text-xl font-semibold text-foreground">ScalpSense</span>
        </div>

        {!submitted ? (
          <>
            <h1 className="text-2xl font-semibold text-foreground text-center mb-8">Reset your password</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={email.trim().length === 0}
                className={`w-full h-14 rounded-xl font-semibold text-base btn-press transition-colors ${
                  email.trim().length > 0 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'
                }`}
              >
                Send reset link
              </button>
            </form>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              Back to login
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
                <CheckCircle size={32} className="text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-3">Check your inbox</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              If that email is registered, you'll receive a reset link shortly. Check your inbox.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press"
            >
              Back to login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
