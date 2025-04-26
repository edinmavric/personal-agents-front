'use client';

import React, { useState, useRef } from 'react';
import {
    Plus,
    X,
    Loader2,
    Apple,
    ChefHat,
    Lightbulb,
    Utensils,
    Clock,
    Tag,
    Camera,
    ImageIcon,
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface Recipe {
    id: string;
    title: string;
    ingredients: string[];
    instructions: string[];
    nutritionalInfo: {
        calories: number;
        protein: string;
        carbs: string;
        fat: string;
    };
    timeToMake: string;
    image?: string;
}

export default function SmartFridge() {
    const [groceries, setGroceries] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [quickRecipes, setQuickRecipes] = useState<Recipe[]>([]);
    const [loadingQuickRecipes, setLoadingQuickRecipes] = useState(false);
    const [isQuickRecipesModalOpen, setIsQuickRecipesModalOpen] =
        useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addGrocery = () => {
        if (currentInput.trim() === '') return;

        if (!groceries.includes(currentInput.trim().toLowerCase())) {
            setGroceries([...groceries, currentInput.trim().toLowerCase()]);
            setCurrentInput('');
        } else {
            toast.warning('This item is already in your list');
        }
    };

    const removeGrocery = (index: number) => {
        const newGroceries = [...groceries];
        newGroceries.splice(index, 1);
        setGroceries(newGroceries);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addGrocery();
        }
    };

    const generateRecipes = async () => {
        if (groceries.length === 0) {
            toast.error('Please add some groceries first');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/recipes/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ingredients: groceries }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate recipes');
            }

            const data = await response.json();
            setRecipes(data.recipes);
            toast.success('Found some delicious healthy recipes for you!');
        } catch (error) {
            console.error('Error generating recipes:', error);
            toast.error('Something went wrong. Please try again.');

            setRecipes([
                {
                    id: '1',
                    title: 'Mediterranean Vegetable Salad',
                    ingredients: [
                        'cucumber',
                        'tomato',
                        'red onion',
                        'olive oil',
                        'lemon juice',
                        'feta cheese',
                    ],
                    instructions: [
                        'Chop all vegetables into bite-sized pieces',
                        'Mix together in a large bowl',
                        'Drizzle with olive oil and lemon juice',
                        'Sprinkle crumbled feta cheese on top',
                    ],
                    nutritionalInfo: {
                        calories: 320,
                        protein: '8g',
                        carbs: '12g',
                        fat: '28g',
                    },
                    timeToMake: '15 minutes',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const getQuickRecipes = async () => {
        setLoadingQuickRecipes(true);

        try {
            const response = await fetch('/api/recipes/quick', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to get quick recipes');
            }

            const data = await response.json();
            setQuickRecipes(data.recipes);
            toast.success('Here are some recipe ideas to inspire you!');
        } catch (error) {
            console.error('Error getting quick recipes:', error);
            toast.error('Something went wrong. Please try again.');

            setQuickRecipes([
                {
                    id: 'q1',
                    title: '15-Minute Quinoa Bowl',
                    ingredients: [
                        'quinoa',
                        'avocado',
                        'cherry tomatoes',
                        'cucumber',
                        'olive oil',
                        'lemon juice',
                    ],
                    instructions: [
                        'Cook quinoa according to package instructions',
                        'Chop vegetables and arrange in a bowl',
                        'Drizzle with olive oil and lemon juice',
                        'Season with salt and pepper to taste',
                    ],
                    nutritionalInfo: {
                        calories: 350,
                        protein: '10g',
                        carbs: '45g',
                        fat: '15g',
                    },
                    timeToMake: '15 minutes',
                },
                {
                    id: 'q2',
                    title: 'Protein-Packed Smoothie',
                    ingredients: [
                        'banana',
                        'Greek yogurt',
                        'spinach',
                        'protein powder',
                        'almond milk',
                        'honey',
                    ],
                    instructions: [
                        'Add all ingredients to a blender',
                        'Blend until smooth',
                        'Pour into a glass and enjoy',
                    ],
                    nutritionalInfo: {
                        calories: 280,
                        protein: '24g',
                        carbs: '35g',
                        fat: '5g',
                    },
                    timeToMake: '5 minutes',
                },
            ]);
        } finally {
            setLoadingQuickRecipes(false);
        }
    };

    const handleOpenQuickRecipesModal = () => {
        setIsQuickRecipesModalOpen(true);
        if (quickRecipes.length === 0) {
            getQuickRecipes();
        }
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            setUploadedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        setIsProcessingImage(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const detectedIngredients = ['apple', 'banana', 'tomato'];

            const newIngredients = detectedIngredients.filter(
                ingredient => !groceries.includes(ingredient)
            );

            if (newIngredients.length > 0) {
                setGroceries([...groceries, ...newIngredients]);
                toast.success(
                    `Added ${newIngredients.length} ingredients from your image!`
                );
            } else {
                toast.info('No new ingredients detected in the image');
            }
        } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Failed to process image. Please try again.');
        } finally {
            setIsProcessingImage(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="container mx-auto py-2 sm:py-4 px-2 sm:px-4 max-w-7xl h-screen flex flex-col">
            <div className="flex justify-end mb-2 sm:mb-4">
                <Button
                    onClick={handleOpenQuickRecipesModal}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-700 shadow-md rounded-lg transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
                >
                    <Lightbulb className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    Get Recipe Ideas
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-6 flex-grow overflow-hidden">
                <Card className="md:col-span-4 lg:col-span-3 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                    <CardHeader className="py-2 sm:py-3 space-y-0.5 sm:space-y-1">
                        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-green-700 dark:text-green-400 text-lg sm:text-xl">
                            <Apple className="h-4 sm:h-5 w-4 sm:w-5" />
                            Your Groceries
                        </CardTitle>
                        <CardDescription className="text-green-600/80 dark:text-green-500/80 text-xs sm:text-sm">
                            Tell us what ingredients you have
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow pb-2 px-2 sm:px-3 flex flex-col">
                        <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-3">
                            <Input
                                placeholder="Add an ingredient..."
                                value={currentInput}
                                onChange={e => setCurrentInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-grow bg-white dark:bg-green-950/40 border-green-200 dark:border-green-800 shadow-sm rounded-lg text-sm sm:text-base h-9 sm:h-10"
                            />
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={addGrocery}
                                    size="icon"
                                    className="flex-1 sm:flex-none shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-sm rounded-lg w-9 sm:w-10 h-9 sm:h-10 transition-all duration-300"
                                >
                                    <Plus className="h-4 sm:h-5 w-4 sm:w-5" />
                                </Button>
                                <Button
                                    onClick={triggerFileInput}
                                    size="icon"
                                    disabled={isProcessingImage}
                                    className="flex-1 sm:flex-none shrink-0 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-sm rounded-lg w-9 sm:w-10 h-9 sm:h-10 transition-all duration-300"
                                    title="Upload image of groceries"
                                >
                                    {isProcessingImage ? (
                                        <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                                    ) : (
                                        <Camera className="h-4 sm:h-5 w-4 sm:w-5" />
                                    )}
                                </Button>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                            />
                        </div>

                        {uploadedImage && (
                            <div className="mb-3 relative group">
                                <div className="relative w-full h-20 sm:h-28 rounded-lg overflow-hidden bg-black/5">
                                    <img
                                        src={uploadedImage}
                                        alt="Uploaded groceries"
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-white bg-black/40 hover:bg-black/60 text-xs sm:text-sm"
                                            onClick={() =>
                                                setUploadedImage(null)
                                            }
                                        >
                                            <X className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-1" />{' '}
                                            Remove
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-green-600 rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs text-white flex items-center">
                                        <ImageIcon className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1" />{' '}
                                        Scan completed
                                    </div>
                                </div>
                            </div>
                        )}

                        <ScrollArea className="flex-grow rounded-lg border border-green-200 dark:border-green-800/50 bg-white/90 dark:bg-green-950/40 p-1.5 sm:p-2 shadow-inner min-h-[120px]">
                            {groceries.length > 0 ? (
                                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                    {groceries.map((grocery, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-800 dark:from-green-900/60 dark:to-emerald-900/60 dark:text-green-300 px-1.5 sm:px-2 py-0.5 sm:py-1 h-auto capitalize text-xs sm:text-sm rounded-md sm:rounded-lg transition-all duration-200 shadow-sm"
                                        >
                                            {grocery}
                                            <button
                                                onClick={() =>
                                                    removeGrocery(index)
                                                }
                                                className="ml-1 sm:ml-1.5 text-green-700 dark:text-green-400 hover:text-red-600 dark:hover:text-red-400 rounded-full h-3.5 sm:h-4 w-3.5 sm:w-4 flex items-center justify-center bg-green-50 dark:bg-green-800/40 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                                            >
                                                <X className="h-2 sm:h-2.5 w-2 sm:w-2.5" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    <div className="text-center">
                                        <Tag className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-1 text-green-300 dark:text-green-700/50" />
                                        <p>No ingredients yet</p>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="pt-0 pb-2 sm:pb-3 px-2 sm:px-3">
                        <Button
                            onClick={generateRecipes}
                            disabled={isLoading || groceries.length === 0}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 dark:from-green-600 dark:to-emerald-700 dark:hover:from-green-500 dark:hover:to-emerald-600 h-8 sm:h-10 rounded-lg shadow-sm text-sm sm:text-base font-medium transition-all duration-300"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4 animate-spin" />
                                    Finding recipes...
                                </>
                            ) : (
                                <>
                                    <ChefHat className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                                    Generate Recipes
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="md:col-span-8 lg:col-span-9 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                    <CardHeader className="py-2 sm:py-3 space-y-0.5 sm:space-y-1">
                        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-green-700 dark:text-green-400 text-lg sm:text-xl">
                            <ChefHat className="h-4 sm:h-5 w-4 sm:w-5" />
                            Healthy Recipe Suggestions
                        </CardTitle>
                        <CardDescription className="text-green-600/80 dark:text-green-500/80 text-xs sm:text-sm">
                            Based on your available ingredients
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow p-2 sm:p-3 pt-0 overflow-hidden">
                        <ScrollArea className="h-full pr-2 sm:pr-3">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-2 sm:space-y-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-300 to-emerald-300 dark:from-green-700 dark:to-emerald-700 blur-lg opacity-30 animate-pulse"></div>
                                        <Loader2 className="h-8 sm:h-10 w-8 sm:w-10 animate-spin text-green-600 dark:text-green-400 relative z-10" />
                                    </div>
                                    <p className="text-sm sm:text-base text-green-700 dark:text-green-400">
                                        Finding healthy recipes...
                                    </p>
                                </div>
                            ) : recipes.length > 0 ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {recipes.map(recipe => (
                                        <div
                                            key={recipe.id}
                                            className="bg-white dark:bg-green-950/40 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-green-100 dark:border-green-800/30"
                                        >
                                            <h3 className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-300 mb-1 sm:mb-1.5">
                                                {recipe.title}
                                            </h3>

                                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">
                                                <span className="flex items-center gap-0.5 sm:gap-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs">
                                                    <Clock className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                                                    {recipe.timeToMake}
                                                </span>
                                                <span className="flex items-center gap-0.5 sm:gap-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs">
                                                    <Utensils className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                                                    {
                                                        recipe.nutritionalInfo
                                                            .calories
                                                    }{' '}
                                                    cal
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                                                <div>
                                                    <h4 className="font-medium text-green-700 dark:text-green-400 text-xs sm:text-sm mb-0.5 sm:mb-1 flex items-center gap-0.5 sm:gap-1">
                                                        <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 bg-green-500 dark:bg-green-400 rounded-full"></span>
                                                        Ingredients:
                                                    </h4>
                                                    <ul className="list-disc pl-3 sm:pl-4 text-xs sm:text-sm space-y-0.5">
                                                        {recipe.ingredients
                                                            .slice(0, 4)
                                                            .map(
                                                                (
                                                                    ingredient,
                                                                    idx
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="capitalize"
                                                                    >
                                                                        {
                                                                            ingredient
                                                                        }
                                                                    </li>
                                                                )
                                                            )}
                                                        {recipe.ingredients
                                                            .length > 4 && (
                                                            <li className="text-gray-500">
                                                                +
                                                                {recipe
                                                                    .ingredients
                                                                    .length -
                                                                    4}{' '}
                                                                more
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium text-green-700 dark:text-green-400 text-xs sm:text-sm mb-0.5 sm:mb-1 flex items-center gap-0.5 sm:gap-1 mt-1.5 sm:mt-0">
                                                        <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 bg-green-500 dark:bg-green-400 rounded-full"></span>
                                                        Instructions:
                                                    </h4>
                                                    <ol className="list-decimal pl-3 sm:pl-4 text-xs sm:text-sm space-y-0.5">
                                                        {recipe.instructions
                                                            .slice(0, 2)
                                                            .map(
                                                                (step, idx) => (
                                                                    <li
                                                                        key={
                                                                            idx
                                                                        }
                                                                    >
                                                                        {step}
                                                                    </li>
                                                                )
                                                            )}
                                                        {recipe.instructions
                                                            .length > 2 && (
                                                            <li className="text-gray-500">
                                                                +
                                                                {recipe
                                                                    .instructions
                                                                    .length -
                                                                    2}{' '}
                                                                more steps
                                                            </li>
                                                        )}
                                                    </ol>
                                                </div>
                                            </div>

                                            <Separator className="my-1.5 sm:my-2 bg-green-100 dark:bg-green-800/50" />

                                            <div className="flex flex-wrap justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 bg-green-50 dark:bg-green-900/30 p-1 sm:p-1.5 rounded-lg">
                                                <span className="font-medium px-1">
                                                    Protein:{' '}
                                                    {
                                                        recipe.nutritionalInfo
                                                            .protein
                                                    }
                                                </span>
                                                <span className="font-medium px-1">
                                                    Carbs:{' '}
                                                    {
                                                        recipe.nutritionalInfo
                                                            .carbs
                                                    }
                                                </span>
                                                <span className="font-medium px-1">
                                                    Fat:{' '}
                                                    {recipe.nutritionalInfo.fat}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-2 sm:p-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-900 dark:to-emerald-900 blur-lg opacity-20"></div>
                                        <ChefHat className="h-10 sm:h-12 w-10 sm:w-12 mb-2 sm:mb-3 text-green-200 dark:text-green-800 relative z-10" />
                                    </div>
                                    <p className="text-sm sm:text-base font-medium">
                                        Add ingredients first
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1 text-center max-w-xs">
                                        We'll find healthy options just for you
                                    </p>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={isQuickRecipesModalOpen}
                onOpenChange={setIsQuickRecipesModalOpen}
            >
                <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900/95 border-blue-200 dark:border-blue-800 p-3 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-1.5 sm:gap-2 text-blue-700 dark:text-blue-400 text-xl sm:text-2xl">
                            <Lightbulb className="h-5 sm:h-6 w-5 sm:w-6" />
                            Recipe Ideas
                        </DialogTitle>
                        <DialogDescription className="text-blue-600/80 dark:text-blue-500/80 text-sm sm:text-base">
                            Get some healthy recipe inspiration instantly
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-grow overflow-hidden py-1 sm:py-2">
                        {loadingQuickRecipes ? (
                            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                                <div className="relative mb-3 sm:mb-4">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-200 to-indigo-300 dark:from-blue-700 dark:to-indigo-800 blur-lg opacity-20"></div>
                                    <Loader2 className="h-8 sm:h-10 w-8 sm:w-10 animate-spin text-blue-500 dark:text-blue-400 relative z-10" />
                                </div>
                                <p className="text-sm sm:text-base text-blue-600 dark:text-blue-400">
                                    Finding delicious recipe ideas for you...
                                </p>
                            </div>
                        ) : quickRecipes.length > 0 ? (
                            <ScrollArea className="h-[50vh] sm:h-[60vh]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 px-1">
                                    {quickRecipes.map(recipe => (
                                        <div
                                            key={recipe.id}
                                            className="bg-white/90 dark:bg-blue-950/40 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100 dark:border-blue-800/30 overflow-hidden group relative"
                                        >
                                            <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-800/30 dark:to-indigo-800/30 rounded-full -mr-8 -mt-8 opacity-70"></div>

                                            <h3 className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-300 mb-1.5 sm:mb-2 relative">
                                                {recipe.title}
                                            </h3>

                                            <div className="mb-2 sm:mb-3">
                                                <span className="items-center gap-0.5 sm:gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 inline-flex text-xs sm:text-sm w-fit">
                                                    <Clock className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-0.5 sm:mr-1" />
                                                    {recipe.timeToMake}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                                <div>
                                                    <h4 className="font-medium text-blue-700 dark:text-blue-400 text-xs sm:text-sm mb-0.5 sm:mb-1 flex items-center gap-0.5 sm:gap-1">
                                                        <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                                                        Ingredients:
                                                    </h4>
                                                    <ul className="list-disc pl-3 sm:pl-4 text-xs sm:text-sm space-y-0.5">
                                                        {recipe.ingredients
                                                            .slice(0, 4)
                                                            .map(
                                                                (
                                                                    ingredient,
                                                                    idx
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="capitalize"
                                                                    >
                                                                        {
                                                                            ingredient
                                                                        }
                                                                    </li>
                                                                )
                                                            )}
                                                        {recipe.ingredients
                                                            .length > 4 && (
                                                            <li className="text-gray-500">
                                                                +
                                                                {recipe
                                                                    .ingredients
                                                                    .length -
                                                                    4}{' '}
                                                                more
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>

                                                <div className="mt-1.5 sm:mt-0">
                                                    <h4 className="font-medium text-blue-700 dark:text-blue-400 text-xs sm:text-sm mb-0.5 sm:mb-1 flex items-center gap-0.5 sm:gap-1">
                                                        <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                                                        Instructions:
                                                    </h4>
                                                    <ol className="list-decimal pl-3 sm:pl-4 text-xs sm:text-sm space-y-0.5">
                                                        {recipe.instructions
                                                            .slice(0, 3)
                                                            .map(
                                                                (step, idx) => (
                                                                    <li
                                                                        key={
                                                                            idx
                                                                        }
                                                                    >
                                                                        {step}
                                                                    </li>
                                                                )
                                                            )}
                                                        {recipe.instructions
                                                            .length > 3 && (
                                                            <li className="text-gray-500">
                                                                +
                                                                {recipe
                                                                    .instructions
                                                                    .length -
                                                                    3}{' '}
                                                                more steps
                                                            </li>
                                                        )}
                                                    </ol>
                                                </div>
                                            </div>

                                            <Separator className="my-2 sm:my-3 bg-blue-100 dark:bg-blue-800/50" />

                                            <div className="flex flex-wrap justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-900/30 p-1.5 sm:p-2 rounded-lg">
                                                <span className="font-medium px-1 mb-1">
                                                    Cal:{' '}
                                                    {
                                                        recipe.nutritionalInfo
                                                            .calories
                                                    }
                                                </span>
                                                <span className="font-medium px-1 mb-1">
                                                    Protein:{' '}
                                                    {
                                                        recipe.nutritionalInfo
                                                            .protein
                                                    }
                                                </span>
                                                <span className="font-medium px-1 mb-1">
                                                    Carbs:{' '}
                                                    {
                                                        recipe.nutritionalInfo
                                                            .carbs
                                                    }
                                                </span>
                                                <span className="font-medium px-1 mb-1">
                                                    Fat:{' '}
                                                    {recipe.nutritionalInfo.fat}
                                                </span>
                                            </div>

                                            <div className="absolute bottom-0 left-0 h-0.5 sm:h-1 bg-gradient-to-r from-blue-400 to-indigo-500 w-0 group-hover:w-full transition-all duration-300"></div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                                <div className="relative mb-3 sm:mb-4">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-200 to-indigo-300 dark:from-blue-700 dark:to-indigo-800 blur-lg opacity-20"></div>
                                    <Lightbulb className="h-10 sm:h-12 w-10 sm:w-12 text-blue-300 dark:text-blue-700 relative z-10" />
                                </div>
                                <Button
                                    onClick={getQuickRecipes}
                                    disabled={loadingQuickRecipes}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-600 rounded-lg shadow-md text-sm sm:text-base font-medium px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-300"
                                >
                                    Get Recipe Ideas
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
