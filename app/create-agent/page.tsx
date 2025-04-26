'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { createAgent } from '@/lib/api';
import type { Agent } from '@/lib/api';
import { Toaster, toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

type AgentFormData = Omit<Agent, 'id' | 'rating' | 'reviewCount' | 'is_primary' | 'owner' | 'appearance'> & {
    tagsInput: string;
    publish: boolean;
    iconInitial?: string;
    iconColor?: string;
    bgColor?: string;
};

export default function CreateAgentPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<AgentFormData>>({
        name: '',
        description: '',
        system_prompt: '',
        price: '$0',
        tagsInput: '',
        publish: true,
        iconInitial: '',
        iconColor: '#000000',
        bgColor: '#ffffff',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

     const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
        if (typeof checked === 'boolean') {
            setFormData(prev => ({ ...prev, publish: checked }));
        }
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!formData.name || !formData.description || !formData.system_prompt) {
            toast.error('Please fill in all required fields: Name, Description, and System Prompt.');
            setIsSubmitting(false);
            return;
        }

        const initial = formData.iconInitial || formData.name?.charAt(0).toUpperCase() || 'A';

        const agentDataToSubmit = {
            name: formData.name,
            description: formData.description,
            system_prompt: formData.system_prompt,
            price: formData.price || '$0',
            tags: formData.tagsInput?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
            is_published: formData.publish,
            appearance: {
                iconInitial: initial,
                iconColor: formData.iconColor || '#000000',
                bgColor: formData.bgColor || '#ffffff',
            },
        };

        try {
            const result = await createAgent(agentDataToSubmit as any);

            if (result.success) {
                toast.success(`Agent "${result.data?.name}" created successfully!`);
                router.push('/marketplace');
            } else {
                toast.error(`Failed to create agent: ${result.message}`);
            }
        } catch (error) {
            console.error('Failed to submit agent creation form:', error);
            toast.error('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-10 flex items-center justify-center">
            <Toaster richColors />
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-primary">Create Your AI Agent</CardTitle>
                    <CardDescription>Define the properties of your new custom agent.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Agent Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Marketing Copywriter Pro"
                                required
                                className="bg-card"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe what your agent does, its capabilities, and use cases."
                                required
                                className="bg-card min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="system_prompt">System Prompt <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="system_prompt"
                                name="system_prompt"
                                value={formData.system_prompt}
                                onChange={handleChange}
                                placeholder="Define the core instructions, personality, and constraints for your agent. e.g., 'You are a helpful assistant specializing in...' "
                                required
                                className="bg-card min-h-[150px]"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="tagsInput">Tags (comma-separated)</Label>
                            <Input
                                id="tagsInput"
                                name="tagsInput"
                                value={formData.tagsInput}
                                onChange={handleChange}
                                placeholder="e.g., marketing, copywriting, social media"
                                className="bg-card"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g., $10 or $0 for free"
                                className="bg-card"
                            />
                        </div>

                        <fieldset className="border p-4 rounded-md space-y-4">
                             <legend className="text-sm font-medium px-1">Appearance</legend>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                 <div className="space-y-2">
                                     <Label htmlFor="iconInitial">Icon Initial</Label>
                                     <Input
                                         id="iconInitial"
                                         name="iconInitial"
                                         value={formData.iconInitial}
                                         onChange={handleChange}
                                         maxLength={2}
                                         placeholder={formData.name?.charAt(0).toUpperCase() || 'A'}
                                         className="bg-card w-16 text-center"
                                     />
                                 </div>
                                 <div className="space-y-2">
                                     <Label htmlFor="iconColor">Icon Color</Label>
                                     <Input
                                         id="iconColor"
                                         name="iconColor"
                                         type="color"
                                         value={formData.iconColor}
                                         onChange={handleColorChange}
                                         className="bg-card p-1 h-10 w-16"
                                     />
                                 </div>
                                 <div className="space-y-2">
                                     <Label htmlFor="bgColor">Background Color</Label>
                                     <Input
                                         id="bgColor"
                                         name="bgColor"
                                         type="color"
                                         value={formData.bgColor}
                                         onChange={handleColorChange}
                                         className="bg-card p-1 h-10 w-16"
                                     />
                                 </div>
                             </div>
                         </fieldset>


                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="publish"
                                checked={formData.publish}
                                onCheckedChange={handleCheckboxChange}
                            />
                            <Label htmlFor="publish" className="cursor-pointer">
                                Publish this agent to the marketplace immediately
                            </Label>
                        </div>

                        <CardFooter className="p-0 pt-6">
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? 'Creating Agent...' : 'Create Agent'}
                            </Button>
                        </CardFooter>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
