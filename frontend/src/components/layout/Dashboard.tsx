import type { UserRole, DisasterInfo } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Header } from './Header';
import { MapContainer } from '@/components/map/MapContainer';
import { LeftPanel } from '@/components/panels/LeftPanel';
import { RequestHelpFAB } from './RequestHelpFAB';

interface DashboardProps {
  role: UserRole;
  disaster: DisasterInfo;
  onChangeRole: () => void;
  onChangeDisaster: () => void;
}

export function Dashboard({ role, disaster, onChangeRole, onChangeDisaster }: DashboardProps) {
  const { location, loading } = useGeolocation();

  const handleRequestHelp = () => {
    // TODO: Implement RequestHelpDialog
    console.log('Request help clicked');
  };

  // Use disaster center as map center, or user location if available and in victim mode
  const mapCenter = role === 'victim' && location ? location : disaster.center;

  if (loading && !location) {
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
      <Header
        role={role}
        disaster={disaster}
        onChangeRole={onChangeRole}
        onChangeDisaster={onChangeDisaster}
      />

      {/* Left Panel with Tabs */}
      <LeftPanel role={role} />

      {/* Map Container */}
      <div className="pt-16 h-screen">
        <MapContainer center={mapCenter} zoom={role === 'victim' ? 15 : 12} />
      </div>

      {/* Request Help FAB (only for victims) */}
      {role === 'victim' && <RequestHelpFAB onClick={handleRequestHelp} />}
    </div>
  );
}
