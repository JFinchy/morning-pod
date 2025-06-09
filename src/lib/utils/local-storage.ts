// Local storage utilities for user preferences
export interface UserPreferences {
  autoPlay: boolean;
  favoriteEpisodes: string[]; // Episode IDs
  hiddenSources: string[]; // Source IDs
  playbackSpeed: number; // 0.5-2
  playerVolume: number; // 0-1
  theme: string;
}

const STORAGE_KEY = "morning-pod-preferences";

// Default preferences
const defaultPreferences: UserPreferences = {
  autoPlay: false,
  favoriteEpisodes: [],
  hiddenSources: [],
  playbackSpeed: 1,
  playerVolume: 0.8,
  theme: "forest",
};

// Get preferences from localStorage
export function getPreferences(): UserPreferences {
  if (typeof window === "undefined") return defaultPreferences;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultPreferences;

    const parsed = JSON.parse(stored);
    return { ...defaultPreferences, ...parsed };
  } catch (error) {
    console.error("Error reading preferences:", error);
    return defaultPreferences;
  }
}

// Save preferences to localStorage
export function savePreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === "undefined") return;

  try {
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving preferences:", error);
  }
}

// Episode favorites
export function getFavoriteEpisodes(): string[] {
  return getPreferences().favoriteEpisodes;
}

export function addToFavorites(episodeId: string): void {
  const current = getFavoriteEpisodes();
  if (!current.includes(episodeId)) {
    savePreferences({
      favoriteEpisodes: [...current, episodeId],
    });
  }
}

export function removeFromFavorites(episodeId: string): void {
  const current = getFavoriteEpisodes();
  savePreferences({
    favoriteEpisodes: current.filter((id) => id !== episodeId),
  });
}

export function isFavorite(episodeId: string): boolean {
  return getFavoriteEpisodes().includes(episodeId);
}

// Hidden sources
export function getHiddenSources(): string[] {
  return getPreferences().hiddenSources;
}

export function hideSource(sourceId: string): void {
  const current = getHiddenSources();
  if (!current.includes(sourceId)) {
    savePreferences({
      hiddenSources: [...current, sourceId],
    });
  }
}

export function showSource(sourceId: string): void {
  const current = getHiddenSources();
  savePreferences({
    hiddenSources: current.filter((id) => id !== sourceId),
  });
}

export function isSourceHidden(sourceId: string): boolean {
  return getHiddenSources().includes(sourceId);
}

// Player preferences
export function getPlayerVolume(): number {
  return getPreferences().playerVolume;
}

export function savePlayerVolume(volume: number): void {
  savePreferences({ playerVolume: Math.max(0, Math.min(1, volume)) });
}

export function getPlaybackSpeed(): number {
  return getPreferences().playbackSpeed;
}

export function savePlaybackSpeed(speed: number): void {
  savePreferences({ playbackSpeed: Math.max(0.5, Math.min(2, speed)) });
}

export function getAutoPlay(): boolean {
  return getPreferences().autoPlay;
}

export function saveAutoPlay(autoPlay: boolean): void {
  savePreferences({ autoPlay });
}
