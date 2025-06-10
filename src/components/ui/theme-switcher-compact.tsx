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
        aria-label="Change Theme"
        className="btn btn-ghost btn-circle tooltip tooltip-left"
        data-tip="Change Theme"
        onClick={() => setIsOpen(!isOpen)}
        ref={buttonRef}
      >
        <Palette className="h-5 w-5" />
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
            className={`bg-base-100 rounded-box border-base-300 absolute right-0 z-[100] w-44 border p-1.5 shadow-2xl ${
              dropdownPosition === "above"
                ? "bottom-full mb-2"
                : "top-full mt-2"
            }`}
          >
            <div className="max-h-80 overflow-y-auto">
              {/* Header */}
              <div className="mb-1 px-2 py-1">
                <span className="text-base-content text-xs font-medium">
                  Choose Theme
                </span>
              </div>

              {/* Dark Themes Section */}
              <div className="px-2 py-0.5">
                <span className="text-[10px] tracking-wide uppercase opacity-60">
                  Dark Themes
                </span>
              </div>

              {/* Dark Theme Items */}
              {darkThemes.map((theme) => (
                <button
                  className={`hover:bg-base-200 flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
                    currentTheme === theme.name
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name)}
                >
                  <div
                    className="bg-primary border-base-content/20 h-2.5 w-2.5 flex-shrink-0 rounded-full border"
                    data-theme={theme.name}
                  />
                  <span className="flex-1 truncate text-left text-xs">
                    {theme.label}
                  </span>
                  {currentTheme === theme.name && (
                    <Check className="text-primary h-2.5 w-2.5 flex-shrink-0" />
                  )}
                </button>
              ))}

              {/* Light Themes Section */}
              <div className="mt-2 px-2 py-0.5">
                <span className="text-[10px] tracking-wide uppercase opacity-60">
                  Light Themes
                </span>
              </div>

              {/* Light Theme Items */}
              {lightThemes.map((theme) => (
                <button
                  className={`hover:bg-base-200 flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
                    currentTheme === theme.name
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name)}
                >
                  <div
                    className="bg-primary border-base-content/20 h-2.5 w-2.5 flex-shrink-0 rounded-full border"
                    data-theme={theme.name}
                  />
                  <span className="flex-1 truncate text-left text-xs">
                    {theme.label}
                  </span>
                  {currentTheme === theme.name && (
                    <Check className="text-primary h-2.5 w-2.5 flex-shrink-0" />
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
