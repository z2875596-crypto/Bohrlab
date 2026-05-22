# BohrLab 🧪

**材料逆向设计科研智能体** | An Autonomous Materials Discovery Agent

> 灵感来源于深势科技 [BohrClaw（玻龙）](https://mp.weixin.qq.com/s?__biz=MzI4MzQzNDAxNQ==&mid=2247511278&idx=1&sn=c51e16abbd226abca752c26290deb818)，以固体氧化物燃料电池（SOFC）互联体材料发现为核心场景，展示「将知识、模型、工具与实验接口组织为可执行、可验证智能体工作流」的完整实现。

---

## 演示截图

> *(在此处插入你的运行截图，推荐截取：输入查询 + 推理过程 + 结果面板 三张)*

---

## 核心能力

| BohrClaw 能力描述 | BohrLab 实现方式 |
|---|---|
| 理解研究目标 | 自然语言性能需求解析，提取量化约束 |
| 调用文献与知识 | arXiv API 语义检索 + LLM 结构化抽取 |
| 调用科研工具 | GBR 代理预测模型 + Materials Project 数据 |
| 调用实验接口 | 合成路线生成器（前驱体、烧结参数、可行性评分）|
| 回收结果推进决策 | 多维加权评分 + Top-K 排序 + 迭代反馈回路 |
| 持续自主研究 | ReAct 循环（最多 12 步）+ DeepSeek Function Calling |

---

## 技术架构

```
用户输入目标性能
        ↓
  DeepSeek-chat (ReAct Loop)
        ↓
  ┌─────────────────────────────────────┐
  │           Tool Layer                │
  │  文献检索  →  性质预测  →  评分排序  │
  │              ↓                      │
  │          合成路线生成                │
  └─────────────────────────────────────┘
        ↓
   结果报告 + 实验方案
```

**后端**：FastAPI + Python，SSE 流式推送  
**前端**：React + Vite + Recharts，实时渲染推理过程  
**模型**：DeepSeek-chat（Function Calling）  
**预测**：GBR 代理模型（6维材料描述符 → 电导率 / TEC / 最高使用温度）

---

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- DeepSeek API Key（[免费申请](https://platform.deepseek.com)）

### 安装与启动

```bash
# 1. 克隆项目
git clone https://github.com/你的用户名/bohrlab.git
cd bohrlab

# 2. 配置 API Key
cp .env.example backend/.env
# 编辑 backend/.env，填入你的 DEEPSEEK_API_KEY

# 3. 安装后端依赖
cd backend
pip install -r requirements.txt
cd ..

# 4. 安装前端依赖
cd frontend
npm install
cd ..
```

启动（需要两个终端）：

```bash
# 终端 1 — 后端
cd backend && python main.py

# 终端 2 — 前端
cd frontend && npm run dev
```

浏览器打开 `http://localhost:5173`

---

## 使用示例

在输入框中描述目标材料需求，例如：

```
I need a ceramic material with electrical conductivity > 10,000 S/m,
thermal expansion coefficient < 12 ppm/K, stable above 500°C,
for use as SOFC interconnect.
```

智能体将自动完成：

1. **文献检索** — 搜索 arXiv 相关论文，提取候选材料
2. **性质预测** — 调用 GBR 代理模型预测各材料关键性质
3. **评分排序** — 多维度加权打分，输出 Top-K 推荐列表
4. **合成方案** — 生成前驱体清单、烧结参数、操作建议

全程推理过程实时可见，每一步 Thought / Action / Observation 均在界面展示。

---

## 项目结构

```
bohrlab/
├── backend/
│   ├── main.py          # FastAPI 入口，SSE 流式端点
│   ├── agent.py         # ReAct 智能体核心（DeepSeek Function Calling）
│   ├── tools.py         # 4 个科研工具定义与实现
│   ├── predictor.py     # GBR 代理预测模型
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # 主界面（双栏布局）
│   │   ├── AgentTrace.jsx   # 实时推理过程可视化
│   │   └── ResultPanel.jsx  # 结果展示 + Recharts 图表
│   └── package.json
├── .env.example         # API Key 配置模板
├── start.sh             # 一键启动（Linux/macOS）
└── README.md
```

---

## 后续计划

- [ ] 接入 Materials Project 完整 REST API
- [ ] 支持导出 PDF 研究报告
- [ ] 添加材料结构可视化（晶体结构 3D 渲染）
- [ ] 多智能体协作模式（文献 Agent + 计算 Agent 并行）
- [ ] 对接 Uni-Mol 分子表示模型

---

## 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.0 | 2026-05 | 初始版本，完整 ReAct 工作流，4 工具集成 |

---

## 关于

本项目为个人学习项目，旨在探索 AI 智能体在材料科学领域的应用。  
作者具有化学 / 材料科学背景，对科研智能体方向持续关注。

欢迎 Issue 和 PR。
