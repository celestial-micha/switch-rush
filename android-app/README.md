# Switch Rush Android App

这是一个原生 Android WebView 外壳项目，已经把网页游戏资源打包进 `assets/www`。

## 你本地如何生成 APK

1. 用 Android Studio 打开 `D:\coding\codex\android-app`
2. 等待 Gradle 同步完成
3. 连接手机或启动模拟器
4. 点击 `Run` 安装调试版

## 直接生成安装包

在 Android Studio 里：

1. 打开 `Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. 构建完成后找到输出的 `app-debug.apk`
3. 发到手机安装测试

## 资源同步

如果你后面继续修改网页版本，需要把这些文件重新复制到 `app/src/main/assets/www/`：

- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `icons/`
