import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Download, Leaf } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const ClinicianSummary = () => {
  const navigate = useNavigate();
  const { onboardingData, currentCheckIn } = useApp();

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const hairTypeLabel: Record<string, string> = {
    '3b': '3b — Loose, springy curls', '3c': '3c — Tight, corkscrew curls',
    '4a': '4a — Dense, S-shaped coils', '4b': '4b — Z-shaped, tightly coiled',
    '4c': '4c — Very tight, densely packed coils', 'unsure': 'Mixed / Unsure',
  };

  const fields = [
    { label: 'Hair type', value: hairTypeLabel[onboardingData.hairType] || 'Not specified' },
    { label: 'Current protective style', value: onboardingData.protectiveStyles.join(', ') || 'Not specified' },
    { label: 'Typical cycle length', value: onboardingData.cycleLength || 'Not specified' },
    { label: 'Current cycle duration', value: '28 days' },
    { label: 'Wash frequency', value: onboardingData.washFrequency || 'Not specified' },
  ];

  const symptoms = [
    { label: 'Itch', value: currentCheckIn?.itch || 'Moderate' },
    { label: 'Tenderness', value: currentCheckIn?.tenderness || 'Yes, noticeably' },
    { label: 'Flaking', value: currentCheckIn?.flaking || 'Some flaking' },
    { label: 'Hairline changes', value: currentCheckIn?.hairline || 'Looks a bit thinner' },
    { label: 'Shedding', value: currentCheckIn?.shedding || 'More than usual' },
  ];

  const negatives = symptoms.filter(s => ['None', 'No', 'Normal', 'No change'].includes(s.value));

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'ScalpSense Clinical Summary', text: 'Patient-reported scalp symptom summary' });
      } catch { /* cancelled */ }
    } else {
      toast('Share feature coming soon');
    }
  };

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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="pb-8">
          <h2 className="text-2xl font-semibold mb-1">Clinical Summary</h2>
          <p className="text-muted-foreground text-sm mb-1">Patient-reported scalp symptom summary</p>
          <p className="text-muted-foreground text-xs mb-6">Generated {today}</p>

          {/* Profile */}
          <div className="card-elevated p-4 mb-4">
            <h3 className="text-label mb-3">Patient Profile</h3>
            <div className="space-y-2.5">
              {fields.map(f => (
                <div key={f.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-medium text-foreground text-right max-w-[55%]">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="card-elevated p-4 mb-4">
            <h3 className="text-label mb-3">Symptoms Reported (This Cycle)</h3>
            <div className="space-y-2.5">
              {symptoms.map(s => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trend */}
          <div className="card-elevated p-4 mb-4">
            <h3 className="text-label mb-3">Symptom Trend</h3>
            <p className="text-sm text-foreground">
              Itch and tenderness have increased over the last 2 cycles
            </p>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-warning">↑</span>
                <span className="text-muted-foreground">Itch trending up</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-warning">↑</span>
                <span className="text-muted-foreground">Tenderness trending up</span>
              </div>
            </div>
          </div>

          {/* Negatives */}
          {negatives.length > 0 && (
            <div className="card-elevated p-4 mb-6">
              <h3 className="text-label mb-3">Relevant Negatives</h3>
              <ul className="space-y-1">
                {negatives.map(n => (
                  <li key={n.label} className="text-sm text-muted-foreground">
                    No {n.label.toLowerCase()} concerns reported
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="rounded-2xl bg-accent p-4 mb-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              ScalpSense is a symptom-tracking and triage tool. This summary does not constitute a medical diagnosis.
              Report generated {today}. For clinician reference only.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-3">
            <button onClick={handleShare} className="flex-1 h-12 rounded-xl border-2 border-border font-medium text-sm btn-press flex items-center justify-center gap-2">
              <Share2 size={16} strokeWidth={1.8} /> Share
            </button>
            <button onClick={() => toast('PDF download coming soon')} className="flex-1 h-12 rounded-xl border-2 border-border font-medium text-sm btn-press flex items-center justify-center gap-2">
              <Download size={16} strokeWidth={1.8} /> Download PDF
            </button>
          </div>
          <button onClick={() => navigate(-1)} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold btn-press">
            Back to results
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicianSummary;
