# Design audit — jacobniu.github.io (local)

**Date:** 2026-03-25  
**URL:** http://127.0.0.1:8080/  
**Scope:** Homepage (software showcase)  
**Goal:** Align visuals with mature open-source / commercial product homepages.

## First impression (before)

- Communicated a **personal dev page** with strong orange chrome and emoji in the title.
- Thick accent bars and system UI font stack felt closer to a theme preset than a shipped product site.

## Changes applied

1. **Design tokens** — CSS variables for canvas, border, foreground, and accent colors (GitHub-dark–inspired neutrals + blue accent + green for primary download actions).
2. **Typography** — IBM Plex Sans + IBM Plex Mono (loaded from Google Fonts); mono for app titles and version badges.
3. **Brand chrome** — Removed emoji from configured titles; nav/footer copy reads as a **name + product** pattern (`Jacob Niu · Software`).
4. **Hero structure** — Left-aligned editorial layout with optional **kicker** (`发布与下载` / `Releases & downloads`) and **H1** headline from config.
5. **Interaction** — Language toggle and expand control meet ~44px touch targets; `focus-visible` rings on accent color; `prefers-reduced-motion` respected.
6. **Collapsed details** — `[hidden]` panels forced `display: none` so folded content does not affect layout or scanning.

## Design score (informal)

| Area            | Before | After (target) |
|-----------------|--------|----------------|
| Hierarchy       | C      | B+             |
| Typography      | C      | B              |
| Color / contrast| B      | B+             |
| AI-slop signals | B      | A- (no purple gradients; reduced decorative orange) |

## Quick wins for a future pass

- Add **favicons** + `og:image` for share cards.
- Optional **GitHub / Docs** links in the navbar (data-driven from `config.json`).
- **App icons** in each card header when you have assets.

## PR summary

> Design review: reskin toward OSS/product dark UI — design tokens, IBM Plex, GitHub-style surfaces, blue/green actions, editorial hero, emoji removed from site strings.
