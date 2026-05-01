[На русском](README.ru.md)

# AnimateIT! for draw.io

AnimateIT! makes selected draw.io / diagrams.net connectors easier to follow. When you select an edge, it gets a bright flow highlight, temporarily moves above overlapping lines, and then returns to its original style and layer order when deselected.

It is built for network diagrams, rack layouts, infrastructure maps, and other diagrams where many connectors cross each other.

<img width="920" height="602" alt="AnimateIT preview" src="https://github.com/user-attachments/assets/280c3808-6bdc-4f05-83a6-1f834713abe1" />

## Features

- Flow animation on selected connectors
- Bright green highlight and increased stroke width
- Temporary bring-to-front behavior while a connector is selected
- Restoration of the original style and layer order on deselect
- Toggle from the draw.io **Extras** menu or with `Ctrl + Alt + I`
- Desktop plugin and browser userscript variants

## Files

| File | Purpose |
|---|---|
| `AnimateIT.js` | Native draw.io plugin for draw.io Desktop and self-hosted diagrams.net |
| `AnimateIT.user.js` | Tampermonkey userscript for app.diagrams.net / draw.io in the browser |
| `README.md` | English documentation |
| `README.ru.md` | Russian documentation |

## Browser Installation With Tampermonkey

Use this option for the official web editor at [app.diagrams.net](https://app.diagrams.net/). The userscript is the most practical browser approach because normal external plugin loading can be blocked by the site's content security policy.

1. Install Tampermonkey.
2. In Chrome, open **Extensions -> Tampermonkey -> Details** and enable **Allow user scripts**. Without this setting the script may appear installed but never run.
3. Open Tampermonkey and choose **Create a new script**.
4. Paste the full contents of `AnimateIT.user.js`.
5. Save the script with `Ctrl + S`.
6. Open or hard-reload [app.diagrams.net](https://app.diagrams.net/) with `Ctrl + F5`.

When it is working, the browser console shows:

```text
[AnimateIT] Userscript started...
[AnimateIT] Draw.loadPlugin found...
[AnimateIT] Ready
```

You can also run this in DevTools:

```js
window.__AnimateITStatus
```

`ready: true` means the userscript has attached itself to draw.io successfully.

## Desktop Installation

External plugins are disabled by default in draw.io Desktop starting from version 19.0.3, so the app must be launched with `--enable-plugins`.

1. Download `AnimateIT.js` and save it somewhere permanent, for example:

   ```text
   C:\Users\YourName\drawio-plugins\AnimateIT.js
   ```

2. Edit your draw.io shortcut and add the flag to the target:

   ```cmd
   "C:\Program Files\draw.io\draw.io.exe" --enable-plugins
   ```

3. Open draw.io using that shortcut.
4. Go to **Extras -> Plugins...**.
5. Click **Add**, select `AnimateIT.js`, then click **OK** and **Apply**.
6. Restart draw.io using the same shortcut.

The plugin will be available from **Extras -> AnimateIT!** after restart.

## Self-Hosted / Docker Installation

If you host diagrams.net yourself, for example with Docker, you control the HTTP headers and plugin origin. In that setup you can use `AnimateIT.js` as a normal draw.io plugin.

Recommended setup:

1. Host `AnimateIT.js` from the same origin as your diagrams.net instance, or relax your CSP to allow that plugin URL.
2. Open your self-hosted diagrams.net instance.
3. Add the plugin through **Extras -> Plugins...**.
4. Reload the editor.

## Usage

Select any connector. AnimateIT! highlights it and raises it above overlapping lines. Deselect the connector and the plugin restores the original style and layer order.

Use `Ctrl + Alt + I` or **Extras -> AnimateIT!** to disable or re-enable the plugin while draw.io is open.

## Compatibility

| Platform | Status | Notes |
|---|---|---|
| app.diagrams.net / draw.io in Chrome | Supported via Tampermonkey | Requires Tampermonkey's **Allow user scripts** permission |
| app.diagrams.net / draw.io in other browsers | Supported via userscript manager | Site access must be enabled for the extension |
| draw.io Desktop for Windows | Supported | Requires `--enable-plugins` |
| Self-hosted diagrams.net / Docker | Supported | Host the plugin where your CSP allows it |
| Confluence / Jira draw.io apps | Not supported | These environments do not allow arbitrary plugins |

## Troubleshooting

If the Tampermonkey version does not run:

- Confirm that the installed script starts with `// @version      1.3.0`.
- Open DevTools -> Console and filter by `AnimateIT`.
- Run `window.__AnimateITStatus` in the console to see the last startup status.
- If there are no `[AnimateIT]` messages and `window.__AnimateITStatus` is `undefined`, Tampermonkey did not run the script. In Chrome, enable **Allow user scripts** for Tampermonkey and make sure the extension has access to `app.diagrams.net`.
- If you see a timeout waiting for `Draw.loadPlugin`, hard-reload the page after the editor has fully opened.
- If the menu item appears but selection does nothing, check whether the selected object is an edge, not a shape.

## Notes For Maintainers

`AnimateIT.user.js` intentionally uses `@grant unsafeWindow` so it can access draw.io globals such as `Draw`, `mxEvent`, and `mxUtils`. A previous injected-script approach was removed because it was more fragile in Chrome and could fail before setting diagnostic status.

## License

MIT. See [LICENSE](LICENSE).
