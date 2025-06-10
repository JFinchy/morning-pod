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

  const lightThemes = themes.filter((theme) => theme.category === "Light");
  const darkThemes = themes.filter((theme) => theme.category === "Dark");

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
            className="fixed inset-0 z-[200]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown - positioned to extend beyond sidebar */}
          <div
            className={`bg-base-100 rounded-box border-base-300 fixed z-[250] w-80 border p-2 shadow-2xl ${
              dropdownPosition === "above" ? "bottom-16" : "top-16"
            }`}
            style={{
              left: buttonRef.current
                ? `${buttonRef.current.getBoundingClientRect().right - 320}px`
                : "0px",
            }}
          >
            <div className="menu max-h-96 overflow-y-auto">
              <li className="menu-title">
                <span>Choose Theme</span>
              </li>

              <li className="menu-title mt-2 text-xs opacity-60">
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
                        className="bg-primary border-base-content/20 h-4 w-4 rounded-full border-2"
                        data-theme={theme.name}
                      />
                      <span className="flex-1 text-left">{theme.label}</span>
                      {currentTheme === theme.name && (
                        <Check className="text-primary h-4 w-4" />
                      )}
                    </button>
                  </li>
                ))}
              </div>

              <li className="menu-title mt-4 text-xs opacity-60">
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
                        className="bg-primary border-base-content/20 h-4 w-4 rounded-full border-2"
                        data-theme={theme.name}
                      />
                      <span className="flex-1 text-left">{theme.label}</span>
                      {currentTheme === theme.name && (
                        <Check className="text-primary h-4 w-4" />
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
