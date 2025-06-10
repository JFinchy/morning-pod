"use client";

import { useState as _useState } from "react";

import { MainLayout } from "@/components/layouts";
import { Button as _Button } from "@/components/ui";

export default function TTSPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body text-center">
            <h1 className="text-2xl font-bold mb-4">Text-to-Speech Service</h1>
            <p className="text-base-content/70 mb-4">
              This page is temporarily disabled while we refactor the TTS router
              to match the new API.
            </p>
            <p className="text-sm text-warning">
              The TTS service is available through the generation API at{" "}
              <code>/api/episodes/generate</code>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
