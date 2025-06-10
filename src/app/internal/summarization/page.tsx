"use client";

import { useState as _useState } from "react";

import { MainLayout } from "@/components/layouts";
import { Button as _Button } from "@/components/ui";

export default function SummarizationPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body text-center">
            <h1 className="mb-4 text-2xl font-bold">Summarization Service</h1>
            <p className="text-base-content/70 mb-4">
              This page is temporarily disabled while we refactor the
              summarization router to match the new API.
            </p>
            <p className="text-warning text-sm">
              The summarization service is available through the generation API
              at <code>/api/episodes/generate</code>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
