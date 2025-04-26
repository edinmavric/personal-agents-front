import { Metadata } from 'next';
import SmartFridge from '@/components/fridge';

export const metadata: Metadata = {
    title: 'Recipe Finder | Find Healthy Recipes with Your Ingredients',
    description:
        'Enter the ingredients you have and get AI-powered healthy recipe suggestions tailored to your available groceries.',
};

export default function RecipeFinderPage() {
    return (
        <main className="py-8 min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center dark:from-green-950/20 dark:to-black/95">
            <div className="container">
                <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-2 text-center">
                    Smart Recipe Finder
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl mx-auto">
                    Enter the ingredients you have available, and our AI will
                    suggest the healthiest recipes you can make right now.
                </p>

                <SmartFridge />
            </div>
        </main>
    );
}
