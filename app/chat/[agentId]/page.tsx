'use client';

import { useEffect, useState } from 'react';
import Chat from '@/components/Chat';
import { useRouter } from 'next/navigation';
import { agentsData } from '@/components/custom/agentsMockData';

export default function ChatPage({ params }: { params: { agentId: string } }) {
  const [agent, setAgent] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const foundAgent = agentsData.find(agent => agent.id === params.agentId);
    if (foundAgent) {
      setAgent(foundAgent);
    } else {
      router.push('/marketplace'); // Redirect if agent not found
    }
  }, [params.agentId, router]);

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading agent...</div>
      </div>
    );
  }

  return <Chat agent={agent} />;
}
