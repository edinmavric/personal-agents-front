"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { createAgent } from "@/lib/api";
import type { Agent } from "@/lib/api";
import { Toaster, toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Bot, Sparkles, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

// Define the structure for the form data, excluding fields set by backend or defaults
type AgentFormData = Omit<
  Agent,
  "id" | "rating" | "reviewCount" | "is_primary" | "owner" | "appearance"
> & {
  tagsInput: string; // Use a single string for tags input
  publish: boolean; // Add publish flag
  // Add appearance fields if needed for creation
  iconInitial?: string;
};

export default function CreateAgentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<AgentFormData>>({
    name: "",
    description: "",
    system_prompt: "",
    price: "$0",
    tagsInput: "",
    publish: true,
    iconInitial: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      setFormData((prev) => ({ ...prev, publish: checked }));
    }
  };

  // Function to get avatar styles based on current form data
  const getAvatarStyles = () => {
    return {
      backgroundColor: "#6366f1", // Default indigo color
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: "1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.description || !formData.system_prompt) {
      toast.error(
        "Please fill in all required fields: Name, Description, and System Prompt."
      );
      setIsSubmitting(false);
      return;
    }

    // Basic validation for icon initial
    const initial =
      formData.iconInitial || formData.name?.charAt(0).toUpperCase() || "A";

    const agentDataToSubmit = {
      name: formData.name,
      description: formData.description,
      system_prompt: formData.system_prompt,
      price: formData.price || "$0",
      tags:
        formData.tagsInput
          ?.split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag) || [],
      is_published: formData.publish, // Assuming backend field name
      appearance: {
        // Structure appearance data
        iconInitial: initial,
        iconColor: "#6366f1", // Default indigo color
        bgColor: "#818cf8", // Default lighter indigo
      },
      // Add other fields from AgentFormData if necessary
    };

    try {
      // Type assertion needed if createAgent expects a more specific type
      const result = await createAgent(agentDataToSubmit as any);

      if (result.success) {
        toast.success(`Agent "${result.data?.name}" created successfully!`);
        // Optionally redirect to the marketplace or the new agent's page
        router.push("/marketplace");
      } else {
        toast.error(`Failed to create agent: ${result.message}`);
      }
    } catch (error) {
      console.error("Failed to submit agent creation form:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 p-4 md:p-10 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="absolute top-40 right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <Toaster richColors position="top-center" />

      <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <Link
          href="/marketplace"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      <Card className="w-full max-w-2xl shadow-xl border border-indigo-200 dark:border-indigo-900/50 animate-fadeIn bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Create Your AI Agent
                </span>
              </CardTitle>
              <CardDescription>
                Define your agent's capabilities, personality and appearance
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-base font-medium flex items-center gap-1"
              >
                Agent Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Marketing Copywriter Pro"
                required
                className="bg-card border-indigo-200 dark:border-indigo-800/50 focus-visible:ring-indigo-500/50 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what your agent does, its capabilities, and use cases."
                required
                className="bg-card border-indigo-200 dark:border-indigo-800/50 focus-visible:ring-indigo-500/50 min-h-[100px] text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system_prompt" className="text-base font-medium">
                System Prompt <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="system_prompt"
                name="system_prompt"
                value={formData.system_prompt}
                onChange={handleChange}
                placeholder="Define the core instructions, personality, and constraints for your agent. e.g., 'You are a helpful assistant specializing in...' "
                required
                className="bg-card border-indigo-200 dark:border-indigo-800/50 focus-visible:ring-indigo-500/50 min-h-[150px] text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tagsInput" className="text-base font-medium">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tagsInput"
                  name="tagsInput"
                  value={formData.tagsInput}
                  onChange={handleChange}
                  placeholder="e.g., marketing, copywriting, social media"
                  className="bg-card border-indigo-200 dark:border-indigo-800/50 focus-visible:ring-indigo-500/50 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-base font-medium">
                  Price
                </Label>
                <Input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., $10 or $0 for free"
                  className="bg-card border-indigo-200 dark:border-indigo-800/50 focus-visible:ring-indigo-500/50 text-base"
                />
              </div>
            </div>

            {/* Simplified Appearance Settings with Preview */}
            <fieldset className="border border-indigo-200 dark:border-indigo-800/50 p-6 rounded-lg shadow-sm space-y-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
              <legend className="text-base font-medium px-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                ✨ Agent Appearance
              </legend>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Preview section */}
                <div className="flex-1 flex flex-col items-center gap-4 bg-white dark:bg-black/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                  <span className="text-sm text-muted-foreground">Preview</span>
                  <div
                    className="h-20 w-20 rounded-full flex items-center justify-center"
                    style={getAvatarStyles()}
                  >
                    {formData.iconInitial ? (
                      formData.iconInitial.substring(0, 2).toUpperCase()
                    ) : formData.name ? (
                      formData.name.charAt(0).toUpperCase()
                    ) : (
                      <Bot size={30} />
                    )}
                  </div>
                  <span className="text-center font-medium">
                    {formData.name || "Your Agent Name"}
                  </span>
                </div>

                {/* Settings section - simplified */}
                <div className="flex-[2] space-y-4 flex items-center justify-center">
                  <div className="space-y-3 max-w-xs w-full">
                    <Label htmlFor="iconInitial" className="text-sm">
                      Icon Initial (max 2 characters)
                    </Label>
                    <Input
                      id="iconInitial"
                      name="iconInitial"
                      value={formData.iconInitial}
                      onChange={handleChange}
                      maxLength={2}
                      placeholder={
                        formData.name?.charAt(0).toUpperCase() || "A"
                      }
                      className="bg-white dark:bg-black/20 w-24 text-center text-base font-medium"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter up to 2 characters to display as your agent's icon.
                      If left blank, the first letter of the agent name will be
                      used.
                    </p>
                  </div>
                </div>
              </div>
            </fieldset>

            <div className="flex items-center space-x-3 pt-2 bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <Checkbox
                id="publish"
                checked={formData.publish}
                onCheckedChange={handleCheckboxChange}
                className="border-indigo-400 dark:border-indigo-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
              <Label
                htmlFor="publish"
                className="cursor-pointer text-base flex items-center gap-1.5"
              >
                <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Publish this agent to the marketplace immediately
              </Label>
            </div>

            <CardFooter className="p-0 pt-6 flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 min-h-11 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium"
              >
                {isSubmitting ? "Creating Agent..." : "Create Agent"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/marketplace")}
                className="flex-1 min-h-11 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(
              to right,
              rgba(127, 127, 127, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(127, 127, 127, 0.1) 1px,
              transparent 1px
            );
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
