import React from 'react';

interface CollapsibleProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

const CollapsibleContext = React.createContext<{
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}>({ open: false });

export function Collapsible({ children, open = false, onOpenChange }: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = React.useState(open);
  const currentOpen = open !== undefined ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <CollapsibleContext.Provider value={{ open: currentOpen, onOpenChange: handleOpenChange }}>
      {children}
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger({ children, className, asChild }: CollapsibleTriggerProps) {
  const { open, onOpenChange } = React.useContext(CollapsibleContext);

  if (asChild) {
    return (
      <div onClick={() => onOpenChange?.(!open)} className={className}>
        {children}
      </div>
    );
  }

  return (
    <button
      className={className}
      onClick={() => onOpenChange?.(!open)}
    >
      {children}
    </button>
  );
}

export function CollapsibleContent({ children, className }: CollapsibleContentProps) {
  const { open } = React.useContext(CollapsibleContext);

  if (!open) {
    return null;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
}