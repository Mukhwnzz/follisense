import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const bookingPlatforms = ['Fresha', 'Booksy', 'Timely', 'Square', 'Instagram DM', 'WhatsApp', 'Phone call', 'Other'];

const SalonBooking = () => {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState('');
  const [otherPlatform, setOtherPlatform] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6">
        <div className="flex items-center py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.8} />
          </button>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-semibold mb-1">Salon Booking</h1>
          <p className="text-lg text-primary font-medium mb-3">Coming soon</p>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            We're working on connecting FolliSense with your favourite booking platforms so you can book your next appointment directly from the app.
          </p>
          <div className="card-elevated p-5 mb-6">
            <p className="text-sm font-medium text-foreground mb-3">Which booking platform does your salon use?</p>
            <div className="flex flex-wrap gap-2">
              {bookingPlatforms.map(p => (
                <button key={p} onClick={() => setPlatform(p)} className={`pill-option ${platform === p ? 'selected' : ''}`}>{p}</button>
              ))}
            </div>
            {platform === 'Other' && (
              <input type="text" value={otherPlatform} onChange={e => setOtherPlatform(e.target.value)} placeholder="Which platform?" className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm mt-3 focus:outline-none focus:border-primary" />
            )}
          </div>
          <div className="card-elevated p-5 mb-6">
            <p className="text-sm font-medium text-foreground mb-3">Notify me when booking is live</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm mb-3 focus:outline-none focus:border-primary" />
            <button
              onClick={() => {
                toast({ title: 'Thanks!', description: "We'll let you know when salon booking goes live." });
                setEmail('');
              }}
              disabled={!email}
              className={`w-full h-12 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${email ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground cursor-not-allowed'}`}
            >
              <Bell size={16} /> Notify me
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SalonBooking;
