# Design QA

Source visual: Figma `Menu Entity refresh`, node `11564:48524`.

Prototype checked:
- `file:///Users/hui.tan/Documents/ClaudeCode/menu-prototype/index.html`
- `file:///Users/hui.tan/Documents/ClaudeCode/menu-prototype/publish-status-overlay.html`
- `http://127.0.0.1:4174/index.html`

Evidence:
- Reference screenshot: `reference-menu-entity-refresh.png`
- Index screenshot: `index-overlay-file-screenshot.png`
- Standalone screenshot: `standalone-overlay-file-screenshot.png`

Checks:
- Side panel placement, width, top/bottom margin, radius, and shadow match the Figma overlay direction.
- Header, close button, pill tabs, notice banner, stacked status bar, legend, search/filter row, view toggle, and location tiles are present.
- Full interaction paths are implemented in `js/publish-status-overlay.js`: tabs, search, status dropdown, legend/stack-bar filtering, location/channel view switch, tile expansion, failed-channel AI popover, issues drill-in, close/reopen, and Escape close.
- `node --check js/publish-status-overlay.js` passes.

Notes:
- Playwright browser automation could not launch in this environment because the bundled browser is missing and the MCP-launched local Chrome process is killed by host permissions. Chrome CLI screenshots were used for visual QA instead.
- The index-page screenshot shows faint underlying page contours outside the panel's right edge/shadow area. The standalone overlay screenshot is clean, and the overlay content itself is not affected.

Final result: passed.
