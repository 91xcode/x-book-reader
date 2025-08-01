import { useMemo } from 'react';

// use desktop size as base size (匹配readest实现)
export const useResponsiveSize = (baseSize: number) => {
  return useMemo(() => {
    const isPhone = window.innerWidth <= 480;
    const isTablet = window.innerWidth > 480 && window.innerWidth <= 1024;
    
    if (isPhone) return baseSize * 1.25;
    if (isTablet) return baseSize * 1.25;
    return baseSize;
  }, [baseSize]);
};

export const useDefaultIconSize = () => {
  return useResponsiveSize(20);
};