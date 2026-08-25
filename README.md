# ResumeBuilder

[English](#english) | [中文](#中文)

## English

For technical details, please see [SETUP.md](SETUP.md). This README is simply the author's explanation of why this project exists.

The real-world background is straightforward: I was looking for a job and needed to write resumes.

Resume editing became a serious headache for a while. I initially used an online resume-building platform, but it was too expensive and the workflow was unnecessarily cumbersome.

Writing a resume always seemed to present an awkward choice: either start from scratch and write everything manually, or use one of the many platforms that look fancy. Neither option felt particularly comfortable; both introduced their own friction.

So the author went through several rounds of iteration with Codex and encountered all kinds of strange problems along the way. When an AI codes a web application on its own, it does not look at or think about the result with human eyes and a human brain. Many of its automatic decisions sound perfectly rational in their descriptions—often making it seem smarter and far more technically advanced than I am—but actually using the result can feel like a toad landing on your foot: deeply unpleasant in a way that is hard to put into words. Then you still have to keep debugging it and matching wits with the AI.

Fortunately, this is a relatively small and simple project. On more complicated projects, I have spent extremely long sessions wrestling with AI, only for it to make a confident-looking change that breaks everything and forces a rollback—an entire afternoon gone. That has happened more than once.

This project, however, is simple and focused, which is worth celebrating. The final result has at least reached a state that I can genuinely use.

The image below shows the interface. Let us go from left to right.

The left side is a library containing all kinds of experience material.

The upper-middle area is intended for jobs whose title and job description are not especially well defined. In those cases, you can paste the job description there and let the system automatically match its keywords against your experience library. To explain the underlying model more clearly: a resume experience normally contains several bullet points. Every experience, together with all of its bullet points, exists in the system as reusable source material.

The system reads the keywords in the job description, selects the relevant individual bullet points, and keeps track of which project or experience each bullet belongs to.

That said, the author sincerely believes this middle feature is not particularly useful—honestly, almost not useful at all. In the current era, few people are likely to rely on simple job-description keyword matching to choose items from an experience library; it does not feel very intelligent. Most people now use language models to refine and tailor their content.

This leads to one of the genuinely useful parts of the system: it includes ready-made prompts that you can give directly to your preferred AI. The AI produces a JSON file in the required format, and you can import that file using the button in the upper-right corner to generate a complete resume. This approach remains very flexible. The prompt defines only the data format; it does not dictate what you must write.

You can change the writing instructions according to your own needs. Everyone has different preferences, and the best part about prompts is that they are easy and inexpensive to modify. You can tell the large language model you already use how to make decisions according to your own priorities. In today's era of “democratized technology” brought about by large language models, one of the greatest benefits is that people can create highly customized content at very low cost and with almost no learning curve.

One important point: this platform itself contains no AI API integration. Adding one would be straightforward from both a technical and workflow perspective, but the author sees no compelling reason to do so.

Most people already use consumer-facing resume-building products or language-model applications. Why pay an additional API cost and add more complexity?

The goal is not to automate the entire process. It is to reduce repetitive manual work when matching a resume to a company's job description—for example, adjusting the target title and relevant technical skills. The project was never intended to let AI handle the complete loop from receiving a job description, rewriting a resume, and submitting the application. That is not the author's direction, and the author does not even consider it a mature product idea—at least not from the perspective of an independent developer who is also half a product manager.

Adding unnecessary features does not help. Keep it simple. There are already enough AI-API-based products on the market; there is no need to add another piece of AI slop here.

<img width="1504" height="725" alt="ResumeBuilder main interface" src="https://github.com/user-attachments/assets/0b6eac31-4eb4-47fb-a26c-19026d4fc614" />

The lower-middle area groups selected material by project. If the content produced by an LLM does not match your preferences, you can add or edit it manually here. The changes immediately appear in the resume on the right, reducing the need to revise the same content repeatedly.

<img width="358" height="658" alt="Project-based material selection" src="https://github.com/user-attachments/assets/8c94e332-d8b8-43e1-969e-753c2edd714b" />

The right side is simply an editor designed to be easy to use. Please take the author's word for it: I may not have many special advantages, but I have extensive experience being knocked flat by reality. I therefore have no desire to build a page that requires repetitive, manual, frustrating edits. I genuinely use this application myself, so if the page is not suitable for human beings, I will be the first person affected.

You can move every project bullet up or down, and all text can be edited directly on the page without modifying the original JSON file.

<img width="619" height="193" alt="Editable and reorderable resume bullets" src="https://github.com/user-attachments/assets/c849089a-6ea6-40d3-9c94-d5dc3f33461c" />

In the image below, “Export” in the upper-right corner refers to exporting JSON. Resume writing is usually cumulative: after carefully tailoring one version for a role, you can build on it next time instead of starting from zero as if every resume were a new piece of literature.

The second row supports several output formats, including TXT, PDF, and Word.

The author does not strongly recommend exporting directly to PDF. Companies often use resume-screening software to extract text, and a PDF generated directly by this application may not be as standardized as one produced by Microsoft Word. Although the author and AI have already gone through several rounds of layout improvements, formatting issues may still appear in real use.

The recommended workflow is therefore to export to Word first, then save or print the document as a PDF from Word.

<img width="380" height="111" alt="Resume export controls" src="https://github.com/user-attachments/assets/317428a3-3a21-428c-a8ce-0c4b8712aed0" />

THE END

---

## 中文

具体技术方面请查看 [SETUP.md](SETUP.md)，这里只是作者在描述这个项目是为了什么。

是这样的，这个项目的现实背景是我在找工作、需要写简历。

但简历编辑这件事，在一段时间之内让我非常头疼。当时我是在网上找了一个简历编辑的平台来做，但问题是那个平台收费太高了而且流程很麻烦，没必要。

对于写简历这件事，我总觉得它处于一种两难的境地：要么 start from scratch 手写，要么用一些看起来很 fancy 的平台。但在这二者之间，好像用哪个都不是很舒坦，都有些阻碍。

所以，作者就找 Codex 迭代了好几轮，中间真的遇到了各种稀里古怪的问题。这个 AI 自己做 web coding 的时候，它是不用人的眼睛和脑子去想的。它很多自动的设定，看描述写得非常理性，显得比我聪明、比我在技术方面 advanced 多了，但实际用起来就像癞蛤蟆上脚面——说不出的难受，还得继续跟它斗智斗勇地调试。

还好这是一个比较小型、比较单纯的项目。在其他一些复杂项目里跟 AI 斗智斗勇，斗了半天，session 巨长，结果它像模像样地一改，反而全崩了，还得回退，一下午白干，这种事也不少。

但还好，这个项目非常简单、非常单纯，值得庆贺。反正最终它呈现出的样子，起码是我能真正去使用的状态。

下图是它的一个界面，先从左往右讲吧：

左边是各种各样的经历素材。

中间上面是针对一些岗位，由于它的 job description 和 title 并不是定义得非常明确，那种情况下就可以把 job description 粘过来，然后来自动根据关键词匹配自己的素材库的内容。抱歉啊，刚才确实讲得不是很清楚。我的逻辑是：大家平时写简历，一条项目经历下面会有好几个 bullet point。所有这些经历以及自带的 bullet point，都是作为一个素材库存在的。

然后系统会根据 Job Description 里的关键词，自动把相关的每一条 bullet point 以及它对应属于哪个项目给筛选出来。

但是作者真诚地想说，中间这个功能其实没什么用，真的是一点用都没有。毕竟都现在这个时代了，大家不太可能再去用 job description 里的关键词来映射自己经历库里的内容并挑出来，这样显得很不智能；现在大家基本都是用 language model 来润色自己的内容。

这也引出了这个系统非常 nice 的一点：它里面写好了 prompt，你可以直接把这个 prompt 喂给你的 AI，让它生成指定格式的 JSON 文件。接着点击右上角的导入，直接把这个 JSON 文件导进来，就能生成一份完整的简历了。这样就非常自由，注意一下，这个 prompt 只是规定了这么一个格式，它不在乎你里面具体要怎么写。

关于具体怎么写这个方面，大家根据自己的需求自己去改就行。因为每个人的偏好都不太一样，而 Prompt 最好的一点，就是大家可以随时、非常简单且低成本地自己去改，让自己用的 large language model 根据自己的心意和偏好去做取舍。作者觉得，在如今这个因为 large language model 到来而实现“技术平权”的时代，它最大的好处就是大家完全不需要什么学习成本，就能以极低成本去实现定制化的内容。

这边需要注意一点：这个平台本身没有任何跟 AI API 相关的东西。虽然不论从技术上还是流程上，把它引进来都很容易，但作者觉得真的没必要加，看不到存在的必要性。

大家基本上多多少少都在用现成 To C 的 ResumeBuilder 平台了，那干嘛还要多花一笔 API 的费用，还增加复杂度？

这里的重点并不是让流程全自动跑起来，而是稍微减少手动编辑简历里匹配公司 job description 的时间，比如 job description 里的 title、各种 tech skill 等，减少的是这部分的重复劳动。它建立的初衷本来就不是为了让 AI 完成从拿到 job description、修改简历再到投递的整套闭环，这不是作者的想法（甚至作者都不觉得这是一个成熟的产品思路。起码从一个个人开发者的角度来看，这部分并不是作者——作为半个产品经理——想要去走的方向）。

没有必要的东西加进去没什么用，纯粹一点吧。市面上基于 AI API 的产品已经足够多了，没必要在这个事情上再多加一个 slop 了。

<img width="1504" height="725" alt="ResumeBuilder 主界面" src="https://github.com/user-attachments/assets/0b6eac31-4eb4-47fb-a26c-19026d4fc614" />

中间偏下的这个部分是分项目的，每个项目里面都选了素材库的这么一个可视化的栏目。如果大家觉得 LLM 写的内容不太贴合自己的心意，这边可以直接手动加进来、手动修改，改完它就能直接在右边出现，这样就不需要反复去改了，尽可能减少重复劳动。

<img width="358" height="658" alt="按项目选择素材" src="https://github.com/user-attachments/assets/8c94e332-d8b8-43e1-969e-753c2edd714b" />

然后右边就非常好理解了，就是一个编辑器，非常易于使用。（大家相信一下，作者别的没什么优势，但在“被现实摩擦干倒”这方面非常有经验，所以作者非常不愿意让这个页面产生任何需要反复、手动、麻烦去修改的东西，因为作者是真的要用的，如果页面不适合人类使用，那么作者就是第一个中枪的。）

所有的项目经历你都可以自己调整顺序（上移或下移），而且这里面所有的文字内容也都可以直接在页面上修改，用不着去改原始的 JSON。

<img width="619" height="193" alt="可编辑、可调整顺序的简历条目" src="https://github.com/user-attachments/assets/c849089a-6ea6-40d3-9c94-d5dc3f33461c" />

下图右上角的“导出”，指的导出是 JSON。因为写简历通常是一个累积的过程，比如针对某些岗位精改了一版后，下次还能在这个基础上接着用，不需要每次都像文学创作一样从零开始。

下图第二行支持导出各种格式，比如 TXT、PDF、Word 等。

不过作者这边不是很建议大家直接导出 PDF。因为公司会用简历筛选软件做文字识别，而这里直接导出的 PDF 肯定没有从 Word 导出的规范。而且，虽然作者在排版方面已经和 AI 做了好几轮迭代优化，但实际使用中依然难免会出现一些排版问题。

因此，仍然建议大家先导出 Word，再从 Word 里面另存或打印成 PDF。

<img width="380" height="111" alt="简历导出选项" src="https://github.com/user-attachments/assets/317428a3-3a21-428c-a8ce-0c4b8712aed0" />

THE END
