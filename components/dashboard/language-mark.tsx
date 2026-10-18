import { cn } from "@/lib/utils";

/**
 * Language as a colour chip plus the name in mono — the way a repository
 * listing states it — rather than a brand logo. In a dense rule grid a wall
 * of vendor marks fights the typography, and the colour alone is enough to
 * scan a column by. Colours follow GitHub's linguist palette so they match
 * what an engineer already recognises.
 */
const LANGUAGE_COLOR: Record<string, string> = {
  assembly: "#6e4c13",
  astro: "#ff5a03",
  c: "#555555",
  "c#": "#178600",
  "c++": "#f34b7d",
  clojure: "#db5855",
  cmake: "#da3434",
  crystal: "#000100",
  css: "#563d7c",
  dart: "#00b4ab",
  dockerfile: "#384d54",
  elixir: "#6e4a7e",
  elm: "#60b5cc",
  erlang: "#b83998",
  "f#": "#b845fc",
  fortran: "#4d41b1",
  go: "#00add8",
  graphql: "#e10098",
  groovy: "#4298b8",
  haskell: "#5e5086",
  hcl: "#844fba",
  html: "#e34c26",
  java: "#b07219",
  javascript: "#f1e05a",
  json: "#8b8b8b",
  julia: "#a270ba",
  "jupyter notebook": "#da5b0b",
  kotlin: "#a97bff",
  lua: "#000080",
  makefile: "#427819",
  markdown: "#083fa1",
  nim: "#ffc200",
  nix: "#7e7eff",
  "objective-c": "#438eff",
  ocaml: "#ef7a08",
  perl: "#0298c3",
  php: "#4f5d95",
  powershell: "#012456",
  python: "#3572a5",
  r: "#198ce7",
  ruby: "#701516",
  rust: "#dea584",
  scala: "#c22d40",
  scss: "#c6538c",
  shell: "#89e051",
  solidity: "#aa6746",
  sql: "#e38c00",
  svelte: "#ff3e00",
  swift: "#f05138",
  tex: "#3d6117",
  toml: "#9c4221",
  typescript: "#3178c6",
  v: "#4f87c4",
  "vim script": "#199f4b",
  vue: "#41b883",
  yaml: "#cb171e",
  zig: "#ec915c",
};

export function languageColor(language: string | null | undefined) {
  if (!language) return null;
  return LANGUAGE_COLOR[language.toLowerCase()] ?? null;
}

export function LanguageMark({
  language,
  className,
  showLabel = true,
}: {
  language: string | null | undefined;
  className?: string;
  showLabel?: boolean;
}) {
  const color = languageColor(language);

  if (!language) {
    return (
      <span className={cn("data-mono text-xs text-ink-faint", className)}>
        no language
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        aria-hidden
        className={cn(
          "size-2.5 shrink-0 ring-1 ring-foreground/25 ring-inset",
          !color && "border border-rule-strong"
        )}
        style={color ? { backgroundColor: color } : undefined}
      />
      {showLabel ? (
        <span className="data-mono text-xs text-ink-soft">{language}</span>
      ) : (
        <span className="sr-only">{language}</span>
      )}
    </span>
  );
}
