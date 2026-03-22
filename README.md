# Ralph

![Ralph](ralph.webp)

[English](#english-version) | [中文](#中文版本)

## 中文版本

Ralph 是一个自主 AI 代理循环，反复运行 AI 编码工具（[OpenCode](https://opencode.ai) 或 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)）直到完成所有 PRD 项目。每次迭代都是一个具有干净上下文的新实例。内存通过 git 历史、`progress.txt` 和 `prd.json` 持续存在。

基于 [Geoffrey Huntley 的 Ralph 模式](https://ghuntley.com/ralph/)。

## 前提条件

- 以下 AI 编码工具之一已安装并经过身份验证：
  - [OpenCode CLI](https://opencode.ai) (默认)
  - [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (`npm install -g @anthropic-ai/claude-code`)
- `jq` 已安装 (`brew install jq` on macOS)
- 您项目的 git 仓库

## 设置

### 方案 1：复制到您的项目

将 ralph 文件复制到您的项目中：

```bash
# 从您的项目根目录
mkdir -p scripts/ralph
cp /path/to/ralph/ralph.sh scripts/ralph/

# 为您的 AI 工具复制提示模板：
cp /path/to/ralph/AGENTS.md scripts/ralph/AGENTS.md    # For OpenCode and Claude Code

chmod +x scripts/ralph/ralph.sh
```

### 方案 2：全局安装技能

将技能复制到您的 OpenCode 或 Claude 配置中以供所有项目使用：

For OpenCode
```bash
cp -r skills/prd ~/.opencode/skills/
cp -r skills/ralph ~/.opencode/skills/
```

For Claude Code (manual)
```bash
cp -r skills/prd ~/.claude/skills/
cp -r skills/ralph ~/.claude/skills/
```

### 方案 3：使用 Claude Code Marketplace

将 Ralph marketplace 添加到 Claude Code：

```bash
/plugin marketplace add willin/ralph
```

然后安装技能：

```bash
/plugin install ralph-skills@ralph-marketplace
```

安装后可用的技能：
- `/prd` - 生成产品需求文档
- `/ralph` - 将 PRD 转换为 prd.json 格式

当您要求 Claude 时，技能会自动调用：
- "create a prd", "write prd for", "plan this feature"
- "convert this prd", "turn into ralph format", "create prd.json"

## 工作流程

### 1. 创建 PRD

使用 PRD 技能生成详细的需求文档：

```
Load the prd skill and create a PRD for [your feature description]
```

回答澄清问题。技能将输出保存到 `tasks/prd-[feature-name].md`。

### 2. 将 PRD 转换为 Ralph 格式

使用 Ralph 技能将 markdown PRD 转换为 JSON：

```
Load the ralph skill and convert tasks/prd-[feature-name].md to prd.json
```

这将创建带有为自主执行构建的用户故事的 `prd.json`。

### 3. 运行 Ralph

```bash
# 使用 OpenCode (默认)
./scripts/ralph/ralph.sh [max_iterations]

# 使用 Claude Code
./scripts/ralph/ralph.sh --tool claude [max_iterations]
```

默认为 10 次迭代。使用 `--tool opencode` 或 `--tool claude` 选择您的 AI 编码工具。

Ralph 将：
1. 创建功能分支（来自 PRD `branchName`）
2. 选择最高优先级的 `passes: false` 故事
3. 实现那个单独的故事
4. 运行质量检查（类型检查，测试）
5. 如果检查通过则提交
6. 更新 `prd.json` 将故事标记为 `passes: true`
7. 将学习成果追加到 `progress.txt`
8. 重复直到所有故事通过或达到最大迭代次数

## 关键文件

| File | Purpose |
|------|---------|
| `ralph.sh` | 生成新 AI 实例的 bash 循环 (支持 `--tool opencode` 或 `--tool claude`) |
| `AGENTS.md` | OpenCode 和 Claude Code 的提示模板 |
| `prd.json` | 带有 `passes` 状态的用户故事（任务列表） |
| `prd.json.example` | 示例 PRD 格式供参考 |
| `progress.txt` | 仅供追加的未来迭代学习成果 |
| `skills/prd/` | 生成 PRD 的技能（适用于 OpenCode 和 Claude Code） |
| `skills/ralph/` | 将 PRD 转换为 JSON 的技能（适用于 OpenCode 和 Claude Code） |
| `.claude-plugin/` | Claude Code marketplace 发现的插件清单 |
| `flowchart/` | Ralph 工作方式的交互式可视化 |

## Flowchart

[![Ralph Flowchart](ralph-flowchart.png)](https://ralph.js.cool/)

**[查看交互式流程图](https://ralph.js.cool/)** - 点击查看每步的动画。

`flowchart/` 目录包含源代码。本地运行：

```bash
cd flowchart
npm install
npm run dev
```

## 关键概念

### 每次迭代 = 新上下文

每次迭代都会生成一个具有干净上下文的**新 AI 实例**（OpenCode 或 Claude Code）。迭代之间唯一的内存是：
- Git 历史（来自先前迭代的提交）
- `progress.txt`（学习成果和上下文）
- `prd.json`（哪些故事已完成）

### 小任务

每个 PRD 项目应该足够小以在一个上下文窗口中完成。如果任务太大，LLM 会在完成之前耗尽上下文并产生糟糕的代码。

合适大小的故事：
- 添加数据库列和迁移
- 向现有页面添加 UI 组件
- 更新服务器操作并添加新逻辑
- 向列表添加筛选下拉菜单

太大（拆分这些）：
- "构建整个仪表盘"
- "添加身份验证"
- "重构 API"

### AGENTS.md 更新至关重要

每次迭代后，Ralph 会用学习成果更新相关的 `AGENTS.md` 文件。这是关键，因为 AI 编码工具会自动读取这些文件，所以未来的迭代（以及未来的人类开发人员）会从发现的模式、陷阱和约定中受益。

应在 AGENTS.md 中添加的内容示例：
- 发现的模式（"这个代码库对 Y 使用 X"）
- 陷阱（"更改 W 时不要忘记更新 Z"）
- 有用上下文（"设置面板在组件 X 中"）

### 反馈循环

Ralph 只有在存在反馈循环时才能工作：
- 类型检查捕获类型错误
- 测试验证行为
- CI 必须保持绿色（损坏的代码会在迭代间累积）

### UI 故事的浏览器验证

前端故事必须在验收标准中包含"使用 dev-browser 技能在浏览器中验证"。Ralph 将使用 dev-browser 技能导航到页面，与 UI 交互，并确认更改有效。

### 停止条件

当所有故事都具有 `passes: true` 时，Ralph 输出 `<promise>COMPLETE</promise>` 并退出循环。

## 调试

检查当前状态：

```bash
# 查看哪些故事已完成
cat prd.json | jq '.userStories[] | {id, title, passes}'

# 查看先前迭代的学习成果
cat progress.txt

# 检查 git 历史
git log --oneline -10
```

## 自定义提示

将 `AGENTS.md`（用于 OpenCode 或 Claude Code）复制到您的项目后，为其自定义：
- 添加特定于项目的质量检查命令
- 包括代码库约定
- 为您堆栈添加常见陷阱

## 归档

当您开始新功能时（不同的 `branchName`），Ralph 会自动归档以前的运行。归档保存到 `archive/YYYY-MM-DD-feature-name/`。

## 鸣谢与参考

本项目基于原始的 Ralph 模式，感谢以下贡献：

- [Geoffrey Huntley's Ralph article](https://ghuntley.com/ralph/) - 原始 Ralph 模式的创建者
- [OpenCode documentation](https://opencode.ai) - OpenCode 文档
- [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) - Claude Code 文档
- [Snarktank Ralph for AMP & Claude Code](https://github.com/snarktank/ralph?tab=readme-ov-file)

## English Version

Ralph is an autonomous AI agent loop that runs AI coding tools ([OpenCode](https://opencode.ai) or [Claude Code](https://docs.anthropic.com/en/docs/claude-code)) repeatedly until all PRD items are complete. Each iteration is a fresh instance with clean context. Memory persists via git history, `progress.txt`, and `prd.json`.

Based on [Geoffrey Huntley's Ralph pattern](https://ghuntley.com/ralph/).

## Prerequisites

- One of the following AI coding tools installed and authenticated:
  - [OpenCode CLI](https://opencode.ai) (default)
  - [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (`npm install -g @anthropic-ai/claude-code`)
- `jq` installed (`brew install jq` on macOS)
- A git repository for your project

## Setup

### Option 1: Copy to your project

Copy the ralph files into your project:

```bash
# From your project root
mkdir -p scripts/ralph
cp /path/to/ralph/ralph.sh scripts/ralph/

# Copy the prompt template for your AI tool of choice:
cp /path/to/ralph/AGENTS.md scripts/ralph/AGENTS.md    # For OpenCode and Claude Code

chmod +x scripts/ralph/ralph.sh
```

### Option 2: Install skills globally

Copy the skills to your OpenCode or Claude config for use across all projects:

For OpenCode
```bash
cp -r skills/prd ~/.opencode/skills/
cp -r skills/ralph ~/.opencode/skills/
```

For Claude Code (manual)
```bash
cp -r skills/prd ~/.claude/skills/
cp -r skills/ralph ~/.claude/skills/
```

### Option 3: Use Claude Code Marketplace

Add the Ralph marketplace to Claude Code:

```bash
/plugin marketplace add willin/ralph
```

Then install the skills:

```bash
/plugin install ralph-skills@ralph-marketplace
```

Available skills after installation:
- `/prd` - Generate Product Requirements Documents
- `/ralph` - Convert PRDs to prd.json format

Skills are automatically invoked when you ask Claude to:
- "create a prd", "write prd for", "plan this feature"
- "convert this prd", "turn into ralph format", "create prd.json"

## Workflow

### 1. Create a PRD

Use the PRD skill to generate a detailed requirements document:

```
Load the prd skill and create a PRD for [your feature description]
```

Answer the clarifying questions. The skill saves output to `tasks/prd-[feature-name].md`.

### 2. Convert PRD to Ralph format

Use the Ralph skill to convert the markdown PRD to JSON:

```
Load the ralph skill and convert tasks/prd-[feature-name].md to prd.json
```

This creates `prd.json` with user stories structured for autonomous execution.

### 3. Run Ralph

```bash
# Using OpenCode (default)
./scripts/ralph/ralph.sh [max_iterations]

# Using Claude Code
./scripts/ralph/ralph.sh --tool claude [max_iterations]
```

Default is 10 iterations. Use `--tool opencode` or `--tool claude` to select your AI coding tool.

Ralph will:
1. Create a feature branch (from PRD `branchName`)
2. Pick the highest priority story where `passes: false`
3. Implement that single story
4. Run quality checks (typecheck, tests)
5. Commit if checks pass
6. Update `prd.json` to mark story as `passes: true`
7. Append learnings to `progress.txt`
8. Repeat until all stories pass or max iterations reached

## Key Files

| File | Purpose |
|------|---------|
| `ralph.sh` | The bash loop that spawns fresh AI instances (supports `--tool opencode` or `--tool claude`) |
| `AGENTS.md` | Prompt template for OpenCode and Claude Code |
| `prd.json` | User stories with `passes` status (the task list) |
| `prd.json.example` | Example PRD format for reference |
| `progress.txt` | Append-only learnings for future iterations |
| `skills/prd/` | Skill for generating PRDs (works with OpenCode and Claude Code) |
| `skills/ralph/` | Skill for converting PRDs to JSON (works with OpenCode and Claude Code) |
| `.claude-plugin/` | Plugin manifest for Claude Code marketplace discovery |
| `flowchart/` | Interactive visualization of how Ralph works |

## Flowchart

[![Ralph Flowchart](ralph-flowchart.png)](https://ralph.js.cool/)

**[View Interactive Flowchart](https://ralph.js.cool/)** - Click through to see each step with animations.

The `flowchart/` directory contains the source code. To run locally:

```bash
cd flowchart
npm install
npm run dev
```

## Critical Concepts

### Each Iteration = Fresh Context

Each iteration spawns a **new AI instance** (OpenCode or Claude Code) with clean context. The only memory between iterations is:
- Git history (commits from previous iterations)
- `progress.txt` (learnings and context)
- `prd.json` (which stories are done)

### Small Tasks

Each PRD item should be small enough to complete in one context window. If a task is too big, the LLM runs out of context before finishing and produces poor code.

Right-sized stories:
- Add a database column and migration
- Add a UI component to an existing page
- Update a server action with new logic
- Add a filter dropdown to a list

Too big (split these):
- "Build the entire dashboard"
- "Add authentication"
- "Refactor the API"

### AGENTS.md Updates Are Critical

After each iteration, Ralph updates the relevant `AGENTS.md` files with learnings. This is key because AI coding tools automatically read these files, so future iterations (and future human developers) benefit from discovered patterns, gotchas, and conventions.

Examples of what to add to AGENTS.md:
- Patterns discovered ("this codebase uses X for Y")
- Gotchas ("do not forget to update Z when changing W")
- Useful context ("the settings panel is in component X")

### Feedback Loops

Ralph only works if there are feedback loops:
- Typecheck catches type errors
- Tests verify behavior
- CI must stay green (broken code compounds across iterations)

### Browser Verification for UI Stories

Frontend stories must include "Verify in browser using dev-browser skill" in acceptance criteria. Ralph will use the dev-browser skill to navigate to the page, interact with the UI, and confirm changes work.

### Stop Condition

When all stories have `passes: true`, Ralph outputs `<promise>COMPLETE</promise>` and the loop exits.

## Debugging

Check current state:

```bash
# See which stories are done
cat prd.json | jq '.userStories[] | {id, title, passes}'

# See learnings from previous iterations
cat progress.txt

# Check git history
git log --oneline -10
```

## Customizing the Prompt

After copying `AGENTS.md` (for OpenCode or Claude Code) to your project, customize it for your project:
- Add project-specific quality check commands
- Include codebase conventions
- Add common gotchas for your stack

## Archiving

Ralph automatically archives previous runs when you start a new feature (different `branchName`). Archives are saved to `archive/YYYY-MM-DD-feature-name/`.

## Acknowledgements and References

This project builds on the original Ralph pattern with thanks to the following contributors:

- [Geoffrey Huntley's Ralph article](https://ghuntley.com/ralph/) - Creator of the original Ralph pattern
- [OpenCode documentation](https://opencode.ai) - OpenCode documentation
- [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) - Claude Code documentation
- [Snarktank Ralph for AMP & Claude Code](https://github.com/snarktank/ralph?tab=readme-ov-file)