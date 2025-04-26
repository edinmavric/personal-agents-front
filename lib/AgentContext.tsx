'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Agent {
    id: string | number;
    name: string;
    description?: string;
}

interface AgentContextType {
    selectedAgent: Agent | null;
    setSelectedAgent: (agent: Agent | null) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider = ({ children }: { children: ReactNode }) => {
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

    return (
        <AgentContext.Provider value={{ selectedAgent, setSelectedAgent }}>
            {children}
        </AgentContext.Provider>
    );
};

export function useAgent() {
    const context = useContext(AgentContext);
    if (!context) {
        throw new Error('useAgent must be used within an AgentProvider');
    }
    return context;
}
