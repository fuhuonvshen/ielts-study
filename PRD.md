# IELTS Listening Practice — Product Requirements Document

## 1. 产品概述

### 1.1 产品定位
一款本地运行的 Web 端雅思听力单词练习系统。以"听音识词"为核心交互，结合多种练习模式，帮助用户在雅思备考中高效掌握听力词汇。

### 1.2 目标用户
- 雅思备考者，需要强化听力词汇反应速度
- 习惯在 PC 端学习的用户
- 对数据隐私敏感、不希望账号绑定的用户

### 1.3 核心价值
- **听音优先**：练习流程以"听"为第一感官入口，模拟真实听力考试场景
- **本地优先**：所有数据存储在浏览器本地（IndexedDB），无需网络即可使用核心功能
- **简洁高效**：Apple 风格的极简交互，减少认知负担，专注学习本身

---

## 2. 功能需求

### 2.1 MVP 功能清单

#### F1 — 单词列表浏览
| 项目 | 说明 |
|------|------|
| 描述 | 以列表/卡片形式展示所有雅思单词，支持搜索、筛选和排序 |
| 数据来源 | 解析 `IELTSword.json`（JSONL 格式）存入 IndexedDB |
| 展示内容 | 单词、音标、释义、例句（1条）、标签 |
| 交互 | 搜索框（实时过滤）、发音按钮、点击进入单词详情 |
| 单词详情 | 完整释义、全部例句、近义词、短语、同根词、英美音标 |

#### F2 — 听音选词（核心练习）
| 项目 | 说明 |
|------|------|
| 描述 | 播放单词发音，用户从 4 个选项中选出正确的单词，不预先展示单词拼写 |
| 流程 | ① 显示喇叭按钮 → ② 点击/自动播放发音 → ③ 展示 4 个候选单词 → ④ 用户选择 → ⑤ 展示结果（正确/错误 + 单词详情） → ⑥ 点击下一题 |
| 选项生成 | 从词库中随机抽取 3 个干扰项（优先同词性、同长度），加上正确答案共 4 个 |
| 发音方案 | 主方案：有道词典 API（`usspeech`/`ukspeech` 字段）；降级方案：Web Speech API |
| 偏好设置 | 支持切换英音/美音、自动播放开/关、每次练习数量（10/20/50） |

#### F3 — 多种练习模式
| 模式 | 描述 | 交互 |
|------|------|------|
| 听音选词 | 播放发音 → 选正确单词 | 4 选 1 |
| 看词选义 | 展示单词 → 选正确中文释义 | 4 选 1 |
| 听音拼写 | 播放发音 → 键盘输入拼写 | 输入框 |
| 看义选词 | 展示中文释义 → 选正确单词 | 4 选 1 |

#### F4 — 学习进度追踪
| 项目 | 说明 |
|------|------|
| 统计维度 | 累计学习天数、总练习次数、总正确率、今日完成数 |
| 单词状态 | 每个单词记录：未学/学习中/已掌握，正确次数，错误次数，最后练习时间 |
| 可视化 | 近 7 天学习热力图、正确率趋势折线图 |
| 存储 | IndexedDB，按日期 + 单词维度存储练习记录 |

#### F5 — 错题本 & 收藏夹
| 项目 | 说明 |
|------|------|
| 错题本 | 自动收集答错过的单词，按错误次数降序排列，支持一键重练 |
| 收藏夹 | 用户手动收藏重点词汇，支持分类标签 |
| 重练逻辑 | 错题本/收藏夹中的单词可单独发起一轮练习 |

---

## 3. 技术架构

### 3.1 技术选型

| 层级 | 技术 | 选型理由 |
|------|------|----------|
| 框架 | React 18 + TypeScript | 生态成熟，类型安全，团队/社区资源丰富 |
| 构建工具 | Vite 5 | 开发热更新快，生产构建体积小 |
| 样式方案 | Tailwind CSS 4 | 原子化 CSS，与 shadcn/ui 深度集成 |
| 组件库 | shadcn/ui | 无包依赖的组件原语，完全可控，Apple 风格定制友好 |
| 状态管理 | Zustand | 轻量、TS 友好、无 boilerplate，适合中等复杂度 SPA |
| 路由 | React Router v7 | SPA 标准路由方案 |
| 本地存储 | Dexie.js（IndexedDB 封装） | Promise API、类型安全、查询能力强 |
| 图表 | Recharts | React 原生图表库，轻量，热力图/折线图内置支持 |
| 测试 | Vitest + React Testing Library | 与 Vite 同生态，速度快 |
| 代码规范 | ESLint + Prettier | 代码风格统一 |
| 包管理 | pnpm | 磁盘空间友好，安装速度快 |

### 3.2 架构图

```
┌─────────────────────────────────────────────────┐
│                    Browser                       │
│  ┌───────────────────────────────────────────┐  │
│  │              React SPA (Vite)              │  │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────┐  │  │
│  │  │  Pages   │  │Components│  │  Hooks   │  │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  │  │
│  │       │             │             │         │  │
│  │  ┌────┴─────────────┴─────────────┴─────┐  │  │
│  │  │           Zustand Stores             │  │  │
│  │  └────────────────┬─────────────────────┘  │  │
│  │                   │                         │  │
│  │  ┌────────────────┴─────────────────────┐  │  │
│  │  │          Service Layer               │  │  │
│  │  │  (audioService, wordService,         │  │  │
│  │  │   practiceService, statsService)     │  │  │
│  │  └────────────────┬─────────────────────┘  │  │
│  │                   │                         │  │
│  │  ┌────────────────┴─────────────────────┐  │  │
│  │  │       Dexie.js (IndexedDB)           │  │  │
│  │  │  ┌──────────┐  ┌──────────────────┐  │  │  │
│  │  │  │  words   │  │  practiceRecords │  │  │  │
│  │  │  └──────────┘  └──────────────────┘  │  │  │
│  │  └──────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
│                      │                          │
│              ┌───────┴───────┐                  │
│              │  Youdao API   │                  │
│              │  (发音音频)    │                  │
│              └───────────────┘                  │
└─────────────────────────────────────────────────┘
```

### 3.3 路由设计

| 路径 | 页面 | 描述 |
|------|------|------|
| `/` | Dashboard | 学习概览、今日统计、快捷入口 |
| `/words` | WordList | 单词浏览、搜索、筛选 |
| `/words/:wordId` | WordDetail | 单词详情 |
| `/practice` | PracticeHome | 练习模式选择 |
| `/practice/listen` | ListenPick | 听音选词 |
| `/practice/meaning` | MeaningPick | 看词选义 |
| `/practice/spell` | SpellInput | 听音拼写 |
| `/practice/reverse` | ReversePick | 看义选词 |
| `/practice/result` | PracticeResult | 练习结果页 |
| `/wrong-book` | WrongBook | 错题本 |
| `/favorites` | Favorites | 收藏夹 |
| `/stats` | Stats | 详细统计 |

### 3.4 数据模型

```typescript
// IndexedDB Schema (Dexie.js)

interface Word {
  id: string;            // wordId, e.g. "IELTSluan_2_1"
  wordRank: number;
  headWord: string;
  usphone: string;
  ukphone: string;
  usspeech: string;      // 有道 API 参数
  ukspeech: string;
  translations: { pos: string; tranCn: string; tranOther?: string }[];
  sentences: { en: string; cn: string }[];
  synonyms: { pos: string; tran: string; words: string[] }[];
  phrases: { en: string; cn: string }[];
  relWords: { pos: string; words: { hwd: string; tran: string }[] }[];
  bookId: string;
  // 学习状态
  status: 'new' | 'learning' | 'mastered';
  correctCount: number;
  wrongCount: number;
  lastPracticeAt: number | null;
  isFavorite: boolean;
  favoriteTags: string[];
}

interface PracticeRecord {
  id?: number;           // auto-increment
  wordId: string;
  mode: 'listen' | 'meaning' | 'spell' | 'reverse';
  isCorrect: boolean;
  userAnswer: string;
  timestamp: number;
  duration: number;      // 答题耗时 ms
}

interface DailyStats {
  date: string;          // 'YYYY-MM-DD'
  totalCount: number;
  correctCount: number;
  mode: string;
}
```

---

## 4. UI/UX 设计规范

### 4.1 设计风格
- **Apple 极简风格**：大量留白、大圆角（16px+）、柔和阴影、毛玻璃效果（backdrop-blur）
- **色彩系统**：中性色为主（slate/gray），品牌色使用沉稳蓝色系（indigo/blue），正确绿色、错误红色做语义反馈
- **字体**：系统原生字体栈（`-apple-system, BlinkMacSystemFont, "SF Pro Display", ...`），中文回退 PingFang SC / Microsoft YaHei
- **动效**：微交互流畅过渡（200-300ms ease-out），按钮 hover/active 有可感知的反馈，页面切换有淡入效果

### 4.2 组件设计要点
- **喇叭按钮**：大尺寸（56-64px）圆形按钮，毛玻璃底，hover 时轻微放大 + 阴影加深，点击时波纹动画
- **选项卡片**：4 个选项等宽排列（桌面端 2×2 网格），圆角卡片，选中/结果展示时有颜色状态变化
- **进度条**：练习顶部显示当前进度（n/N），细线条（4px）+ 圆角
- **单词卡片**：列表浏览中的单词卡片展示音标 + 核心释义，hover 浮起

---

## 5. 非功能需求

| 需求 | 描述 |
|------|------|
| 离线可用 | 首次加载 JSON 并存入 IndexedDB 后，除发音外的所有功能离线可用；离线时发音降级到 Web Speech API |
| 性能 | JSONL 解析使用 Web Worker，不阻塞主线程；单词列表虚拟滚动（>500 条） |
| 兼容性 | Chrome 90+、Edge 90+、Firefox 90+、Safari 15+ |
| 数据安全 | 支持导出/导入学习数据（JSON 文件），防止清理浏览器数据时丢失 |
| 响应式 | 桌面端优先，移动端基本可用（>=375px 宽度） |

---

## 6. 开发阶段

### Phase 1 — 基础设施（~2天）
- [ ] Vite + React + TS 项目初始化
- [ ] Tailwind CSS + shadcn/ui 配置
- [ ] 路由骨架搭建
- [ ] Dexie.js 数据库 Schema 定义
- [ ] JSONL 解析 & 导入 IndexedDB 服务
- [ ] 通用布局组件（Header、Sidebar、Container）

### Phase 2 — 单词模块（~1.5天）
- [ ] 单词列表页（含虚拟滚动、搜索）
- [ ] 单词详情页
- [ ] 发音服务（有道 API + Web Speech API 降级）

### Phase 3 — 核心练习（~2天）
- [ ] 听音选词练习页（核心交互）
- [ ] 选项生成算法（智能干扰项）
- [ ] 练习结果展示
- [ ] 看词选义模式
- [ ] 听音拼写模式
- [ ] 看义选词模式

### Phase 4 — 数据追踪（~1天）
- [ ] 学习记录存储与查询
- [ ] Dashboard 统计页面
- [ ] 学习热力图 & 趋势图

### Phase 5 — 错题本 & 收藏（~1天）
- [ ] 错题自动收集
- [ ] 收藏夹功能
- [ ] 重练逻辑

### Phase 6 — 收尾（~1天）
- [ ] 数据导出/导入
- [ ] 响应式适配
- [ ] 测试补充
- [ ] 构建配置优化

---

## 7. 问题与决策记录

| # | 问题 | 决策 | 决策人 | 日期 |
|---|------|------|--------|------|
| 1 | 前端框架 | React + TypeScript | 用户 | 2026-05-28 |
| 2 | 发音方案 | 有道 API 为主，Web Speech API 降级 | 用户 | 2026-05-28 |
| 3 | MVP 功能范围 | F1-F5 全部 | 用户 | 2026-05-28 |
| 4 | UI 风格 | Apple 风格极简设计 | 用户 | 2026-05-28 |
| 5 | 组件库 | shadcn/ui | 用户 | 2026-05-28 |
