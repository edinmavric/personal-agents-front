'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
    searchAndFilterAgents,
    subscribeToAgent,
    fetchUserAgentSubscriptions,
} from '@/lib/api';
import type { Agent } from '@/lib/api';
import AgentCard from '@/components/custom/AgentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Search, Filter } from 'lucide-react';
import { useTheme } from 'next-themes';
import ConfirmBuyModal from '@/components/custom/ConfirmBuyModal';
import { Toaster, toast } from 'sonner';

const categories = [
    'Productivity',
    'Finance',
    'Health',
    'Education',
    'Entertainment',
    'Marketing',
    'Customer Support',
    'Other',
];

const USER_ID = 1;

export default function MarketplacePage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [selectedSort, setSelectedSort] = useState<
        'rating' | 'price_asc' | 'price_desc'
    >('rating');
    const [isLoading, setIsLoading] = useState(true);
    const [modalAgent, setModalAgent] = useState<Agent | null>(null);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [subscribedAgentIds, setSubscribedAgentIds] = useState<Set<number>>(
        new Set()
    );
    const { theme, setTheme } = useTheme();
    const userId = 1;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchFilteredAgents = useCallback(async () => {
        setIsLoading(true);
        try {
            const tags = selectedCategory ? [selectedCategory] : [];
            const [filteredAgents, subscriptionsResponse] = await Promise.all([
                searchAndFilterAgents(search, tags, selectedSort),
                fetchUserAgentSubscriptions(),
            ]);
            setAgents(filteredAgents);
            const subIds = new Set(
                subscriptionsResponse.results.map(sub => sub.agent)
            );
            setSubscribedAgentIds(subIds);
        } catch (error) {
            console.error('Error fetching agents or subscriptions:', error);
            toast.error('Failed to load agents or subscription status.');
            setAgents([]);
            setSubscribedAgentIds(new Set());
        } finally {
            setIsLoading(false);
        }
    }, [search, selectedCategory, selectedSort]);

    useEffect(() => {
        fetchFilteredAgents();
    }, [fetchFilteredAgents]);

    const handleConfirmSubscription = async () => {
        if (!modalAgent) return;

        if (subscribedAgentIds.has(modalAgent.id)) {
            toast.info('You are already subscribed to this agent.');
            setModalAgent(null);
            return;
        }

        setIsSubscribing(true);
        try {
            const result = await subscribeToAgent(USER_ID, modalAgent.id);

            if (result.success) {
                toast.success(`Successfully subscribed to ${modalAgent.name}!`);
                setSubscribedAgentIds(prev => new Set(prev).add(modalAgent.id));
                setModalAgent(null);
            } else {
                toast.error(
                    result.message ||
                        `Failed to subscribe to ${modalAgent.name}.`
                );
            }
        } catch (error) {
            console.error('Failed to subscribe:', error);
            toast.error(`Failed to subscribe to ${modalAgent.name}.`);
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted transition-colors duration-300 py-10 px-4">
            <Toaster richColors />
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-center md:text-left text-primary tracking-tight">
                            AI Agent Marketplace
                        </h1>
                        <p className="text-lg text-muted-foreground mt-2">
                            Discover, filter and purchase AI agents for various
                            domains.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
                    <div className="relative w-full md:w-96">
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search for AI agents..."
                            className="w-full pl-10 bg-card border-input shadow-sm"
                        />
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={18}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                {selectedCategory
                                    ? selectedCategory
                                    : 'All categories'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                onClick={() => setSelectedCategory(null)}
                            >
                                All categories
                            </DropdownMenuItem>
                            {categories.map(cat => (
                                <DropdownMenuItem
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                Sort:{' '}
                                {selectedSort === 'rating'
                                    ? 'Top Rated'
                                    : selectedSort === 'price_asc'
                                    ? 'Cheapest'
                                    : 'Most Expensive'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                onClick={() => setSelectedSort('rating')}
                            >
                                Top rated
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setSelectedSort('price_asc')}
                            >
                                Cheapest
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setSelectedSort('price_desc')}
                            >
                                Most expensive
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-card p-6 rounded-lg shadow-md border border-border/20 flex flex-col justify-between animate-pulse"
                            >
                                <div className="space-y-3">
                                    <div className="h-6 bg-muted rounded w-3/4"></div>
                                    <div className="h-4 bg-muted rounded w-full"></div>
                                    <div className="h-4 bg-muted rounded w-5/6"></div>
                                </div>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/10">
                                    <div className="h-4 bg-muted rounded w-1/4"></div>
                                    <div className="h-9 bg-muted rounded w-1/3"></div>
                                </div>
                            </div>
                        ))
                    ) : agents.length > 0 ? (
                        agents.map(agent => (
                            <AgentCard
                                key={agent.id}
                                agent={agent}
                                isSubscribed={subscribedAgentIds.has(agent.id)}
                                onSubscribeClick={() => setModalAgent(agent)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-muted-foreground py-10">
                            No agents found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
            <ConfirmBuyModal
                agent={modalAgent}
                open={!!modalAgent}
                onClose={() => setModalAgent(null)}
                onConfirm={handleConfirmSubscription}
            />
        </div>
    );
}
