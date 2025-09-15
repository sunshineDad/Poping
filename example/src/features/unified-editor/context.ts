import React from 'react'

export interface UnifiedEditorContextValue {
  currentSessionId?: string
}

export const UnifiedEditorContext = React.createContext<UnifiedEditorContextValue>({})

