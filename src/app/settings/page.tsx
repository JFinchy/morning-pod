"use client";

import {
  Brain,
  DollarSign,
  Eye,
  EyeOff,
  Globe,
  Info,
  Mic,
  Palette,
  RotateCcw,
  Save,
  Settings,
  Volume2,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AIProviderSelector } from "@/components/features";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import {
  getPreferences,
  savePreferences,
  type UserPreferences,
} from "@/lib/utils/local-storage";

type SettingsTab = "ai-models" | "interface" | "playback" | "privacy";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("ai-models");
  const [preferences, setPreferences] = useState<null | UserPreferences>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // AI Model selections
  const [selectedSummarizationModel, setSelectedSummarizationModel] =
    useState<string>("gpt-4o-mini");
  const [selectedTTSModel, setSelectedTTSModel] = useState<string>("tts-1");
  const [aiPriority, setAiPriority] = useState<"cost" | "quality" | "speed">(
    "cost"
  );

  useEffect(() => {
    const prefs = getPreferences();
    setPreferences(prefs);
  }, []);

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    if (!preferences) return;

    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    setHasChanges(true);
  };

  const saveSettings = async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      // Add AI model preferences to the preferences
      const updatedPrefs = {
        ...preferences,
        aiModels: {
          priority: aiPriority,
          summarization: selectedSummarizationModel,
          tts: selectedTTSModel,
        },
      };

      savePreferences(updatedPrefs);
      setHasChanges(false);

      // TODO: Show success toast
      console.log("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      // TODO: Show error toast
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    const defaultPrefs = getPreferences();
    setPreferences(defaultPrefs);
    setSelectedSummarizationModel("gpt-4o-mini");
    setSelectedTTSModel("tts-1");
    setAiPriority("cost");
    setHasChanges(true);
  };

  if (!preferences) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="loading loading-spinner loading-lg text-primary" />
          </div>
        </div>
      </MainLayout>
    );
  }

  const tabs = [
    {
      description: "Configure AI providers and model preferences",
      icon: Brain,
      id: "ai-models" as const,
      name: "AI Models",
    },
    {
      description: "Audio player settings and preferences",
      icon: Volume2,
      id: "playback" as const,
      name: "Playback",
    },
    {
      description: "Theme, layout, and display preferences",
      icon: Palette,
      id: "interface" as const,
      name: "Interface",
    },
    {
      description: "Data and privacy settings",
      icon: Eye,
      id: "privacy" as const,
      name: "Privacy",
    },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-base-content">Settings</h1>
              <p className="text-base-content/70 mt-1">
                Configure your podcast generation preferences
              </p>
            </div>

            {hasChanges && (
              <div className="flex gap-2">
                <Button
                  className="gap-2"
                  onClick={resetToDefaults}
                  variant="secondary"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  className="gap-2"
                  disabled={isSaving}
                  onClick={saveSettings}
                  variant="primary"
                >
                  {isSaving ? (
                    <div className="loading loading-spinner loading-sm" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-4">
                <h3 className="font-semibold text-base-content mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "bg-primary text-primary-content"
                            : "hover:bg-base-200"
                        }`}
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{tab.name}</div>
                            <div className="text-xs opacity-70">
                              {tab.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-6">
                {activeTab === "ai-models" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-semibold text-base-content mb-2">
                        AI Model Configuration
                      </h2>
                      <p className="text-base-content/60 mb-6">
                        Choose the AI models for content summarization and
                        text-to-speech generation. Different models offer
                        varying quality, speed, and cost trade-offs.
                      </p>
                    </div>

                    {/* AI Priority Selection */}
                    <div>
                      <h3 className="font-medium text-base-content mb-3">
                        Optimization Priority
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          {
                            desc: "Minimize generation costs",
                            icon: DollarSign,
                            id: "cost",
                            name: "Cost",
                          },
                          {
                            desc: "Best output quality",
                            icon: Brain,
                            id: "quality",
                            name: "Quality",
                          },
                          {
                            desc: "Fastest generation",
                            icon: Zap,
                            id: "speed",
                            name: "Speed",
                          },
                        ].map((priority) => {
                          const Icon = priority.icon;
                          return (
                            <button
                              className={`p-4 rounded-lg border-2 transition-all ${
                                aiPriority === priority.id
                                  ? "border-primary bg-primary/10"
                                  : "border-base-300 hover:border-primary/50"
                              }`}
                              key={priority.id}
                              onClick={() => {
                                setAiPriority(priority.id as any);
                                setHasChanges(true);
                              }}
                            >
                              <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                              <div className="font-medium">{priority.name}</div>
                              <div className="text-xs text-base-content/60">
                                {priority.desc}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Summarization Models */}
                    <div>
                      <AIProviderSelector
                        contentLength={2000} // Estimated content length
                        onModelSelect={(modelId) => {
                          setSelectedSummarizationModel(modelId);
                          setHasChanges(true);
                        }}
                        priority={aiPriority}
                        selectedModel={selectedSummarizationModel}
                        type="summarization"
                      />
                    </div>

                    {/* TTS Models */}
                    <div>
                      <AIProviderSelector
                        contentLength={1500} // Estimated summary length
                        onModelSelect={(modelId) => {
                          setSelectedTTSModel(modelId);
                          setHasChanges(true);
                        }}
                        priority={aiPriority}
                        selectedModel={selectedTTSModel}
                        type="tts"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "playback" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-base-content mb-2">
                        Playback Settings
                      </h2>
                      <p className="text-base-content/60 mb-6">
                        Configure audio player behavior and default settings.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Volume */}
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Default Volume
                          </span>
                          <span className="label-text-alt">
                            {Math.round(preferences.playerVolume * 100)}%
                          </span>
                        </label>
                        <input
                          className="range range-primary"
                          max="1"
                          min="0"
                          onChange={(e) =>
                            handlePreferenceChange(
                              "playerVolume",
                              Number.parseFloat(e.target.value)
                            )
                          }
                          step="0.1"
                          type="range"
                          value={preferences.playerVolume}
                        />
                      </div>

                      {/* Playback Speed */}
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Default Playback Speed
                          </span>
                          <span className="label-text-alt">
                            {preferences.playbackSpeed}x
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          onChange={(e) =>
                            handlePreferenceChange(
                              "playbackSpeed",
                              Number.parseFloat(e.target.value)
                            )
                          }
                          value={preferences.playbackSpeed}
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={0.75}>0.75x</option>
                          <option value={1}>1x (Normal)</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x</option>
                        </select>
                      </div>
                    </div>

                    {/* Auto-play */}
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text font-medium">
                          Auto-play next episode
                        </span>
                        <input
                          checked={preferences.autoPlay}
                          className="toggle toggle-primary"
                          onChange={(e) =>
                            handlePreferenceChange("autoPlay", e.target.checked)
                          }
                          type="checkbox"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === "interface" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-base-content mb-2">
                        Interface Settings
                      </h2>
                      <p className="text-base-content/60 mb-6">
                        Customize the appearance and behavior of the
                        application.
                      </p>
                    </div>

                    {/* Theme Selection */}
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">Theme</span>
                      </label>
                      <select
                        className="select select-bordered w-full max-w-xs"
                        onChange={(e) =>
                          handlePreferenceChange("theme", e.target.value)
                        }
                        value={preferences.theme}
                      >
                        <option value="forest">Forest (Default)</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="cupcake">Cupcake</option>
                        <option value="bumblebee">Bumblebee</option>
                        <option value="emerald">Emerald</option>
                        <option value="corporate">Corporate</option>
                        <option value="synthwave">Synthwave</option>
                        <option value="retro">Retro</option>
                        <option value="cyberpunk">Cyberpunk</option>
                        <option value="valentine">Valentine</option>
                        <option value="halloween">Halloween</option>
                        <option value="garden">Garden</option>
                        <option value="lofi">Lo-Fi</option>
                        <option value="pastel">Pastel</option>
                        <option value="fantasy">Fantasy</option>
                        <option value="wireframe">Wireframe</option>
                        <option value="black">Black</option>
                        <option value="luxury">Luxury</option>
                        <option value="dracula">Dracula</option>
                        <option value="cmyk">CMYK</option>
                        <option value="autumn">Autumn</option>
                        <option value="business">Business</option>
                        <option value="acid">Acid</option>
                        <option value="lemonade">Lemonade</option>
                        <option value="night">Night</option>
                        <option value="coffee">Coffee</option>
                        <option value="winter">Winter</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-base-content mb-2">
                        Privacy Settings
                      </h2>
                      <p className="text-base-content/60 mb-6">
                        Control how your data is stored and used.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="alert alert-info">
                        <Info className="w-5 h-5" />
                        <div>
                          <h4 className="font-medium">Local Storage Only</h4>
                          <p className="text-sm">
                            All your preferences are stored locally in your
                            browser. No personal data is sent to external
                            servers.
                          </p>
                        </div>
                      </div>

                      <div className="card bg-base-200">
                        <div className="card-body p-4">
                          <h4 className="font-medium mb-2">Data Storage</h4>
                          <ul className="text-sm space-y-1 text-base-content/70">
                            <li>• Episode favorites and preferences</li>
                            <li>• Hidden sources configuration</li>
                            <li>• Player volume and speed settings</li>
                            <li>• Theme and interface preferences</li>
                            <li>• AI model selections</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
