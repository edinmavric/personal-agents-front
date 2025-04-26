"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  searchAndFilterAgents,
  subscribeToAgent,
  fetchUserAgentSubscriptions,
} from "@/lib/api";
import type { Agent } from "@/lib/api";
import AgentCard from "@/components/custom/AgentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  PlusCircle,
  Store,
  Sparkles,
  ArrowUp,
  TrendingUp,
} from "lucide-react";
import ConfirmBuyModal from "@/components/custom/ConfirmBuyModal";
import { Toaster, toast } from "sonner";
import Link from "next/link";

const categories = [
  "Productivity",
  "Finance",
  "Health",
  "Education",
  "Entertainment",
  "Marketing",
  "Customer Support",
  "Other",
];

const USER_ID = 1;

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<
    "rating" | "price_asc" | "price_desc"
  >("rating");
  const [isLoading, setIsLoading] = useState(true);
  const [modalAgent, setModalAgent] = useState<Agent | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribedAgentIds, setSubscribedAgentIds] = useState<Set<number>>(
    new Set()
  );
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
        subscriptionsResponse.results.map((sub) => sub.agent)
      );
      setSubscribedAgentIds(subIds);
    } catch (error) {
      console.error("Error fetching agents or subscriptions:", error);
      toast.error("Failed to load agents or subscription status.");
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
      toast.info("You are already subscribed to this agent.");
      setModalAgent(null);
      return;
    }

    setIsSubscribing(true);
    try {
      const result = await subscribeToAgent(USER_ID, modalAgent.id);

      if (result.success) {
        toast.success(`Successfully subscribed to ${modalAgent.name}!`);
        setSubscribedAgentIds((prev) => new Set(prev).add(modalAgent.id));
        setModalAgent(null);
      } else {
        toast.error(
          result.message || `Failed to subscribe to ${modalAgent.name}.`
        );
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
      toast.error(`Failed to subscribe to ${modalAgent.name}.`);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 transition-colors duration-300 py-6 md:py-10 px-4 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <Toaster richColors position="top-center" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Store className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  AI Agent Marketplace
                </span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-1 max-w-2xl">
                Discover intelligent agents for every task, or create your own.
              </p>
            </div>
          </div>

          <Link href="/create-agent" className="shrink-0">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium flex items-center gap-2 shadow-md transition-all duration-300 hover:shadow-lg h-10 md:h-11 pr-4 md:pr-6">
              <PlusCircle className="w-4 h-4" />
              Create Your Agent
            </Button>
          </Link>
        </div>

        <div className="bg-white/30 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 mb-8 shadow-sm border border-indigo-100 dark:border-indigo-900/30 animate-fadeIn">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="relative w-full md:w-96">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for AI agents..."
                className="w-full pl-10 bg-white/70 dark:bg-black/30 border-indigo-200 dark:border-indigo-800/50 focus-visible:ring-indigo-500/50 h-10"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400"
                size={18}
              />
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-indigo-200 dark:border-indigo-800/50 bg-white/70 dark:bg-black/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  >
                    <Filter className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>
                      {selectedCategory ? selectedCategory : "All categories"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-indigo-200 dark:border-indigo-800/50 shadow-lg">
                  <DropdownMenuItem
                    onClick={() => setSelectedCategory(null)}
                    className={
                      !selectedCategory
                        ? "bg-indigo-50 dark:bg-indigo-900/30 font-medium"
                        : ""
                    }
                  >
                    All categories
                  </DropdownMenuItem>
                  {categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={
                        selectedCategory === cat
                          ? "bg-indigo-50 dark:bg-indigo-900/30 font-medium"
                          : ""
                      }
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
                    className="flex items-center gap-2 border-indigo-200 dark:border-indigo-800/50 bg-white/70 dark:bg-black/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  >
                    <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>
                      {selectedSort === "rating"
                        ? "Top Rated"
                        : selectedSort === "price_asc"
                        ? "Price: Low to High"
                        : "Price: High to Low"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-indigo-200 dark:border-indigo-800/50 shadow-lg">
                  <DropdownMenuItem
                    onClick={() => setSelectedSort("rating")}
                    className={
                      selectedSort === "rating"
                        ? "bg-indigo-50 dark:bg-indigo-900/30 font-medium"
                        : ""
                    }
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500" />
                    Top rated
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedSort("price_asc")}
                    className={
                      selectedSort === "price_asc"
                        ? "bg-indigo-50 dark:bg-indigo-900/30 font-medium"
                        : ""
                    }
                  >
                    <ArrowUp className="w-3.5 h-3.5 mr-2 text-green-500" />
                    Cheapest first
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedSort("price_desc")}
                    className={
                      selectedSort === "price_desc"
                        ? "bg-indigo-50 dark:bg-indigo-900/30 font-medium"
                        : ""
                    }
                  >
                    <ArrowUp className="w-3.5 h-3.5 mr-2 rotate-180 text-red-500" />
                    Most expensive first
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 rounded-xl shadow-md border border-indigo-100 dark:border-indigo-900/30 flex flex-col justify-between animate-pulse"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-indigo-200 dark:bg-indigo-900/50 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-indigo-200 dark:bg-indigo-900/50 rounded w-24"></div>
                    <div className="h-4 bg-indigo-200/70 dark:bg-indigo-900/30 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-indigo-200/70 dark:bg-indigo-900/30 rounded w-full"></div>
                  <div className="h-4 bg-indigo-200/70 dark:bg-indigo-900/30 rounded w-5/6"></div>
                  <div className="h-4 bg-indigo-200/70 dark:bg-indigo-900/30 rounded w-4/6"></div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/20">
                  <div className="h-5 bg-indigo-200 dark:bg-indigo-900/50 rounded w-16"></div>
                  <div className="h-9 bg-indigo-200 dark:bg-indigo-900/50 rounded-full w-24"></div>
                </div>
              </div>
            ))
          ) : agents.length > 0 ? (
            agents.map((agent, index) => (
              <div
                key={agent.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <AgentCard
                  agent={agent}
                  isSubscribed={subscribedAgentIds.has(agent.id)}
                  onSubscribeClick={() => setModalAgent(agent)}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/30 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
              <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                No agents found
              </h3>
              <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                We couldn't find any agents matching your search criteria. Try
                adjusting your filters or create your own agent.
              </p>
              <Button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(null);
                  setSelectedSort("rating");
                }}
                variant="outline"
                className="border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                Reset filters
              </Button>
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

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
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
    </div>
  );
}
