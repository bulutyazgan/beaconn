import { Mic, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceSelectionDialogProps {
  onSelectVoiceMode: (useVoice: boolean) => void;
}

export function VoiceSelectionDialog({ onSelectVoiceMode }: VoiceSelectionDialogProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-primary p-4">
      <div className="glass rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-white/10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-50 mb-3 tracking-tight">
            Choose Communication Mode
          </h2>
          <p className="text-base md:text-lg text-neutral-400 font-medium">
            How would you like to request help?
          </p>
        </div>

        {/* Mode Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Voice Mode */}
          <button
            onClick={() => onSelectVoiceMode(true)}
            className="glass-hover p-8 rounded-xl border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 group-hover:from-primary/30 group-hover:to-primary-dark/30 transition-all duration-300">
                <Mic className="w-12 h-12 text-primary-light" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-50 mb-2 tracking-tight">
                  Voice Call
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Speak directly with our AI assistant. Faster for urgent situations.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary-light">
                  Recommended for emergencies
                </span>
              </div>
            </div>
          </button>

          {/* Text Mode */}
          <button
            onClick={() => onSelectVoiceMode(false)}
            className="glass-hover p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-6 rounded-full bg-gradient-to-br from-neutral-700/50 to-neutral-800/50 group-hover:from-neutral-600/50 group-hover:to-neutral-700/50 transition-all duration-300">
                <MessageSquare className="w-12 h-12 text-neutral-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-50 mb-2 tracking-tight">
                  Text Form
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Fill out a form with details. Better for providing specific information.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-neutral-400">
                  Standard method
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500 font-medium">
            Both modes are secure and will connect you with emergency responders
          </p>
        </div>
      </div>
    </div>
  );
}
