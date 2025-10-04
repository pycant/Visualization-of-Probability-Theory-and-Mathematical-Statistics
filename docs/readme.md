# Visualization of Probability Theory and Mathematical Statistics

**可视化概率论与数理统计**

这是一个用于概率论与数理统计可视化的 Web 应用／示例集，旨在通过交互式图表展示各种常见的概率分布、随机变量模拟、中心极限定理、离散／连续分布等概念，帮助学习者直观理解统计理论。

## 📁 目录结构

下面是当前仓库的目录结构（简化版）：

``` tree
Visualization-of-Probability-Theory-and-Mathematical-Statistics/
├── docs/
├── node_modules/
├── static/
├── templates/
├── .gitignore
├── package.json
├── package-lock.json
├── routs.py
├── routs2.py
└── README.md
```

各目录／文件说明：

| 名称                  | 类型 | 说明                          |
| ------------------- | -- | --------------------------- |
| `docs/`             | 目录 | 用于存放项目文档、说明、示例等静态文档资源。      |
| `node_modules/`     | 目录 | 前端依赖包目录，由 `npm install` 生成。 |
| `static/`           | 目录 | 存放静态资源（CSS、JS、图片等）。         |
| `templates/`        | 目录 | 存放前端模板（HTML、Jinja 模板等）。     |
| `.gitignore`        | 文件 | Git 忽略清单。                   |
| `package.json`      | 文件 | 前端工程配置，包含依赖、脚本等。            |
| `package-lock.json` | 文件 | 前端依赖版本锁定文件。                 |
| `routs.py`          | 文件 | 后端路由逻辑（Python）。             |
| `routs2.py`         | 文件 | 后端额外或备用路由逻辑。                |
| `README.md`         | 文件 | 项目说明文档（就是当前这个）。             |

---

## 🚀 功能列表 / 特性

以下是项目目前支持或计划支持的功能：

* **离散型随机变量可视化**

  * 掷两个骰子并展示点数和的分布
  * 实时动画显示掷骰子过程
  * 对比理论概率分布与实验结果

* **连续型随机变量可视化**

  * 正态分布（Gaussian）
  * 用户可调整均值、方差
  * 展示概率密度函数（PDF）与样本直方图
  * 中心极限定理演示：多次取样后样本均值的分布趋近正态

* **理论与公式展示**

  * 随机变量定义及性质
  * 常见分布（伯努利、二项分布、泊松、正态、指数、伽马等）公式推导
  * 分布函数、密度函数、累积分布函数的解释

* **交互体验**

  * 用户可以在前端调整参数（如样本大小、次数、分布参数）
  * 动画与实时更新让统计过程更加直观
  * 多图表并排对比（理论 vs 样本结果）

---

## 🛠 安装与运行指南

以下假设你本地已有 Python 环境、Node.js／npm 环境。

### 前置条件

* Python 3.x
* Node.js + npm
* （可选）虚拟环境，例如 `venv` 或 `conda`

### 步骤

1. 克隆仓库

   ```bash
   git clone https://github.com/pycant/Visualization-of-Probability-Theory-and-Mathematical-Statistics.git
   cd Visualization-of-Probability-Theory-and-Mathematical-Statistics
   ```

2. 安装前端依赖

   ```bash
   npm install
   ```

3. 启动后端服务
   这个项目后端是用 Python 脚本 `routs.py` 或 `routs2.py` 实现的。示例启动命令（根据具体内容可能略有不同）：

   ```bash
   python routs.py
   ```

   或者：

   ```bash
   python routs2.py
   ```

4. 访问 Web 界面
   后端启动后，通常会在某个端口（如 5000）监听。然后在浏览器里访问：

   ``` 
   http://localhost:5000
   ```

5. 调整参数、交互体验
   在前端页面上，你可以调整分布参数、样本次数、查看图表等。

---

## 📋 配置说明

项目支持以下配置方式：

* `~/.codex/config.toml`（本项目无直接采用，此为示例项目可能使用的配置方式，仅供借鉴）
* `package.json` 中有启动脚本和前端构建命令
* 后端脚本内部可能有配置常量，如默认端口、静态资源路径等

如果你在 `routs.py`／`routs2.py` 中看到有诸如 `port = ...`、`app.run(port=...)` 的代码，就可以调整那个值来改变服务监听端口。

---

## 🧪 示例截图 / Demo

> （这里可以插入一些项目运行时的截图或 GIF，以便直观示例效果）

---

## 🧩 贡献指南

如果你愿意参与贡献：

1. Fork 本仓库
2. 新建分支（例如 `feature/your-feature`）
3. 提交代码并发 PR
4. 在 PR 中描述你做了什么、为什么做

欢迎补充新的分布类型、优化交互体验、增加动画效果、性能优化等。

---

## 📝 LICENSE & 作者

本项目的授权（License）请在仓库中查阅 `LICENSE` 文件。

作者 / 贡献者：pycant 及本项目所有贡献者。
