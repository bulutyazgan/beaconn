import { useState } from 'react';
import { X, MapPin, Users, AlertTriangle, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { HelpRequest } from '@/types';

interface CaseDetailsDialogProps {
  helpRequest: HelpRequest;
  onClose: () => void;
  onClaim: (caseId: string) => Promise<void>;
}

export function CaseDetailsDialog({ helpRequest, onClose, onClaim }: CaseDetailsDialogProps) {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await onClaim(helpRequest.id);
      onClose();
    } catch (error) {
      console.error('Failed to claim case:', error);
    } finally {
      setClaiming(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/10 bg-gradient-to-r from-neutral-800/50 to-neutral-700/50">
          <div>
            <h2 className="text-2xl font-bold text-neutral-50 tracking-tight">Help Request Details</h2>
            <p className="text-sm text-neutral-400 mt-1 font-medium">Case #{helpRequest.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5 text-neutral-400 hover:text-neutral-200 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Urgency Badge */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl border shadow-lg ${getUrgencyColor(helpRequest.urgency)}`}>
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold uppercase text-sm tracking-wide">{helpRequest.urgency} URGENCY</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>{new Date(helpRequest.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Raw User Input */}
          {helpRequest.rawDescription && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-md">
              <h3 className="text-sm font-bold text-neutral-50 mb-3 flex items-center gap-2 tracking-wide">
                <MessageSquare className="w-4 h-4 text-primary" />
                User's Report
              </h3>
              <p className="text-neutral-300 leading-relaxed">{helpRequest.rawDescription}</p>
            </div>
          )}

          {/* AI Analysis */}
          {helpRequest.aiReasoning && (
            <div className="bg-gradient-to-br from-alert/10 to-alert-dark/10 border border-alert/30 rounded-xl p-5 shadow-md">
              <h3 className="text-sm font-bold text-alert-light mb-3 flex items-center gap-2 tracking-wide">
                <span className="text-lg">🤖</span>
                AI Assessment
              </h3>
              <p className="text-neutral-300 italic text-sm leading-relaxed">{helpRequest.aiReasoning}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-5">
            {/* Location */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-md hover:bg-white/8 transition-colors">
              <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-bold tracking-wide">Address</span>
              </div>
              <p className="text-neutral-100 text-sm font-mono mb-1">
                {helpRequest.location.lat.toFixed(4)}, {helpRequest.location.lng.toFixed(4)}
              </p>
              <p className="text-xs text-neutral-500 font-medium">
                Click on map to view exact location
              </p>
            </div>

            {/* People Count */}
            {helpRequest.peopleCount > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-md hover:bg-white/8 transition-colors">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-bold tracking-wide">People Affected</span>
                </div>
                <p className="text-neutral-50 text-2xl font-bold">{helpRequest.peopleCount}</p>
              </div>
            )}
          </div>

          {/* Vulnerability Factors */}
          {helpRequest.vulnerabilityFactors && helpRequest.vulnerabilityFactors.length > 0 && (
            <div className="bg-gradient-to-br from-alert/10 to-alert-dark/10 border border-alert/20 rounded-xl p-5 shadow-md">
              <h3 className="text-sm font-bold text-alert-light mb-3 tracking-wide">Vulnerability Factors</h3>
              <div className="flex flex-wrap gap-2">
                {helpRequest.vulnerabilityFactors.map((factor, index) => (
                  <span
                    key={index}
                    className="px-4 py-1.5 bg-alert/20 border border-alert/30 rounded-full text-xs text-alert-light font-semibold tracking-wide shadow-sm"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mobility Status */}
          {helpRequest.mobilityStatus && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-md">
              <h3 className="text-sm font-bold text-neutral-50 mb-2 tracking-wide">Mobility Status</h3>
              <p className="text-neutral-300 capitalize font-medium text-base">{helpRequest.mobilityStatus}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <button
              onClick={handleClaim}
              disabled={claiming || helpRequest.status !== 'pending'}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-secondary/20 to-secondary-dark/20 hover:from-secondary/30 hover:to-secondary-dark/30 disabled:from-neutral-700/20 disabled:to-neutral-800/20 border border-secondary/40 disabled:border-neutral-600/30 rounded-xl font-bold text-secondary-light disabled:text-neutral-500 transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] tracking-wide"
            >
              {claiming ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Claiming...
                </>
              ) : helpRequest.status === 'pending' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  I'm Responding to This Case
                </>
              ) : (
                <>Already Claimed</>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-4 glass hover:bg-white/10 rounded-xl font-semibold text-neutral-200 hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] tracking-wide shadow-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
