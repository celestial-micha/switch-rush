# Switch Rush

[中文说明](./README_CN.md)

`Switch Rush` is a minimalist three-lane dodge game focused on one-thumb mobile controls, rhythm feedback, and installable delivery.

## Screenshots

### Home Screen

![Switch Rush Home](./image/Switch_Rush_Home.jpg)

### Gameplay

![Switch Rush Gameplay](./image/Switch_Rush_Game_Page.jpg)

## License Notice

This repository is provided for portfolio display and learning reference only.

Without the author's permission, redistribution, commercial use, or secondary publication is not allowed.

## Project Structure

- Root web version: can be run locally or deployed as a static site / PWA
- `android-app/`: Android WebView wrapper project for building an installable Android app

## Highlights

- Three-lane dodge gameplay with one-finger controls
- `FLOW / FEVER` rhythm feedback system
- Lightweight built-in synthesized background music and sound effects
- Pause support, best-score saving, and a support page entry
- PWA install support
- Android WebView packaging support

## Documents

- `README.md`: English project overview
- `README_CN.md`: Chinese project overview
- `CHANGELOG.md`: iteration record from the initial version to the current build
- `RELEASE_CHECKLIST.md`: checklist before pushing to GitHub or building a formal APK

## Run Locally

```powershell
cd D:\coding\codex
python -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Android Packaging

Open this folder directly in Android Studio:

`D:\coding\codex\android-app`
