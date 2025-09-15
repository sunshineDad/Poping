import React, { useState } from 'react';
import { ChevronDown, MessageCircle, Layout } from 'lucide-react';

export interface ModeSelectorProps {
  mode: 'conversation' | 'canvas';
  onModeChange: (mode: 'conversation' | 'canvas') => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onModeChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const modes = [
    {
      value: 'conversation' as const,
      label: 'Conversation',
      icon: MessageCircle,
      description: 'Chat with Claude',
    },
    {
      value: 'canvas' as const,
      label: 'Canvas',
      icon: Layout,
      description: 'Visual workspace',
    },
  ];

  const currentMode = modes.find(m => m.value === mode) || modes[0];

  const handleModeSelect = (selectedMode: 'conversation' | 'canvas') => {
    onModeChange(selectedMode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Mode Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-8 px-2 text-muted-foreground hover:bg-muted/50 rounded-full"
      >
        <span className="flex items-center gap-1.5">
          <currentMode.icon className="h-4 w-4" />
          <span className="block max-w-[128px] overflow-hidden text-ellipsis whitespace-nowrap">
            {currentMode.label}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-300 shadow-lg z-50 w-48">
          <div className="py-1">
            {modes.map((modeOption) => (
              <button
                key={modeOption.value}
                onClick={() => handleModeSelect(modeOption.value)}
                className={`
                  w-full flex items-start gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors
                  ${mode === modeOption.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                `}
              >
                <modeOption.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{modeOption.label}</span>
                  <span className="text-xs text-gray-500">{modeOption.description}</span>
                </div>
                {mode === modeOption.value && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};