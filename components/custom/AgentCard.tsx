import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

type Agent = {
  id: number;
  name: string;
  description: string;
  appearance: {
    accent: string;
    iconColor: string;
    bgColor: string;
    iconInitial: string;
  };
  system_prompt: string;
  price: string;
  is_primary: boolean;
  tags: string[];
  reviewCount: number;
  rating: number;
};

export default function AgentCard({ agent, onBuy }: { agent: Agent; onBuy: () => void }) {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-primary/40 transition group">
      <CardHeader className="flex flex-col items-start pb-2">
        <div className="flex items-center gap-2 w-full">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-semibold"
            style={{ 
              backgroundColor: agent.appearance.bgColor,
              color: agent.appearance.iconColor 
            }}
          >
            {agent.appearance.iconInitial}
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{agent.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400 mr-1" />
                {agent.rating}
              </div>
              <span>•</span>
              <span>{agent.reviewCount} reviews</span>
            </div>
          </div>
        </div>
        <CardDescription className="mt-2 line-clamp-2">
          {agent.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-1">
          {agent.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-lg font-bold">{agent.price}</span>
        <Button onClick={onBuy}>Subscribe</Button>
      </CardFooter>
    </Card>
  );
}