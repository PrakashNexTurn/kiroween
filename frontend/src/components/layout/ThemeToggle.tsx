import { Dropdown, Button } from "antd";
import { Sun, Moon, Ghost, ChevronDown } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import type { ReactElement } from "react";

export function ThemeToggle() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const themeIconMap: Record<string, ReactElement> = {
    light: <Sun size={18} />,
    dark: <Moon size={18} />,
    halloween: <Ghost size={18} />,
  };

  const items = availableThemes.map((theme) => ({
    key: theme,
    label: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          height: "28px",
        }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          {themeIconMap[theme]}
        </span>
        <span style={{ textTransform: "capitalize" }}>{theme}</span>
      </div>
    ),
    onClick: () => setTheme(theme),
  }));

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <Button
        type="default"
        style={{
          background: "var(--color-bg-secondary)",
          color: "var(--color-text-primary)",
          borderColor: "var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          height: "36px",
          paddingInline: "12px",
        }}
      >
        {/* Icon */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            height: "20px",
            width: "20px",
          }}
        >
          {themeIconMap[currentTheme]}
        </span>

        {/* Current theme text */}
        <span style={{ textTransform: "capitalize" }}>{currentTheme}</span>

        {/* Chevron */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "1px",
          }}
        >
          <ChevronDown size={16} />
        </span>
      </Button>
    </Dropdown>
  );
}
