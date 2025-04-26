'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    Send,
    MessageSquare,
    MoreVertical,
    Loader2,
    Bot,
} from 'lucide-react';
import {
    fetchAgents,
    fetchChatHistory,
    sendMessage,
    fetchUserById,
    fetchAgentById,
} from '@/lib/api';
import type { Agent } from '@/lib/data/agents';
import type { ChatMessage, User } from '@/lib/data/users';
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarTrigger,
} from '@/components/ui/sidebar';

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

const AgentSkeleton = () => (
    <div className="flex items-center space-x-3 p-3 h-[60px]">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
        </div>
    </div>
);

const MessageSkeleton = ({ isUser = false }: { isUser?: boolean }) => (
    <div className={cn('flex items-start gap-2.5', isUser && 'justify-end')}>
        {!isUser && <Skeleton className="h-7 w-7 rounded-full shrink-0 mt-1" />}
        <div
            className={cn(
                'flex flex-col w-full max-w-[320px] leading-1.5 p-3 border-gray-200 rounded-lg dark:border-gray-700',
                isUser
                    ? 'bg-primary/20 rounded-tr-none'
                    : 'bg-card rounded-tl-none'
            )}
        >
            <Skeleton className="h-4 w-3/4 mb-1.5" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-3 w-1/4 self-end" />
        </div>
    </div>
);

export default function Chat() {
    const [input, setInput] = useState('');
    const [contextInput, setContextInput] = useState('');
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

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingAgents(true);
            setError(null);
            setMessages([]);
            try {
                const [userDataResponse, fetchedAgentsResponse] =
                    await Promise.all([fetchUserById(USER_ID), fetchAgents()]);

                const userData = userDataResponse as User | null;
                const fetchedAgents =
                    (fetchedAgentsResponse && Array.isArray((fetchedAgentsResponse as any).results)
                        ? (fetchedAgentsResponse as any).results
                        : []) as Agent[];

                setUser(userData);
                setAllAgents(fetchedAgents);

                if (userData?.subscribed_agents && fetchedAgents.length > 0) {
                    const subAgents = fetchedAgents.filter(agent =>
                        userData.subscribed_agents.includes(agent.id)
                    );
                    setSubscribedAgents(subAgents);

                    const primaryAgent = subAgents.find(
                        agent => agent.is_primary
                    );
                    const initialAgentId = primaryAgent
                        ? primaryAgent.id
                        : subAgents.length > 0
                        ? subAgents[0].id
                        : null;

                    setSelectedAgentId(initialAgentId);
                } else {
                    setSubscribedAgents([]);
                    setSelectedAgentId(null);
                }
            } catch (err) {
                console.error('Failed to fetch initial data:', err);
                setError(
                    'Failed to load initial data. Please try again later.'
                );
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
            setIsLoadingHistory(false);
            return;
        }

        const loadHistory = async () => {
            setIsLoadingHistory(true);
            setError(null);
            setMessages([]);
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
    }, [messages, scrollToBottom]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !input.trim() ||
            selectedAgentId === null ||
            isSending ||
            isLoadingHistory ||
            isLoadingAgents
        )
            return;

        const userMessage: ChatMessage = {
            role: 'user',
            message: input,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        const currentContext = contextInput;
        setInput('');
        setIsSending(true);
        setError(null);

        try {
            const agentResponse = await sendMessage(
                USER_ID,
                selectedAgentId,
                currentInput,
                currentContext
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

    const handleUpdateContext = () => {
        console.log('Updating context (placeholder):', contextInput);
        toast.success('Context updated (placeholder)');
        setContextInput('');
    };
    const selectedAgent = subscribedAgents.find(
        agent => agent.id === selectedAgentId
    );
    const glowColorClass = getGlowColorClass(selectedAgent?.appearance?.accent);

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden bg-background relative">
                <Toaster richColors />
                <Sidebar
                    side="left"
                    variant="sidebar"
                    collapsible="none"
                    className="z-20 border-r bg-background w-80 shrink-0"
                >
                    <SidebarHeader>
                        <span className="font-semibold text-lg mt-2 pl-3">
                            Agents
                        </span>
                    </SidebarHeader>
                    <SidebarContent className="px-4">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <div className="space-y-2">
                                    {isLoadingAgents ? (
                                        <>
                                            <AgentSkeleton />
                                            <AgentSkeleton />
                                            <AgentSkeleton />
                                        </>
                                    ) : subscribedAgents.length > 0 ? (
                                        subscribedAgents.map(agent => (
                                            <Button
                                                key={agent.id}
                                                variant={
                                                    selectedAgentId === agent.id
                                                        ? 'secondary'
                                                        : 'ghost'
                                                }
                                                className="w-full justify-start h-auto py-2 px-3 text-left"
                                                onClick={() =>
                                                    setSelectedAgentId(agent.id)
                                                }
                                                disabled={isLoadingHistory}
                                            >
                                                <Avatar className="h-8 w-8 mr-3 shrink-0">
                                                    <AvatarImage
                                                        src={
                                                            agent.appearance
                                                                ?.iconInitial
                                                        }
                                                        alt={agent.name}
                                                    />
                                                    <AvatarFallback>
                                                        <Bot size={16} />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="font-medium truncate text-sm">
                                                        {agent.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground truncate">
                                                        {agent.description}
                                                    </span>
                                                </div>
                                            </Button>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted-foreground py-4 px-2">
                                            No active chats. Visit the
                                            marketplace to subscribe to agents.
                                        </div>
                                    )}
                                </div>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>

                <main className="flex flex-col flex-1 h-screen overflow-hidden relative">
                    {selectedAgent && (
                        <div
                            className={cn(
                                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                                'w-[600px] h-[600px] max-w-full max-h-full',
                                'rounded-full blur-3xl opacity-15 pointer-events-none',
                                'transition-colors duration-500 ease-in-out',
                                glowColorClass
                            )}
                            style={{ willChange: 'background-color, opacity' }}
                            aria-hidden="true"
                        />
                    )}
                    <header className="h-14 border-b flex items-center justify-between px-4 md:px-6 shrink-0 relative z-10 bg-background backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger side="left" />
                            {selectedAgent ? (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage
                                            src={
                                                selectedAgent.appearance
                                                    ?.iconInitial
                                            }
                                            alt={selectedAgent.name}
                                        />
                                        <AvatarFallback>
                                            {selectedAgent.appearance?.iconInitial?.[0]?.toUpperCase() || (
                                                <Bot size={12} />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm truncate hidden sm:inline">
                                        {selectedAgent.name}
                                    </span>
                                </div>
                            ) : !isLoadingAgents ? (
                                <span className="text-sm text-muted-foreground">
                                    Select a chat
                                </span>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-7 w-7 rounded-full" />
                                    <Skeleton className="h-4 w-24 hidden sm:inline" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1 md:gap-2 ml-auto">
                            <ThemeToggle />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="More options"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() =>
                                            toast.info(
                                                'Clear chat action (not implemented)'
                                            )
                                        }
                                        disabled={
                                            !selectedAgentId ||
                                            messages.length === 0
                                        }
                                    >
                                        Clear Chat
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            toast.info(
                                                'Agent info action (not implemented)'
                                            )
                                        }
                                        disabled={!selectedAgentId}
                                    >
                                        Agent Info
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <SidebarTrigger side="right" />
                        </div>
                    </header>

                    <div className="flex-1 overflow-auto relative z-10">
                        <ScrollArea className="h-full">
                            <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
                                {isLoadingHistory ? (
                                    <div className="space-y-6 pt-4">
                                        <MessageSkeleton isUser={false} />
                                        <MessageSkeleton isUser={true} />
                                        <MessageSkeleton isUser={false} />
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
                                        <h3 className="text-xl font-medium">
                                            Select a chat
                                        </h3>
                                        <p className="text-muted-foreground mt-2 max-w-md">
                                            Choose an agent from the sidebar to
                                            start chatting.
                                        </p>
                                    </div>
                                ) : messages.length === 0 &&
                                  !isLoadingHistory ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                        <MessageSquare
                                            className="h-12 w-12 text-muted-foreground mb-4"
                                            strokeWidth={1.5}
                                        />
                                        <h3 className="text-xl font-medium">
                                            {`Start chatting with ${
                                                selectedAgent?.name || 'agent'
                                            }`}
                                        </h3>
                                        <p className="text-muted-foreground mt-2 max-w-md">
                                            Ask any question or start chatting
                                            to get assistance.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message, index) => (
                                            <div
                                                key={
                                                    message.timestamp +
                                                    '-' +
                                                    index
                                                }
                                                className={cn(
                                                    'flex items-start gap-2',
                                                    message.role === 'user'
                                                        ? 'justify-end'
                                                        : 'justify-start'
                                                )}
                                            >
                                                {message.role === 'assistant' &&
                                                    selectedAgent && (
                                                        <Avatar className="h-7 w-7 mr-1 shrink-0 mt-1">
                                                            <AvatarImage
                                                                src={
                                                                    selectedAgent
                                                                        .appearance
                                                                        ?.iconInitial
                                                                }
                                                                alt={
                                                                    selectedAgent.name
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {selectedAgent.appearance?.iconInitial?.[0]?.toUpperCase() || (
                                                                    <Bot
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                <div
                                                    className={cn(
                                                        'rounded-lg p-3 max-w-[85%] shadow-sm text-sm relative group',
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
                                                                message.role ===
                                                                    'user'
                                                                    ? 'text-primary-foreground/80'
                                                                    : 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {new Date(
                                                                message.timestamp
                                                            ).toLocaleTimeString(
                                                                [],
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
                                        <div
                                            ref={messagesEndRef}
                                            className="h-px"
                                        />
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="border-t p-4 bg-background shrink-0 relative z-10">
                        {error && !isLoadingHistory && messages.length > 0 && (
                            <p className="text-xs text-destructive text-center mb-2">
                                {error}
                            </p>
                        )}
                        <form
                            onSubmit={handleSubmit}
                            className="max-w-3xl mx-auto flex items-end space-x-2"
                        >
                            <Textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={
                                    !selectedAgentId && !isLoadingAgents
                                        ? 'Select a chat to start...'
                                        : isLoadingHistory
                                        ? 'Loading history...'
                                        : `Message ${
                                              selectedAgent?.name || 'agent'
                                          }...`
                                }
                                className="flex-1 min-h-[48px] max-h-40 resize-none"
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                disabled={
                                    !selectedAgentId ||
                                    isSending ||
                                    isLoadingAgents ||
                                    isLoadingHistory
                                }
                                rows={1}
                                aria-label="Chat message input"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={
                                    !input.trim() ||
                                    !selectedAgentId ||
                                    isSending ||
                                    isLoadingAgents ||
                                    isLoadingHistory
                                }
                                className="h-12 w-12 shrink-0"
                                aria-label="Send message"
                            >
                                {isSending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </form>
                    </div>
                </main>

                <Sidebar
                    side="right"
                    variant="sidebar"
                    collapsible="none"
                    className="z-20 border-l bg-background w-80 shrink-0"
                >
                    <SidebarHeader>
                        <span className="font-semibold text-lg mt-2 pl-3">
                            Context
                        </span>
                    </SidebarHeader>
                    <SidebarContent className="px-4">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <div className="flex flex-col gap-4 h-full">
                                    <p className="text-sm text-muted-foreground">
                                        Add relevant information here. This
                                        context might be sent along with your
                                        messages to help the agent understand
                                        your needs better.
                                    </p>
                                    <Textarea
                                        value={contextInput}
                                        onChange={e =>
                                            setContextInput(e.target.value)
                                        }
                                        placeholder="Example: Project details, user preferences, background info..."
                                        className="flex-1 min-h-[200px] resize-none"
                                        aria-label="Context input area"
                                    />
                                    <Button
                                        className="w-full mt-auto"
                                        variant="secondary"
                                        onClick={handleUpdateContext}
                                    >
                                        Update Context
                                    </Button>
                                </div>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
            </div>
        </SidebarProvider>
    );
}
