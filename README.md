# Switch Rush

`Switch Rush` 是一个极简的三轨闪避小游戏。

项目包含两部分：

- 根目录网页版本：可直接本地运行，也可部署为静态站点/PWA
- `android-app/`：Android WebView 壳工程，用来打包成可安装的安卓应用

## 根目录结构

- `index.html`：页面结构
- `styles.css`：界面样式
- `app.js`：游戏逻辑、音效、动画、输入处理
- `manifest.webmanifest`：PWA 清单
- `sw.js`：离线缓存
- `icons/`：网页与安装图标
- `android-app/`：Android Studio 工程

## 本地运行网页版本

建议使用本地静态服务器启动：

```powershell
cd D:\coding\codex
python -m http.server 4173
```

然后打开：

```text
http://localhost:4173
```

## Android 打包

直接用 Android Studio 打开：

`D:\coding\codex\android-app`

更详细说明见：

`D:\coding\codex\android-app\README.md`
