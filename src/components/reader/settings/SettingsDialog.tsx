import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { RiFontSize, RiDashboardLine, RiTranslate } from 'react-icons/ri';
import { VscSymbolColor } from 'react-icons/vsc';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import { LiaHandPointerSolid } from 'react-icons/lia';
import { IoAccessibilityOutline } from 'react-icons/io5';
import { MdArrowBackIosNew } from 'react-icons/md';

import { useReaderStore } from '@/store/readerStore';
import { useSettingsStore } from '@/store/settingsStore';
import Dialog from '@/components/ui/Dialog';
import Dropdown from '@/components/ui/Dropdown';
import FontPanel from './FontPanel';
import LayoutPanel from './LayoutPanel';
import ColorPanel from './ColorPanel';
import ControlPanel from './ControlPanel';
import LangPanel from './LangPanel';
import MiscPanel from './MiscPanel';

export type SettingsPanelType = 'Font' | 'Layout' | 'Color' | 'Control' | 'Language' | 'Custom';

interface SettingsDialogProps {
  bookKey: string;
  isOpen: boolean;
  onClose: () => void;
}

type TabConfig = {
  tab: SettingsPanelType;
  icon: React.ElementType;
  label: string;
};

const SettingsDialog: React.FC<SettingsDialogProps> = ({ bookKey, isOpen, onClose }) => {
  const { getViewSettings } = useReaderStore();
  const { setFontLayoutSettingsDialogOpen } = useSettingsStore();
  
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const [showAllTabLabels, setShowAllTabLabels] = useState(false);
  
  const tabConfig = [
    {
      tab: 'Font' as SettingsPanelType,
      icon: RiFontSize,
      label: '字体',
    },
    {
      tab: 'Layout' as SettingsPanelType,
      icon: RiDashboardLine,
      label: '布局',
    },
    {
      tab: 'Color' as SettingsPanelType,
      icon: VscSymbolColor,
      label: '颜色',
    },
    {
      tab: 'Control' as SettingsPanelType,
      icon: LiaHandPointerSolid,
      label: '行为',
    },
    {
      tab: 'Language' as SettingsPanelType,
      icon: RiTranslate,
      label: '语言',
    },
    {
      tab: 'Custom' as SettingsPanelType,
      icon: IoAccessibilityOutline,
      label: '自定义',
    },
  ];

  const [activePanel, setActivePanel] = useState<SettingsPanelType>(() => {
    const lastPanel = localStorage.getItem('lastConfigPanel');
    if (lastPanel && tabConfig.some((tab) => tab.tab === lastPanel)) {
      return lastPanel as SettingsPanelType;
    }
    return 'Font' as SettingsPanelType;
  });

  const handleSetActivePanel = (tab: SettingsPanelType) => {
    setActivePanel(tab);
    localStorage.setItem('lastConfigPanel', tab);
  };

  const [resetFunctions, setResetFunctions] = useState<
    Record<SettingsPanelType, (() => void) | null>
  >({
    Font: null,
    Layout: null,
    Color: null,
    Control: null,
    Language: null,
    Custom: null,
  });

  const registerResetFunction = React.useCallback((panel: SettingsPanelType, resetFn: () => void) => {
    setResetFunctions((prev) => ({ ...prev, [panel]: resetFn }));
  }, []);

  const handleResetCurrentPanel = () => {
    const resetFn = resetFunctions[activePanel];
    if (resetFn) {
      resetFn();
    }
  };

  const handleClose = () => {
    setFontLayoutSettingsDialogOpen(false);
    onClose();
  };

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;

    const checkButtonWidths = () => {
      const threshold = (container.clientWidth - 64) * 0.22;
      const hideLabel = Array.from(container.querySelectorAll('button')).some((button) => {
        const labelSpan = button.querySelector('span');
        const labelText = labelSpan?.textContent || '';
        const clone = button.cloneNode(true) as HTMLButtonElement;
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        clone.style.width = 'auto';
        const cloneSpan = clone.querySelector('span');
        if (cloneSpan) {
          cloneSpan.classList.remove('hidden');
          cloneSpan.textContent = labelText;
        }
        document.body.appendChild(clone);
        const fullWidth = clone.scrollWidth;
        document.body.removeChild(clone);
        return fullWidth > threshold;
      });
      setShowAllTabLabels(!hideLabel);
    };

    checkButtonWidths();

    const resizeObserver = new ResizeObserver(checkButtonWidths);
    resizeObserver.observe(container);
    const mutationObserver = new MutationObserver(checkButtonWidths);
    mutationObserver.observe(container, {
      subtree: true,
      characterData: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const currentPanel = tabConfig.find((tab) => tab.tab === activePanel);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      className="modal-open"
      boxClassName="sm:min-w-[520px]"
      header={
        <div className="flex w-full flex-col items-center">
          <div className="tab-title flex pb-2 text-base font-semibold sm:hidden">
            {currentPanel?.label || ''}
          </div>
          <div className="flex w-full flex-row items-center justify-between">
            <button
              tabIndex={-1}
              onClick={handleClose}
              className="btn btn-ghost btn-circle flex h-8 min-h-8 w-8 hover:bg-transparent focus:outline-none sm:hidden"
            >
              <MdArrowBackIosNew />
            </button>
            <div
              ref={tabsRef}
              className="dialog-tabs ms-1 flex h-10 w-full items-center gap-1 sm:ms-0"
            >
              {tabConfig.map(({ tab, icon: Icon, label }) => (
                <button
                  key={tab}
                  data-tab={tab}
                  className={clsx(
                    'btn btn-ghost text-base-content btn-sm gap-1 px-2',
                    activePanel === tab ? 'btn-active' : '',
                  )}
                  onClick={() => handleSetActivePanel(tab)}
                >
                  <Icon className="mr-0" />
                  <span
                    className={clsx(
                      window.innerWidth < 640 && 'hidden',
                      !(showAllTabLabels || activePanel === tab) && 'hidden',
                    )}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex h-full items-center justify-end gap-x-2">
              <Dropdown
                className="dropdown-bottom dropdown-end"
                buttonClassName="btn btn-ghost h-8 min-h-8 w-8 p-0 flex items-center justify-center"
                toggleButton={<PiDotsThreeVerticalBold />}
              >
                <div className="dropdown-content no-triangle z-20 mt-1 border bg-base-200 border-base-200 shadow-2xl rounded-md p-2">
                  <button
                    className="hover:bg-base-300 text-base-content flex w-full items-center justify-center rounded-md p-2"
                    onClick={handleResetCurrentPanel}
                  >
                    <span className="text-sm">
                      {currentPanel ? `重置${currentPanel.label}设置` : '重置设置'}
                    </span>
                  </button>
                </div>
              </Dropdown>
              <button
                onClick={handleClose}
                className="bg-base-300/65 btn btn-ghost btn-circle hidden h-6 min-h-6 w-6 p-0 sm:flex"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="p-4">
        {activePanel === 'Font' && (
          <FontPanel 
            bookKey={bookKey} 
            onRegisterReset={React.useCallback((fn: () => void) => registerResetFunction('Font', fn), [registerResetFunction])} 
          />
        )}
        {activePanel === 'Layout' && (
          <LayoutPanel 
            bookKey={bookKey} 
            onRegisterReset={React.useCallback((fn: () => void) => registerResetFunction('Layout', fn), [registerResetFunction])} 
          />
        )}
        {activePanel === 'Color' && (
          <ColorPanel 
            bookKey={bookKey} 
            onRegisterReset={React.useCallback((fn: () => void) => registerResetFunction('Color', fn), [registerResetFunction])} 
          />
        )}
        {activePanel === 'Control' && (
          <ControlPanel 
            bookKey={bookKey} 
            onRegisterReset={React.useCallback((fn: () => void) => registerResetFunction('Control', fn), [registerResetFunction])} 
          />
        )}
        {activePanel === 'Language' && (
          <LangPanel 
            bookKey={bookKey} 
            onRegisterReset={React.useCallback((fn: () => void) => registerResetFunction('Language', fn), [registerResetFunction])} 
          />
        )}
        {activePanel === 'Custom' && (
          <MiscPanel 
            bookKey={bookKey} 
            onRegisterReset={React.useCallback((fn: () => void) => registerResetFunction('Custom', fn), [registerResetFunction])} 
          />
        )}
      </div>
    </Dialog>
  );
};

export default SettingsDialog; 