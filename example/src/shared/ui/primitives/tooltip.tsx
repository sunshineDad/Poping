/*
[File Overview]
===============
- Purpose: Simple tooltip component without complex state management
- Data Flow: hover → show content
- Core Data Structures: Simple props-based tooltip
- Main Functions: CSS-only hover tooltip
*/

import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface TooltipContentProps {
  children: React.ReactNode;
}

/*
[Function: getPositionClasses]
=========================
- Input: side (string), tooltip position
- Output: string, Tailwind CSS classes
- Role in Data Flow: Positions tooltip relative to trigger
*/
const getPositionClasses = (side: 'top' | 'right' | 'bottom' | 'left') => {
  switch (side) {
    case 'top':
      return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2';
    case 'bottom':
      return 'top-full mt-2 left-1/2 transform -translate-x-1/2';
    case 'left':
      return 'right-full mr-2 top-1/2 transform -translate-y-1/2';
    case 'right':
      return 'left-full ml-2 top-1/2 transform -translate-y-1/2';
    default:
      return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2';
  }
};

// Simple tooltip with direct content prop
export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  if (!content) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {children}
      <div 
        className={`
          absolute invisible group-hover:visible opacity-0 group-hover:opacity-100
          bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap
          z-[9999] pointer-events-none transition-opacity duration-200
          ${getPositionClasses(side)}
        `}
      >
        {content}
      </div>
    </div>
  );
}

// Compatibility components (stateless)
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const TooltipTrigger = ({ children }: TooltipTriggerProps) => {
  return <>{children}</>;
};

export const TooltipContent = ({ children }: TooltipContentProps) => {
  return <>{children}</>;
};