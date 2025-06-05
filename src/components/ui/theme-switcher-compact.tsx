"use client";

import { Palette, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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

export function ThemeSwitcherCompact() {
  const [currentTheme, setCurrentTheme] = useState("forest");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"above" | "below">(
    "below"
  );
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Get theme from localStorage or default to forest
    const savedTheme = localStorage.getItem("theme") || "forest";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setCurrentTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 400; // Approximate height of the dropdown
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // Position dropdown above if there's not enough space below
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition("above");
      } else {
        setDropdownPosition("below");
      }
    }
  }, [isOpen]);

  const handleThemeChange = (themeName: string) => {
    document.documentElement.setAttribute("data-theme", themeName);
    setCurrentTheme(themeName);
    setIsOpen(false);

    // Store theme preference
    localStorage.setItem("theme", themeName);
  };

  const darkThemes = themes.filter((theme) => theme.category === "Dark");
  const lightThemes = themes.filter((theme) => theme.category === "Light");

  return (
    <div className="relative">
      <button
        ref={buttonRef}
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

          {/* Ultra Compact Dropdown - single continuous column */}
          <div
            className={`absolute right-0 z-[100] w-44 bg-base-100 rounded-box shadow-2xl border border-base-300 p-1.5 ${
              dropdownPosition === "above"
                ? "bottom-full mb-2"
                : "top-full mt-2"
            }`}
          >
            <div className="max-h-80 overflow-y-auto">
              {/* Header */}
              <div className="px-2 py-1 mb-1">
                <span className="text-xs font-medium text-base-content">
                  Choose Theme
                </span>
              </div>

              {/* Dark Themes Section */}
              <div className="px-2 py-0.5">
                <span className="text-[10px] opacity-60 uppercase tracking-wide">
                  Dark Themes
                </span>
              </div>

              {/* Dark Theme Items */}
              {darkThemes.map((theme) => (
                <button
                  key={theme.name}
                  className={`flex items-center gap-1.5 w-full text-xs py-1 px-2 rounded hover:bg-base-200 transition-colors ${
                    currentTheme === theme.name
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                  onClick={() => handleThemeChange(theme.name)}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-primary border border-base-content/20 flex-shrink-0"
                    data-theme={theme.name}
                  />
                  <span className="flex-1 text-left truncate text-xs">
                    {theme.label}
                  </span>
                  {currentTheme === theme.name && (
                    <Check className="w-2.5 h-2.5 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}

              {/* Light Themes Section */}
              <div className="px-2 py-0.5 mt-2">
                <span className="text-[10px] opacity-60 uppercase tracking-wide">
                  Light Themes
                </span>
              </div>

              {/* Light Theme Items */}
              {lightThemes.map((theme) => (
                <button
                  key={theme.name}
                  className={`flex items-center gap-1.5 w-full text-xs py-1 px-2 rounded hover:bg-base-200 transition-colors ${
                    currentTheme === theme.name
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                  onClick={() => handleThemeChange(theme.name)}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-primary border border-base-content/20 flex-shrink-0"
                    data-theme={theme.name}
                  />
                  <span className="flex-1 text-left truncate text-xs">
                    {theme.label}
                  </span>
                  {currentTheme === theme.name && (
                    <Check className="w-2.5 h-2.5 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
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
