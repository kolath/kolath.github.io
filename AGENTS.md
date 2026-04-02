# Figma Design System Rules

## General Component Rules

- IMPORTANT: Always reuse existing UI patterns from `index.html`, `styles.css`, and `main.js` when possible. This repo does not currently have a separate component library.
- Place new UI components in `index.html` if they are simple static sections. If the UI grows beyond a few reusable blocks, create a root-level `components/` directory and keep it flat.
- Follow `kebab-case` for CSS class names and DOM section names. Follow `camelCase` for JavaScript functions and variables. Use `UPPER_SNAKE_CASE` only for constants.
- Components and utilities must export as named ES module exports. Existing pattern: `snake.js`.

## Styling Rules

- Use plain global CSS in `styles.css` for styling.
- Design tokens are defined in the `:root` block in `styles.css`.
- IMPORTANT: Never hardcode colors in new UI code when an existing token is available. Always use the CSS custom properties in `styles.css`.
- Spacing values must follow the existing project scale already present in CSS: `16px`, `20px`, `24px`, `40px`, `120px`, plus exact Figma-derived offsets when implementing a Figma frame.
- Typography follows the scale currently defined directly in `styles.css`:
  - `SF Pro Text` for body and support text
  - `SF Pro Display` for display and headings
  - exact Figma sizes when implementing Figma-derived sections
- Prefer adding new reusable CSS variables in `styles.css` before introducing repeated raw values.
- Responsive behavior must be implemented with standard media queries in `styles.css`, matching the existing approach.

## Figma MCP Integration Rules

These rules define how to translate Figma inputs into code for this project and must be followed for every Figma-driven change.

### Required Flow

1. Run `get_design_context` first to fetch the structured representation for the exact node(s).
2. If the response is too large or truncated, run `get_metadata` to get the high-level node map, then re-fetch only the required node(s) with `get_design_context`.
3. Run `get_screenshot` for a visual reference of the node variant being implemented.
4. Only after you have both `get_design_context` and `get_screenshot`, download any assets needed and start implementation.
5. Translate the output into this project’s conventions: plain HTML, plain CSS in `styles.css`, and vanilla JavaScript in `main.js`.
6. Validate against Figma for 1:1 look and behavior before marking complete.

### Implementation Rules

- Treat the Figma MCP output, especially React + Tailwind output, as a design reference only, not final code.
- Replace Tailwind utility classes with this project’s styling approach: global CSS classes in `styles.css`.
- Reuse existing UI patterns from `index.html` and existing tokens from `styles.css` instead of duplicating styles.
- Use the project’s CSS variable token system consistently for color, radius, and elevation.
- Respect the project’s existing architecture: no framework, no router, no client-side component system, minimal DOM scripting in `main.js`.
- Strive for 1:1 visual parity with the Figma design.
- Validate the final UI against the Figma screenshot for both look and behavior.

## Asset Handling

- The Figma MCP server provides an assets endpoint which can serve image and SVG assets.
- IMPORTANT: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly.
- IMPORTANT: DO NOT import or add new icon packages. All assets should come from the Figma payload unless the user explicitly requests otherwise.
- IMPORTANT: DO NOT use or create placeholders if a localhost source is provided.
- Store downloaded assets in a root-level `assets/` directory if assets are added to this repo. Create it only when needed.
- Reference static assets with relative paths from `index.html`, consistent with the static file server in `server.js`.

## Project-Specific Conventions

- This is a flat static project. Keep top-level files simple and avoid introducing framework structure unless the user asks for it.
- Use relative ES module imports only. There are no path aliases or special import resolvers. Existing pattern: `./snake.js`.
- Keep state management local and explicit. Prefer plain objects and pure functions for logic, following `snake.js`, and minimal DOM mutation in `main.js`.
- There is no routing system. Treat the app as a single-page static document served by `server.js`.
- Testing uses Node’s built-in test runner via `node --test`, as defined in `package.json`. Add tests for non-trivial logic in separate `*.test.js` files.
- Accessibility standards:
  - Use semantic HTML elements.
  - Provide `aria-label` where a section or control needs clarification.
  - Preserve keyboard accessibility for interactive elements.
  - Prefer real `<button>` elements for actions.
- Performance considerations:
  - Keep dependencies at zero unless necessary.
  - Avoid large client-side abstractions.
  - Prefer static markup and CSS over runtime rendering.
  - Keep DOM scripting small and direct.
- If the project starts accumulating reusable UI blocks, split them deliberately rather than partially. Do not create a pseudo-component architecture across random files.
