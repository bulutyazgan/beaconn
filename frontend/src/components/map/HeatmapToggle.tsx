import { Flame } from 'lucide-react';

interface HeatmapToggleProps {
  visible: boolean;
  onToggle: () => void;
}

export function HeatmapToggle({ visible, onToggle }: HeatmapToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="glass hover:bg-background-elevated transition-all duration-200 rounded-lg p-3 shadow-lg"
      title={visible ? 'Hide Heatmap' : 'Show Heatmap'}
      aria-label={visible ? 'Hide Heatmap' : 'Show Heatmap'}
      style={{
        border: visible ? '1px solid var(--accent-red)' : '1px solid var(--glass-border)',
      }}
    >
      <Flame
        size={20}
        color={visible ? 'var(--accent-red)' : '#9ca3af'}
        fill={visible ? 'var(--accent-red)' : 'none'}
      />
    </button>
  );
}
