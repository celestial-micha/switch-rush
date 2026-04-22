# Release Checklist

## 提交 GitHub 前

1. 运行 `git status`，确认没有把不该提交的本地文件带进去，比如 `.idea/`、构建缓存或临时文件。
2. 确认公开仓库中使用的是占位赞赏码，而不是真实收款码；真实码应保留为 `Reward Code.private.png` 这类被 `.gitignore` 忽略的私有文件。
3. 检查根目录网页资源是否为最新版本，重点看 `index.html`、`styles.css`、`app.js`、`README.md`、`CHANGELOG.md`。
4. 检查文档是否跟上本次改动：如果玩法、打包方式、版权说明或版本演进有变化，顺手更新对应 Markdown。
5. 提交前最后看一眼网页试玩效果，确认开始、暂停、结算、赞赏页、返回逻辑都正常，再执行 `git add .` 和 `git commit -m "..."`。

## 打正式 APK 前

1. 确认根目录网页资源已经同步到 `android-app/app/src/main/assets/www/`，避免网页版和 APK 内资源不一致。
2. 如果这次要放真实赞赏码，把真实图片临时覆盖到根目录和 `android-app/app/src/main/assets/www/` 两处同名文件，再次确认显示正常。
3. 在 Android Studio 中重新构建并安装，重点检查长屏手机上的顶部状态栏、底部导航栏、HUD、暂停按钮和赞赏入口是否正常。
4. 真机完整试玩一轮，至少检查开始、暂停、恢复、失败结算、赞赏页打开关闭、系统返回键、背景音乐与音效。
5. 打包完成后，如果使用过真实赞赏码，记得把仓库中的公开文件恢复为占位图，并再次运行 `git status`，确认不会误提交私有收款码。
