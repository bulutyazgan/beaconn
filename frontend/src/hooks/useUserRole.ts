import { useState, useEffect } from 'react';
import type { UserRole } from '@/types';

const ROLE_STORAGE_KEY = 'user_role';

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem(ROLE_STORAGE_KEY);
    return stored as UserRole | null;
  });

  useEffect(() => {
    // Persist role changes to localStorage
    if (role) {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    } else {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    }
  }, [role]);

  const selectRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  const clearRole = () => {
    setRole(null);
  };

  return {
    role,
    selectRole,
    clearRole,
    hasRole: role !== null,
  };
}
