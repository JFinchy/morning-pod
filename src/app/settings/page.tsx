"use client";

import { Eye, Info, Palette, RotateCcw, Save, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import {
  getPreferences,
  savePreferences,
  type UserPreferences,
} from "@/lib/utils/local-storage";

type SettingsTab = "interface" | "playback" | "privacy";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("playback");
  const [preferences, setPreferences] = useState<null | UserPreferences>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      savePreferences(preferences);
      setHasChanges(false);
      // Optional: Success toast
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    // This is simple since getPreferences without args returns defaults if empty
    // but here we want to force defaults.
    localStorage.removeItem("user_preferences");
    const defaultPrefs = getPreferences();
    setPreferences(defaultPrefs);
    setHasChanges(true);
  };

  if (!preferences) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading loading-spinner loading-lg text-primary" />
        </div>
      </MainLayout>
    );
  }

  const tabs = [
    {
      description: "Audio player and playback options",
      icon: Volume2,
      id: "playback" as const,
      name: "Playback",
    },
    {
      description: "Data and storage information",
      icon: Eye,
      id: "privacy" as const,
      name: "Privacy",
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-base-content mb-2">
              Settings
            </h1>
            <p className="text-base-content/60">
              Customize your Morning Pod experience
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <>
                <Button
                  btnStyle="ghost"
                  className="gap-2"
                  onClick={resetToDefaults}
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  className="gap-2 shadow-lg"
                  disabled={isSaving}
                  onClick={saveSettings}
                  size="sm"
                  variant="primary"
                >
                  {isSaving ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-content shadow-md scale-[1.02]"
                      : "hover:bg-base-200 text-base-content/70"
                  }`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-bold text-sm">{tab.name}</div>
                      <div
                        className={`text-[10px] ${isActive ? "text-primary-content/70" : "text-base-content/50"}`}
                      >
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-base-100 rounded-3xl border border-base-300 p-8 shadow-sm">
              {activeTab === "playback" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-base-content mb-2">
                      Playback Settings
                    </h2>
                    <p className="text-base-content/60">
                      Configure your default listening preferences.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Volume */}
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-sm font-bold text-base-content uppercase tracking-wider">
                          Default Volume
                        </span>
                        <span className="block text-2xl font-black text-primary mt-1">
                          {Math.round(preferences.playerVolume * 100)}%
                        </span>
                      </label>
                      <input
                        className="range range-primary range-sm"
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
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-sm font-bold text-base-content uppercase tracking-wider">
                          Playback Speed
                        </span>
                      </label>
                      <select
                        className="select select-bordered w-full rounded-xl bg-base-200 border-none font-bold"
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
                        <option value={1}>1.0x (Normal)</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2.0x</option>
                      </select>
                    </div>
                  </div>

                  {/* Auto-play */}
                  <div className="pt-6 border-t border-base-200">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div>
                        <span className="font-bold text-base-content">
                          Continuous Playback
                        </span>
                        <p className="text-xs text-base-content/50">
                          Automatically play the next episode in your library
                        </p>
                      </div>
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

              {activeTab === "privacy" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-base-content mb-2">
                      Data & Privacy
                    </h2>
                    <p className="text-base-content/60">
                      Transparency about how your data is handled.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4 p-6 bg-info/5 rounded-2xl border border-info/10">
                      <Info className="w-6 h-6 text-info flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-base-content">
                          Local Persistence Only
                        </h4>
                        <p className="text-sm text-base-content/70 mt-1 leading-relaxed">
                          Your preferences, favorites, and playback positions
                          are stored exclusively in your browser&apos;s local
                          storage. We do not track your listening habits on our
                          servers.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-base-content uppercase tracking-wider">
                        Stored Items
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Theme Choice",
                          "Playback Volume",
                          "Playback Speed",
                          "Episode Favorites",
                          "Playback History",
                          "Hidden Sources",
                        ].map((item) => (
                          <span
                            key={item}
                            className="badge badge-outline p-3 text-xs opacity-70"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
