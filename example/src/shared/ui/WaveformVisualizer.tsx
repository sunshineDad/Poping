import React from 'react'

interface Props { isRecording?: boolean; level?: number }

export function WaveformVisualizer({ isRecording = false, level = 0 }: Props) {
  const bars = Array.from({ length: 24 });
  return (
    <div className="flex items-end gap-0.5 h-8">
        {bars.map((_, i) => {
          const h = Math.max(
            2,
            (Math.sin((i + (isRecording ? Date.now() / 80 : 0)) / 3) + 1) * 12 + level * 16
          );
          return (
            <div
              key={i}
              className="w-0.5 bg-primary/70 rounded-sm"
              style={{ height: `${h}px` }}
            />
          );
        })}
    </div>
  )
}
