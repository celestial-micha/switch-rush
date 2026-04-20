# Git Guide For This Project

这份说明针对当前 `D:\coding\codex` 项目，目标是完成第一次可回退的版本保存。

## 这次已经帮你做好的事情

我已经创建了：

- `.gitignore`

当前忽略规则的核心思路是：

- 保留源码
- 忽略构建产物
- 忽略本机配置
- 忽略 Android Studio 自动生成缓存

对于这个项目，下面这些内容应该忽略，不要提交：

- `android-app/.gradle/`
- `android-app/.idea/`
- `android-app/build/`
- `android-app/app/build/`
- `android-app/local.properties`

## 你现在只需要执行的 4 条命令

在你自己的终端里，位于 `D:\coding\codex` 时运行：

```powershell
git status
git add .
git commit -m "chore: snapshot recovered Switch Rush project"
git log --oneline --decorate -n 3
```

## 每条命令是干什么的

### `git status`

先看现状。

你每次做 Git 操作前，优先看这一条。它会告诉你：

- 当前在哪个分支
- 哪些文件改了
- 哪些文件还没加入版本管理

这条命令是 Git 里最值得反复使用的一条。

### `git add .`

把“当前目录下所有准备提交的改动”放进暂存区。

最容易理解的方式是：

- 工作区：你正在编辑的真实文件
- 暂存区：你准备打包进下一次提交的文件
- 提交：一次正式存档

`git add .` 的含义就是：

把当前项目里应该提交的变化，先放进“下一次提交的购物篮”。

### `git commit -m "..."`

真正保存一个版本。

提交信息建议写成“这次做了什么”，例如：

```powershell
git commit -m "chore: snapshot recovered Switch Rush project"
```

这次这条信息的意思是：

- `chore`：杂项整理类改动
- `snapshot recovered Switch Rush project`：给恢复后的项目存一个快照

### `git log --oneline --decorate -n 3`

查看最近几次提交。

你会看到类似：

```text
abc1234 (HEAD -> main) chore: snapshot recovered Switch Rush project
```

这说明：

- `abc1234` 是这次提交的短哈希
- `HEAD -> main` 表示你当前就在 `main` 分支的最新提交上

## 这个案例里，你真正需要掌握的 20% Git 核心

如果只学最有用的部分，先记住这 4 条：

1. `git status`
2. `git add .`
3. `git commit -m "说明"`
4. `git log --oneline`

很多初学者觉得 Git 难，不是因为 Git 本身不可理解，而是因为一开始没有抓住最底层的两个概念：

### 概念 1：Git 不是自动保存

Git 不会因为你改了文件就自动记住。

你需要明确做两步：

1. `git add`
2. `git commit`

### 概念 2：提交是“可回退的存档点”

每次 `commit`，你都相当于给项目打了一个时间节点。

以后如果改坏了，可以回到之前的某个提交。

所以对新手最实用的原则是：

- 每做完一小段稳定改动，就提交一次
- 不要攒很久才提交

## 推荐你这次提交后的下一步习惯

以后每次改功能时，用下面这个小循环：

```powershell
git status
git add .
git commit -m "feat: 描述这次功能"
```

比如：

```powershell
git commit -m "feat: tune obstacle rhythm"
git commit -m "fix: remove fever screen tint"
git commit -m "feat: add android wrapper project"
```

## 如果你想让我继续帮你

你执行完以后，把下面两条命令的输出贴给我：

```powershell
git status
git log --oneline --decorate -n 5
```

我就能继续带你做下一步，比如：

- 建分支
- 给这次小游戏改功能
- 做第二次和第三次提交
- 教你怎么回退到某个稳定版本
