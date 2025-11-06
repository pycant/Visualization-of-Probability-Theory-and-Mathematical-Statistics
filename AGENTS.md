# Repository Guidelines

## 项目概述
这是一个可视化教学案例项目，专注于统计学和概率论的可视化教学。项目包含Python后端和前端HTML页面，用于展示各种统计概念和分布的可视化效果。

## 项目结构

### 核心目录
- `templates/` - HTML模板文件，包含各种统计概念的可视化页面
- `static/` - 静态资源文件
  - `css/` - 样式表文件
  - `js/` - JavaScript文件
  - `img/` - 图片资源
  - `libs/` - 第三方库
  - `videos/` - 教学视频
- `docs/` - 文档目录，包含各种统计概念的教学文档
- `tools/` - 工具脚本
- `bin/` - 二进制文件

### 主要文件
- `routs.py` / `routs2.py` - Flask路由文件
- `add_ai_help.py` - AI辅助工具
- `package.json` - Node.js依赖配置

## 开发环境

### 技术栈
- **后端**: Python + Flask
- **前端**: HTML + JavaScript + CSS
- **样式**: Tailwind CSS
- **可视化**: 自定义JavaScript图表库

### 依赖管理
```bash
# 检查Node.js依赖
npm list

# 安装依赖
npm install
```

## 编码规范

### Python代码
- 使用4个空格缩进
- 遵循PEP 8规范
- 函数和类使用小写字母和下划线命名

### HTML/CSS/JavaScript
- 使用语义化HTML标签
- CSS类名使用连字符命名法
- JavaScript使用驼峰命名法
- 保持代码注释清晰

### 文件命名
- Python文件: `snake_case.py`
- HTML文件: `snake_case.html`
- 配置文件: `kebab-case.ext`

## apply-patch 工具使用指南

### 基本语法
```
apply_patch {"command": ["apply_patch", "*** Begin Patch\n*** Update File: path/to/file.py\n@@ def example():\n- pass\n+ return 123\n*** End Patch"]}
```

### 关键规则
- 始终使用 `apply_patch`（切勿使用 `applypatch` 或 `apply-patch`）
- 使用正确的补丁格式和分隔符
- 使用 `*** Begin Patch` 和 `*** End Patch` 作为分隔符
- 使用 `*** Update File:` 或 `*** New File:` 指定文件路径
- 使用统一的diff格式进行更改（`@@ ... @@`）
- 使用 `-` 标记删除的行，使用 `+` 标记添加的行

### 示例

**编辑现有文件:**
```
apply_patch {"command": ["apply_patch", "*** Begin Patch\n*** Update File: src/main.py\n@@ def hello():\n-     print("Hello")\n+     print("Hello World")\n*** End Patch"]}
```

**创建新文件:**
```
apply_patch {"command": ["apply_patch", "*** Begin Patch\n*** New File: config.json\n+{\n+  "name": "example",\n+  "version": "1.0.0"\n+}\n*** End Patch"]}
```

**多行更改:**
```
apply_patch {"command": ["apply_patch", "*** Begin Patch\n*** Update File: utils.py\n@@ def process_data(data):\n-     result = []\n-     for item in data:\n-         result.append(item * 2)\n+     return [item * 2 for item in data]\n*** End Patch"]}
```

### 重要说明
- 如果补丁格式无效，工具调用将失败
- 成功应用补丁后无需重新读取文件
- 更改是原子性应用的
- 在字符串中正确转义特殊字符

## 测试指南

### 页面测试
- 确保所有HTML页面在浏览器中正常加载
- 验证JavaScript交互功能正常工作
- 检查CSS样式正确应用

### 功能测试
- 测试Python后端路由
- 验证数据可视化组件
- 检查响应式设计

## 提交规范

### 提交信息
- 使用中文或英文描述更改内容
- 简要说明修改的目的和影响
- 关联相关功能或修复的问题

### 代码审查
- 确保代码符合项目编码规范
- 验证可视化效果正确显示
- 检查跨浏览器兼容性

## 部署说明

### 本地运行
```bash
# 启动Flask应用
python routs.py
```

### 生产部署
- 配置适当的Web服务器（如Nginx）
- 设置静态文件缓存
- 优化前端资源加载

## 故障排除

### 常见问题
- 页面加载失败：检查文件路径和路由配置
- 可视化不显示：验证JavaScript库加载和数据处理
- 样式异常：检查CSS文件路径和类名

### 调试工具
- 使用浏览器开发者工具调试前端问题
- 查看Flask日志获取后端错误信息
- 验证数据格式和API响应
