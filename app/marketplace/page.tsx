'use client'
import React, { useState, useEffect } from "react";
import { searchAndFilterAgents } from "@/lib/api";
import AgentCard from "@/components/custom/AgentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sun, Moon, Search, Filter } from "lucide-react";
import { useTheme } from "next-themes";
import ConfirmBuyModal from "@/components/custom/ConfirmBuyModal";



const categories = [
  "Productivity",
  "Finance",
  "Health",
  "Education",
  "Entertainment",
  "Marketing",
  "Customer Support",
  "Other"
];

export default function MarketplacePage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<'rating' | 'price_asc' | 'price_desc'>('rating');
  const [isLoading, setIsLoading] = useState(true);
  const [modalAgent, setModalAgent] = useState<any | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchFilteredAgents = async () => {
      setIsLoading(true);
      try {
        const tags = selectedCategory ? [selectedCategory] : [];
        // Remove sortMapping and use selectedSort directly
        const filteredAgents = await searchAndFilterAgents(
          search,
          tags,
          selectedSort
        );
        setAgents(filteredAgents as any[]);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredAgents();
  }, [search, selectedCategory, selectedSort]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted transition-colors duration-300 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-center md:text-left text-primary tracking-tight">
              AI Agent Marketplace
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Discover, filter and purchase AI agents for various domains.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ml-4"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
          <div className="relative w-full md:w-96">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for AI agents by name, description or category..."
              className="w-full pl-10 bg-card border-input shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {selectedCategory ? selectedCategory : "All categories"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                All categories
              </DropdownMenuItem>
              {categories.map((cat) => (
                <DropdownMenuItem key={cat} onClick={() => setSelectedCategory(cat)}>
                  {cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Sort: {selectedSort}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedSort("rating")}>
                Top rated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedSort("price_asc")}>
                Cheapest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedSort("price_desc")}>
                Most expensive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full text-center text-muted-foreground">
              Loading...
            </div>
          ) : agents.length > 0 ? (
            agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onBuy={() => setModalAgent(agent)} />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground">
              No agents found.
            </div>
          )}
        </div>
      </div>
      <ConfirmBuyModal
        agent={modalAgent}
        open={!!modalAgent}
        onClose={() => setModalAgent(null)}
        onConfirm={() => {
          setModalAgent(null);
          // Here you can add your buy logic
        }}
      />
    </div>
  );
}