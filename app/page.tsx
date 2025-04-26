"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Send,
  MessageSquare,
  MoreVertical,
  Loader2,
  Bot,
  Mic,
  X,
  Sparkles,
  Zap,
  ArrowRight,
  Shuffle,
  Users,
} from "lucide-react";
import {
  fetchAgents,
  sendMessage,
  fetchUserById,
  fetchUserAgentSubscriptions,
  postAgentsMergeQuery,
  fetchUserContext,
  saveUserContext,
  fetchChatHistory,
} from "@/lib/api";
import type { Agent, ChatMessage, ApiUser, Notification } from "@/lib/api";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import VoiceComponent from "@/components/VoiceComponent";
import NotificationBell from "@/components/custom/NotificationBell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAgent } from "@/lib/AgentContext";
import Link from "next/link";

const getGlowColorClass = (accent?: string): string => {
  switch (accent?.toLowerCase()) {
    case "green":
      return "bg-green-500";
    case "blue":
      return "bg-blue-500";
    case "red":
      return "bg-red-500";
    case "yellow":
      return "bg-yellow-500";
    case "purple":
      return "bg-purple-500";
    default:
      return "bg-primary";
  }
};

const getAgentGradientColor = (appearance?: Agent["appearance"]): string => {
  if (
    appearance?.bgColor &&
    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(appearance.bgColor)
  ) {
    return appearance.bgColor;
  }
  switch (appearance?.accent?.toLowerCase()) {
    case "green":
      return "#22c55e";
    case "blue":
      return "#3b82f6";
    case "red":
      return "#ef4444";
    case "yellow":
      return "#eab308";
    case "purple":
      return "#a855f7";
    default:
      return "#6366f1";
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
  <div className={cn("flex items-start gap-2.5", isUser && "justify-end")}>
    {!isUser && <Skeleton className="h-7 w-7 rounded-full shrink-0 mt-1" />}
    <div
      className={cn(
        "flex flex-col w-full max-w-[320px] leading-1.5 p-3 border-gray-200 rounded-lg dark:border-gray-700",
        isUser ? "bg-primary/20 rounded-tr-none" : "bg-card rounded-tl-none"
      )}
    >
      <Skeleton className="h-4 w-3/4 mb-1.5" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-3 w-1/4 self-end" />
    </div>
  </div>
);

export default function Chat() {
  const [input, setInput] = useState("");
  const [contextInput, setContextInput] = useState("");
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

  // Create mocked health-related notifications
  // Using type assertion to match the actual Notification type

  const mockHealthNotifications = [
    {
      id: 1,
      // Using 'message' instead of 'content' to match the Notification type
      message:
        "Daily Health Summary: Your daily step goal was achieved! You walked 11,203 steps today. Keep up the good work!",
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(), // 35 min ago
      is_read: false,
      user: USER_ID,
    },
    {
      id: 2,
      message:
        "Workout Reminder: It's time for your scheduled 30-minute cardio workout. Your fitness agent recommends getting started now.",
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
      is_read: false,
      category: "health",
      user: USER_ID,
    },
    {
      id: 3,
      message:
        "Hydration Alert: You haven't logged any water intake in the past 2 hours. Remember to stay hydrated!",
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
      is_read: false,
      category: "health",
      user: USER_ID,
    },
  ] as Notification[];

  // Initialize with mocked data instead of empty array
  const [notifications, setNotifications] = useState<Notification[]>(
    mockHealthNotifications
  );
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(
    mockHealthNotifications.filter((n) => !n.is_read).length
  );
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { setSelectedAgent } = useAgent();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const getAgentColors = (
    ids: number[]
  ): { name: string; colorClass: string }[] => {
    return ids
      .map((id) => {
        const agent = allAgents.find((agent) => agent.id === id);
        return agent
          ? {
              name: agent.name,
              colorClass: getGlowColorClass(agent.appearance?.accent),
            }
          : null;
      })
      .filter(Boolean) as { name: string; colorClass: string }[];
  };

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
          subscriptions.map((sub) => sub.agent)
        );

        const subAgents = allFetchedAgents.filter((agent) =>
          subscribedAgentIds.has(agent.id)
        );

        subAgents.forEach((agent) => {
          if (!agent.appearance) {
            agent.appearance = {
              iconInitial: agent.name.charAt(0).toUpperCase(),
            };
          }
        });

        setSubscribedAgents(subAgents);

        console.log("Subscribed agents:", subAgents);

        if (subAgents.length > 0 && !isMergeMode) {
          const primaryAgent = subAgents.find((agent) => agent.is_primary);
          const initialAgentId = primaryAgent
            ? primaryAgent.id
            : subAgents[0].id;

          setSelectedAgentId(initialAgentId);
        } else {
          console.log("No subscribed agents found or in merge mode.");
          setSelectedAgentId(null);
        }

        if (userContextResponse) {
          setContextInput(userContextResponse);
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError("Failed to load initial data. Please try again later.");
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
        const history = await fetchChatHistory(USER_ID, selectedAgentId);
        setMessages(history);

        console.log("Fetched chat history for agent:", selectedAgentId);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
        setError("Failed to load chat history. Please try again later.");
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
      subscribedAgents.find((a) => a.id === agentId) ||
      allAgents.find((a) => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
    }
    if (isMergeMode) {
      setSelectedMergeAgentIds((prev) => {
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
      role: "user",
      message: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    const currentContext = contextInput;
    setInput("");
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
            role: "assistant",
            message: mergeResponse.response,
            timestamp: new Date().toISOString(),
            mergedAgentIds: agentIdsArray,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          throw new Error("Failed to get response from merged agents.");
        }
      } else if (!isMergeMode && selectedAgentId !== null) {
        const agentResponse = await sendMessage(
          selectedAgentId,
          currentInput,
          currentContext
        );

        if (agentResponse) {
          setMessages((prev) => [...prev, agentResponse as ChatMessage]);
        } else {
          throw new Error("Failed to get response from agent.");
        }
      } else {
        setError(
          isMergeMode
            ? "Please select at least two agents for merging."
            : "Please select an agent."
        );
        setMessages((prev) => prev.filter((msg) => msg !== userMessage));
        setInput(currentInput);
      }
    } catch (err) {
      console.error("Failed to process message:", err);
      setError("Failed to send message. Please try again.");
      setMessages((prev) => prev.filter((msg) => msg !== userMessage));
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
      toast.success("Context saved successfully!");
    } else {
      toast.error("Failed to save context. Please try again.");
    }
  };

  // Replace API call with local state update
  const handleMarkRead = async (id: number) => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification || notification.is_read) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadNotificationCount((prev) => Math.max(0, prev - 1));

    // Show toast for confirmation
    toast.success("Notification marked as read");
  };

  // Replace API call with local state update
  const handleMarkAllRead = async () => {
    if (unreadNotificationCount === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadNotificationCount(0);

    // Show toast for confirmation
    toast.success("All notifications marked as read");
  };

  const selectedAgent = !isMergeMode
    ? subscribedAgents.find((agent) => agent.id === selectedAgentId)
    : null;

  const glowGradientColor = getAgentGradientColor(selectedAgent?.appearance);

  const canSubmit = isMergeMode
    ? input.trim() && selectedMergeAgentIds.size > 1
    : input.trim() && selectedAgentId !== null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden relative bg-gradient-to-br from-background via-background to-background/90">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
        <div className="absolute top-20 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <Toaster richColors position="top-center" />
        <Sidebar
          side="left"
          variant="sidebar"
          collapsible="none"
          className="z-20 border-r bg-background/80 backdrop-blur-sm w-80 shrink-0 transition-all duration-300"
        >
          <SidebarHeader className="flex items-center justify-between pr-3">
            <span className="font-semibold text-lg mt-2 pl-3 flex items-center gap-2">
              {isMergeMode ? (
                <>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    Select Agents to Merge
                  </span>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 text-indigo-500" />
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    Agents
                  </span>
                </>
              )}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMergeMode}
              title={isMergeMode ? "Exit Merge Mode" : "Enter Merge Mode"}
              className={cn(
                "mt-1 rounded-full transition-all duration-300",
                isMergeMode
                  ? "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 hover:text-orange-600"
                  : "bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500/30 hover:text-indigo-600"
              )}
            >
              {isMergeMode ? (
                <X className="h-4 w-4" />
              ) : (
                <Shuffle className="h-4 w-4" />
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
                    subscribedAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center space-x-2 animate-fadeIn"
                      >
                        {isMergeMode && (
                          <Checkbox
                            id={`agent-checkbox-${agent.id}`}
                            checked={selectedMergeAgentIds.has(agent.id)}
                            onCheckedChange={() =>
                              handleAgentSelection(agent.id)
                            }
                            className="ml-1"
                            aria-label={`Select agent ${agent.name} for merging`}
                          />
                        )}
                        <Button
                          variant={
                            !isMergeMode && selectedAgentId === agent.id
                              ? "secondary"
                              : "ghost"
                          }
                          className={cn(
                            "w-full justify-start h-auto py-2 text-left transition-all duration-200",
                            isMergeMode ? "pl-2" : "pl-3",
                            !isMergeMode &&
                              selectedAgentId === agent.id &&
                              "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30"
                          )}
                          onClick={() => handleAgentSelection(agent.id)}
                          disabled={isLoadingHistory && !isMergeMode}
                        >
                          <Avatar
                            className={cn(
                              "h-8 w-8 mr-3 shrink-0 ring-2 ring-offset-2 transition-all duration-300",
                              selectedAgentId === agent.id
                                ? "ring-indigo-500 ring-offset-indigo-500/10"
                                : "ring-transparent ring-offset-transparent"
                            )}
                          >
                            <AvatarImage
                              src={agent.appearance?.iconInitial}
                              alt={agent.name}
                            />
                            <AvatarFallback
                              className={cn(
                                "bg-gradient-to-br",
                                agent.appearance?.accent === "green" &&
                                  "from-green-500 to-emerald-700",
                                agent.appearance?.accent === "blue" &&
                                  "from-blue-500 to-indigo-700",
                                agent.appearance?.accent === "red" &&
                                  "from-red-500 to-rose-700",
                                agent.appearance?.accent === "yellow" &&
                                  "from-amber-500 to-yellow-700",
                                agent.appearance?.accent === "purple" &&
                                  "from-purple-500 to-fuchsia-700",
                                !agent.appearance?.accent &&
                                  "from-indigo-500 to-violet-700"
                              )}
                            >
                              {agent.appearance?.iconInitial?.[0]?.toUpperCase() || (
                                <Bot size={16} />
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
                    <div className="text-center text-muted-foreground py-10 px-2 rounded-xl border-2 border-dashed border-muted my-4">
                      <Bot className="h-10 w-10 mx-auto mb-3 text-muted-foreground/60" />
                      <p className="font-medium mb-1">No agents subscribed</p>
                      <p className="text-sm">
                        Visit the marketplace to discover and add agents.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border-indigo-500/30"
                        asChild
                      >
                        <Link
                          href="/marketplace"
                          className="flex items-center gap-2"
                        >
                          Explore Marketplace <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
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
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "w-[800px] h-[800px] max-w-full max-h-full",
                "rounded-full blur-3xl opacity-20 pointer-events-none",
                "transition-colors duration-700 ease-in-out animate-pulse-slow"
              )}
              style={{
                willChange: "background-color, opacity",
                background: `radial-gradient(circle at 50% 50%, ${glowGradientColor} 0%, transparent 70%)`,
              }}
              aria-hidden="true"
            />
          )}
          <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 shrink-0 relative z-10 bg-background/80 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-2">
              <SidebarTrigger
                side="left"
                className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border-none text-indigo-600 dark:text-indigo-400"
              />
              {isMergeMode ? (
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-1.5 rounded-full">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span className="font-medium text-sm truncate hidden sm:inline text-amber-700 dark:text-amber-300">
                    Merge Mode ({selectedMergeAgentIds.size} selected)
                  </span>
                </div>
              ) : selectedAgent ? (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <Avatar className="h-8 w-8 ring-2 ring-indigo-500 ring-offset-2 ring-offset-indigo-500/10">
                    <AvatarImage
                      src={selectedAgent.appearance?.iconInitial}
                      alt={selectedAgent.name}
                    />
                    <AvatarFallback
                      className={cn(
                        "bg-gradient-to-br",
                        selectedAgent.appearance?.accent === "green" &&
                          "from-green-500 to-emerald-700",
                        selectedAgent.appearance?.accent === "blue" &&
                          "from-blue-500 to-indigo-700",
                        selectedAgent.appearance?.accent === "red" &&
                          "from-red-500 to-rose-700",
                        selectedAgent.appearance?.accent === "yellow" &&
                          "from-amber-500 to-yellow-700",
                        selectedAgent.appearance?.accent === "purple" &&
                          "from-purple-500 to-fuchsia-700",
                        !selectedAgent.appearance?.accent &&
                          "from-indigo-500 to-violet-700"
                      )}
                    >
                      {selectedAgent.appearance?.iconInitial?.[0]?.toUpperCase() || (
                        <Bot size={12} className="text-white" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-base truncate hidden sm:inline">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {selectedAgent.name}
                    </span>
                  </span>
                </div>
              ) : !isLoadingAgents ? (
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                  {isMergeMode ? "Select agents to merge" : "Select a chat"}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32 hidden sm:inline" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-3 ml-auto">
              <Link
                href="/dashboard"
                className="text-sm font-medium px-3 py-2 rounded-full bg-transparent hover:bg-indigo-500/10 transition-colors flex items-center gap-1.5"
                style={{ textDecoration: "none" }}
              >
                Dashboard
              </Link>
              <Link
                href="/marketplace"
                className="text-sm font-medium px-3 py-2 rounded-full bg-transparent hover:bg-purple-500/10 transition-colors flex items-center gap-1.5"
                style={{ textDecoration: "none" }}
              >
                Marketplace
              </Link>
              <Link
                href="/shopping-comparison"
                className="text-sm font-medium px-3 py-2 rounded-full bg-transparent hover:bg-blue-500/10 transition-colors flex items-center gap-1.5"
                style={{ textDecoration: "none" }}
              >
                Shopping
              </Link>
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
                    className="rounded-full hover:bg-muted"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      toast.info("Clear chat action (not implemented)")
                    }
                    disabled={messages.length === 0 || isMergeMode}
                  >
                    Clear Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      toast.info("Agent info action (not implemented)")
                    }
                    disabled={!selectedAgentId || isMergeMode}
                  >
                    Agent Info
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <SidebarTrigger
                side="right"
                className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border-none text-blue-600 dark:text-blue-400"
              />
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
                  <div className="text-center py-20 text-destructive bg-destructive/5 rounded-xl border border-destructive/20 px-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-3">
                      <X className="h-6 w-6 text-destructive" />
                    </div>
                    <p className="text-lg font-medium">{error}</p>
                    <p className="text-sm text-destructive/80 mt-1">
                      Please try again or select a different agent.
                    </p>
                  </div>
                ) : !selectedAgentId && !isMergeMode && !isLoadingAgents ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                      <MessageSquare
                        className="h-10 w-10 text-indigo-500"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3 className="text-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Select a chat
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      Choose an agent from the sidebar to start chatting or
                      enter Merge Mode.
                    </p>
                  </div>
                ) : isMergeMode && selectedMergeAgentIds.size < 2 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                      <Users
                        className="h-10 w-10 text-amber-500"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3 className="text-xl font-medium bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                      Merge Mode
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      Select at least two agents from the sidebar to merge their
                      capabilities for your query.
                    </p>
                  </div>
                ) : messages.length === 0 && !isLoadingHistory ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-4 animate-pulse-slow">
                      <MessageSquare
                        className="h-10 w-10 text-blue-500"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3 className="text-xl font-medium bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                      {isMergeMode
                        ? `Query Merged Agents (${selectedMergeAgentIds.size})`
                        : `Start chatting with ${
                            selectedAgent?.name || "agent"
                          }`}
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      {isMergeMode
                        ? "Ask a question using the combined knowledge of the selected agents."
                        : "Ask any question or start chatting to get assistance."}
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div
                        key={`${message.timestamp}-${message.role}-${index}`}
                        className={cn(
                          "flex items-start gap-2 animate-slideInUp",
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        )}
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        {message.role === "assistant" &&
                          !message.mergedAgentIds &&
                          selectedAgent && (
                            <Avatar className="h-8 w-8 mr-1 shrink-0 mt-1 ring-2 ring-offset-2 ring-indigo-500/40 ring-offset-background">
                              <AvatarImage
                                src={selectedAgent.appearance?.iconInitial}
                                alt={selectedAgent.name}
                              />
                              <AvatarFallback
                                className={cn(
                                  "bg-gradient-to-br",
                                  selectedAgent.appearance?.accent ===
                                    "green" && "from-green-500 to-emerald-700",
                                  selectedAgent.appearance?.accent === "blue" &&
                                    "from-blue-500 to-indigo-700",
                                  selectedAgent.appearance?.accent === "red" &&
                                    "from-red-500 to-rose-700",
                                  selectedAgent.appearance?.accent ===
                                    "yellow" && "from-amber-500 to-yellow-700",
                                  selectedAgent.appearance?.accent ===
                                    "purple" &&
                                    "from-purple-500 to-fuchsia-700",
                                  !selectedAgent.appearance?.accent &&
                                    "from-indigo-500 to-violet-700"
                                )}
                              >
                                {selectedAgent.appearance?.iconInitial?.[0]?.toUpperCase() || (
                                  <Bot size={14} className="text-white" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        {message.role === "assistant" &&
                          message.mergedAgentIds && (
                            <Avatar className="h-8 w-8 mr-1 shrink-0 mt-1 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-amber-500/40 ring-offset-background">
                              <Users size={14} className="text-white" />
                            </Avatar>
                          )}
                        <div
                          className={cn(
                            "rounded-2xl p-4 max-w-[85%] shadow-md text-sm relative group transition-all",
                            message.role === "user"
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none"
                              : message.mergedAgentIds
                              ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-tl-none border border-amber-200 dark:border-amber-700/50"
                              : "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-tl-none border border-indigo-200 dark:border-indigo-700/50"
                          )}
                        >
                          {message.role === "assistant" &&
                            message.mergedAgentIds && (
                              <div className="mb-3 border-b border-amber-200 dark:border-amber-700/50 pb-2 flex flex-wrap gap-1.5 items-center">
                                <span className="text-xs font-medium text-amber-700 dark:text-amber-300 mr-1">
                                  Merged:
                                </span>
                                {getAgentColors(message.mergedAgentIds).map(
                                  (agentInfo) => (
                                    <Badge
                                      key={agentInfo.name}
                                      variant="outline"
                                      className={cn(
                                        "text-xs border-none px-2 py-1 font-medium",
                                        agentInfo.colorClass.replace(
                                          "bg-",
                                          "text-"
                                        )
                                      )}
                                      style={{
                                        backgroundColor: `var(--${agentInfo.colorClass.replace(
                                          "bg-",
                                          ""
                                        )}-bg / 0.15)`,
                                      }}
                                    >
                                      {agentInfo.name}
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
                                "text-xs mt-2 text-right",
                                message.role === "user"
                                  ? "text-white/80"
                                  : message.mergedAgentIds
                                  ? "text-amber-500/80"
                                  : "text-indigo-500/80"
                              )}
                            >
                              {new Date(message.timestamp).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} className="h-px" />
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="border-t p-4 bg-background/80 backdrop-blur-sm shrink-0 relative z-10">
            {error && !isLoadingHistory && messages.length > 0 && (
              <p className="text-xs text-destructive text-center mb-2 bg-destructive/5 py-1.5 px-3 rounded-full mx-auto w-fit">
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
                    className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border-blue-500/20"
                    aria-label="Open voice chat"
                    tabIndex={-1}
                  >
                    <Mic className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg w-full">
                  <DialogHeader>
                    <DialogTitle>Voice Chat (ElevenLabs)</DialogTitle>
                  </DialogHeader>
                  <VoiceComponent />
                </DialogContent>
              </Dialog>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isMergeMode
                    ? selectedMergeAgentIds.size > 1
                      ? `Query ${selectedMergeAgentIds.size} merged agents...`
                      : "Select at least 2 agents to merge..."
                    : !selectedAgentId && !isLoadingAgents
                    ? "Select a chat to start..."
                    : isLoadingHistory
                    ? "Loading history..."
                    : `Message ${selectedAgent?.name || "agent"}...`
                }
                className="flex-1 min-h-[48px] max-h-40 resize-none rounded-2xl bg-background border-muted focus-visible:ring-offset-indigo-500 transition-all duration-300 shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={
                  (!isMergeMode && !selectedAgentId) ||
                  (isMergeMode && selectedMergeAgentIds.size < 2) ||
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
                  !canSubmit || isSending || isLoadingAgents || isLoadingHistory
                }
                className={cn(
                  "h-12 w-12 shrink-0 rounded-full transition-all duration-300",
                  isMergeMode
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                )}
                aria-label={isMergeMode ? "Send merged query" : "Send message"}
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Send className="h-5 w-5 text-white" />
                )}
              </Button>
            </form>
          </div>
        </main>

        <Sidebar
          side="right"
          variant="sidebar"
          collapsible="none"
          className="z-20 border-l bg-background/80 backdrop-blur-sm w-80 shrink-0 transition-all duration-300"
        >
          <SidebarHeader>
            <span className="font-semibold text-lg mt-2 pl-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Personal Context
              </span>
            </span>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <div className="flex flex-col gap-4 h-full">
                  <p className="text-sm text-muted-foreground">
                    Add relevant personal information or preferences here. This
                    context will be saved and can be sent along with your
                    messages in single-agent mode.
                  </p>
                  <Textarea
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                    placeholder="Example: Project details, user preferences, background info..."
                    className="flex-1 min-h-[200px] resize-none rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 focus-visible:ring-blue-500/50"
                    aria-label="Context input area"
                    disabled={isSavingContext}
                  />
                  <Button
                    className="w-full mt-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium"
                    onClick={handleUpdateContext}
                    disabled={isSavingContext || !user}
                  >
                    {isSavingContext ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {isSavingContext ? "Saving..." : "Save Context"}
                  </Button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.25;
          }
          100% {
            opacity: 0.15;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }

        .animate-slideInUp {
          animation: slideInUp 0.3s ease forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(
              to right,
              rgba(127, 127, 127, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(127, 127, 127, 0.1) 1px,
              transparent 1px
            );
          background-size: 20px 20px;
        }
      `}</style>
    </SidebarProvider>
  );
}
