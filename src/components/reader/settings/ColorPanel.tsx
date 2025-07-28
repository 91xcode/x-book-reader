import React, { useEffect, useState } from 'react';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import { MdRadioButtonUnchecked, MdRadioButtonChecked } from 'react-icons/md';
import { CgColorPicker } from 'react-icons/cg';
import { TbSunMoon } from 'react-icons/tb';
import { PiPlus } from 'react-icons/pi';

import { useReaderStore } from '@/store/readerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeStore } from '@/store/themeStore';

interface ColorPanelProps {
  bookKey: string;
  onRegisterReset: (resetFn: () => void) => void;
}

const ColorPanel: React.FC<ColorPanelProps> = ({ bookKey, onRegisterReset }) => {
  const { getView, getViewSettings, setViewSettings } = useReaderStore();
  const { setThemeMode, setThemeColor } = useThemeStore();
  const viewSettings = getViewSettings(bookKey);

  const handleReset = () => {
    // Basic reset functionality
    setThemeColor('default');
    setThemeMode('auto');
  };

  useEffect(() => {
    onRegisterReset(handleReset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Basic color panel UI
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MdOutlineLightMode />
        <span>Light</span>
      </div>
      <div className="flex items-center gap-2">
        <MdOutlineDarkMode />
        <span>Dark</span>
      </div>
      <div className="flex items-center gap-2">
        <TbSunMoon />
        <span>Auto</span>
      </div>
      <div className="flex items-center gap-2">
        <CgColorPicker />
        <span>Custom</span>
      </div>
    </div>
  );
};

export default ColorPanel; 