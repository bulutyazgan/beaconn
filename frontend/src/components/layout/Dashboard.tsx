import type { UserRole } from '@/types';

interface DashboardProps {
  role: UserRole;
  onChangeRole: () => void;
}

export function Dashboard({ role, onChangeRole }: DashboardProps) {
  return (
    <div className="min-h-screen w-full bg-background-primary text-white">
      {/* Placeholder for now */}
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <h1 className="text-4xl font-bold">
          {role === 'victim' ? 'Victim Dashboard' : 'Responder Dashboard'}
        </h1>
        <p className="text-gray-400">
          Role: <span className="text-accent-blue font-semibold capitalize">{role}</span>
        </p>
        <button
          onClick={onChangeRole}
          className="px-4 py-2 glass hover:bg-background-elevated transition-colors rounded-md"
        >
          Change Role
        </button>
        <p className="text-sm text-gray-500 mt-8">
          Map and panels will be implemented in next phase
        </p>
      </div>
    </div>
  );
}
