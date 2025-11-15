import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RequestHelpFABProps {
  onClick: () => void;
}

export function RequestHelpFAB({ onClick }: RequestHelpFABProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl bg-accent-red hover:bg-accent-red/90 border-2 border-accent-red/50"
      title="Request Help"
    >
      <AlertCircle className="w-6 h-6" />
    </Button>
  );
}
