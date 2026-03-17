# Publishing a release

## First release (one-time)

1. **Version is set** in `package.json` and `src-tauri/tauri.conf.json` (e.g. `1.0.0`).
2. **Commit and push** all changes to `main`.
3. **Create the release** (from repo root):

   ```bash
   gh release create v1.0.0 --title "BountyHub Desktop v1.0.0" --notes "First release of the BountyHub desktop app for Windows, macOS, and Linux."
   ```

   Or in GitHub: **Releases** → **Draft a new release** → choose tag `v1.0.0` (create if needed) → **Publish release**.

4. **Desktop workflow** runs automatically: builds Tauri for Windows, macOS, and Linux, uploads installers and `latest.json` to the release. Wait a few minutes for artifacts to appear.
5. **Download page** at [bountyhub.tech/download](https://bountyhub.tech/download) links to `https://github.com/chiku524/bountyhub/releases/latest`; once the release is published, the buttons work.

## Later releases

1. Bump `version` in `package.json` and `src-tauri/tauri.conf.json` to the new version (e.g. `1.1.0`).
2. Commit, push, then run:

   ```bash
   gh release create v1.1.0 --title "BountyHub Desktop v1.1.0" --notes "Bug fixes and improvements."
   ```

   Or create the release from the GitHub UI.

3. The desktop app’s built-in updater will see the new version and prompt users to update.
