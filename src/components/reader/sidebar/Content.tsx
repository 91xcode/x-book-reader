import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { PiNotePencil } from 'react-icons/pi';

import { BookDoc } from '@/libs/document';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/overlayscrollbars.css';

import TOCView from './TOCView';
import TabNavigation from './TabNavigation';

const SidebarContent: React.FC<{
  bookDoc: BookDoc;
  sideBarBookKey: string;
}> = ({ bookDoc, sideBarBookKey }) => {
  const [activeTab, setActiveTab] = useState('toc');
  const [fade, setFade] = useState(false);
  const [targetTab, setTargetTab] = useState(activeTab);

  const handleTabChange = (tab: string) => {
    setFade(true);
    const timeout = setTimeout(() => {
      setFade(false);
      setTargetTab(tab);
    }, 300);

    setActiveTab(tab);
  };

  return (
    <>
      <div
        className={clsx(
          'sidebar-content flex h-full min-h-0 flex-grow flex-col shadow-inner',
          'font-sans text-base font-normal sm:text-sm',
        )}
      >
        <OverlayScrollbarsComponent
          className='min-h-0 flex-1'
          options={{ scrollbars: { autoHide: 'scroll' }, showNativeOverlaidScrollbars: false }}
          defer
        >
          <div
            className={clsx('scroll-container h-full transition-opacity duration-300 ease-in-out', {
              'opacity-0': fade,
              'opacity-100': !fade,
            })}
          >
            {targetTab === 'toc' && bookDoc.toc && (
              <TOCView toc={bookDoc.toc} bookKey={sideBarBookKey} />
            )}
            {targetTab === 'annotations' && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="text-base-content/60 mb-4">
                  <PiNotePencil className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无注释</h3>
                  <p className="text-sm">选择文字添加注释和高亮</p>
                </div>
              </div>
            )}
            {targetTab === 'bookmarks' && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="text-base-content/60 mb-4">
                  <PiNotePencil className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无书签</h3>
                  <p className="text-sm">点击添加书签来标记重要内容</p>
                </div>
              </div>
            )}
          </div>
        </OverlayScrollbarsComponent>
      </div>
      <div className='flex-shrink-0'>
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </>
  );
};

export default SidebarContent; 