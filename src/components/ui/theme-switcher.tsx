"use client";

import { Palette, Check } from "lucide-react";
import { useState, useEffect } from "react";

const themes = [
  { name: "light", label: "Light", category: "Light" },
  { name: "dark", label: "Dark", category: "Dark" },
  { name: "cupcake", label: "Cupcake", category: "Light" },
  { name: "bumblebee", label: "Bumblebee", category: "Light" },
  { name: "emerald", label: "Emerald", category: "Light" },
  { name: "corporate", label: "Corporate", category: "Light" },
  { name: "synthwave", label: "Synthwave", category: "Dark" },
  { name: "retro", label: "Retro", category: "Light" },
  { name: "cyberpunk", label: "Cyberpunk", category: "Dark" },
  { name: "valentine", label: "Valentine", category: "Light" },
  { name: "halloween", label: "Halloween", category: "Dark" },
  { name: "garden", label: "Garden", category: "Light" },
  { name: "forest", label: "Forest", category: "Dark" },
  { name: "aqua", label: "Aqua", category: "Light" },
  { name: "lofi", label: "Lo-Fi", category: "Light" },
  { name: "pastel", label: "Pastel", category: "Light" },
  { name: "fantasy", label: "Fantasy", category: "Light" },
  { name: "wireframe", label: "Wireframe", category: "Light" },
  { name: "black", label: "Black", category: "Dark" },
  { name: "luxury", label: "Luxury", category: "Dark" },
  { name: "dracula", label: "Dracula", category: "Dark" },
  { name: "cmyk", label: "CMYK", category: "Light" },
  { name: "autumn", label: "Autumn", category: "Light" },
  { name: "business", label: "Business", category: "Light" },
  { name: "acid", label: "Acid", category: "Light" },
  { name: "lemonade", label: "Lemonade", category: "Light" },
  { name: "night", label: "Night", category: "Dark" },
  { name: "coffee", label: "Coffee", category: "Dark" },
  { name: "winter", label: "Winter", category: "Light" },
  { name: "dim", label: "Dim", category: "Dark" },
  { name: "nord", label: "Nord", category: "Light" },
  { name: "sunset", label: "Sunset", category: "Dark" },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("light");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setCurrentTheme(savedTheme);
  }, []);

  const handleThemeChange = (themeName: string) => {
    document.documentElement.setAttribute("data-theme", themeName);
    setCurrentTheme(themeName);
    setIsOpen(false);

    // Store theme preference
    localStorage.setItem("theme", themeName);
  };

  const lightThemes = themes.filter((theme) => theme.category === "Light");
  const darkThemes = themes.filter((theme) => theme.category === "Dark");

  return (
    <div className="relative">
      <button
        className="btn btn-ghost btn-circle tooltip tooltip-left"
        data-tip="Change Theme"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Palette className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-[100] w-80 bg-base-100 rounded-box shadow-2xl border border-base-300 p-2">
            <div className="menu">
              <li className="menu-title">
                <span>Choose Theme</span>
              </li>

              <li className="menu-title text-xs opacity-60 mt-2">
                <span>Light Themes</span>
              </li>

              <div className="grid grid-cols-2 gap-1">
                {lightThemes.map((theme) => (
                  <li key={theme.name}>
                    <button
                      className={`flex items-center gap-2 ${
                        currentTheme === theme.name ? "active" : ""
                      }`}
                      onClick={() => handleThemeChange(theme.name)}
                    >
                      <div
                        className="w-4 h-4 rounded-full bg-primary border-2 border-base-content/20"
                        data-theme={theme.name}
                      />
                      <span className="flex-1 text-left">{theme.label}</span>
                      {currentTheme === theme.name && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  </li>
                ))}
              </div>

              <li className="menu-title text-xs opacity-60 mt-4">
                <span>Dark Themes</span>
              </li>

              <div className="grid grid-cols-2 gap-1">
                {darkThemes.map((theme) => (
                  <li key={theme.name}>
                    <button
                      className={`flex items-center gap-2 ${
                        currentTheme === theme.name ? "active" : ""
                      }`}
                      onClick={() => handleThemeChange(theme.name)}
                    >
                      <div
                        className="w-4 h-4 rounded-full bg-primary border-2 border-base-content/20"
                        data-theme={theme.name}
                      />
                      <span className="flex-1 text-left">{theme.label}</span>
                      {currentTheme === theme.name && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  </li>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hidden theme controller inputs for daisyUI */}
      {themes.map((theme) => (
        <input
          key={theme.name}
          type="radio"
          name="theme-dropdown"
          className="theme-controller sr-only"
          aria-label={theme.label}
          value={theme.name}
          checked={currentTheme === theme.name}
          onChange={() => handleThemeChange(theme.name)}
        />
      ))}
    </div>
  );
}
