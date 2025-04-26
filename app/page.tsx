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
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    Send,
    MessageSquare,
    MoreVertical,
    Loader2,
    Bot,
    Mic,
    Users,
    X,
} from 'lucide-react';
import {
    fetchAgents,
    fetchChatHistory,
    sendMessage,
    fetchUserById,
    fetchUserAgentSubscriptions,
    postAgentsMergeQuery,
    fetchUserContext,
    saveUserContext,
    fetchUnreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    fetchNotifications,
} from '@/lib/api';
import type { Agent, ChatMessage, ApiUser, Notification } from '@/lib/api';
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import VoiceComponent from '@/components/VoiceComponent';
import NotificationBell from '@/components/custom/NotificationBell';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAgent } from '@/lib/AgentContext';
import Link from 'next/link';

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

const getAgentGradientColor = (appearance?: Agent['appearance']): string => {
    if (
        appearance?.bgColor &&
        /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(appearance.bgColor)
    ) {
        return appearance.bgColor;
    }
    switch (appearance?.accent?.toLowerCase()) {
        case 'green':
            return '#22c55e';
        case 'blue':
            return '#3b82f6';
        case 'red':
            return '#ef4444';
        case 'yellow':
            return '#eab308';
        case 'purple':
            return '#a855f7';
        default:
            return '#6366f1';
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
    const [user, setUser] = useState<ApiUser | null>(null);
    const [selectedAgentId, setSelectedAgentId] = useState<number | null>(1);
    const [isLoadingAgents, setIsLoadingAgents] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isSavingContext, setIsSavingContext] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isMergeMode, setIsMergeMode] = useState(false);
    const [selectedMergeAgentIds, setSelectedMergeAgentIds] = useState<
        Set<number>
    >(new Set());
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const { setSelectedAgent } = useAgent();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const getAgentColors = (
        ids: number[]
    ): { name: string; colorClass: string }[] => {
        return ids
            .map(id => {
                const agent = allAgents.find(agent => agent.id === id);
                return agent
                    ? {
                          name: agent.name,
                          colorClass: getGlowColorClass(
                              agent.appearance?.accent
                          ),
                      }
                    : null;
            })
            .filter(Boolean) as { name: string; colorClass: string }[];
    };

    const fetchAndSetNotifications = useCallback(
        async (showLoading = false) => {
            if (showLoading) setIsLoadingNotifications(true);
            try {
                const allNotifsResponse = await fetchNotifications();
                const unreadNotifsResponse = await fetchUnreadNotifications();

                const sortedNotifications = (
                    allNotifsResponse.results || []
                ).sort(
                    (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                );

                setNotifications(sortedNotifications);
                setUnreadNotificationCount(unreadNotifsResponse.count || 0);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            } finally {
                if (showLoading) setIsLoadingNotifications(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchAndSetNotifications(true);

        notificationIntervalRef.current = setInterval(() => {
            fetchAndSetNotifications(false);
        }, 30000);

        return () => {
            if (notificationIntervalRef.current) {
                clearInterval(notificationIntervalRef.current);
            }
        };
    }, [fetchAndSetNotifications]);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingAgents(true);
            setError(null);
            setMessages([]);
            setIsMergeMode(false);
            setSelectedMergeAgentIds(new Set());
            try {
                const [
                    userDataResponse,
                    fetchedAgentsResponse,
                    subscriptionsResponse,
                    userContextResponse,
                ] = await Promise.all([
                    fetchUserById(USER_ID),
                    fetchAgents(),
                    fetchUserAgentSubscriptions(),
                    fetchUserContext(USER_ID),
                ]);

                const userData = userDataResponse as ApiUser | null;
                const allFetchedAgents = (
                    fetchedAgentsResponse?.results &&
                    Array.isArray(fetchedAgentsResponse.results)
                        ? fetchedAgentsResponse.results
                        : []
                ) as Agent[];

                setUser(userData);
                setAllAgents(allFetchedAgents);

                const subscriptions = subscriptionsResponse?.results || [];
                const subscribedAgentIds = new Set(
                    subscriptions.map(sub => sub.agent)
                );

                const subAgents = allFetchedAgents.filter(agent =>
                    subscribedAgentIds.has(agent.id)
                );

                subAgents.forEach(agent => {
                    if (!agent.appearance) {
                        agent.appearance = {
                            iconInitial: agent.name.charAt(0).toUpperCase(),
                        };
                    }
                });

                setSubscribedAgents(subAgents);

                console.log('Subscribed agents:', subAgents);

                if (subAgents.length > 0 && !isMergeMode) {
                    const primaryAgent = subAgents.find(
                        agent => agent.is_primary
                    );
                    const initialAgentId = primaryAgent
                        ? primaryAgent.id
                        : subAgents[0].id;

                    setSelectedAgentId(initialAgentId);
                } else {
                    console.log('No subscribed agents found or in merge mode.');
                    setSelectedAgentId(null);
                }

                if (userContextResponse) {
                    setContextInput(userContextResponse);
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
        if (isMergeMode || selectedAgentId === null) {
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
                setMessages(Array.isArray(history) ? history : []);
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
    }, [selectedAgentId, isMergeMode]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleAgentSelection = (agentId: number) => {
        const agent =
            subscribedAgents.find(a => a.id === agentId) ||
            allAgents.find(a => a.id === agentId);
        if (agent) {
            setSelectedAgent(agent);
        }
        if (isMergeMode) {
            setSelectedMergeAgentIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(agentId)) {
                    newSet.delete(agentId);
                } else {
                    newSet.add(agentId);
                }
                return newSet;
            });
            setSelectedAgentId(null);
        } else {
            setSelectedAgentId(agentId);
            setSelectedMergeAgentIds(new Set());
        }
    };

    const toggleMergeMode = () => {
        setIsMergeMode(!isMergeMode);
        setSelectedAgentId(null);
        setMessages([]);
        setError(null);
        if (!isMergeMode) {
            setSelectedMergeAgentIds(new Set());
        } else {
            if (subscribedAgents.length > 0) {
                setSelectedAgentId(subscribedAgents[0].id);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending || isLoadingAgents || isLoadingHistory)
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
            if (isMergeMode && selectedMergeAgentIds.size > 1) {
                const agentIdsArray = Array.from(selectedMergeAgentIds);
                const mergeResponse = await postAgentsMergeQuery({
                    agent_ids: agentIdsArray,
                    query: currentInput,
                });

                if (mergeResponse && mergeResponse.response) {
                    const assistantMessage: ChatMessage = {
                        role: 'assistant',
                        message: mergeResponse.response,
                        timestamp: new Date().toISOString(),
                        mergedAgentIds: agentIdsArray,
                    };
                    setMessages(prev => [...prev, assistantMessage]);
                } else {
                    throw new Error(
                        'Failed to get response from merged agents.'
                    );
                }
            } else if (!isMergeMode && selectedAgentId !== null) {
                const agentResponse = await sendMessage(
                    selectedAgentId,
                    currentInput,
                    currentContext
                );

                if (agentResponse) {
                    setMessages(prev => [
                        ...prev,
                        agentResponse as ChatMessage,
                    ]);
                } else {
                    throw new Error('Failed to get response from agent.');
                }
            } else {
                setError(
                    isMergeMode
                        ? 'Please select at least two agents for merging.'
                        : 'Please select an agent.'
                );
                setMessages(prev => prev.filter(msg => msg !== userMessage));
                setInput(currentInput);
            }
        } catch (err) {
            console.error('Failed to process message:', err);
            setError('Failed to send message. Please try again.');
            setMessages(prev => prev.filter(msg => msg !== userMessage));
            setInput(currentInput);
        } finally {
            setIsSending(false);
        }
    };

    const handleUpdateContext = async () => {
        if (!user || isSavingContext) return;

        setIsSavingContext(true);
        const success = await saveUserContext(user.id, contextInput);
        setIsSavingContext(false);

        if (success) {
            toast.success('Context saved successfully!');
        } else {
            toast.error('Failed to save context. Please try again.');
        }
    };

    const handleMarkRead = async (id: number) => {
        const notification = notifications.find(n => n.id === id);
        if (!notification || notification.is_read) return;

        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));

        const result = await markNotificationAsRead(id);
        if (!result) {
            toast.error('Failed to mark notification as read.');
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, is_read: false } : n))
            );
            setUnreadNotificationCount(prev => prev + 1);
        }
    };

    const handleMarkAllRead = async () => {
        if (unreadNotificationCount === 0) return;

        const previouslyUnreadIds = new Set(
            notifications.filter(n => !n.is_read).map(n => n.id)
        );

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadNotificationCount(0);

        const result = await markAllNotificationsAsRead();
        if (!result.success) {
            toast.error('Failed to mark all notifications as read.');
            setNotifications(prev =>
                prev.map(n =>
                    previouslyUnreadIds.has(n.id) ? { ...n, is_read: false } : n
                )
            );
            setUnreadNotificationCount(previouslyUnreadIds.size);
        }
    };

    const selectedAgent = !isMergeMode
        ? subscribedAgents.find(agent => agent.id === selectedAgentId)
        : null;

    const glowGradientColor = getAgentGradientColor(selectedAgent?.appearance);

    const canSubmit = isMergeMode
        ? input.trim() && selectedMergeAgentIds.size > 1
        : input.trim() && selectedAgentId !== null;

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
                    <SidebarHeader className="flex items-center justify-between pr-3">
                        <span className="font-semibold text-lg mt-2 pl-3">
                            {isMergeMode ? 'Select Agents to Merge' : 'Agents'}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMergeMode}
                            title={
                                isMergeMode
                                    ? 'Exit Merge Mode'
                                    : 'Enter Merge Mode'
                            }
                            className="mt-1"
                        >
                            {isMergeMode ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <Users className="h-4 w-4" />
                            )}
                        </Button>
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
                                            <div
                                                key={agent.id}
                                                className="flex items-center space-x-2"
                                            >
                                                {isMergeMode && (
                                                    <Checkbox
                                                        id={`agent-checkbox-${agent.id}`}
                                                        checked={selectedMergeAgentIds.has(
                                                            agent.id
                                                        )}
                                                        onCheckedChange={() =>
                                                            handleAgentSelection(
                                                                agent.id
                                                            )
                                                        }
                                                        className="ml-1"
                                                        aria-label={`Select agent ${agent.name} for merging`}
                                                    />
                                                )}
                                                <Button
                                                    variant={
                                                        !isMergeMode &&
                                                        selectedAgentId ===
                                                            agent.id
                                                            ? 'secondary'
                                                            : 'ghost'
                                                    }
                                                    className={cn(
                                                        'w-full justify-start h-auto py-2 text-left',
                                                        isMergeMode
                                                            ? 'pl-2'
                                                            : 'pl-3'
                                                    )}
                                                    onClick={() =>
                                                        handleAgentSelection(
                                                            agent.id
                                                        )
                                                    }
                                                    disabled={
                                                        isLoadingHistory &&
                                                        !isMergeMode
                                                    }
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
                                                            {agent.appearance?.iconInitial?.[0]?.toUpperCase() || (
                                                                <Bot
                                                                    size={16}
                                                                />
                                                            )}
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
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted-foreground py-4 px-2">
                                            No agents subscribed. Visit the
                                            marketplace.
                                        </div>
                                    )}
                                </div>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>

                <main className="flex flex-col flex-1 h-screen overflow-hidden relative">
                    {selectedAgent && !isMergeMode && (
                        <div
                            className={cn(
                                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                                'w-[600px] h-[600px] max-w-full max-h-full',
                                'rounded-full blur-3xl opacity-15 pointer-events-none',
                                'transition-colors duration-500 ease-in-out'
                            )}
                            style={{
                                willChange: 'background-color, opacity',
                                background: `radial-gradient(circle at 50% 50%, ${glowGradientColor} 0%, transparent 70%)`,
                            }}
                            aria-hidden="true"
                        />
                    )}
                    <header className="h-14 border-b flex items-center justify-between px-4 md:px-6 shrink-0 relative z-10 bg-background backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger side="left" />
                            {isMergeMode ? (
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium text-sm truncate hidden sm:inline">
                                        Merge Mode ({selectedMergeAgentIds.size}{' '}
                                        selected)
                                    </span>
                                </div>
                            ) : selectedAgent ? (
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
                                    {isMergeMode
                                        ? 'Select agents to merge'
                                        : 'Select a chat'}
                                </span>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-7 w-7 rounded-full" />
                                    <Skeleton className="h-4 w-24 hidden sm:inline" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1 md:gap-2 ml-auto">
                            <Link
                                href="/dashboard"
                                className="text-sm font-medium px-3 py-2 rounded hover:bg-muted transition-colors"
                                style={{ textDecoration: 'none' }}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/marketplace"
                                className="text-sm font-medium px-3 py-2 rounded hover:bg-muted transition-colors"
                                style={{ textDecoration: 'none' }}
                            >
                                Marketplace
                            </Link>
                            {/* <Link
                                href="/shopping-comparison"
                                className="text-sm font-medium px-3 py-2 rounded hover:bg-muted transition-colors"
                                style={{ textDecoration: 'none' }}
                            >
                                Shopping
                            </Link> */}
                            <NotificationBell
                                notifications={notifications}
                                unreadCount={unreadNotificationCount}
                                onMarkRead={handleMarkRead}
                                onMarkAllRead={handleMarkAllRead}
                                isLoading={isLoadingNotifications}
                            />
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
                                            messages.length === 0 || isMergeMode
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
                                        disabled={
                                            !selectedAgentId || isMergeMode
                                        }
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
                                {isLoadingHistory && !isMergeMode ? (
                                    <div className="space-y-6 pt-4">
                                        <MessageSkeleton isUser={false} />
                                        <MessageSkeleton isUser={true} />
                                        <MessageSkeleton isUser={false} />
                                    </div>
                                ) : error && messages.length === 0 ? (
                                    <div className="text-center py-20 text-destructive">
                                        {error}
                                    </div>
                                ) : !selectedAgentId &&
                                  !isMergeMode &&
                                  !isLoadingAgents ? (
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
                                            start chatting or enter Merge Mode.
                                        </p>
                                    </div>
                                ) : isMergeMode &&
                                  selectedMergeAgentIds.size < 2 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                        <Users
                                            className="h-12 w-12 text-muted-foreground mb-4"
                                            strokeWidth={1.5}
                                        />
                                        <h3 className="text-xl font-medium">
                                            Merge Mode
                                        </h3>
                                        <p className="text-muted-foreground mt-2 max-w-md">
                                            Select at least two agents from the
                                            sidebar to merge their capabilities
                                            for your query.
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
                                            {isMergeMode
                                                ? `Query Merged Agents (${selectedMergeAgentIds.size})`
                                                : `Start chatting with ${
                                                      selectedAgent?.name ||
                                                      'agent'
                                                  }`}
                                        </h3>
                                        <p className="text-muted-foreground mt-2 max-w-md">
                                            {isMergeMode
                                                ? 'Ask a question using the combined knowledge of the selected agents.'
                                                : 'Ask any question or start chatting to get assistance.'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message, index) => (
                                            <div
                                                key={`${message.timestamp}-${message.role}-${index}`}
                                                className={cn(
                                                    'flex items-start gap-2',
                                                    message.role === 'user'
                                                        ? 'justify-end'
                                                        : 'justify-start'
                                                )}
                                            >
                                                {message.role === 'assistant' &&
                                                    !message.mergedAgentIds &&
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
                                                {message.role === 'assistant' &&
                                                    message.mergedAgentIds && (
                                                        <Avatar className="h-7 w-7 mr-1 shrink-0 mt-1 bg-muted rounded-full flex items-center justify-center">
                                                            <Users
                                                                size={14}
                                                                className="text-muted-foreground"
                                                            />
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
                                                    {message.role ===
                                                        'assistant' &&
                                                        message.mergedAgentIds && (
                                                            <div className="mb-2 border-b pb-1.5 flex flex-wrap gap-1 items-center">
                                                                <span className="text-xs font-medium text-muted-foreground mr-1">
                                                                    Merged:
                                                                </span>
                                                                {getAgentColors(
                                                                    message.mergedAgentIds
                                                                ).map(
                                                                    agentInfo => (
                                                                        <Badge
                                                                            key={
                                                                                agentInfo.name
                                                                            }
                                                                            variant="outline"
                                                                            className={cn(
                                                                                'text-xs border-none px-1.5 py-0.5',
                                                                                agentInfo.colorClass.replace(
                                                                                    'bg-',
                                                                                    'text-'
                                                                                )
                                                                            )}
                                                                            style={{
                                                                                backgroundColor: `var(--${agentInfo.colorClass.replace(
                                                                                    'bg-',
                                                                                    ''
                                                                                )}-bg / 0.1)`,
                                                                            }}
                                                                        >
                                                                            {
                                                                                agentInfo.name
                                                                            }
                                                                        </Badge>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
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
                            <Dialog
                                open={isVoiceModalOpen}
                                onOpenChange={setIsVoiceModalOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="h-12 w-12 shrink-0"
                                        aria-label="Open voice chat"
                                        tabIndex={-1}
                                    >
                                        <Mic className="h-5 w-5" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg w-full">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Voice Chat (ElevenLabs)
                                        </DialogTitle>
                                    </DialogHeader>
                                    <VoiceComponent />
                                </DialogContent>
                            </Dialog>
                            <Textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={
                                    isMergeMode
                                        ? selectedMergeAgentIds.size > 1
                                            ? `Query ${selectedMergeAgentIds.size} merged agents...`
                                            : 'Select at least 2 agents to merge...'
                                        : !selectedAgentId && !isLoadingAgents
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
                                    (!isMergeMode && !selectedAgentId) ||
                                    (isMergeMode &&
                                        selectedMergeAgentIds.size < 2) ||
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
                                    !canSubmit ||
                                    isSending ||
                                    isLoadingAgents ||
                                    isLoadingHistory
                                }
                                className="h-12 w-12 shrink-0"
                                aria-label={
                                    isMergeMode
                                        ? 'Send merged query'
                                        : 'Send message'
                                }
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
                            Personal Context
                        </span>
                    </SidebarHeader>
                    <SidebarContent className="px-4">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <div className="flex flex-col gap-4 h-full">
                                    <p className="text-sm text-muted-foreground">
                                        Add relevant personal information or
                                        preferences here. This context will be
                                        saved and can be sent along with your
                                        messages in single-agent mode.
                                    </p>
                                    <Textarea
                                        value={contextInput}
                                        onChange={e =>
                                            setContextInput(e.target.value)
                                        }
                                        placeholder="Example: Project details, user preferences, background info..."
                                        className="flex-1 min-h-[200px] resize-none"
                                        aria-label="Context input area"
                                        disabled={isSavingContext}
                                    />
                                    <Button
                                        className="w-full mt-auto"
                                        variant="secondary"
                                        onClick={handleUpdateContext}
                                        disabled={isSavingContext || !user}
                                    >
                                        {isSavingContext ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : null}
                                        {isSavingContext
                                            ? 'Saving...'
                                            : 'Save Context'}
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
