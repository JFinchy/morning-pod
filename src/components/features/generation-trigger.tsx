"use client";

import { Plus, Play } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";

import { GenerationModal } from "./generation-modal";

interface GenerationTriggerProps {
  variant?: "primary" | "secondary" | "accent";
  btnStyle?: "outline" | "ghost" | "dash" | "soft";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function GenerationTrigger({
  variant = "primary",
  btnStyle = "outline",
  size = "lg",
  className = "",
  children,
}: GenerationTriggerProps) {
  return (
    <GenerationModal
      trigger={
        <Button
          variant={variant}
          btnStyle={btnStyle}
          size={size}
          className={`gap-2 ${className}`}
        >
          <Plus className="w-5 h-5" />
          {children || "Generate New Episode"}
        </Button>
      }
      onEpisodeGenerated={() => {
        // Handle episode generation completion
      }}
    />
  );
}

// Convenience component for the primary action
export function GenerateEpisodeButton() {
  return (
    <GenerationTrigger variant="primary" size="lg">
      Generate New Episode
    </GenerationTrigger>
  );
}

// Convenience component for smaller contexts
export function GenerateButton() {
  return (
    <GenerationTrigger variant="primary" size="sm">
      Generate Episode
    </GenerationTrigger>
  );
}
