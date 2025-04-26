import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import type { Agent } from '@/lib/api';

interface AgentCardProps {
    agent: Agent;
    onSubscribeClick: (agent: Agent) => void;
    isSubscribed: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({
    agent,
    onSubscribeClick,
    isSubscribed,
}) => {
    const formatPrice = (price: string | number | undefined): string => {
        if (price === undefined || price === null) return 'Free';
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice === 0) return 'Free';
        return `$${numPrice.toFixed(2)}/mo`;
    };

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <Avatar className="h-12 w-12">
                    <AvatarImage
                        src={agent.appearance?.iconInitial}
                        alt={agent.name}
                    />
                    <AvatarFallback>
                        {agent.name?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        By{' '}
                        {agent.creator
                            ? `User ${agent.creator.first_name} ${agent.creator.last_name}`
                            : 'Unknown Creator'}
                    </CardDescription>
                    {agent.category && (
                        <Badge variant="outline" className="mt-1 text-xs">
                            {agent.category}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {agent.description}
                </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-1">
                    {agent.rating !== undefined && agent.rating !== null ? (
                        <>
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">
                                {agent.rating.toFixed(1)}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm text-muted-foreground">
                            No rating
                        </span>
                    )}
                    <span className="text-sm text-muted-foreground mx-1">
                        ·
                    </span>
                    <span className="text-sm font-semibold">
                        {formatPrice(agent.price)}
                    </span>
                </div>
                <Button
                    size="sm"
                    onClick={() => onSubscribeClick(agent)}
                    disabled={isSubscribed}
                >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default AgentCard;
