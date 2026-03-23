"use client";

import { Check, Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const themes = [
  { category: "Light", label: "Light", name: "light" },
  { category: "Dark", label: "Dark", name: "dark" },
  { category: "Light", label: "Cupcake", name: "cupcake" },
  { category: "Light", label: "Bumblebee", name: "bumblebee" },
  { category: "Light", label: "Emerald", name: "emerald" },
  { category: "Light", label: "Corporate", name: "corporate" },
  { category: "Dark", label: "Synthwave", name: "synthwave" },
  { category: "Light", label: "Retro", name: "retro" },
  { category: "Dark", label: "Cyberpunk", name: "cyberpunk" },
  { category: "Light", label: "Valentine", name: "valentine" },
  { category: "Dark", label: "Halloween", name: "halloween" },
  { category: "Light", label: "Garden", name: "garden" },
  { category: "Dark", label: "Forest", name: "forest" },
  { category: "Light", label: "Aqua", name: "aqua" },
  { category: "Light", label: "Lo-Fi", name: "lofi" },
  { category: "Light", label: "Pastel", name: "pastel" },
  { category: "Light", label: "Fantasy", name: "fantasy" },
  { category: "Light", label: "Wireframe", name: "wireframe" },
  { category: "Dark", label: "Black", name: "black" },
  { category: "Dark", label: "Luxury", name: "luxury" },
  { category: "Dark", label: "Dracula", name: "dracula" },
  { category: "Light", label: "CMYK", name: "cmyk" },
  { category: "Light", label: "Autumn", name: "autumn" },
  { category: "Light", label: "Business", name: "business" },
  { category: "Light", label: "Acid", name: "acid" },
  { category: "Light", label: "Lemonade", name: "lemonade" },
  { category: "Dark", label: "Night", name: "night" },
  { category: "Dark", label: "Coffee", name: "coffee" },
  { category: "Light", label: "Winter", name: "winter" },
  { category: "Dark", label: "Dim", name: "dim" },
  { category: "Light", label: "Nord", name: "nord" },
  { category: "Dark", label: "Sunset", name: "sunset" },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("forest");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get theme from server-rendered document attribute or fallback
    const savedTheme =
      document.documentElement.getAttribute("data-theme") ||
      localStorage.getItem("theme") ||
      "forest";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setCurrentTheme(savedTheme);
  }, []);

  const handleThemeChange = (themeName: string) => {
    document.documentElement.setAttribute("data-theme", themeName);
    setCurrentTheme(themeName);
    setIsOpen(false);

    // Store theme preference
    localStorage.setItem("theme", themeName);
    document.cookie = `theme=${themeName}; path=/; max-age=31536000`;
  };

  const lightThemes = themes.filter((theme) => theme.category === "Light");
  const darkThemes = themes.filter((theme) => theme.category === "Dark");

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        aria-label="Change Theme"
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
            className="fixed inset-0 z-[200]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown - absolute positioned directly below the button but aligned right */}
          <div className="absolute right-0 top-full mt-2 z-[250] w-[calc(100vw-2rem)] max-w-[320px] bg-base-100 rounded-box shadow-2xl border border-base-300 p-2 origin-top-right">
            <div className="menu w-full max-h-[65vh] overflow-y-auto block p-1">
              <li className="menu-title px-2 py-1">
                <span>Choose Theme</span>
              </li>

              <li className="menu-title text-xs opacity-60 mt-2 px-2 py-1">
                <span>Light Themes</span>
              </li>

              <div className="grid grid-cols-2 gap-1 mb-2">
                {lightThemes.map((theme) => (
                  <button
                    key={theme.name}
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-base-200 transition-colors ${
                      currentTheme === theme.name ? "bg-base-200 font-bold" : ""
                    }`}
                    onClick={() => handleThemeChange(theme.name)}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 border-base-content/20 flex-shrink-0"
                      data-theme={theme.name}
                      style={{
                        backgroundColor: "var(--fallback-p,oklch(var(--p)/1))",
                      }}
                    />
                    <span className="flex-1 text-left text-sm truncate">
                      {theme.label}
                    </span>
                    {currentTheme === theme.name && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <li className="menu-title text-xs opacity-60 mt-4 px-2 py-1">
                <span>Dark Themes</span>
              </li>

              <div className="grid grid-cols-2 gap-1 mb-2">
                {darkThemes.map((theme) => (
                  <button
                    key={theme.name}
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-base-200 transition-colors ${
                      currentTheme === theme.name ? "bg-base-200 font-bold" : ""
                    }`}
                    onClick={() => handleThemeChange(theme.name)}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 border-base-content/20 flex-shrink-0"
                      data-theme={theme.name}
                    />
                    <span className="flex-1 text-left text-sm truncate">
                      {theme.label}
                    </span>
                    {currentTheme === theme.name && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hidden theme controller inputs for daisyUI */}
      {themes.map((theme) => (
        <input
          aria-label={theme.label}
          checked={currentTheme === theme.name}
          className="theme-controller sr-only"
          key={theme.name}
          name="theme-dropdown"
          onChange={() => handleThemeChange(theme.name)}
          type="radio"
          value={theme.name}
        />
      ))}
    </div>
  );
}
