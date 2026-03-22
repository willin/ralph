export const translations = {
  en: {
    title: "How Ralph Works",
    subtitle: "Autonomous AI agent loop for completing PRDs",
    steps: [
      { label: "You write a PRD", description: "Define what you want to build" },
      { label: "Convert to prd.json", description: "Break into small user stories" },
      { label: "Run ralph.sh", description: "Starts the autonomous loop" },
      { label: "AI picks a story", description: "Finds next passes: false" },
      { label: "Implements it", description: "Writes code, runs tests" },
      { label: "Commits changes", description: "If tests pass" },
      { label: "Updates prd.json", description: "Sets passes: true" },
      { label: "Logs to progress.txt", description: "Saves learnings" },
      { label: "More stories?", description: "" },
      { label: "Done!", description: "All stories complete" },
    ],
    button: {
      previous: "Previous",
      next: "Next",
      reset: "Reset",
    },
    controls: {
      stepCounter: (current: number, total: number) => `Step ${current} of ${total}`,
    },
    instructions: "Click Next to reveal each step",
    edgeLabels: {
      yes: "Yes",
      no: "No",
    },
    noteContent: {
      jsonExample: `{
  "id": "US-001",
  "title": "Add priority field to database",
  "acceptanceCriteria": [
    "Add priority column to tasks table",
    "Generate and run migration",
    "Typecheck passes"
  ],
  "passes": false
}`,
      updateNote: `Also updates AGENTS.md with
patterns discovered, so future
iterations learn from this one.`,
    },
  },
  zh: {
    title: "Ralph 工作原理",
    subtitle: "完成 PRD 的自主 AI 代理循环",
    steps: [
      { label: "编写 PRD", description: "定义您想要构建的内容" },
      { label: "转换为 prd.json", description: "分解为小的用户故事" },
      { label: "运行 ralph.sh", description: "启动自主循环" },
      { label: "AI 选择一个故事", description: "寻找下一个 passes: false" },
      { label: "实现它", description: "编写代码，运行测试" },
      { label: "提交更改", description: "如果测试通过" },
      { label: "更新 prd.json", description: "设置 passes: true" },
      { label: "记录到 progress.txt", description: "保存学习成果" },
      { label: "还有更多故事？", description: "" },
      { label: "完成！", description: "所有故事已完成" },
    ],
    button: {
      previous: "上一步",
      next: "下一步",
      reset: "重置",
    },
    controls: {
      stepCounter: (current: number, total: number) => `第 ${current} 步，共 ${total} 步`,
    },
    instructions: "点击下一步显示每个步骤",
    edgeLabels: {
      yes: "是",
      no: "否",
    },
    noteContent: {
      jsonExample: `{
  "id": "US-001",
  "title": "向数据库添加优先级字段",
  "acceptanceCriteria": [
    "向任务表添加优先级列",
    "生成并运行迁移",
    "类型检查通过"
  ],
  "passes": false
}`,
      updateNote: `同时更新 AGENTS.md 与发现的模式，
这样未来的迭代就能从中学习。`,
    },
  },
};

export type Language = 'en' | 'zh';