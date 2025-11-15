import { useState } from 'react';
import type { UserRole } from '@/types';
import { useUserRole } from '@/hooks/useUserRole';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDisasterSelection } from '@/hooks/useDisasterSelection';
import { RoleSelection } from '@/components/role/RoleSelection';
import { DisasterSelectionDialog } from '@/components/role/DisasterSelectionDialog';
import { Dashboard } from '@/components/layout/Dashboard';

function App() {
  const { role, selectRole, clearRole, hasRole } = useUserRole();
  const { location } = useGeolocation();
  const { selectedDisaster, selectDisaster, nearbyDisasters, allDisasters } = useDisasterSelection(
    location,
    role
  );

  const [showDisasterSelection, setShowDisasterSelection] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    selectRole(selectedRole);

    // If responder, show disaster selection dialog
    if (selectedRole === 'responder') {
      setShowDisasterSelection(true);
    }
  };

  const handleDisasterSelect = (disasterId: string) => {
    selectDisaster(disasterId);
    setShowDisasterSelection(false);
  };

  // Show role selection if no role chosen
  if (!hasRole) {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  // For responders: show disaster selection if no disaster selected
  if (role === 'responder' && !selectedDisaster) {
    return (
      <DisasterSelectionDialog
        open={true}
        disasters={allDisasters}
        onSelect={handleDisasterSelect}
      />
    );
  }

  // For victims: wait for disaster detection, or show message if not in affected area
  if (role === 'victim' && !selectedDisaster) {
    return (
      <div className="min-h-screen w-full bg-background-primary flex items-center justify-center p-4">
        <div className="glass p-8 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">No Active Disaster Detected</h2>
          <p className="text-gray-400 mb-6">
            {nearbyDisasters.length === 0
              ? "You don't appear to be in an active disaster zone. This app is for emergency response during disasters."
              : 'Detecting disaster information...'}
          </p>
          <button
            onClick={clearRole}
            className="px-4 py-2 glass hover:bg-background-elevated transition-colors rounded-md"
          >
            Change Role
          </button>
        </div>
      </div>
    );
  }

  // Show main dashboard
  return (
    <>
      <Dashboard
        role={role!}
        disaster={selectedDisaster!}
        onChangeRole={clearRole}
        onChangeDisaster={() => setShowDisasterSelection(true)}
      />
      {role === 'responder' && (
        <DisasterSelectionDialog
          open={showDisasterSelection}
          disasters={allDisasters}
          onSelect={handleDisasterSelect}
        />
      )}
    </>
  );
}

export default App;
