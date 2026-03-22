---
name: ralph
description: "将 PRD 转换为 Ralph 自主代理系统使用的 prd.json 格式。在您有现有 PRD 并需要将其转换为 Ralph 的 JSON 格式时使用。触发条件：生成 prd.json, convert this prd, turn this into ralph format, create prd.json from this, ralph json。"
user-invocable: true
---

# Ralph PRD 转换器

将现有 PRD 转换为 Ralph 用于自主执行的 prd.json 格式。

---

## 工作内容

获取 PRD（markdown 文件或文本）并将其转换为您 ralph 目录中的 `prd.json`。

---

## 输出格式

```json
{
  "project": "[项目名称]",
  "branchName": "ralph/[功能名称-连字符格式]",
  "description": "[来自 PRD 标题/介绍的功能描述]",
  "userStories": [
    {
      "id": "US-001",
      "title": "[故事标题]",
      "description": "作为一个 [用户]，我想要 [功能] 这样 [好处]",
      "acceptanceCriteria": [
        "标准 1",
        "标准 2",
        "类型检查通过"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

---

## 故事大小：第一法则

**每个故事必须可以在 ONE Ralph 迭代（一个上下文窗口）中完成。**

Ralph 每次迭代都会生成一个新的 AI 实例，没有任何先前工作的记忆。如果故事太大，LLM 会在完成之前耗尽上下文并生成损坏的代码。

### 合适大小的故事：
- 添加数据库列和迁移
- 向现有页面添加 UI 组件
- 使用新逻辑更新服务器操作
- 向列表添加筛选下拉菜单

### 太大（分割这些）：
- "构建整个仪表盘" - 分割为：schema、查询、UI 组件、筛选器
- "添加身份验证" - 分割为：schema、中间件、登录 UI、会话处理
- "重构 API" - 按端点或模式将每个分成一个故事

**经验法则：** 如果您无法在 2-3 句话中描述更改，则太大。

---

## 故事排序：依赖关系优先

故事按优先级顺序执行。早期故事不得依赖后期故事。

**正确顺序：**
1. Schema/数据库更改（迁移）
2. 服务器操作 / 后端逻辑
3. 使用后端的 UI 组件
4. 汇总数据的仪表盘/摘要视图

**错误顺序：**
1. UI 组件（依赖尚不存在的 schema）
2. Schema 更改

---

## 验收标准：必须可验证

每个标准必须是 Ralph 可以检查的东西，而不是模糊的东西。

### 好的标准（可验证）：
- "向任务表添加 `status` 列，默认值为 'pending'"
- "筛选下拉菜单有选项：全部、活跃、已完成"
- "点击删除显示确认对话框"
- "类型检查通过"
- "测试通过"

### 坏的标准（模糊）：
- "正常工作"
- "用户可以轻松做 X"
- "良好用户体验"
- "处理边缘情况"

### 始终包括最终标准：
```
"类型检查通过"
```

对于有可测试逻辑的故事，还包括：
```
"测试通过"
```

### 对于更改 UI 的故事，还包括：
```
"使用 dev-browser 技能在浏览器中验证"
```

前端故事在视觉验证之前并未完成。Ralph 将使用 dev-browser 技能导航到页面，与 UI 交互，并确认更改有效。

---

## 转换规则

1. **每个用户故事变成一个 JSON 条目**
2. **ID**：顺序（US-001、US-002 等）
3. **优先级**：基于依赖关系顺序，然后是文档顺序
4. **所有故事**：`passes: false` 和空的 `notes`
5. **branchName**：从功能名称派生，连字符格式，以 `ralph/` 为前缀
6. **始终添加**：将"类型检查通过"添加到每个故事的验收标准

---

## 分割大型 PRD

如果 PRD 有大型功能，请将其分割：

**原始：**
> "添加用户通知系统"

**分割为：**
1. US-001：向数据库添加通知表
2. US-002：创建发送通知的通知服务
3. US-003：向头部添加通知铃铛图标
4. US-004：创建通知下拉面板
5. US-005：添加标记为已读功能
6. US-006：添加通知首选项页面

每个都是一个集中的更改，可以独立完成和验证。

---

## 示例

**输入 PRD：**
```markdown
# 任务状态功能

添加标记不同任务状态的能力。

## 需求
- 在任务列表上切换待办/进行中/完成
- 按状态筛选列表
- 在每个任务上显示状态徽章
- 在数据库中持久化状态
```

**输出 prd.json：**
```json
{
  "project": "TaskApp",
  "branchName": "ralph/task-status",
  "description": "任务状态功能 - 使用状态指示器跟踪任务进度",
  "userStories": [
    {
      "id": "US-001",
      "title": "向任务表添加状态字段",
      "description": "作为一个开发人员，我需要在数据库中存储任务状态。",
      "acceptanceCriteria": [
        "添加状态列：'pending' | 'in_progress' | 'done'（默认 'pending'）",
        "成功生成并运行迁移",
        "类型检查通过"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-002",
      "title": "在任务卡片上显示状态徽章",
      "description": "作为一个用户，我想要一眼看到任务状态。",
      "acceptanceCriteria": [
        "每个任务卡片显示彩色状态徽章",
        "徽章颜色：灰色=待办，蓝色=进行中，绿色=完成",
        "类型检查通过",
        "使用 dev-browser 技能在浏览器中验证"
      ],
      "priority": 2,
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-003",
      "title": "向任务列表行添加状态切换",
      "description": "作为一个用户，我想要直接从列表更改任务状态。",
      "acceptanceCriteria": [
        "每行都有状态下拉菜单或切换",
        "更改状态立即保存",
        "UI 更新无需刷新页面",
        "类型检查通过",
        "使用 dev-browser 技能在浏览器中验证"
      ],
      "priority": 3,
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-004",
      "title": "按状态筛选任务",
      "description": "作为一个用户，我想要筛选列表只查看某些状态。",
      "acceptanceCriteria": [
        "筛选下拉菜单：全部 | 待办 | 进行中 | 完成",
        "筛选器保留在 URL 参数中",
        "类型检查通过",
        "使用 dev-browser 技能在浏览器中验证"
      ],
      "priority": 4,
      "passes": false,
      "notes": ""
    }
  ]
}
```

---

## 归档之前的运行

**在编写新的 prd.json 之前，检查是否存在来自不同功能的现有 prd.json：**

1. 如果存在，读取当前的 `prd.json`
2. 检查 `branchName` 是否与新功能的分支名称不同
3. 如果不同并且 `progress.txt` 除了标题外还有内容：
   - 创建归档文件夹：`archive/YYYY-MM-DD-feature-name/`
   - 将当前的 `prd.json` 和 `progress.txt` 复制到归档
   - 用新标题重置 `progress.txt`

**ralph.sh 脚本在运行时自动处理此问题**，但如果在运行之间手动更新 prd.json，请先归档。

---

## 保存前检查清单

在编写 prd.json 之前，验证：

- [ ] **之前运行已归档**（如果 prd.json 存在但 branchName 不同，请先归档）
- [ ] 每个故事都可以在一次迭代中完成（足够小）
- [ ] 故事按依赖关系排序（schema 到后端到 UI）
- [ ] 每个故事都有"类型检查通过"作为标准
- [ ] UI 故事有"使用 dev-browser 技能在浏览器中验证"作为标准
- [ ] 验收标准是可验证的（不模糊）
- [ ] 没有故事依赖后续故事
