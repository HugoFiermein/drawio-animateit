# AnimateIT! — draw.io Plugin
<img width="920" height="602" alt="20260501-2139-12 2434234" src="https://github.com/user-attachments/assets/280c3808-6bdc-4f05-83a6-1f834713abe1" />

A lightweight draw.io plugin that animates connectors (edges) on selection. When you click a connector, it lights up with a flow animation, rises above overlapping lines, and snaps back to its original style the moment you deselect it.

Designed for network diagrams, rack layouts, and any diagram where connectors overlap and are hard to trace visually.

---

## Features

- **Flow animation on select** — clicking any connector triggers a animated flow effect along the line
- **Brings line to front** — the selected connector rises above all overlapping lines so it's always visible
- **Visual highlight** — selected connector becomes thicker (`strokeWidth=4`) and bright green (`#00FF44`)
- **Non-destructive** — original style is fully restored on deselect; nothing is permanently changed in your diagram
- **Move-safe** — animation is cleanly removed if you drag/reposition the connector
- **Toggle on/off** — disable the plugin at any time via menu or keyboard shortcut without restarting draw.io

---

## Keyboard Shortcut

| Action | Shortcut |
|---|---|
| Toggle AnimateIT! on/off | `Ctrl + Alt + I` |

You can also toggle it via **Extras → AnimateIT!** in the menu bar (shows ✅ when active, ⬜ when disabled).

---

## Installation — Desktop App

External plugins are disabled by default in draw.io Desktop starting from version 19.0.3. You need to launch the app with a special flag to enable them.

### Step 1 — Download the plugin

Download `AnimateIT.js` from this repository and save it somewhere permanent, for example:

```
C:\Users\YourName\drawio-plugins\AnimateIT.js
```

### Step 2 — Enable external plugins

External plugins require launching draw.io with the `--enable-plugins` flag.

**Option A — Edit your desktop shortcut:**

1. Right-click the draw.io shortcut on your desktop → **Properties**
2. In the **Target** field, add the flag at the end:

```
"C:\Program Files\draw.io\draw.io.exe" --enable-plugins
```

3. Click **OK** and always launch draw.io using this shortcut

**Option B — Run from command line:**

```cmd
"C:\Program Files\draw.io\draw.io.exe" --enable-plugins
```

### Step 3 — Load the plugin

1. Open draw.io (using the modified shortcut or command above)
2. Go to **Extras → Plugins...**
3. Click **Add**
4. Select your local `AnimateIT.js` file
5. Click **OK**, then **Apply**
6. Restart draw.io — the plugin will load automatically on every launch

> **Note:** Always launch draw.io with `--enable-plugins` — the plugin will not load without this flag.

---

## Installation — Web Version (app.diagrams.net)

The plugin file must be hosted at a publicly accessible URL (e.g. GitHub Pages).

1. Fork or copy `AnimateIT.js` to your own GitHub repository
2. Enable **GitHub Pages** for that repository (Settings → Pages → Branch: main)
3. Your plugin URL will be:
   ```
   https://<your-username>.github.io/<your-repo>/AnimateIT.js
   ```
4. Open [app.diagrams.net](https://app.diagrams.net)
5. Go to **Extras → Plugins → Add**
6. Paste the URL and click **OK → Apply**
7. Reload the browser tab — the plugin is now active

---

## Compatibility

| Platform | Supported |
|---|---|
| draw.io Desktop (Windows) | ✅ (requires `--enable-plugins`) |
| draw.io Web (app.diagrams.net) | ✅ |
| draw.io for Confluence / Jira | ❌ (plugins not supported) |
