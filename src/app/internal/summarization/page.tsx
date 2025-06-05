"use client";

import {
  Brain,
  Settings,
  BarChart3,
  TestTube,
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function SummarizationTestPage() {
  const [testContent, setTestContent] = useState(
    `
OpenAI has announced a major breakthrough in artificial intelligence with the release of GPT-4 Turbo, a more powerful and efficient version of their language model. The new model features improved reasoning capabilities, better code generation, and enhanced multimodal understanding.

Key improvements include:
- 128,000 token context window (4x larger than GPT-4)
- Updated knowledge cutoff to April 2024
- Reduced pricing: $0.01 per 1K input tokens, $0.03 per 1K output tokens
- Better instruction following and reduced hallucinations
- Enhanced performance on coding tasks

The model is now available through the OpenAI API and will be rolling out to ChatGPT Plus users over the coming weeks. This represents a significant step forward in making advanced AI capabilities more accessible and cost-effective for developers and businesses.

Industry experts predict this will accelerate AI adoption across various sectors, from customer service to content creation and software development.
  `.trim()
  );

  const [summaryOptions, setSummaryOptions] = useState({
    source: "OpenAI Blog",
    title: "OpenAI Announces GPT-4 Turbo",
    contentType: "tech" as const,
    summaryStyle: "conversational" as const,
    targetLength: "medium" as const,
    includeKeyPoints: true,
    includeTakeaways: true,
  });

  const [configOptions, setConfigOptions] = useState({
    provider: "openai" as const,
    model: "gpt-4-turbo-preview",
    maxTokens: 2000,
    temperature: 0.3,
  });

  // API calls
  const summarizeMutation = api.summarization.summarizeContent.useMutation();
  const { data: metrics } = api.summarization.getMetrics.useQuery();
  const { data: config } = api.summarization.getConfig.useQuery();
  const { data: history } = api.summarization.getHistory.useQuery({
    limit: 10,
  });
  const testConfigMutation = api.summarization.testConfiguration.useMutation();
  const updateConfigMutation = api.summarization.updateConfig.useMutation();

  const handleSummarize = async () => {
    try {
      await summarizeMutation.mutateAsync({
        content: testContent,
        ...summaryOptions,
      });
    } catch (error) {
      console.error("Summarization failed:", error);
    }
  };

  const handleTestConfig = async () => {
    try {
      await testConfigMutation.mutateAsync();
    } catch (error) {
      console.error("Config test failed:", error);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      await updateConfigMutation.mutateAsync(configOptions);
    } catch (error) {
      console.error("Config update failed:", error);
    }
  };

  const summaryResult = summarizeMutation.data?.data;
  const isLoading = summarizeMutation.isPending;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                AI Summarization Lab
              </h1>
              <p className="text-base-content/70">
                Test and monitor AI-powered content summarization
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Testing Interface */}
          <div className="xl:col-span-2 space-y-6">
            {/* Content Input */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <TestTube className="w-5 h-5 text-primary" />
                  <h2 className="card-title">Content Input</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Source</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={summaryOptions.source}
                        onChange={(e) =>
                          setSummaryOptions((prev) => ({
                            ...prev,
                            source: e.target.value,
                          }))
                        }
                        placeholder="Content source"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Title</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={summaryOptions.title}
                        onChange={(e) =>
                          setSummaryOptions((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Content title"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Type</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={summaryOptions.contentType}
                        onChange={(e) =>
                          setSummaryOptions((prev) => ({
                            ...prev,
                            contentType: e.target.value as any,
                          }))
                        }
                      >
                        <option value="tech">Tech</option>
                        <option value="news">News</option>
                        <option value="business">Business</option>
                        <option value="general">General</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Style</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={summaryOptions.summaryStyle}
                        onChange={(e) =>
                          setSummaryOptions((prev) => ({
                            ...prev,
                            summaryStyle: e.target.value as any,
                          }))
                        }
                      >
                        <option value="conversational">Conversational</option>
                        <option value="brief">Brief</option>
                        <option value="detailed">Detailed</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Length</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={summaryOptions.targetLength}
                        onChange={(e) =>
                          setSummaryOptions((prev) => ({
                            ...prev,
                            targetLength: e.target.value as any,
                          }))
                        }
                      >
                        <option value="short">Short (~100)</option>
                        <option value="medium">Medium (~200)</option>
                        <option value="long">Long (~300)</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Options</span>
                      </label>
                      <div className="flex gap-2">
                        <label className="label cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={summaryOptions.includeKeyPoints}
                            onChange={(e) =>
                              setSummaryOptions((prev) => ({
                                ...prev,
                                includeKeyPoints: e.target.checked,
                              }))
                            }
                          />
                          <span className="label-text ml-1 text-xs">
                            Key Points
                          </span>
                        </label>
                        <label className="label cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={summaryOptions.includeTakeaways}
                            onChange={(e) =>
                              setSummaryOptions((prev) => ({
                                ...prev,
                                includeTakeaways: e.target.checked,
                              }))
                            }
                          />
                          <span className="label-text ml-1 text-xs">
                            Takeaways
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Content</span>
                      <span className="label-text-alt">
                        {testContent.length} characters
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-32"
                      value={testContent}
                      onChange={(e) => setTestContent(e.target.value)}
                      placeholder="Paste your content here..."
                    />
                  </div>

                  <Button
                    onClick={handleSummarize}
                    disabled={isLoading || !testContent.trim()}
                    className="btn-primary"
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Summary Result */}
            {(summaryResult || summarizeMutation.error) && (
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title mb-4">Summary Result</h2>

                  {summarizeMutation.error && (
                    <div className="alert alert-error">
                      <span>Error: {summarizeMutation.error.message}</span>
                    </div>
                  )}

                  {summaryResult && (
                    <div className="space-y-4">
                      {/* Summary Text */}
                      <div className="bg-base-100 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Summary</h3>
                        <p className="text-base-content/80 leading-relaxed">
                          {summaryResult.summary}
                        </p>
                      </div>

                      {/* Key Points */}
                      {summaryResult.keyPoints &&
                        summaryResult.keyPoints.length > 0 && (
                          <div className="bg-base-100 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Key Points</h3>
                            <ul className="list-disc list-inside space-y-1">
                              {summaryResult.keyPoints.map((point, index) => (
                                <li
                                  key={index}
                                  className="text-base-content/80"
                                >
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* Takeaways */}
                      {summaryResult.takeaways &&
                        summaryResult.takeaways.length > 0 && (
                          <div className="bg-base-100 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Takeaways</h3>
                            <ul className="list-disc list-inside space-y-1">
                              {summaryResult.takeaways.map(
                                (takeaway, index) => (
                                  <li
                                    key={index}
                                    className="text-base-content/80"
                                  >
                                    {takeaway}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {/* TTS Preview */}
                      <div className="bg-base-100 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">TTS Optimized</h3>
                        <p className="text-sm text-base-content/60 mb-2">
                          Estimated duration:{" "}
                          {summaryResult.ttsOptimized.estimatedDuration}s
                        </p>
                        <p className="text-base-content/80 text-sm font-mono">
                          {summaryResult.ttsOptimized.text.substring(0, 200)}...
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="stat bg-base-100 rounded-lg">
                          <div className="stat-title text-xs">Compression</div>
                          <div className="stat-value text-sm">
                            {(
                              summaryResult.metadata.compressionRatio * 100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                        <div className="stat bg-base-100 rounded-lg">
                          <div className="stat-title text-xs">Processing</div>
                          <div className="stat-value text-sm">
                            {summaryResult.metadata.processingTime}ms
                          </div>
                        </div>
                        <div className="stat bg-base-100 rounded-lg">
                          <div className="stat-title text-xs">Cost</div>
                          <div className="stat-value text-sm">
                            ${summaryResult.metadata.cost.toFixed(4)}
                          </div>
                        </div>
                        <div className="stat bg-base-100 rounded-lg">
                          <div className="stat-title text-xs">Quality</div>
                          <div className="stat-value text-sm">
                            {(
                              ((summaryResult.metadata.quality.coherence +
                                summaryResult.metadata.quality.relevance +
                                summaryResult.metadata.quality.readability) /
                                3) *
                              100
                            ).toFixed(0)}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metrics & Config */}
          <div className="space-y-6">
            {/* Metrics Dashboard */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="card-title">Metrics</h2>
                </div>

                {metrics?.success && metrics.metrics && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="stat bg-base-100 rounded-lg p-3">
                        <div className="stat-title text-xs">Total Requests</div>
                        <div className="stat-value text-lg">
                          {metrics.metrics.totalRequests}
                        </div>
                      </div>
                      <div className="stat bg-base-100 rounded-lg p-3">
                        <div className="stat-title text-xs">Success Rate</div>
                        <div className="stat-value text-lg">
                          {metrics.metrics.totalRequests > 0
                            ? (
                                (metrics.metrics.successfulRequests /
                                  metrics.metrics.totalRequests) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div className="stat bg-base-100 rounded-lg p-3">
                        <div className="stat-title text-xs flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Total Cost
                        </div>
                        <div className="stat-value text-lg">
                          ${metrics.metrics.totalCost.toFixed(4)}
                        </div>
                      </div>
                      <div className="stat bg-base-100 rounded-lg p-3">
                        <div className="stat-title text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Avg Processing
                        </div>
                        <div className="stat-value text-lg">
                          {metrics.metrics.averageProcessingTime.toFixed(0)}ms
                        </div>
                      </div>
                      <div className="stat bg-base-100 rounded-lg p-3">
                        <div className="stat-title text-xs flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Avg Quality
                        </div>
                        <div className="stat-value text-lg">
                          {(metrics.metrics.averageQualityScore * 100).toFixed(
                            0
                          )}
                          %
                        </div>
                      </div>
                    </div>

                    {/* Quality Distribution */}
                    <div className="bg-base-100 p-3 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">
                        Quality Distribution
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Excellent</span>
                          <span>
                            {metrics.metrics.qualityDistribution.excellent}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Good</span>
                          <span>
                            {metrics.metrics.qualityDistribution.good}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Fair</span>
                          <span>
                            {metrics.metrics.qualityDistribution.fair}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Poor</span>
                          <span>
                            {metrics.metrics.qualityDistribution.poor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Configuration */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-primary" />
                  <h2 className="card-title">Configuration</h2>
                </div>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Provider</span>
                    </label>
                    <select
                      className="select select-bordered select-sm"
                      value={configOptions.provider}
                      onChange={(e) =>
                        setConfigOptions((prev) => ({
                          ...prev,
                          provider: e.target.value as any,
                        }))
                      }
                    >
                      <option value="openai">OpenAI</option>
                      <option value="claude">Claude</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Model</span>
                    </label>
                    <select
                      className="select select-bordered select-sm"
                      value={configOptions.model}
                      onChange={(e) =>
                        setConfigOptions((prev) => ({
                          ...prev,
                          model: e.target.value,
                        }))
                      }
                    >
                      <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Max Tokens</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered input-sm"
                      value={configOptions.maxTokens}
                      onChange={(e) =>
                        setConfigOptions((prev) => ({
                          ...prev,
                          maxTokens: parseInt(e.target.value),
                        }))
                      }
                      min="100"
                      max="4000"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Temperature</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered input-sm"
                      value={configOptions.temperature}
                      onChange={(e) =>
                        setConfigOptions((prev) => ({
                          ...prev,
                          temperature: parseFloat(e.target.value),
                        }))
                      }
                      min="0"
                      max="2"
                      step="0.1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleTestConfig}
                      disabled={testConfigMutation.isPending}
                      className="btn-sm flex-1"
                      btnStyle="outline"
                    >
                      {testConfigMutation.isPending ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        "Test"
                      )}
                    </Button>
                    <Button
                      onClick={handleUpdateConfig}
                      disabled={updateConfigMutation.isPending}
                      className="btn-sm flex-1"
                    >
                      {updateConfigMutation.isPending ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </div>

                  {testConfigMutation.data && (
                    <div
                      className={`alert ${testConfigMutation.data.success ? "alert-success" : "alert-error"} text-xs`}
                    >
                      <span>
                        {testConfigMutation.data.success
                          ? "Configuration test passed!"
                          : `Test failed: ${testConfigMutation.data.error}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent History */}
            {history?.success &&
              history.history &&
              history.history.length > 0 && (
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h2 className="card-title mb-4">Recent History</h2>
                    <div className="space-y-2">
                      {history.history.slice(0, 5).map((entry: any) => (
                        <div
                          key={entry.id}
                          className="bg-base-100 p-3 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {entry.request.title || "Untitled"}
                              </p>
                              <p className="text-xs text-base-content/60">
                                {entry.request.source}
                              </p>
                            </div>
                            <div
                              className={`badge ${entry.success ? "badge-success" : "badge-error"} badge-sm`}
                            >
                              {entry.success ? "Success" : "Failed"}
                            </div>
                          </div>
                          <p className="text-xs text-base-content/60 mt-1">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
