import React, { useEffect, useState } from 'react';
import { useReaderStore } from '@/store/readerStore';
import { getCompleteStyles } from '@/utils/style';
import { getMaxInlineSize } from '@/utils/config';
import { useTranslation } from '@/hooks/useTranslation';

interface ViewMenuProps {
  bookKey: string;
  isDropdownOpen?: boolean;
  setIsDropdownOpen?: (open: boolean) => void;
}

const ViewMenu: React.FC<ViewMenuProps> = ({ 
  bookKey, 
  isDropdownOpen = false, 
  setIsDropdownOpen 
}) => {
  const _ = useTranslation()._;
  const { getView, getViewSettings, setViewSettings, applyViewStyles } = useReaderStore();
  const viewSettings = getViewSettings(bookKey);

  const [isScrolledMode, setScrolledMode] = useState(viewSettings?.scrolled ?? false);
  const [zoomLevel, setZoomLevel] = useState(viewSettings?.zoomLevel ?? 100);
  const [invertImgColorInDark, setInvertImgColorInDark] = useState(
    viewSettings?.invertImgColorInDark ?? false
  );

  // 🎯 readest风格的滚动模式快速切换
  useEffect(() => {
    if (isScrolledMode === viewSettings?.scrolled || !viewSettings) return;
    
    // 直接更新viewSettings对象
    const updatedSettings = { ...viewSettings, scrolled: isScrolledMode };
    
    // 立即应用到renderer
    const view = getView(bookKey);
    view?.renderer.setAttribute('flow', isScrolledMode ? 'scrolled' : 'paginated');
    view?.renderer.setAttribute(
      'max-inline-size',
      `${getMaxInlineSize(updatedSettings)}px`,
    );
    view?.renderer.setStyles?.(getCompleteStyles(updatedSettings));
    
    // 更新store
    setViewSettings(bookKey, updatedSettings);
    
    // 🎯 关键修复：重新应用所有样式（包括动画）
    setTimeout(() => {
      applyViewStyles(bookKey);
    }, 50);
    
    // 关闭下拉菜单
    setIsDropdownOpen?.(false);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrolledMode]);

  useEffect(() => {
    if (zoomLevel === viewSettings?.zoomLevel || !viewSettings) return;
    // TODO: 实现缩放逻辑
    const updatedSettings = { ...viewSettings, zoomLevel };
    setViewSettings(bookKey, updatedSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomLevel]);

  useEffect(() => {
    if (invertImgColorInDark === viewSettings?.invertImgColorInDark || !viewSettings) return;
    const updatedSettings = { ...viewSettings, invertImgColorInDark };
    setViewSettings(bookKey, updatedSettings);
    
    // 立即应用样式变化
    const view = getView(bookKey);
    view?.renderer.setStyles?.(getCompleteStyles(updatedSettings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invertImgColorInDark]);

  const handleSyncProgress = () => {
    // TODO: 实现进度同步
    console.log('📊 同步阅读进度');
    setIsDropdownOpen?.(false);
  };

  if (!isDropdownOpen || !viewSettings) {
    return null;
  }

  return (
    <div className="absolute top-12 right-0 z-50 w-64 bg-base-100 border border-base-200 rounded-lg shadow-lg">
      <div className="p-4 space-y-4">
        {/* 🎯 滚动模式快速切换 */}
        <div className="config-item">
          <span className="text-sm">{_('Scrolled Mode')}</span>
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={isScrolledMode}
            onChange={() => setScrolledMode(!isScrolledMode)}
          />
        </div>

        {/* 分隔线 */}
        <div className="divider my-2"></div>

        {/* 🔍 缩放级别 */}
        <div className="config-item">
          <span className="text-sm">缩放</span>
          <div className="flex items-center space-x-2">
            <button 
              className="btn btn-xs"
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
            >
              -
            </button>
            <span className="text-xs w-12 text-center">{zoomLevel}%</span>
            <button 
              className="btn btn-xs"
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
            >
              +
            </button>
          </div>
        </div>

        {/* 🖼️ 暗色模式图片反转 */}
        <div className="config-item">
          <span className="text-sm">暗色模式图片反转</span>
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={invertImgColorInDark}
            onChange={() => setInvertImgColorInDark(!invertImgColorInDark)}
          />
        </div>

        {/* 分隔线 */}
        <div className="divider my-2"></div>

        {/* 📊 同步进度 */}
        <button 
          className="btn btn-sm w-full"
          onClick={handleSyncProgress}
        >
          📊 同步阅读进度
        </button>
      </div>
    </div>
  );
};

export default ViewMenu; 