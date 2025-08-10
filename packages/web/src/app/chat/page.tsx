'use client';

import { ChatInterface } from '@/components/chat/chat-interface';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for chat history (only for authenticated users) */}
      {user && (
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ChatSidebar
            selectedSessionId={selectedSessionId}
            onSessionSelect={setSelectedSessionId}
          />
        </div>
      )}
      
      {/* Main chat interface */}
      <div className="flex-1 flex flex-col">
        <ChatInterface sessionId={selectedSessionId} />
      </div>
    </div>
  );
}