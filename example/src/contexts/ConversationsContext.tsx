import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock data types
export interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  preview?: string;
}

interface ConversationsContextType {
  conversations: Conversation[];
  loadConversations: (limit?: number, filters?: any) => Promise<void>;
  recentDirectories: Record<string, { lastDate: string; shortname: string; }>;
  getMostRecentWorkingDirectory: () => string;
}

const ConversationsContext = createContext<ConversationsContextType>({
  conversations: [],
  loadConversations: async () => {},
  recentDirectories: {},
  getMostRecentWorkingDirectory: () => './',
});

// Mock data
const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Python backend integration',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    preview: 'Discussion about integrating Python backend with Claude Code',
  },
  {
    id: '2', 
    title: 'UI component extraction',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    preview: 'Extracting Home page components as standalone project',
  },
  {
    id: '3',
    title: 'Database optimization',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    preview: 'Optimizing PostgreSQL queries for better performance',
  },
];

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [recentDirectories] = useState<Record<string, { lastDate: string; shortname: string; }>>({
    '/Users/bytedance/Downloads/cui-main/cui-home-standalone': {
      lastDate: new Date().toISOString(),
      shortname: 'cui-home-standalone'
    },
    '/Users/bytedance/Downloads/cui-main': {
      lastDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      shortname: 'cui-main'
    },
    '/Users/bytedance/Projects': {
      lastDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      shortname: 'Projects'
    },
  });

  const loadConversations = async (limit = 20, filters?: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setConversations(mockConversations.slice(0, limit));
  };

  const getMostRecentWorkingDirectory = () => {
    const directories = Object.keys(recentDirectories);
    if (directories.length === 0) return './';
    
    // Sort by lastDate and return the most recent one
    const mostRecent = directories.sort((a, b) => 
      new Date(recentDirectories[b].lastDate).getTime() - 
      new Date(recentDirectories[a].lastDate).getTime()
    )[0];
    
    return mostRecent || './';
  };

  useEffect(() => {
    // Load initial conversations
    loadConversations();
  }, []);

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        loadConversations,
        recentDirectories,
        getMostRecentWorkingDirectory,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export const useConversations = () => {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
};