"use client";

import { Play, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";

import { GenerationModal } from "./generation-modal";

interface GenerationTriggerProps {
  btnStyle?: "dash" | "ghost" | "outline" | "soft";
  children?: React.ReactNode;
  className?: string;
  size?: "lg" | "md" | "sm";
  variant?: "accent" | "primary" | "secondary";
}

export function GenerationTrigger({
  btnStyle = "outline",
  children,
  className = "",
  size = "lg",
  variant = "primary",
}: GenerationTriggerProps) {
  return (
    <GenerationModal
      onEpisodeGenerated={() => {
        // Handle episode generation completion
      }}
      trigger={
        <Button
          btnStyle={btnStyle}
          className={`gap-2 ${className}`}
          size={size}
          variant={variant}
        >
          <Plus className="h-5 w-5" />
          {children || "Generate New Episode"}
        </Button>
      }
    />
  );
}

// Convenience component for the primary action
export function GenerateEpisodeButton() {
  return (
    <GenerationTrigger size="lg" variant="primary">
      Generate New Episode
    </GenerationTrigger>
  );
}

// Convenience component for smaller contexts
export function GenerateButton() {
  return (
    <GenerationTrigger size="sm" variant="primary">
      Generate Episode
    </GenerationTrigger>
  );
}
