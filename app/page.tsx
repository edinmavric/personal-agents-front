'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Send, MessageSquare, MoreVertical, Loader2, Bot, CloudCog } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchAgents, fetchChatHistory, sendMessage, fetchUser, fetchAgent } from '@/lib/api';
import type { Agent } from '@/lib/data/agents';
import type { ChatMessage, User } from '@/lib/data/users';

const getGlowColorClass = (accent?: string): string => {
    switch (accent?.toLowerCase()) {
        case 'green':
            return 'bg-green-500';
        case 'blue':
            return 'bg-blue-500';
        case 'red':
            return 'bg-red-500';
        case 'yellow':
            return 'bg-yellow-500';
        case 'purple':
            return 'bg-purple-500';
        default:
            return 'bg-primary';
    }
};

const USER_ID = 1;

export default function Chat() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [allAgents, setAllAgents] = useState<Agent[]>([]);
    const [subscribedAgents, setSubscribedAgents] = useState<Agent[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
    const [isLoadingAgents, setIsLoadingAgents] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingAgents(true);
            setError(null);
            try {
                const [userDataResponse, fetchedAgentsResponse] = await Promise.all([
                    fetchUser(USER_ID),
                    fetchAgents()
                ]);

                const userData = userDataResponse as User | null;
                const fetchedAgents = (fetchedAgentsResponse as Agent[] | null) ?? [];

                setUser(userData);
                setAllAgents(fetchedAgents);

                console.log(allAgents)

                if (userData?.subscribed_agents && fetchedAgents.length > 0) {
                    const subAgents = fetchedAgents.filter(agent =>
                        userData.subscribed_agents.includes(agent.id)
                    );
                    setSubscribedAgents(subAgents);

                    const primaryAgent = subAgents.find(agent => agent.is_primary);
                    if (primaryAgent) {
                        setSelectedAgentId(primaryAgent.id);
                    } else if (subAgents.length > 0) {
                        setSelectedAgentId(subAgents[0].id);
                    } else {
                        setSelectedAgentId(null);
                    }
                } else {
                    setSubscribedAgents([]);
                    setSelectedAgentId(null);
                }

            } catch (err) {
                console.error('Failed to fetch initial data:', err);
                setError('Failed to load initial data. Please try again later.');
                setSubscribedAgents([]);
                setSelectedAgentId(null);
            } finally {
                setIsLoadingAgents(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedAgentId === null) {
            setMessages([]);
            setError(null);
            return;
        }

        const loadHistory = async () => {
            setIsLoadingHistory(true);
            setError(null);
            try {
                const history = await fetchChatHistory(
                    USER_ID,
                    selectedAgentId
                );
                setMessages(history as ChatMessage[]);
            } catch (err) {
                console.error('Failed to fetch chat history:', err);
                setError(
                    'Failed to load chat history. Please try again later.'
                );
                setMessages([]);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        loadHistory();
    }, [selectedAgentId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || selectedAgentId === null || isSending || isLoadingHistory) return;

        const userMessage: ChatMessage = {
            role: 'user',
            message: input,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsSending(true);
        setError(null);

        try {
            const agentResponse = await sendMessage(
                USER_ID,
                selectedAgentId,
                currentInput
            );
            setMessages(prev => [...prev, agentResponse as ChatMessage]);
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message. Please try again.');
            setMessages(prev => prev.filter(msg => msg !== userMessage));
            setInput(currentInput);
        } finally {
            setIsSending(false);
        }
    };

    const selectedAgent = subscribedAgents.find(agent => agent.id === selectedAgentId);
    const glowColorClass = getGlowColorClass(selectedAgent?.appearance?.accent);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <div className="w-80 border-r flex flex-col h-full shrink-0">
                <div className="h-14 border-b px-4 flex items-center justify-between shrink-0">
                    <h2 className="font-semibold text-lg">Chats</h2>
                </div>
                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-2">
                        {isLoadingAgents ? (
                            <div className="text-center text-muted-foreground py-4">Loading...</div>
                        ) : subscribedAgents.length > 0 ? (
                            subscribedAgents.map(agent => (
                                <Button
                                    key={agent.id}
                                    variant={selectedAgentId === agent.id ? 'secondary' : 'ghost'}
                                    className="w-full justify-start h-auto py-2 px-3 text-left"
                                    onClick={() => setSelectedAgentId(agent.id)}
                                >
                                    <Avatar className="h-8 w-8 mr-3">
                                        <AvatarImage src={agent.appearance?.iconInitial} alt={agent.name} />
                                        <AvatarFallback>
                                            <Bot size={16} />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-medium truncate text-sm">{agent.name}</span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {agent.description}
                                        </span>
                                    </div>
                                </Button>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-4">
                                No active chats. Visit the marketplace to subscribe to agents.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <div className="flex flex-col flex-1 h-screen overflow-hidden relative">
                {selectedAgent && (
                    <div
                        className={cn(
                            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                            'w-[600px] h-[600px]',
                            'rounded-full blur-3xl opacity-15 pointer-events-none',
                            'transition-colors duration-500 ease-in-out',
                            glowColorClass
                        )}
                        style={{ willChange: 'background-color, opacity' }}
                    />
                )}

                <div className="h-14 border-b flex items-center justify-between px-6 shrink-0 relative z-10 bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <Select
                            value={selectedAgentId !== null ? String(selectedAgentId) : undefined}
                            onValueChange={(value) => setSelectedAgentId(value ? parseInt(value, 10) : null)}
                            disabled={isLoadingAgents || subscribedAgents.length === 0}
                        >
                            <SelectTrigger className="w-[250px] h-9 pl-2 pr-3">
                                <SelectValue placeholder={isLoadingAgents ? "Loading agents..." : "Select a chat"}>
                                    {selectedAgent ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={selectedAgent.appearance?.iconInitial} alt={selectedAgent.name} />
                                                <AvatarFallback>
                                                    {selectedAgent.appearance?.iconInitial || <Bot size={12} />}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-sm truncate">{selectedAgent.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">
                                            {isLoadingAgents ? "Loading..." : "Select a chat"}
                                        </span>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {subscribedAgents.map((agent) => (
                                    <SelectItem key={agent.id} value={String(agent.id)}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={agent.appearance?.iconInitial} alt={agent.name} />
                                                <AvatarFallback>
                                                    {agent.appearance?.iconInitial || <Bot size={12} />}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{agent.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                                {subscribedAgents.length === 0 && !isLoadingAgents && (
                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                        No subscribed agents.
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto relative z-10">
                    <ScrollArea className="h-full">
                        <div className="max-w-3xl mx-auto p-6 space-y-6">
                            {isLoadingHistory ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                                </div>
                            ) : error && messages.length === 0 ? (
                                <div className="text-center py-20 text-destructive">
                                    {error}
                                </div>
                            ) : !selectedAgentId && !isLoadingAgents ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                    <MessageSquare
                                        className="h-12 w-12 text-muted-foreground mb-4"
                                        strokeWidth={1.5}
                                    />
                                    <h3 className="text-xl font-medium">Select a chat</h3>
                                    <p className="text-muted-foreground mt-2 max-w-md">
                                        Choose an agent from the sidebar or header dropdown to start chatting.
                                    </p>
                                </div>
                            ) : messages.length === 0 && !isLoadingHistory ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                    <MessageSquare
                                        className="h-12 w-12 text-muted-foreground mb-4"
                                        strokeWidth={1.5}
                                    />
                                    <h3 className="text-xl font-medium">
                                        {`Start chatting with ${selectedAgent?.name || 'agent'}`}
                                    </h3>
                                    <p className="text-muted-foreground mt-2 max-w-md">
                                        Ask any question or start chatting to get assistance.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((message, index) => (
                                        <div
                                            key={message.timestamp + '-' + index}
                                            className={cn(
                                                'flex items-start',
                                                message.role === 'user'
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            )}
                                        >
                                            {message.role === 'assistant' && selectedAgent && (
                                                <Avatar className="h-7 w-7 mr-2 shrink-0 mt-1">
                                                    <AvatarImage src={selectedAgent.appearance?.iconInitial} alt={selectedAgent.name} />
                                                    <AvatarFallback>
                                                        {selectedAgent.appearance?.iconInitial || <Bot size={14} />}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div
                                                className={cn(
                                                    'rounded-lg p-3 max-w-[85%] shadow-sm text-sm',
                                                    message.role === 'user'
                                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                        : 'bg-card rounded-tl-none border'
                                                )}
                                            >
                                                <div className="whitespace-pre-wrap break-words">
                                                    {message.message}
                                                </div>
                                                {message.timestamp && (
                                                    <div
                                                        className={cn(
                                                            'text-xs mt-1.5 text-right',
                                                            message.role === 'user'
                                                                ? 'text-primary-foreground/80'
                                                                : 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {new Date(
                                                            message.timestamp
                                                        ).toLocaleTimeString(
                                                            'en-US',
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            }
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <div className="border-t p-4 bg-background shrink-0 relative z-10">
                    {error && !isLoadingHistory && messages.length > 0 && (
                        <p className="text-xs text-destructive text-center mb-2">{error}</p>
                    )}
                    <form
                        onSubmit={handleSubmit}
                        className="max-w-3xl mx-auto flex items-end space-x-2"
                    >
                        <Textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={
                                selectedAgentId === null
                                    ? 'Select a chat to start...'
                                    : `Message ${selectedAgent?.name || 'agent'}...`
                            }
                            className="flex-1 min-h-[48px] max-h-40 resize-none"
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            disabled={selectedAgentId === null || isSending || isLoadingAgents || isLoadingHistory}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!input.trim() || selectedAgentId === null || isSending || isLoadingAgents || isLoadingHistory}
                            className="h-12 w-12"
                        >
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
