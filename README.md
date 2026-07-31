# Resume Canvas 本地简历工作台

这是一个面向北美（尤其加拿大）求职场景的本地简历系统。所有内容默认保存在当前浏览器的本地存储中，不会上传到服务器。

## 最快使用方式

双击项目根目录的 `启动简历系统.bat`，等待浏览器打开：

`http://localhost:3000`

也可以在 PowerShell 中运行：

```powershell
npm install
npm run dev
```

## 推荐工作流

1. 在左侧「真实经历素材库」一次性录入全部经历、教育背景和技能。
2. 每条成果只写真实事实，尽量包含动作、任务范围和可验证的数字。
3. 在中间粘贴目标岗位 Title 和 Job Description。
4. 点击「智能生成岗位版」。系统会按关键词相关度筛选素材、调整简介，并保存岗位版本。
5. 在右侧简历纸张中直接修改任何文字；修改会同步回素材库并自动保存。
6. 使用「打印 / PDF」导出 Letter 纸张尺寸的 PDF，或导出 ATS 友好的 TXT。
7. 定期点击「备份」下载 JSON；更换浏览器或设备后可用「导入」恢复。

## 让另一个 Chat 帮你整理旧简历

如果你不想重新输入旧简历，可以在另一个 Chat 中上传旧简历、项目说明和零散资料，让它整理成可直接导入本系统的素材库文件。

请让那个 Chat 先完整阅读：

[`给其他Chat的简历资料导入说明.md`](./给其他Chat的简历资料导入说明.md)

它最终应在 `imports/` 中生成一个 JSON 文件并通过本项目的校验。回到系统后，点击顶部「导入」即可一次性写入素材库。

## 让另一个 Chat 按 Job Description 生成岗位版

当素材库已经准备好，需要针对具体岗位生成简历时，请让新的 Chat 完整阅读：

[`给其他Chat的岗位定制Prompt.md`](./给其他Chat的岗位定制Prompt.md)

这个 Chat 会读取素材库 JSON 和 Job Description，先给出证据匹配、差距和修改建议，再生成一份岗位版 JSON。岗位版可以筛选、排序和改写 bullet，但改写保存在独立覆盖层中，不会破坏素材库原文。将生成的 JSON 导入 Resume Canvas 后，右侧会直接显示可继续编辑和下载的岗位简历。

## 数据与隐私

- 数据保存在浏览器 `localStorage`。
- 清理浏览器网站数据会删除本地内容，所以请保留 JSON 备份。
- 当前岗位匹配完全在本机完成，不调用外部 AI 服务，也不会虚构经历。
- 示例数据仅用于展示，请先替换成自己的真实信息。
- `imports/` 和 `tmp/` 中的个人资料、岗位版 JSON、分析报告及临时文件默认不会进入 Git。

## 无个人信息的演示数据

项目提供一份所有姓名、公司、经历、数字和联系方式均为虚构的完整演示文件：

[`demo/resume-canvas-demo.json`](./demo/resume-canvas-demo.json)

可以在 Resume Canvas 中点击「导入」体验完整流程。演示文件只用于功能测试，不代表任何真实人物。

## 常用命令

```powershell
npm run dev
npm run build
npm run lint
npm run validate:import -- imports/你的导入文件.json
```
