import { useUserRole } from '@/hooks/useUserRole';
import { RoleSelection } from '@/components/role/RoleSelection';
import { Dashboard } from '@/components/layout/Dashboard';

function App() {
  const { role, selectRole, clearRole, hasRole } = useUserRole();

  if (!hasRole) {
    return <RoleSelection onSelectRole={selectRole} />;
  }

  return <Dashboard role={role!} onChangeRole={clearRole} />;
}

export default App;
