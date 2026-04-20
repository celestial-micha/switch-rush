# Recovery Report

这份报告记录的是此前项目文件缺失后，如何根据现有内容推断并恢复原始网页工程。

## 恢复时的已知事实

- 根目录中大量网页项目文件已经缺失。
- `android-app/` 目录仍然存在。
- `android-app/app/src/main/assets/www/` 中保留了完整网页资源。
- `android-app/README.md` 能证明 Android 工程只是网页游戏的封装壳层，而不是唯一源头。
- 之前的对话中明确提到过根目录原本存在独立网页 / PWA 文件，以及后来新增的 Android 工程。

## 推断出的原始结构

```text
D:\coding\codex\
  index.html
  styles.css
  app.js
  manifest.webmanifest
  sw.js
  README.md
  icons\
    icon-192.png
    icon-512.png
  android-app\
    ...
```

## 当时确认缺失并补齐的文件

- `D:\coding\codex\index.html`
- `D:\coding\codex\styles.css`
- `D:\coding\codex\app.js`
- `D:\coding\codex\manifest.webmanifest`
- `D:\coding\codex\sw.js`
- `D:\coding\codex\README.md`
- `D:\coding\codex\icons\icon-192.png`
- `D:\coding\codex\icons\icon-512.png`

## 恢复方法

- 网页资源与图标：从 `android-app/app/src/main/assets/www/` 读取并复制回根目录
- `README.md`：根据现有工程结构与对话信息手工重建

## 恢复过程中的边界

按照当时的要求，恢复过程中没有修改 `android-app/app` 目录中的原有文件内容。

说明如下：

- 允许读取 `android-app/app` 用于反推与恢复
- 不对其中原始文件做删除、覆盖或重写
