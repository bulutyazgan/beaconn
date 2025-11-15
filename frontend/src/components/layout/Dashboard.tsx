import type { UserRole } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Header } from './Header';
import { MapContainer } from '@/components/map/MapContainer';
import { LeftPanel } from '@/components/panels/LeftPanel';
import { RequestHelpFAB } from './RequestHelpFAB';

interface DashboardProps {
  role: UserRole;
  onChangeRole: () => void;
}

export function Dashboard({ role, onChangeRole }: DashboardProps) {
  const { location, loading } = useGeolocation();

  const handleRequestHelp = () => {
    // TODO: Implement RequestHelpDialog
    console.log('Request help clicked');
  };

  if (loading || !location) {
    return (
      <div className="min-h-screen w-full bg-background-primary flex items-center justify-center">
        <div className="glass p-6 rounded-lg">
          <p className="text-accent-blue">Loading location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background-primary">
      {/* Header */}
      <Header role={role} onChangeRole={onChangeRole} />

      {/* Left Panel with Tabs */}
      <LeftPanel role={role} />

      {/* Map Container */}
      <div className="pt-16 h-screen">
        <MapContainer center={location} zoom={15} />
      </div>

      {/* Request Help FAB (only for victims) */}
      {role === 'victim' && <RequestHelpFAB onClick={handleRequestHelp} />}
    </div>
  );
}
