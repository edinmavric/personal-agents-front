'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

const navLinks = [
    { href: '/', label: 'Chat' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: 'recepies', label: 'Recipes' },
];

const Header = () => {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === '/' || pathname === '/login' || pathname === '/register') {
        return null;
    }

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
                <Link
                    href="/"
                    className="mr-6 hidden lg:flex items-center gap-2"
                    prefetch={false}
                >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
                        AI
                    </span>
                    <span className="sr-only">Daily AI Helper</span>
                </Link>
                <div className="ml-auto flex gap-2 items-center">
                    {navLinks.map(link =>
                        link.href === '/' ? (
                            <Button
                                key={link.href}
                                variant="ghost"
                                className={`h-9 px-4 py-2 text-sm font-medium
                                    ${
                                        pathname === link.href
                                            ? 'bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300'
                                            : ''
                                    }
                                `}
                                onClick={() => router.push('/')}
                            >
                                {link.label}
                            </Button>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                prefetch={false}
                                passHref
                            >
                                <Button
                                    variant="ghost"
                                    className={`h-9 px-4 py-2 text-sm font-medium
                                        ${
                                            pathname === link.href
                                                ? 'bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300'
                                                : ''
                                        }
                                    `}
                                >
                                    {link.label}
                                </Button>
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
