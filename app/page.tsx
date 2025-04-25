'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Plus, Send, MessageSquare, MoreVertical, Search } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp?: Date;
}

interface Conversation {
    id: number;
    title: string;
    lastMessage?: string;
    date?: Date;
}

interface ChatModel {
    id: string;
    name: string;
    description: string;
}

export default function Chat() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([
        {
            id: 1,
            title: 'Project brainstorming ideas',
            lastMessage: 'Let me think about that...',
            date: new Date(2023, 3, 15),
        },
        {
            id: 2,
            title: 'Weekly planning session',
            lastMessage: 'I will create a schedule for you',
            date: new Date(2023, 3, 14),
        },
        {
            id: 3,
            title: 'Research on machine learning',
            lastMessage: 'Here are some resources on neural networks',
            date: new Date(2023, 3, 12),
        },
    ]);
    const [activeConversation, setActiveConversation] = useState<number>(1);
    const [selectedModel, setSelectedModel] = useState<string>('gpt-4');

    const availableModels: ChatModel[] = [
        {
            id: 'gpt-4',
            name: 'GPT-4',
            description: 'Most capable model, best at complex tasks',
        },
        {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5',
            description: 'Faster response, great for most tasks',
        },
    ];

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            role: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: `This is a simulated response to: "${input}"`,
                role: 'assistant',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    const createNewConversation = () => {
        const newId = Math.max(...conversations.map(c => c.id)) + 1;
        const newConversation = {
            id: newId,
            title: `New Conversation ${newId}`,
            date: new Date(),
        };
        setConversations([newConversation, ...conversations]);
        setActiveConversation(newId);
        setMessages([]);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <div className="w-80 border-r flex flex-col h-full">
                <div className="shrink-0 p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Conversations</h2>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={createNewConversation}
                            title="New conversation"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Search */}
                <div className="shrink-0 p-3 border-b">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="w-full pl-8 pr-3 py-2 text-sm bg-muted/40 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Search conversations..."
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-auto">
                    <ScrollArea className="h-full">
                        <div className="p-2">
                            {conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    onClick={() =>
                                        setActiveConversation(conv.id)
                                    }
                                    className={cn(
                                        'p-3 rounded-lg mb-1 cursor-pointer transition-colors',
                                        conv.id === activeConversation
                                            ? 'bg-accent text-accent-foreground'
                                            : 'hover:bg-muted'
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 truncate">
                                            <div className="font-medium text-sm">
                                                {conv.title}
                                            </div>
                                            {conv.lastMessage && (
                                                <div className="text-xs text-muted-foreground truncate mt-0.5">
                                                    {conv.lastMessage}
                                                </div>
                                            )}
                                        </div>
                                        {conv.date && (
                                            <div className="text-xs text-muted-foreground ml-2">
                                                {conv.date.toLocaleDateString(
                                                    'en-US',
                                                    {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="h-14 border-b flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <Select
                            value={selectedModel}
                            onValueChange={setSelectedModel}
                        >
                            <SelectTrigger className="w-[180px] h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableModels.map(model => (
                                    <SelectItem key={model.id} value={model.id}>
                                        <div className="flex flex-col">
                                            <div className="font-medium">
                                                {model.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {model.description}
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center">
                            <MessageSquare className="h-5 w-5 text-primary mr-2" />
                            <h3 className="font-medium">
                                {conversations.find(
                                    c => c.id === activeConversation
                                )?.title || 'New Conversation'}
                            </h3>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-auto">
                    <ScrollArea className="h-full">
                        <div className="max-w-3xl mx-auto p-6 space-y-6">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                    <MessageSquare
                                        className="h-12 w-12 text-muted-foreground mb-4"
                                        strokeWidth={1.5}
                                    />
                                    <h3 className="text-xl font-medium">
                                        Start a new conversation
                                    </h3>
                                    <p className="text-muted-foreground mt-2 max-w-md">
                                        Ask any question or start chatting to
                                        get assistance on your tasks.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {messages.map(message => (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                'flex',
                                                message.role === 'user'
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'rounded-lg p-4 max-w-[85%] shadow-sm',
                                                    message.role === 'user'
                                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                        : 'bg-card rounded-tl-none border'
                                                )}
                                            >
                                                <div className="whitespace-pre-wrap break-words">
                                                    {message.content}
                                                </div>
                                                {message.timestamp && (
                                                    <div
                                                        className={cn(
                                                            'text-xs mt-2',
                                                            message.role ===
                                                                'user'
                                                                ? 'text-primary-foreground/80'
                                                                : 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {message.timestamp.toLocaleTimeString(
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

                {/* Input Area */}
                <div className="border-t p-4 bg-background">
                    <form
                        onSubmit={handleSubmit}
                        className="max-w-3xl mx-auto flex items-center space-x-2"
                    >
                        <Textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 min-h-12 max-h-40 resize-none"
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!input.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
