# Git Guide For This Project

这份说明针对当前项目 `D:\coding\codex`，目标是帮助你用最少的核心命令完成版本保存，并理解它们为什么有用。

## 这次项目里最重要的 20% Git

如果你现在只想先掌握最实用的一小部分，记住下面四条命令就够用了：

```powershell
git status
git add .
git commit -m "feat: 描述这次改动"
git log --oneline -n 5
```

它们分别对应四件事：

- `git status`：先看现状
- `git add .`：把准备提交的改动放进暂存区
- `git commit -m "..."`：正式保存一个版本
- `git log --oneline -n 5`：回看最近几次提交

## 新手最该先理解的两个概念

### 1. Git 不是自动保存

你改了文件，Git 不会自动帮你记住。

真正形成一个“版本”，至少要走两步：

1. `git add`
2. `git commit`

### 2. Commit 就是一个可回退的存档点

每次 `commit`，都相当于给项目打了一个时间节点。

以后如果你改坏了，或者想给面试官展示“我是怎么一步步把项目做好的”，这些存档点都会很有价值。

## 这次你现在应该怎么提交

你已经有一个初始提交：`小游戏初始版本`

当前这次可以作为一次比较完整的功能与体验打磨提交。推荐你在 `D:\coding\codex` 目录执行：

```powershell
& 'D:\Program Files\Git\cmd\git.exe' status
& 'D:\Program Files\Git\cmd\git.exe' add .
& 'D:\Program Files\Git\cmd\git.exe' commit -m "feat: polish mobile gameplay and android packaging"
& 'D:\Program Files\Git\cmd\git.exe' log --oneline --decorate -n 5
```

如果你平时已经把 Git 配到环境变量里，也可以把前面的完整路径去掉，直接写成：

```powershell
git status
git add .
git commit -m "feat: polish mobile gameplay and android packaging"
git log --oneline --decorate -n 5
```

## 为什么这次推荐这个提交信息

`feat: polish mobile gameplay and android packaging`

可以拆成两部分理解：

- `feat`：这次是功能和体验上的明显增强，不只是小修小补
- `polish mobile gameplay and android packaging`：说明重点是手机端玩法打磨与 Android 封装体验完善

如果你更想强调“这是一整晚的集中打磨版本”，也可以用：

```powershell
git commit -m "feat: finalize mobile polish for Switch Rush"
```

## 以后每次开发时的推荐节奏

做完一小段稳定改动，就提交一次，不要攒特别久。

一个很实用的小循环是：

```powershell
git status
git add .
git commit -m "fix: 描述修复内容"
```

常见提交前缀你可以先只记这三个：

- `feat:` 新功能或明显增强
- `fix:` 修 bug
- `docs:` 文档更新

比如这个项目里，以后你可能会写出这样的提交：

```powershell
git commit -m "fix: tune long-screen mobile layout"
git commit -m "feat: add support page pause behavior"
git commit -m "docs: update changelog and release notes"
```

## 提交前建议检查什么

先跑一遍：

```powershell
& 'D:\Program Files\Git\cmd\git.exe' status
```

重点看三件事：

- 有没有把不该提交的本地文件带进去，比如 `.idea/`
- 私有赞赏码是不是还保持在 `.gitignore` 中
- Android 资源和根目录网页资源是不是已经同步

## 什么时候需要更新 Markdown 文档

如果改动会影响下面这些内容，建议顺手更新文档：

- 玩法和功能
- 运行方式
- 打包方式
- 版权说明
- 版本演进记录

不是每次都要大改 README，但比较完整的一轮迭代后，至少更新一次 `CHANGELOG.md` 会很值。
