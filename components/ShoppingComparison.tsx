'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    X,
    Loader2,
    ShoppingBag,
    Store,
    Map,
    DollarSign,
    BarChart4,
    Search,
    MapPin,
    Navigation,
    AlertTriangle,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

interface StorePrice {
    store: string;
    price: number;
    inStock: boolean;
}

interface ItemPrice {
    item: string;
    prices: StorePrice[];
}

interface StoreTotal {
    store: string;
    totalPrice: number;
    itemsAvailable: number;
    totalItems: number;
    distance: number;
    actualDistance?: number;
}

interface Coordinates {
    latitude: number;
    longitude: number;
}

const mockStores = [
    {
        name: 'Maxi',
        location: 'City Center',
        distance: 1.2,
        coordinates: { latitude: 43.1417, longitude: 20.5181 },
    },
    {
        name: 'Idea',
        location: 'AVNOJ Boulevard',
        distance: 2.4,
        coordinates: { latitude: 43.1395, longitude: 20.5114 },
    },
    {
        name: 'Lidl',
        location: 'Industrial Zone',
        distance: 3.1,
        coordinates: { latitude: 43.1504, longitude: 20.5289 },
    },
    {
        name: 'Prima',
        location: 'Mur Area',
        distance: 1.8,
        coordinates: { latitude: 43.1477, longitude: 20.5241 },
    },
    {
        name: 'Aman',
        location: 'Near Hospital',
        distance: 0.9,
        coordinates: { latitude: 43.139, longitude: 20.522 },
    },
];

const mockPriceDatabase: Record<string, StorePrice[]> = {
    milk: [
        { store: 'Maxi', price: 1.29, inStock: true },
        { store: 'Idea', price: 1.49, inStock: true },
        { store: 'Lidl', price: 1.19, inStock: true },
        { store: 'Prima', price: 1.39, inStock: true },
        { store: 'Aman', price: 1.59, inStock: true },
    ],
    eggs: [
        { store: 'Maxi', price: 2.99, inStock: true },
        { store: 'Idea', price: 3.29, inStock: true },
        { store: 'Lidl', price: 2.89, inStock: true },
        { store: 'Prima', price: 3.49, inStock: true },
        { store: 'Aman', price: 3.19, inStock: true },
    ],
    bread: [
        { store: 'Maxi', price: 2.49, inStock: true },
        { store: 'Idea', price: 2.79, inStock: true },
        { store: 'Lidl', price: 1.99, inStock: true },
        { store: 'Prima', price: 2.29, inStock: true },
        { store: 'Aman', price: 2.69, inStock: true },
    ],
    chicken: [
        { store: 'Maxi', price: 6.99, inStock: true },
        { store: 'Idea', price: 7.49, inStock: true },
        { store: 'Lidl', price: 6.49, inStock: true },
        { store: 'Prima', price: 7.29, inStock: false },
        { store: 'Aman', price: 8.99, inStock: true },
    ],
    pasta: [
        { store: 'Maxi', price: 1.19, inStock: true },
        { store: 'Idea', price: 1.39, inStock: true },
        { store: 'Lidl', price: 0.99, inStock: true },
        { store: 'Prima', price: 1.29, inStock: true },
        { store: 'Aman', price: 1.49, inStock: true },
    ],
    cheese: [
        { store: 'Maxi', price: 3.99, inStock: true },
        { store: 'Idea', price: 4.49, inStock: true },
        { store: 'Lidl', price: 3.49, inStock: true },
        { store: 'Prima', price: 3.89, inStock: true },
        { store: 'Aman', price: 4.29, inStock: false },
    ],
    apples: [
        { store: 'Maxi', price: 2.99, inStock: true },
        { store: 'Idea', price: 3.29, inStock: true },
        { store: 'Lidl', price: 2.49, inStock: true },
        { store: 'Prima', price: 2.79, inStock: true },
        { store: 'Aman', price: 2.89, inStock: true },
    ],
    bananas: [
        { store: 'Maxi', price: 1.29, inStock: true },
        { store: 'Idea', price: 1.19, inStock: true },
        { store: 'Lidl', price: 0.99, inStock: true },
        { store: 'Prima', price: 1.09, inStock: true },
        { store: 'Aman', price: 1.39, inStock: true },
    ],
    tomatoes: [
        { store: 'Maxi', price: 2.49, inStock: true },
        { store: 'Idea', price: 2.19, inStock: true },
        { store: 'Lidl', price: 1.99, inStock: true },
        { store: 'Prima', price: 2.29, inStock: true },
        { store: 'Aman', price: 2.39, inStock: true },
    ],
    yogurt: [
        { store: 'Maxi', price: 2.29, inStock: true },
        { store: 'Idea', price: 2.49, inStock: true },
        { store: 'Lidl', price: 1.99, inStock: true },
        { store: 'Prima', price: 2.19, inStock: true },
        { store: 'Aman', price: 2.39, inStock: false },
    ],
};

export default function ShoppingComparison() {
    const [shoppingList, setShoppingList] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [priceResults, setPriceResults] = useState<ItemPrice[]>([]);
    const [storeTotals, setStoreTotals] = useState<StoreTotal[]>([]);
    const [bestStore, setBestStore] = useState<StoreTotal | null>(null);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [showLocationDialog, setShowLocationDialog] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const isGeolocationAvailable =
        typeof navigator !== 'undefined' && 'geolocation' in navigator;

    const enableLocation = () => {
        if (!isGeolocationAvailable) {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }

        setIsLocationLoading(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            position => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationEnabled(true);
                setIsLocationLoading(false);
                toast.success('Location enabled successfully!');
                if (storeTotals.length > 0) {
                    findBestDeals();
                }
            },
            error => {
                console.error('Error getting location:', error);
                setIsLocationLoading(false);
                setLocationError(
                    error.code === 1
                        ? 'Location permission denied. Please enable location in your browser settings.'
                        : 'Could not get your location. Please try again.'
                );
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const disableLocation = () => {
        setLocationEnabled(false);
        setUserLocation(null);
        if (storeTotals.length > 0) {
            findBestDeals();
        }
    };

    const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const addItem = () => {
        if (!currentInput.trim()) return;

        const normalizedItem = currentInput.trim().toLowerCase();

        if (shoppingList.includes(normalizedItem)) {
            toast.error(`${normalizedItem} is already in your list`);
            return;
        }

        if (!mockPriceDatabase[normalizedItem]) {
            toast.error(
                `Sorry, we don't have price data for ${normalizedItem}`
            );
            return;
        }

        setShoppingList([...shoppingList, normalizedItem]);
        setCurrentInput('');
    };

    const removeItem = (index: number) => {
        const newList = [...shoppingList];
        newList.splice(index, 1);
        setShoppingList(newList);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addItem();
        }
    };

    const findBestDeals = () => {
        if (shoppingList.length === 0) {
            toast.error('Please add items to your shopping list first');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            try {
                const itemPrices: ItemPrice[] = [];

                shoppingList.forEach(item => {
                    const prices = mockPriceDatabase[item] || [];
                    itemPrices.push({
                        item,
                        prices: [...prices].sort((a, b) => a.price - b.price),
                    });
                });

                const totals: StoreTotal[] = mockStores
                    .map(store => {
                        let totalPrice = 0;
                        let itemsAvailable = 0;

                        itemPrices.forEach(({ item, prices }) => {
                            const storePrice = prices.find(
                                p => p.store === store.name
                            );
                            if (storePrice && storePrice.inStock) {
                                totalPrice += storePrice.price;
                                itemsAvailable++;
                            }
                        });

                        let actualDistance;
                        if (locationEnabled && userLocation) {
                            actualDistance = calculateDistance(
                                userLocation.latitude,
                                userLocation.longitude,
                                store.coordinates.latitude,
                                store.coordinates.longitude
                            ).toFixed(1);
                        }

                        return {
                            store: store.name,
                            totalPrice,
                            itemsAvailable,
                            totalItems: shoppingList.length,
                            distance: store.distance,
                            actualDistance: actualDistance
                                ? parseFloat(actualDistance)
                                : undefined,
                        };
                    })
                    .sort((a, b) => {
                        if (a.itemsAvailable !== b.itemsAvailable) {
                            return b.itemsAvailable - a.itemsAvailable;
                        }
                        return a.totalPrice - b.totalPrice;
                    });

                setPriceResults(itemPrices);
                setStoreTotals(totals);

                const best = totals.length > 0 ? totals[0] : null;
                setBestStore(best);

                toast.success('Found the best deals for your shopping list!');
            } catch (error) {
                console.error('Error calculating best deals:', error);
                toast.error(
                    'Failed to calculate best deals. Please try again.'
                );
            } finally {
                setIsLoading(false);
            }
        }, 2500);
    };

    const formatPrice = (price: number) => {
        return `€${price.toFixed(2)}`;
    };

    const handleLocationClick = () => {
        if (locationEnabled) {
            disableLocation();
        } else {
            if (isGeolocationAvailable) {
                setShowLocationDialog(true);
            } else {
                setLocationError(
                    'Geolocation is not supported by your browser'
                );
            }
        }
    };

    return (
        <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">
                        Smart Shopping Comparison
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Find the best deals for your grocery list
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                    <Button
                        variant={locationEnabled ? 'default' : 'outline'}
                        onClick={handleLocationClick}
                        className={`${
                            locationEnabled
                                ? 'bg-green-600 hover:bg-green-700'
                                : ''
                        } text-xs sm:text-sm flex-1 sm:flex-none`}
                        disabled={isLocationLoading}
                        size="sm"
                    >
                        {isLocationLoading ? (
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1.5 sm:mr-2" />
                        ) : locationEnabled ? (
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        ) : (
                            <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        )}
                        {locationEnabled ? 'Location On' : 'Enable Location'}
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="text-xs sm:text-sm flex-1 sm:flex-none border-green-600 hover:text-green-700 hover:bg-green-600 text-white hover:border-green-700"
                        size="sm"
                    >
                        <Link href="/recepies">Smart Recepies</Link>
                    </Button>
                    <Button
                        onClick={findBestDeals}
                        disabled={isLoading || shoppingList.length === 0}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xs sm:text-sm flex-1 sm:flex-none"
                        size="sm"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                Finding deals...
                            </>
                        ) : (
                            <>
                                <Search className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Find Best Deals
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {locationError && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3 mb-4 flex items-center gap-2 text-amber-800 text-xs sm:text-sm">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-amber-500" />
                    <p>{locationError}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
                <Card className="md:col-span-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            Your Shopping List
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-blue-600/80 dark:text-blue-500/80">
                            Add the items you need to buy
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-grow p-2 sm:p-3 flex flex-col">
                        <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-3">
                            <Input
                                placeholder="Add an item..."
                                value={currentInput}
                                onChange={e => setCurrentInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-grow bg-white dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-sm sm:text-base h-8 sm:h-10"
                            />
                            <Button
                                onClick={addItem}
                                size="icon"
                                className="bg-blue-600 hover:bg-blue-700 h-8 sm:h-10 w-8 sm:w-10"
                            >
                                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-grow rounded-lg border border-blue-200 dark:border-blue-800 bg-white/90 dark:bg-blue-950/40 p-2 shadow-inner min-h-[150px] sm:min-h-[200px] max-h-[300px] sm:max-h-[400px]">
                            {shoppingList.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {shoppingList.map((item, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-800 dark:from-blue-900/60 dark:to-indigo-900/60 dark:text-blue-300 px-2 py-1 h-auto capitalize text-sm rounded-lg"
                                        >
                                            {item}
                                            <button
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                                className="ml-1.5 text-blue-700 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-400 rounded-full h-4 w-4 flex items-center justify-center bg-blue-50 dark:bg-blue-800/40 hover:bg-red-50 dark:hover:bg-red-900/30"
                                            >
                                                <X className="h-2.5 w-2.5" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center text-muted-foreground">
                                        <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-blue-300 dark:text-blue-700/50" />
                                        <p>Your shopping list is empty</p>
                                        <p className="text-xs mt-1">
                                            Add items to find the best deals
                                        </p>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="pt-0 pb-2 sm:pb-3 px-2 sm:px-3">
                        <Button
                            onClick={findBestDeals}
                            disabled={isLoading || shoppingList.length === 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 h-8 sm:h-10 text-xs sm:text-sm"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                    Finding best deals...
                                </>
                            ) : (
                                <>
                                    <Search className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    Find Best Deals
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <div className="md:col-span-8 space-y-4 sm:space-y-6">
                    {bestStore ? (
                        <>
                            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                                <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <Store className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                        Best Overall Store
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm text-green-600/80 dark:text-green-500/80">
                                        The best place to buy all your items
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-400">
                                                {bestStore.store}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-muted-foreground">
                                                {
                                                    mockStores.find(
                                                        s =>
                                                            s.name ===
                                                            bestStore.store
                                                    )?.location
                                                }{' '}
                                                (
                                                {locationEnabled &&
                                                bestStore.actualDistance
                                                    ? `${bestStore.actualDistance} km away (real-time)`
                                                    : `${bestStore.distance} km away (estimate)`}
                                                )
                                            </p>
                                        </div>
                                        <div className="text-right mt-2 sm:mt-0">
                                            <p className="text-xs sm:text-sm text-muted-foreground">
                                                Total Price
                                            </p>
                                            <p className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-400">
                                                {formatPrice(
                                                    bestStore.totalPrice
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Items Available</span>
                                            <span className="font-medium">
                                                {bestStore.itemsAvailable} of{' '}
                                                {bestStore.totalItems}
                                            </span>
                                        </div>
                                        <Progress
                                            value={
                                                (bestStore.itemsAvailable /
                                                    bestStore.totalItems) *
                                                100
                                            }
                                            className="h-2 bg-green-200 dark:bg-green-800"
                                        />
                                    </div>

                                    <div className="p-2 sm:p-3 bg-white/60 dark:bg-green-900/20 rounded-lg">
                                        <h4 className="font-medium mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                            <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                                            Why This Store
                                        </h4>
                                        <ul className="space-y-1 text-xs sm:text-sm">
                                            <li>
                                                ✓{' '}
                                                {bestStore.itemsAvailable ===
                                                bestStore.totalItems
                                                    ? 'Has all your items in stock'
                                                    : `Has ${bestStore.itemsAvailable} of ${bestStore.totalItems} items in stock`}
                                            </li>
                                            <li>
                                                ✓ Best overall price for your
                                                shopping list
                                            </li>
                                            <li>
                                                ✓{' '}
                                                {bestStore.distance < 2
                                                    ? 'Close to your location'
                                                    : 'Reasonable distance from your location'}
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                            {priceResults.length > 0 && (
                                <Card className="overflow-hidden">
                                    <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                            <BarChart4 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                            Price Comparison by Item
                                        </CardTitle>
                                        <CardDescription className="text-xs sm:text-sm">
                                            Compare prices across different
                                            stores
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="px-0">
                                        <ScrollArea className="h-[300px] sm:h-[400px]">
                                            <div className="space-y-3 sm:space-y-4">
                                                {priceResults.map(
                                                    (itemPrice, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="px-3 sm:px-6"
                                                        >
                                                            <h3 className="font-medium text-base sm:text-lg capitalize mb-1 sm:mb-2">
                                                                {itemPrice.item}
                                                            </h3>
                                                            <div className="space-y-1.5 sm:space-y-2">
                                                                {itemPrice.prices.map(
                                                                    (
                                                                        store,
                                                                        storeIdx
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                storeIdx
                                                                            }
                                                                            className={`flex items-center justify-between p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm ${
                                                                                storeIdx ===
                                                                                0
                                                                                    ? 'bg-green-50 dark:bg-green-900/20'
                                                                                    : 'bg-gray-50 dark:bg-gray-800/20'
                                                                            } ${
                                                                                !store.inStock
                                                                                    ? 'opacity-60'
                                                                                    : ''
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <Store
                                                                                    className={`h-4 w-4 ${
                                                                                        storeIdx ===
                                                                                        0
                                                                                            ? 'text-green-600'
                                                                                            : 'text-muted-foreground'
                                                                                    }`}
                                                                                />
                                                                                <span
                                                                                    className={`${
                                                                                        storeIdx ===
                                                                                        0
                                                                                            ? 'font-medium'
                                                                                            : ''
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        store.store
                                                                                    }
                                                                                </span>
                                                                                {!store.inStock && (
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className="text-xs bg-red-50 text-red-800 border-red-200"
                                                                                    >
                                                                                        Out
                                                                                        of
                                                                                        stock
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <div
                                                                                className={`flex items-center ${
                                                                                    storeIdx ===
                                                                                    0
                                                                                        ? 'text-green-700 dark:text-green-400 font-medium'
                                                                                        : ''
                                                                                }`}
                                                                            >
                                                                                {storeIdx ===
                                                                                    0 && (
                                                                                    <Badge className="mr-2 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                                                                        Best
                                                                                        price
                                                                                    </Badge>
                                                                                )}
                                                                                {formatPrice(
                                                                                    store.price
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                            {idx <
                                                                priceResults.length -
                                                                    1 && (
                                                                <Separator className="my-2 sm:my-4" />
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            )}
                            {storeTotals.length > 0 && (
                                <Card>
                                    <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                            Store Comparison
                                        </CardTitle>
                                        <CardDescription className="text-xs sm:text-sm">
                                            Compare total costs across stores
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                                        <div className="space-y-3 sm:space-y-4">
                                            {storeTotals.map((store, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-2 sm:p-3 rounded-lg ${
                                                        idx === 0
                                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-900/50 border border-green-200 dark:border-green-800'
                                                            : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                                            {idx === 0 && (
                                                                <Badge className="bg-green-600 text-xs px-1 sm:px-2 py-0 sm:py-0.5">
                                                                    Best Value
                                                                </Badge>
                                                            )}
                                                            <h3
                                                                className={`font-medium text-sm ${
                                                                    idx === 0
                                                                        ? 'sm:text-lg'
                                                                        : 'sm:text-base'
                                                                }`}
                                                            >
                                                                {store.store}
                                                            </h3>
                                                        </div>
                                                        <p
                                                            className={`font-bold ${
                                                                idx === 0
                                                                    ? 'text-base sm:text-xl text-green-700 dark:text-green-400'
                                                                    : 'text-sm sm:text-base'
                                                            }`}
                                                        >
                                                            {formatPrice(
                                                                store.totalPrice
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                                                        <div>
                                                            <p className="text-muted-foreground">
                                                                Items Available
                                                            </p>
                                                            <p className="font-medium">
                                                                {
                                                                    store.itemsAvailable
                                                                }{' '}
                                                                of{' '}
                                                                {
                                                                    store.totalItems
                                                                }
                                                            </p>
                                                            <Progress
                                                                value={
                                                                    (store.itemsAvailable /
                                                                        store.totalItems) *
                                                                    100
                                                                }
                                                                className="h-1.5 mt-1 bg-gray-200 dark:bg-gray-700"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">
                                                                Distance
                                                            </p>
                                                            <p className="font-medium flex items-center gap-1">
                                                                {locationEnabled &&
                                                                store.actualDistance
                                                                    ? `${store.actualDistance} km`
                                                                    : `${store.distance} km}`}
                                                                {locationEnabled &&
                                                                    store.actualDistance && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="ml-1 text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                                                        >
                                                                            real-time
                                                                        </Badge>
                                                                    )}
                                                            </p>
                                                            <Progress
                                                                value={
                                                                    100 -
                                                                    ((locationEnabled &&
                                                                    store.actualDistance
                                                                        ? store.actualDistance
                                                                        : store.distance) /
                                                                        5) *
                                                                        100
                                                                }
                                                                className="h-1.5 mt-1 bg-gray-200 dark:bg-gray-700"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    ) : !isLoading ? (
                        <div className="relative h-full min-h-[400px] flex items-center justify-center">
                            <div className="bg-white/95 dark:bg-gray-900/95 p-6 sm:p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
                                <Search className="mx-auto h-12 w-12 text-blue-500 mb-4 opacity-80" />
                                <h3 className="text-xl font-bold mb-2">
                                    Ready to find the best deals?
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Add items to your shopping list and click
                                    "Find Best Deals" to compare prices across
                                    stores
                                </p>
                                <div className="flex justify-center">
                                    <div className="animate-bounce flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                        <span>Start searching</span>
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                        >
                                            <path
                                                d="M8 12L8 4"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M12 8L8 4L4 8"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
                                <h3 className="text-lg font-medium mb-2">
                                    Finding best deals...
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Comparing prices across stores
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog
                open={showLocationDialog}
                onOpenChange={setShowLocationDialog}
            >
                <DialogContent className="max-w-[85vw] sm:max-w-[425px] p-4 sm:p-6">
                    <DialogHeader className="space-y-1 sm:space-y-2">
                        <DialogTitle className="text-base sm:text-lg">
                            Enable Location Services?
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            This allows us to show you real distances to each
                            store and provide more accurate recommendations.
                            Your location data is only used for this purpose and
                            is not stored.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowLocationDialog(false)}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                enableLocation();
                                setShowLocationDialog(false);
                            }}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                        >
                            Enable Location
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
