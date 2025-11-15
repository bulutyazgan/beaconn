import type { UserRole } from '@/types';
import { useUserRole } from '@/hooks/useUserRole';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDisasterSelection } from '@/hooks/useDisasterSelection';
import { RoleSelection } from '@/components/role/RoleSelection';
import { Dashboard } from '@/components/layout/Dashboard';

function App() {
  const { role, selectRole, clearRole, hasRole } = useUserRole();
  const { location } = useGeolocation();
  const { selectedDisaster, nearbyDisasters } = useDisasterSelection(location, role);

  const handleRoleSelect = (selectedRole: UserRole) => {
    selectRole(selectedRole);
  };

  // Show role selection if no role chosen
  if (!hasRole) {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  // Wait for disaster detection based on user location
  if (!selectedDisaster) {
    return (
      <div className="min-h-screen w-full bg-background-primary flex items-center justify-center p-4">
        <div className="glass p-8 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">
            {nearbyDisasters.length === 0 ? 'No Active Disaster Detected' : 'Detecting Disaster...'}
          </h2>
          <p className="text-gray-400 mb-6">
            {nearbyDisasters.length === 0
              ? "You don't appear to be in an active disaster zone. This app is for emergency response during disasters."
              : 'Analyzing your location and finding nearby disasters...'}
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
    <Dashboard
      role={role!}
      disaster={selectedDisaster!}
      onChangeRole={clearRole}
    />
  );
}

export default App;
