'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAgent } from '@/lib/AgentContext';
import { useState } from 'react';

const navLinks = [
    { href: '/', label: 'Chat' },
    { href: '/marketplace', label: 'Marketplace' },
];

const dashboardOptions = [
    { id: 1, label: 'Health' },
    { id: 2, label: 'Financial' },
];

const Header = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { selectedAgent } = useAgent();
    const [dashboardOpen, setDashboardOpen] = useState(false);

    if (pathname === '/' || pathname === '/login' || pathname === '/register') {
        return null;
    }

    const handleDashboardSelect = (id: number) => {
        setDashboardOpen(false);
        router.push(`/dashboard/${id}`);
    };

    const handleNav = (base: string) => {
        if (typeof selectedAgent?.id === 'number') {
            router.push(`${base}/${selectedAgent.id}`);
        }
    };

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
                <Link
                    href={
                        typeof selectedAgent?.id === 'number'
                            ? `/dashboard/${selectedAgent.id}`
                            : '/dashboard'
                    }
                    className="mr-6 hidden lg:flex items-center gap-2"
                    prefetch={false}
                >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
                        AI
                    </span>
                    <span className="sr-only">Daily AI Helper</span>
                </Link>
                <div className="ml-auto flex gap-2 items-center">
                    <div className="relative">
                        <button
                            type="button"
                            className={`group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors
                                hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none
                                disabled:pointer-events-none disabled:opacity-50
                                dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50
                                ${
                                    pathname.startsWith('/dashboard')
                                        ? 'bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300'
                                        : ''
                                }
                            `}
                            onClick={() => setDashboardOpen(open => !open)}
                        >
                            Dashboard
                            <svg
                                className="ml-2 w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        {dashboardOpen && (
                            <div className="absolute z-10 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-950 ring-1 ring-black ring-opacity-5">
                                <ul>
                                    {dashboardOptions.map(option => (
                                        <li key={option.id}>
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() =>
                                                    handleDashboardSelect(
                                                        option.id
                                                    )
                                                }
                                            >
                                                {option.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    {navLinks.map(link =>
                        link.href === '/' ? (
                            <button
                                key={link.href}
                                type="button"
                                className={`group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors
                                    hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none
                                    disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50
                                    dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50
                                    dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50
                                    ${
                                        pathname === link.href
                                            ? 'bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300'
                                            : ''
                                    }
                                `}
                                onClick={() => router.push('/')}
                            >
                                {link.label}
                            </button>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors
                                    hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none
                                    disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50
                                    dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50
                                    dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50
                                    ${
                                        pathname === link.href
                                            ? 'bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300'
                                            : ''
                                    }
                                `}
                                prefetch={false}
                            >
                                {link.label}
                            </Link>
                        )
                    )}
                    <ThemeToggle />
                </div>
            </header>
        </div>
    );
};

export default Header;
