import { cn } from "@/lib/utils"

type VisibilityThemeOption = string

interface VisibilityThemeSelectorProps<TTheme extends VisibilityThemeOption> {
  themes: readonly TTheme[]
  value: TTheme
  onChange: (theme: TTheme) => void
  ariaLabel: string
  themeClasses: Record<TTheme, { swatch: string }>
}

export function VisibilityThemeSelector<TTheme extends VisibilityThemeOption>({
  themes,
  value,
  onChange,
  ariaLabel,
  themeClasses,
}: VisibilityThemeSelectorProps<TTheme>) {
  return (
    <div className="flex items-center gap-2" aria-label={ariaLabel}>
      {themes.map((theme) => (
        <button
          key={theme}
          type="button"
          aria-label={`Set ${theme} visibility theme`}
          onClick={() => onChange(theme)}
          className={cn(
            "h-4 w-4 rounded-[2px] border border-gray-500 transition-all",
            themeClasses[theme].swatch,
            value === theme ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100",
          )}
        />
      ))}
    </div>
  )
}
