import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, RoleCode, AuthResponseData } from '../types';
import { apiRequest, ApiError } from '../api/client';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (fullName: string, phone: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasPermission: (permissionCode: string) => boolean;
  hasRole: (roleCode: RoleCode | string) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Lấy thông tin user hiện tại thông qua HttpOnly Cookie phiên làm việc
  const refreshProfile = useCallback(async () => {
    try {
      const res = await apiRequest<User>('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<AuthResponseData>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe })
      });

      if (res.success && res.data) {
        setUser(res.data.user);
      } else {
        throw new ApiError(res.message || 'Đăng nhập không thành công.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Lỗi khi đăng xuất máy chủ:', err);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (fullName: string, phone: string) => {
    const res = await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ fullName, phone })
    });
    if (res.success) {
      setUser(prev => prev ? { ...prev, fullName, phone } : null);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const res = await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (res.success) {
      setUser(prev => prev ? { ...prev, requirePasswordChange: false } : null);
    }
  };

  const hasPermission = useCallback((permissionCode: string): boolean => {
    if (!user) return false;
    if (user.role.code === 'ADMIN') return true;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permissionCode);
  }, [user]);

  const hasRole = useCallback((roleCode: RoleCode | string): boolean => {
    if (!user) return false;
    return user.role.code === roleCode;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: user ? 'cookie-authenticated' : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile,
        changePassword,
        hasPermission,
        hasRole,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
