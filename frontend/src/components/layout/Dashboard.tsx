import type { UserRole, DisasterInfo } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Header } from './Header';
import { MapContainer } from '@/components/map/MapContainer';
import { LeftPanel } from '@/components/panels/LeftPanel';
import { RequestHelpFAB } from './RequestHelpFAB';
import { getHelpRequestsByDisaster } from '@/data/mock-help-requests';

interface DashboardProps {
  role: UserRole;
  disaster: DisasterInfo;
  onChangeRole: () => void;
}

export function Dashboard({ role, disaster, onChangeRole }: DashboardProps) {
  const { location, loading } = useGeolocation();

  const handleRequestHelp = () => {
    // TODO: Implement RequestHelpDialog
    console.log('Request help clicked');
  };

  const handleMarkerClick = (request: any) => {
    console.log('Victim marker clicked:', request);
    // TODO: Show help request details dialog
  };

  // Always use user's location if available, otherwise fall back to disaster center
  const mapCenter = location || disaster.center;

  // Get help requests for this disaster
  const helpRequests = getHelpRequestsByDisaster(disaster.id);

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
      />

      {/* Left Panel with Tabs */}
      <LeftPanel role={role} />

      {/* Map Container */}
      <div className="pt-16 h-screen">
        <MapContainer
          center={mapCenter}
          zoom={role === 'victim' ? 16 : 13}
          helpRequests={helpRequests}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {/* Request Help FAB (only for victims) */}
      {role === 'victim' && <RequestHelpFAB onClick={handleRequestHelp} />}
    </div>
  );
}
