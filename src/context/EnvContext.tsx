'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BookServiceV2 } from '@/services/BookServiceV2';

interface EnvConfig {
  getAppService: () => Promise<any>;
}

interface AppService {
  isWebApp: boolean;
  isMobileApp: boolean;
  isDesktopApp: boolean;
  hasRoundedWindow: boolean;
  isLinuxApp: boolean;
  loadSettings: () => Promise<any>;
  loadLibraryBooks: () => Promise<any[]>;
}

interface EnvContextValue {
  envConfig: EnvConfig;
  appService: AppService | null;
}

const EnvContext = createContext<EnvContextValue | null>(null);

export const useEnv = () => {
  const context = useContext(EnvContext);
  if (!context) {
    throw new Error('useEnv must be used within an EnvProvider');
  }
  return context;
};

interface EnvProviderProps {
  children: ReactNode;
}

export const EnvProvider: React.FC<EnvProviderProps> = ({ children }) => {
  const [appService, setAppService] = useState<AppService | null>(null);

  const envConfig: EnvConfig = {
    getAppService: async () => {
      return {
        isWebApp: true,
        isMobileApp: false,
        isDesktopApp: false,
        hasRoundedWindow: false,
        isLinuxApp: false,
        loadSettings: async () => ({
          globalReadSettings: true,
          alwaysShowStatusBar: false,
          autoCheckUpdates: false,
        }),
        loadLibraryBooks: async () => {
          const bookService = BookServiceV2.getInstance();
          return bookService.getBooks();
        },
      };
    },
  };

  useEffect(() => {
    const initAppService = async () => {
      const service = await envConfig.getAppService();
      setAppService(service);
    };
    initAppService();
  }, []);

  return (
    <EnvContext.Provider value={{ envConfig, appService }}>
      {children}
    </EnvContext.Provider>
  );
}; 