import React, { createContext, useState, ReactNode } from 'react';
import { AuthUser, UserRole } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  registerPlayerCredentials: (playerId: string, name: string, email: string, password: string) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  playingRole: string;
  battingStyle: string;
  bowlingStyle: string;
  age: string;
  phone: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AcademyUser = { id: string; email: string; password: string; name: string; role: UserRole; playerId?: string };

const INITIAL_USERS: AcademyUser[] = [
  // YWCC Admins
  {
    id: 'admin1',
    email: 'ashishmahto@ywcc.com',
    password: 'Pawa@9999',
    name: 'Ashish Mahto',
    role: 'admin' as UserRole,
  },
  {
    id: 'admin2',
    email: 'chandrakant@ywcc.com',
    password: 'Chandu.#2052',
    name: 'Chandrakant',
    role: 'admin' as UserRole,
  },
  {
    id: 'admin3',
    email: 'vishnu@ywcc.com',
    password: 'vishnu#2023',
    name: 'Vishnu',
    role: 'admin' as UserRole,
  },
  // Players
  { id: 'p1', email: 'arjun@academy.com', password: 'player123', name: 'Arjun Sharma', role: 'player' as UserRole, playerId: 'p1' },
  { id: 'p2', email: 'priya@academy.com', password: 'player123', name: 'Priya Patel', role: 'player' as UserRole, playerId: 'p2' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [academyUsers, setAcademyUsers] = useState<AcademyUser[]>(INITIAL_USERS);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    const found = academyUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      setUser({ id: found.id, email: found.email, name: found.name, role: found.role, playerId: (found as any).playerId });
      setIsLoading(false);
      return { success: true, role: found.role };
    }
    setIsLoading(false);
    return { success: false, error: 'Invalid email or password. Please check your credentials.' };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 900));
    setIsLoading(false);
    return { success: true };
  };

  const registerPlayerCredentials = (playerId: string, name: string, email: string, password: string) => {
    const newUser: AcademyUser = { id: playerId, email, password, name, role: 'player', playerId };
    setAcademyUsers(prev => [...prev, newUser]);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, registerPlayerCredentials }}>
      {children}
    </AuthContext.Provider>
  );
}
