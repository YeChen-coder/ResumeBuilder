# 给其他 Chat 的简历资料导入说明

## 你正在处理什么项目

这是 `Resume Canvas`，一个本地运行的北美求职简历系统。用户只在这里维护一份完整的“真实经历素材库”，之后再根据不同岗位的 Title 和 Job Description，从素材库中筛选内容生成岗位版简历。

你的任务不是修改程序，也不是立刻写某一个岗位的最终简历。你的任务是：

1. 读取用户提供的旧简历、项目材料、教育信息和零散描述。
2. 提取其中所有可验证的真实事实。
3. 合并重复内容，梳理表达，标记矛盾或缺失信息。
4. 生成一个符合本项目格式的 JSON 素材库文件。
5. 验证文件无误，让用户能在 Resume Canvas 中点击「导入」直接使用。

所有文件路径均相对于 Resume Canvas 项目根目录。

最终文件建议保存为：

`imports/resume-canvas-import.json`

## 新 Chat 可以直接使用的开场指令

用户可以把下面这段话复制到一个新的 Chat，然后上传旧简历：

> 我正在使用本地项目 Resume Canvas。请先完整阅读项目根目录下的《给其他Chat的简历资料导入说明.md》和 `imports/resume-canvas-import.template.json`。我接下来会上传以前的简历和其他经历材料。请按说明提取、去重和整理真实信息，不要虚构，不要修改项目程序，也不要直接生成某个岗位的最终简历。资料没有发完之前先持续接收；我明确说“资料已发完”以后，再集中列出冲突或必须确认的问题。确认完成后，请生成 `imports/resume-canvas-import.json`，运行项目提供的导入校验，并告诉我如何在 Resume Canvas 中导入。

## 必须遵守的事实规则

- 不得编造公司、职位、日期、技术、职责、项目规模、数字或成果。
- 不得为了“写得好看”擅自扩大职责，例如把参与写成负责、把协助写成领导。
- 旧简历之间存在冲突时，不要自行选择一个版本；先记录冲突，资料收齐后询问用户。
- 原文没有量化结果时，不得补造百分比、金额、人数或效率提升。
- 可做语言润色和结构调整，但润色后必须保持原事实强度。
- 无法确认的信息应暂时省略，或在给用户的待确认清单中列出；不要把问号、推测或备注写入最终简历 bullet。
- 用户发来的不同语言内容可以统一整理成英文简历表达；专有名词、公司名和学位名不要随意翻译。
- 加拿大简历通常不应加入照片、年龄、性别、婚姻状况、身份证件号码等个人敏感信息。

## 资料接收流程

### 第一阶段：持续接收

在用户明确说“资料已发完”前：

- 接收 PDF、DOCX、文本、截图和零散补充。
- 简短确认已经收到哪些材料。
- 不要每收到一份文件就反复追问。
- 在内部维护事实清单，包括公司、职位、日期、地点、项目、动作、工具、结果和数字。

### 第二阶段：合并与查错

资料收齐后：

1. 按时间和雇主合并重复经历。
2. 同一公司不同职位或晋升经历应拆成不同 Experience。
3. 将意思相同的 bullet 合并，保留事实最完整且最准确的版本。
4. 找出日期、职位名、地点、数字和职责强度的冲突。
5. 只询问会影响事实正确性或数据结构的问题；避免询问纯风格偏好。

### 第三阶段：整理为素材库

素材库应该“完整”，而不是只适配一个岗位：

- 保留用户所有真实且有价值的经历。
- 每条 bullet 尽量只表达一个主要成果。
- 推荐结构：`Action + What/Scope + How + Result`。
- 没有结果数字时，可以写真实的业务价值，但不要虚构指标。
- Tags 使用简短的英文小写关键词，用于后续岗位匹配。
- 不要因为当前某个岗位暂时用不到就删除真实经历。

### 第四阶段：生成、校验、交付

1. 复制 `imports/resume-canvas-import.template.json` 的结构。
2. 替换全部示例内容。
3. 每个 Experience、Bullet、Education 和 Skill Group 使用唯一 ID。
4. `selectedBulletIds` 默认包含所有有效 bullet 的 ID。
5. `bulletOverrides` 保持空对象；素材库阶段不做岗位版改写。
6. `target` 保持空白，`versions` 保持空数组。
7. 在项目根目录运行：

```powershell
npm run validate:import -- imports/resume-canvas-import.json
```

7. 只有校验通过后才向用户交付。

## 字段说明

### profile

- `name`：姓名
- `headline`：通用职业定位，不针对某一家公司的岗位
- `city`：加拿大常用格式，例如 `Toronto, ON`
- `phone`：电话号码
- `email`：邮箱
- `linkedin`：LinkedIn 地址
- `summary`：通用英文职业简介。只总结素材库中确实存在的能力。

### experiences

每段任职经历包含：

- `id`：唯一 ID，例如 `exp-shopify-ba-2023`
- `company`：公司名
- `role`：正式职位名
- `location`：城市、省/州或 Remote
- `start`、`end`：保持统一格式，例如 `May 2022`、`Present`
- `bullets`：该任职经历下的事实/成果列表

每条 bullet 包含：

- `id`：全文件唯一 ID，例如 `b-shopify-ba-dashboard`
- `text`：用于北美简历的英文成果句
- `tags`：用于匹配岗位的英文关键词数组

Tags 示例：

```json
["sql", "data analysis", "stakeholder management", "process improvement"]
```

### education

- `school`：学校正式名称
- `degree`：学位和专业
- `location`：地点
- `start`、`end`：就读时间
- `detail`：荣誉、相关课程或 GPA；只有真实且有价值时填写

### skills

按类别整理，例如：

- `Tools`
- `Technical`
- `Business`
- `Languages`
- `Certifications`

`items` 是逗号分隔的技能文本。只有用户确实具备的技能才能写入。

## 导入文件的完整结构

请以项目中的 `imports/resume-canvas-import.template.json` 为准。最终 JSON 必须包含：

```text
profile
experiences[]
education[]
skills[]
selectedBulletIds[]
bulletOverrides
target
versions[]
template
accent
```

不要添加注释，因为标准 JSON 不支持注释。

## 最终交付给用户时要说明

- 处理了多少段工作经历、多少条成果、多少段教育和多少组技能。
- 哪些重复内容被合并。
- 是否仍有未确认信息；未确认信息不得写入导入文件。
- 校验命令是否通过。
- 用户下一步只需打开 Resume Canvas，点击顶部「导入」，选择生成的 JSON 文件。

## 本项目中的职责边界

- 当前这个项目维护 Chat：负责修改 Resume Canvas 程序和本说明。
- 资料整理 Chat：负责读取用户资料并生成经过验证的导入 JSON。
- Resume Canvas：负责本地保存素材、按岗位筛选、编辑、版本管理和导出。

资料整理 Chat 不应修改 `app/`、`package.json` 或其他程序文件。如发现导入结构确实无法表达某类真实信息，应记录具体需求，让用户回到程序维护 Chat 处理。
