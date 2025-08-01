import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';

interface Position {
  top: number;
  left: number;
  dir?: 'up' | 'down';
  point?: { x: number; y: number };
}

interface PopupProps {
  width: number;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  position?: Position;
  trianglePosition?: Position;
  children: React.ReactNode;
  className?: string;
  triangleClassName?: string;
  additionalStyle?: React.CSSProperties;
}

const Popup: React.FC<PopupProps> = ({
  width,
  height,
  minHeight,
  maxHeight,
  position,
  trianglePosition,
  children,
  className = '',
  triangleClassName = '',
  additionalStyle = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [childrenHeight, setChildrenHeight] = useState(height || minHeight || 0);

  const popupPadding = useResponsiveSize(10);
  let availableHeight = window.innerHeight - 2 * popupPadding;
  if (trianglePosition?.dir === 'up') {
    availableHeight = trianglePosition.point?.y ? trianglePosition.point.y - popupPadding : availableHeight;
  } else if (trianglePosition?.dir === 'down') {
    availableHeight = trianglePosition.point?.y ? window.innerHeight - trianglePosition.point.y - popupPadding : availableHeight;
  }
  maxHeight = Math.min(maxHeight || availableHeight, availableHeight);
  if (minHeight) {
    minHeight = Math.min(minHeight, availableHeight);
  }

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.contentRect.height;
        if (newHeight !== childrenHeight) {
          setChildrenHeight(newHeight);
          return;
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    setAdjustedPosition(position);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  if (!position) return null;

  return (
    <div
      ref={containerRef}
      className={clsx('absolute rounded-lg', className)}
      style={{
        top: adjustedPosition?.top || position.top,
        left: adjustedPosition?.left || position.left,
        width: width,
        height: height,
        minHeight: minHeight,
        maxHeight: maxHeight,
        ...additionalStyle,
      }}
    >
      {trianglePosition && (
        <div
          className={clsx('absolute text-base-200', triangleClassName)}
          style={{
            top: trianglePosition.top,
            left: trianglePosition.left,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid currentColor',
            transform: 'translateX(-50%)',
          }}
        />
      )}
      {children}
    </div>
  );
};

export default Popup;