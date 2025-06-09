"use client";

import { useEffect, useState } from "react";

import {
  addToFavorites,
  getFavoriteEpisodes,
  isFavorite,
  removeFromFavorites,
} from "@/lib/utils/local-storage";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites on mount
  useEffect(() => {
    setFavorites(getFavoriteEpisodes());
    setIsLoaded(true);
  }, []);

  const toggleFavorite = (episodeId: string) => {
    const currentlyFavorited = isFavorite(episodeId);

    if (currentlyFavorited) {
      removeFromFavorites(episodeId);
      setFavorites((prev) => prev.filter((id) => id !== episodeId));
    } else {
      addToFavorites(episodeId);
      setFavorites((prev) => [...prev, episodeId]);
    }
  };

  const checkIsFavorite = (episodeId: string): boolean => {
    return favorites.includes(episodeId);
  };

  return {
    favorites,
    isFavorite: checkIsFavorite,
    isLoaded,
    toggleFavorite,
  };
}
