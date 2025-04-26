import React from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCheck } from 'lucide-react';
import type { Notification } from '@/lib/api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface NotificationBellProps {
    notifications: Notification[];
    unreadCount: number;
    onMarkRead: (id: number) => Promise<void>;
    onMarkAllRead: () => Promise<void>;
    isLoading: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
    notifications,
    unreadCount,
    onMarkRead,
    onMarkAllRead,
    isLoading,
}) => {
    const handleMarkRead = async (
        e: React.MouseEvent<HTMLDivElement>,
        id: number,
        isRead: boolean
    ) => {
        e.stopPropagation(); // Prevent popover from closing if clicking inside
        if (!isRead) {
            await onMarkRead(id);
        }
    };

    const handleMarkAll = async (e: React.MouseEvent<HTMLButtonElement>) => {
         e.stopPropagation();
         await onMarkAllRead();
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={`Notifications (${unreadCount} unread)`}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-4 w-4 min-w-0 p-0 flex items-center justify-center text-xs rounded-full"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-3 border-b">
                    <h4 className="font-medium text-sm">Notifications</h4>
                    {notifications.some(n => !n.is_read) && (
                         <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto px-2 py-1"
                            onClick={handleMarkAll}
                            disabled={isLoading}
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {isLoading && notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications yet.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        'p-3 hover:bg-muted/50 cursor-pointer flex items-start gap-2',
                                        !notification.is_read && 'bg-blue-500/5' // Subtle background for unread
                                    )}
                                    onClick={(e) => handleMarkRead(e, notification.id, notification.is_read)}
                                >
                                    {!notification.is_read && (
                                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" aria-hidden="true" />
                                    )}
                                    <div className={cn("flex-1", notification.is_read && "pl-4")}>
                                        <p className="text-sm mb-1">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(notification.timestamp), 'MMM d, yyyy h:mm a')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
