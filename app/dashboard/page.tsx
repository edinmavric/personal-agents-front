'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import HealthDashboard from '@/components/custom/dashboard/HealthDashboard';
import FinancialDashboard from '@/components/custom/dashboard/FinancialDashboard';
import { LucideIcon, Flame, DollarSign, HeartPulse, Target, CheckCircle2, Info, PiggyBank, Droplets } from "lucide-react";

type BadgeColor = 'string' | 'indigo' | 'green' | 'yellow';

type MockItem = {
    label: string;
    description: string;
    badge: string;
    color: BadgeColor;
};

type MockSection = {
    category: string;
    items: MockItem[];
};

const mockData: MockSection[] = [
    {
        category: 'Overall',
        items: [
            {
                label: 'Daily Goal',
                description: 'You need to eat 2,300 calories today.',
                badge: 'Calorie Target',
                color: 'indigo',
            },
            {
                label: 'Best Deal',
                description:
                    'Bananas are cheaper at SuperMart ($0.99/lb) than at LocalShop ($1.29/lb).',
                badge: 'Savings',
                color: 'indigo',
            },
        ],
    },
    {
        category: 'Financial',
        items: [
            {
                label: 'Budget',
                description:
                    'You have spent $120 of your $200 weekly grocery budget.',
                badge: 'Budget Tracker',
                color: 'yellow',
            },
            {
                label: 'Tip',
                description:
                    'Buy in bulk at WarehouseClub to save 15% on grains.',
                badge: 'Bulk Savings',
                color: 'yellow',
            },
        ],
    },
    {
        category: 'Health',
        items: [
            {
                label: 'Protein Intake',
                description:
                    'You need 60g more protein to reach your daily goal.',
                badge: 'Protein',
                color: 'green',
            },
            {
                label: 'Hydration',
                description: 'Drink at least 2 more cups of water today.',
                badge: 'Hydration',
                color: 'green',
            },
        ],
    },
];

const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'health', label: 'Health Dashboard' },
    { key: 'financial', label: 'Financial Dashboard' },
];

const overviewIcons: Record<string, LucideIcon> = {
    "Daily Goal": Flame,
    "Best Deal": PiggyBank,
    "Budget": DollarSign,
    "Tip": Info,
    "Protein Intake": CheckCircle2,
    "Hydration": Droplets,
};

const badgeColorClass = (color: string) => {
    switch (color) {
        case 'indigo':
            return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case 'green':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'yellow':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default:
            return '';
    }
};

const page = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="w-full max-w-[1600px] mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <div className="flex gap-2 mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                            activeTab === tab.key
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground hover:bg-accent'
                        }`}
                        onClick={() => setActiveTab(tab.key)}
                        type="button"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockData.flatMap(section =>
                        section.items.map((item, idx) => {
                            const Icon = overviewIcons[item.label] || Info;
                            return (
                                <div
                                    key={section.category + idx}
                                    className="bg-card rounded-xl shadow-sm border flex flex-col p-5 gap-3 h-full"
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="inline-flex items-center justify-center rounded-md bg-muted p-2">
                                            <Icon className={`h-6 w-6 ${badgeColorClass(item.color)}`} />
                                        </span>
                                        <span className="font-semibold text-lg">{item.label}</span>
                                    </div>
                                    <div className="flex-1 text-muted-foreground text-sm mb-2">
                                        {item.description}
                                    </div>
                                    <div>
                                        <Badge
                                            variant="outline"
                                            className={`mt-1 ${badgeColorClass(item.color)}`}
                                        >
                                            {item.badge}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
            {activeTab === 'health' && (
                <div>
                    <HealthDashboard />
                </div>
            )}
            {activeTab === 'financial' && (
                <div>
                    <FinancialDashboard />
                </div>
            )}
        </div>
    );
};

export default page;
