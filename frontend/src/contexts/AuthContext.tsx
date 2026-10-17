import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  email: string;
  name: string;
  picture?: string;
  sub: string; // Google's unique user ID
  nickname: string | null; // public name shown on the leaderboard
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => void;
  updateNickname: (nickname: string) => Promise<void>;
  isLoading: boolean;
  credential: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Google ID tokens expire after ~1 hour; once expired the backend rejects them,
// so treat the user as signed out.
const isCredentialExpired = (credential: string) => {
  try {
    const payload = JSON.parse(atob(credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credential, setCredential] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCredential = localStorage.getItem('credential');

    if (savedUser && savedCredential && !isCredentialExpired(savedCredential)) {
      try {
        setUser({ nickname: null, ...JSON.parse(savedUser) });
        setCredential(savedCredential);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('credential');
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('credential');
    }
    setIsLoading(false);
  }, []);

  const login = async (credential: string) => {
    try {
      setIsLoading(true);

      // Send credential to backend for verification
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      const userData: User = {
        email: data.email,
        name: data.name,
        picture: data.picture,
        sub: data.sub,
        nickname: data.nickname,
      };

      setUser(userData);
      setCredential(credential);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('credential', credential);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCredential(null);
    localStorage.removeItem('user');
    localStorage.removeItem('credential');

    // Sign out from Google
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const updateNickname = async (nickname: string) => {
    if (!user || !credential) {
      throw new Error('You need to be signed in to set a nickname');
    }

    const response = await fetch(`${API_URL}/api/users/nickname`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential, nickname }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save nickname');
    }

    const userData: User = { ...user, nickname: data.nickname };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!credential && !isCredentialExpired(credential),
        login,
        logout,
        updateNickname,
        isLoading,
        credential,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
