"use client";

import {
  ChangeEvent,
  CSSProperties,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Bullet = { id: string; text: string; tags: string[] };
type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  bullets: Bullet[];
};
type Education = {
  id: string;
  school: string;
  degree: string;
  location: string;
  start: string;
  end: string;
  detail: string;
};
type SkillGroup = { id: string; label: string; items: string };
type Profile = {
  name: string;
  headline: string;
  city: string;
  phone: string;
  email: string;
  linkedin: string;
  summary: string;
};
type ResumeVersion = {
  id: string;
  title: string;
  company: string;
  createdAt: string;
  selectedBulletIds: string[];
  bulletOverrides: Record<string, string>;
  profile: Profile;
};
type AppData = {
  profile: Profile;
  experiences: Experience[];
  education: Education[];
  skills: SkillGroup[];
  selectedBulletIds: string[];
  bulletOverrides: Record<string, string>;
  target: { title: string; company: string; requirements: string };
  versions: ResumeVersion[];
  template: "classic" | "modern";
  accent: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);
const starterData: AppData = {
  profile: {
    name: "Your Name",
    headline: "Product & Operations Professional",
    city: "Toronto, ON",
    phone: "+1 416 000 0000",
    email: "you@email.com",
    linkedin: "linkedin.com/in/yourname",
    summary:
      "Results-oriented professional with experience translating ambiguous business needs into practical, measurable outcomes. Skilled at cross-functional collaboration, process improvement, and clear stakeholder communication.",
  },
  experiences: [
    {
      id: "exp-1",
      company: "Northstar Labs",
      role: "Product Operations Specialist",
      location: "Toronto, ON",
      start: "2023",
      end: "Present",
      bullets: [
        {
          id: "b-1",
          text: "Coordinated product, sales, and support workflows across 4 teams, reducing handoff time by 28%.",
          tags: ["operations", "cross-functional", "process", "product"],
        },
        {
          id: "b-2",
          text: "Built weekly KPI reporting for leadership and turned customer feedback into prioritized product recommendations.",
          tags: ["analytics", "reporting", "customer", "strategy"],
        },
        {
          id: "b-3",
          text: "Documented and standardized 12 recurring processes, improving onboarding consistency for new team members.",
          tags: ["documentation", "onboarding", "process improvement"],
        },
      ],
    },
    {
      id: "exp-2",
      company: "Maple Bridge Consulting",
      role: "Business Analyst",
      location: "Vancouver, BC",
      start: "2021",
      end: "2023",
      bullets: [
        {
          id: "b-4",
          text: "Analyzed operational data in Excel and SQL to identify cost-saving opportunities worth $120K annually.",
          tags: ["sql", "excel", "analytics", "cost reduction"],
        },
        {
          id: "b-5",
          text: "Facilitated requirements workshops with 15+ stakeholders and translated findings into implementation plans.",
          tags: ["requirements", "stakeholder", "facilitation", "planning"],
        },
        {
          id: "b-6",
          text: "Created executive-ready presentations that clarified project risks, trade-offs, and recommended actions.",
          tags: ["communication", "presentation", "risk", "leadership"],
        },
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "University Name",
      degree: "Bachelor of Commerce, Business Technology Management",
      location: "Toronto, ON",
      start: "2017",
      end: "2021",
      detail: "Dean’s List · Relevant coursework: Data Analytics, Operations Management",
    },
  ],
  skills: [
    { id: "skill-1", label: "Tools", items: "Excel, SQL, Tableau, Jira, Notion" },
    { id: "skill-2", label: "Strengths", items: "Process improvement, stakeholder management, requirements analysis" },
    { id: "skill-3", label: "Languages", items: "English, Mandarin" },
  ],
  selectedBulletIds: ["b-1", "b-2", "b-4", "b-5", "b-6"],
  bulletOverrides: {},
  target: { title: "", company: "", requirements: "" },
  versions: [],
  template: "classic",
  accent: "#275d4c",
};

function normalizeData(value: unknown): AppData {
  const parsed =
    value && typeof value === "object" ? (value as Partial<AppData>) : {};
  return {
    ...starterData,
    ...parsed,
    bulletOverrides: parsed.bulletOverrides ?? {},
    versions: Array.isArray(parsed.versions)
      ? parsed.versions.map((version) => ({
          ...version,
          bulletOverrides: version.bulletOverrides ?? {},
        }))
      : [],
  };
}

const stopWords = new Set(
  "the a an and or for with to of in on is are be as at by from this that you your our we will have has experience role work working ability strong skills skill including about into across using use years".split(" "),
);
function keywords(text: string) {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9+#.\u4e00-\u9fff\s-]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word)),
    ),
  );
}
function fitScore(bullet: Bullet, targetWords: string[]) {
  const haystack = `${bullet.text} ${bullet.tags.join(" ")}`.toLowerCase();
  return targetWords.reduce((score, word) => score + (haystack.includes(word) ? 1 : 0), 0);
}
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function ResumeStudio() {
  const [data, setData] = useState<AppData>(starterData);
  const [activeSection, setActiveSection] = useState("experience");
  const [mobilePanel, setMobilePanel] = useState<"library" | "target" | "resume">("resume");
  const [selectedExp, setSelectedExp] = useState("exp-1");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [isHydrated, setHydrated] = useState(false);
  const [coverage, setCoverage] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isExportingWord, setExportingWord] = useState(false);
  const [draggedBulletId, setDraggedBulletId] = useState<string | null>(null);
  const [dragOverBulletId, setDragOverBulletId] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = localStorage.getItem("resume-canvas-data-v1");
      if (stored) {
        try {
          setData(normalizeData(JSON.parse(stored)));
        } catch {
          localStorage.removeItem("resume-canvas-data-v1");
        }
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!isHydrated) return;
    const timer = window.setTimeout(
      () => localStorage.setItem("resume-canvas-data-v1", JSON.stringify(data)),
      250,
    );
    return () => window.clearTimeout(timer);
  }, [data, isHydrated]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedExperience =
    data.experiences.find((item) => item.id === selectedExp) ?? data.experiences[0];
  const targetWords = useMemo(
    () => keywords(`${data.target.title} ${data.target.requirements}`),
    [data.target],
  );
  const visibleExperiences = data.experiences.filter((experience) =>
    `${experience.role} ${experience.company} ${experience.bullets
      .map((bullet) => `${bullet.text} ${bullet.tags.join(" ")}`)
      .join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const selectedExperiences = data.experiences
    .map((experience) => ({
      ...experience,
      bullets: experience.bullets
        .filter((bullet) => data.selectedBulletIds.includes(bullet.id))
        .sort(
          (first, second) =>
            data.selectedBulletIds.indexOf(first.id) -
            data.selectedBulletIds.indexOf(second.id),
        )
        .map((bullet) => ({
          ...bullet,
          text: data.bulletOverrides[bullet.id] ?? bullet.text,
        })),
    }))
    .filter((experience) => experience.bullets.length > 0);
  const allBullets = data.experiences.flatMap((experience) => experience.bullets);
  const selectedBullets = selectedExperiences.flatMap((experience) => experience.bullets);
  const selectionGroups = data.experiences.map((experience) => {
    const originalPosition = new Map(
      experience.bullets.map((bullet, index) => [bullet.id, index]),
    );
    const selectedPosition = new Map(
      data.selectedBulletIds.map((id, index) => [id, index]),
    );
    const bullets = [...experience.bullets].sort((first, second) => {
      const firstSelected = selectedPosition.has(first.id);
      const secondSelected = selectedPosition.has(second.id);
      if (firstSelected && secondSelected) {
        return selectedPosition.get(first.id)! - selectedPosition.get(second.id)!;
      }
      if (firstSelected) return -1;
      if (secondSelected) return 1;
      return originalPosition.get(first.id)! - originalPosition.get(second.id)!;
    });
    return {
      ...experience,
      bullets,
      selectedCount: bullets.filter((bullet) =>
        data.selectedBulletIds.includes(bullet.id),
      ).length,
    };
  });
  const wordCount =
    data.profile.summary.split(/\s+/).filter(Boolean).length +
    selectedBullets.reduce(
      (total, bullet) => total + bullet.text.split(/\s+/).filter(Boolean).length,
      0,
    );
  const metricCount = selectedBullets.filter((bullet) => /[$%]|\d/.test(bullet.text)).length;
  const matchingWords = targetWords.filter((word) =>
    `${data.profile.summary} ${selectedBullets.map((item) => item.text).join(" ")} ${data.skills
      .map((item) => item.items)
      .join(" ")}`
      .toLowerCase()
      .includes(word),
  );
  const atsScore = Math.min(
    98,
    52 +
      (data.profile.email ? 6 : 0) +
      (data.profile.phone ? 5 : 0) +
      (data.profile.summary ? 7 : 0) +
      Math.min(metricCount * 4, 16) +
      Math.min(matchingWords.length * 2, 12),
  );

  function updateProfile(key: keyof Profile, value: string) {
    setData((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
  }
  function updateTarget(key: keyof AppData["target"], value: string) {
    setData((current) => ({ ...current, target: { ...current.target, [key]: value } }));
  }
  function updateExperience(
    id: string,
    key: keyof Omit<Experience, "id" | "bullets">,
    value: string,
  ) {
    setData((current) => ({
      ...current,
      experiences: current.experiences.map((experience) =>
        experience.id === id ? { ...experience, [key]: value } : experience,
      ),
    }));
  }
  function updateBullet(experienceId: string, bulletId: string, text: string) {
    setData((current) => ({
      ...current,
      experiences: current.experiences.map((experience) =>
        experience.id === experienceId
          ? {
              ...experience,
              bullets: experience.bullets.map((bullet) =>
                bullet.id === bulletId ? { ...bullet, text } : bullet,
              ),
            }
          : experience,
      ),
    }));
  }
  function updateResumeBullet(bulletId: string, text: string) {
    const original = allBullets.find((bullet) => bullet.id === bulletId)?.text;
    setData((current) => {
      const nextOverrides = { ...current.bulletOverrides };
      if (text === original) {
        delete nextOverrides[bulletId];
      } else {
        nextOverrides[bulletId] = text;
      }
      return { ...current, bulletOverrides: nextOverrides };
    });
  }
  function updateEducation(id: string, key: keyof Omit<Education, "id">, value: string) {
    setData((current) => ({
      ...current,
      education: current.education.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }));
  }
  function updateSkill(id: string, key: "label" | "items", value: string) {
    setData((current) => ({
      ...current,
      skills: current.skills.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }));
  }
  function addExperience() {
    const id = uid();
    setData((current) => ({
      ...current,
      experiences: [
        ...current.experiences,
        {
          id,
          company: "Company",
          role: "Role Title",
          location: "City, Province",
          start: "Start",
          end: "End",
          bullets: [
            {
              id: uid(),
              text: "Start with an action verb, describe what you did, and add a measurable result.",
              tags: [],
            },
          ],
        },
      ],
    }));
    setSelectedExp(id);
    setActiveSection("experience");
    setShowAddMenu(false);
  }
  function addBullet(experienceId: string) {
    const id = uid();
    setData((current) => ({
      ...current,
      experiences: current.experiences.map((experience) =>
        experience.id === experienceId
          ? {
              ...experience,
              bullets: [
                ...experience.bullets,
                { id, text: "Describe an achievement or impact.", tags: [] },
              ],
            }
          : experience,
      ),
      selectedBulletIds: [...current.selectedBulletIds, id],
    }));
  }
  function addEducation() {
    setData((current) => ({
      ...current,
      education: [
        ...current.education,
        {
          id: uid(),
          school: "School Name",
          degree: "Degree / Program",
          location: "City, Province",
          start: "Start",
          end: "End",
          detail: "",
        },
      ],
    }));
    setActiveSection("education");
    setShowAddMenu(false);
  }
  function addSkillGroup() {
    setData((current) => ({
      ...current,
      skills: [...current.skills, { id: uid(), label: "Category", items: "Skill one, skill two" }],
    }));
    setActiveSection("skills");
    setShowAddMenu(false);
  }
  function tailorResume() {
    if (!data.target.title.trim() && !data.target.requirements.trim()) {
      setToast("请先填写目标岗位或粘贴职位描述");
      return;
    }
    const ranked = allBullets
      .map((bullet) => ({ bullet, score: fitScore(bullet, targetWords) }))
      .sort((a, b) => b.score - a.score);
    const hasMatches = ranked.some((item) => item.score > 0);
    const selection = ranked
      .filter((item, index) => (hasMatches ? item.score > 0 || index < 5 : index < 5))
      .slice(0, 8)
      .map((item) => item.bullet.id);
    const topTags = ranked
      .slice(0, 5)
      .flatMap((item) => item.bullet.tags)
      .filter((tag, index, array) => array.indexOf(tag) === index)
      .slice(0, 3);
    const summary =
      data.target.title && topTags.length
        ? `Results-oriented professional with hands-on experience in ${topTags.join(
            ", ",
          )}. Proven ability to turn complex requirements into measurable outcomes through clear communication and cross-functional collaboration. Prepared to contribute this experience as a ${data.target.title}.`
        : data.profile.summary;
    const version: ResumeVersion = {
      id: uid(),
      title: data.target.title || "Custom resume",
      company: data.target.company,
      createdAt: new Date().toISOString(),
      selectedBulletIds: selection,
      bulletOverrides: {},
      profile: {
        ...data.profile,
        headline: data.target.title || data.profile.headline,
        summary,
      },
    };
    setData((current) => ({
      ...current,
      selectedBulletIds: selection,
      bulletOverrides: {},
      profile: version.profile,
      versions: [version, ...current.versions].slice(0, 12),
    }));
    setCoverage(targetWords.slice(0, 12));
    setMobilePanel("resume");
    setToast(`已按相关度选出 ${selection.length} 条真实经历`);
  }
  function toggleBullet(id: string) {
    setData((current) => ({
      ...current,
      selectedBulletIds: current.selectedBulletIds.includes(id)
        ? current.selectedBulletIds.filter((bulletId) => bulletId !== id)
        : [...current.selectedBulletIds, id],
    }));
  }
  function selectedIdsForBullet(bulletId: string) {
    const experience = data.experiences.find((item) =>
      item.bullets.some((bullet) => bullet.id === bulletId),
    );
    if (!experience) return [];
    const ids = new Set(experience.bullets.map((bullet) => bullet.id));
    return data.selectedBulletIds.filter((id) => ids.has(id));
  }
  function canMoveBullet(bulletId: string, direction: -1 | 1) {
    const ids = selectedIdsForBullet(bulletId);
    const index = ids.indexOf(bulletId);
    return index >= 0 && index + direction >= 0 && index + direction < ids.length;
  }
  function reorderBullet(draggedId: string, targetId: string) {
    if (draggedId === targetId) return;
    const sourceExperience = data.experiences.find((experience) =>
      experience.bullets.some((bullet) => bullet.id === draggedId),
    );
    if (
      !sourceExperience ||
      !sourceExperience.bullets.some((bullet) => bullet.id === targetId)
    ) {
      setToast("只能在同一段经历或项目内排序");
      return;
    }
    setData((current) => {
      const experience = current.experiences.find(
        (item) => item.id === sourceExperience.id,
      );
      if (!experience) return current;
      const containerIds = new Set(
        experience.bullets.map((bullet) => bullet.id),
      );
      const orderedIds = current.selectedBulletIds.filter((id) =>
        containerIds.has(id),
      );
      const fromIndex = orderedIds.indexOf(draggedId);
      const toIndex = orderedIds.indexOf(targetId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const [moved] = orderedIds.splice(fromIndex, 1);
      orderedIds.splice(toIndex, 0, moved);
      let replacementIndex = 0;
      return {
        ...current,
        selectedBulletIds: current.selectedBulletIds.map((id) =>
          containerIds.has(id) && current.selectedBulletIds.includes(id)
            ? orderedIds[replacementIndex++]
            : id,
        ),
      };
    });
    setDraggedBulletId(null);
    setDragOverBulletId(null);
    setToast("当前岗位版顺序已更新");
  }
  function moveBullet(bulletId: string, direction: -1 | 1) {
    const ids = selectedIdsForBullet(bulletId);
    const index = ids.indexOf(bulletId);
    const targetId = ids[index + direction];
    if (targetId) reorderBullet(bulletId, targetId);
  }
  function beginBulletDrag(
    event: DragEvent<HTMLElement>,
    bulletId: string,
  ) {
    setDraggedBulletId(bulletId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", bulletId);
  }
  function allowBulletDrop(
    event: DragEvent<HTMLElement>,
    bulletId: string,
  ) {
    if (!draggedBulletId || draggedBulletId === bulletId) return;
    const sourceIds = selectedIdsForBullet(draggedBulletId);
    if (!sourceIds.includes(bulletId)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverBulletId(bulletId);
  }
  function restoreVersion(version: ResumeVersion) {
    setData((current) => ({
      ...current,
      selectedBulletIds: version.selectedBulletIds,
      bulletOverrides: version.bulletOverrides,
      profile: version.profile,
      target: { ...current.target, title: version.title, company: version.company },
    }));
    setToast("已恢复该岗位版本");
  }
  function downloadBlob(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
  function download(filename: string, content: string, type: string) {
    downloadBlob(filename, new Blob([content], { type }));
  }
  function exportText() {
    const lines = [
      data.profile.name.toUpperCase(),
      data.profile.headline,
      [data.profile.city, data.profile.phone, data.profile.email, data.profile.linkedin]
        .filter(Boolean)
        .join(" | "),
      "",
      "PROFESSIONAL SUMMARY",
      data.profile.summary,
      "",
      "EXPERIENCE",
      ...selectedExperiences.flatMap((experience) => [
        `${experience.role} | ${experience.company} | ${experience.location}`,
        `${experience.start} – ${experience.end}`,
        ...experience.bullets.map((bullet) => `• ${bullet.text}`),
        "",
      ]),
      "EDUCATION",
      ...data.education.flatMap((education) => [
        `${education.degree} | ${education.school}`,
        `${education.location} | ${education.start} – ${education.end}`,
        education.detail,
        "",
      ]),
      "SKILLS",
      ...data.skills.map((group) => `${group.label}: ${group.items}`),
    ];
    download(
      `${data.profile.name.replace(/\s+/g, "_")}_${data.target.title || "Resume"}.txt`,
      lines.join("\n"),
      "text/plain;charset=utf-8",
    );
  }
  async function exportWord() {
    setExportingWord(true);
    try {
      const [{ Packer }, { buildResumeWordDocument, resumeWordFilename }] =
        await Promise.all([import("docx"), import("./resumeWord.mjs")]);
      const wordDocument = buildResumeWordDocument(data, selectedExperiences);
      const blob = await Packer.toBlob(wordDocument);
      downloadBlob(`${resumeWordFilename(data)}.docx`, blob);
      setToast("Word 简历已生成，可在 Word 中自由编辑格式");
    } catch (error) {
      console.error("Unable to export Word resume", error);
      setToast("Word 文件生成失败，请稍后重试");
    } finally {
      setExportingWord(false);
    }
  }
  function exportBackup() {
    download("resume-canvas-backup.json", JSON.stringify(data, null, 2), "application/json");
  }
  function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setData(normalizeData(JSON.parse(String(reader.result))));
        setToast("备份已导入");
      } catch {
        setToast("无法读取该备份文件");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  const resumeStyle = { "--resume-accent": data.accent } as CSSProperties;

  return (
    <main className="studio-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">R</div>
          <div><strong>Resume Canvas</strong><span>本地简历工作台</span></div>
        </div>
        <div className="save-state"><span className="save-dot" />已自动保存到本机</div>
        <nav className="top-actions" aria-label="文件操作">
          <button className="ghost-button" onClick={() => importRef.current?.click()}>↥ 导入</button>
          <input ref={importRef} type="file" accept=".json" hidden onChange={importBackup} />
          <button className="ghost-button" onClick={exportBackup}>↓ 备份</button>
          <button className="primary-button" onClick={() => window.print()}>↗ 打印 / PDF</button>
        </nav>
      </header>

      <div className="mobile-tabs">
        {[
          ["library", "素材库"],
          ["target", "岗位"],
          ["resume", "简历"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={mobilePanel === key ? "active" : ""}
            onClick={() => setMobilePanel(key as typeof mobilePanel)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="workspace">
        <aside className={`library-panel panel ${mobilePanel === "library" ? "mobile-active" : ""}`}>
          <div className="panel-heading">
            <div><p className="eyebrow">MASTER LIBRARY</p><h2>真实经历素材库</h2></div>
            <div className="add-wrap">
              <button className="square-button" aria-label="添加内容" onClick={() => setShowAddMenu((value) => !value)}>+</button>
              {showAddMenu && (
                <div className="add-menu">
                  <button onClick={addExperience}>＋ 工作经历</button>
                  <button onClick={addEducation}>＋ 教育经历</button>
                  <button onClick={addSkillGroup}>＋ 技能分组</button>
                </div>
              )}
            </div>
          </div>
          <div className="search-box">
            <span>⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索经历、技能或关键词" />
          </div>
          <div className="section-tabs">
            {[
              ["experience", "经历", data.experiences.length],
              ["education", "教育", data.education.length],
              ["skills", "技能", data.skills.length],
              ["profile", "资料", 1],
            ].map(([key, label, count]) => (
              <button key={String(key)} className={activeSection === key ? "active" : ""} onClick={() => setActiveSection(String(key))}>
                <span>{label}</span><em>{count}</em>
              </button>
            ))}
          </div>

          <div className="library-content">
            {activeSection === "experience" && (
              <>
                <div className="item-list">
                  {visibleExperiences.map((experience) => (
                    <button
                      className={`library-card ${selectedExperience?.id === experience.id ? "active" : ""}`}
                      key={experience.id}
                      onClick={() => setSelectedExp(experience.id)}
                    >
                      <span className="card-icon">{experience.company.slice(0, 1)}</span>
                      <span><strong>{experience.role}</strong><small>{experience.company} · {experience.bullets.length} 条成果</small></span>
                    </button>
                  ))}
                </div>
                {selectedExperience && (
                  <div className="detail-editor">
                    <div className="detail-title"><span>编辑经历</span><small>写事实，不为某个岗位提前润色</small></div>
                    <div className="two-fields">
                      <Field label="职位" value={selectedExperience.role} onChange={(value) => updateExperience(selectedExperience.id, "role", value)} />
                      <Field label="公司" value={selectedExperience.company} onChange={(value) => updateExperience(selectedExperience.id, "company", value)} />
                    </div>
                    <div className="two-fields">
                      <Field label="开始" value={selectedExperience.start} onChange={(value) => updateExperience(selectedExperience.id, "start", value)} />
                      <Field label="结束" value={selectedExperience.end} onChange={(value) => updateExperience(selectedExperience.id, "end", value)} />
                    </div>
                    <Field label="地点" value={selectedExperience.location} onChange={(value) => updateExperience(selectedExperience.id, "location", value)} />
                    <label className="field"><span>成果要点</span></label>
                    <div className="bullet-editor-list">
                      {selectedExperience.bullets.map((bullet, index) => (
                        <div className="bullet-editor" key={bullet.id}>
                          <span>{index + 1}</span>
                          <textarea
                            value={bullet.text}
                            rows={3}
                            onChange={(event) => updateBullet(selectedExperience.id, bullet.id, event.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <button className="text-button" onClick={() => addBullet(selectedExperience.id)}>＋ 添加成果要点</button>
                  </div>
                )}
              </>
            )}

            {activeSection === "education" && (
              <div className="detail-editor stacked-editor">
                {data.education.map((education) => (
                  <div className="editor-block" key={education.id}>
                    <Field label="学校" value={education.school} onChange={(value) => updateEducation(education.id, "school", value)} />
                    <Field label="学位 / 专业" value={education.degree} onChange={(value) => updateEducation(education.id, "degree", value)} />
                    <div className="two-fields">
                      <Field label="开始" value={education.start} onChange={(value) => updateEducation(education.id, "start", value)} />
                      <Field label="结束" value={education.end} onChange={(value) => updateEducation(education.id, "end", value)} />
                    </div>
                    <Field label="地点" value={education.location} onChange={(value) => updateEducation(education.id, "location", value)} />
                    <Field label="补充信息" value={education.detail} onChange={(value) => updateEducation(education.id, "detail", value)} />
                  </div>
                ))}
                <button className="text-button" onClick={addEducation}>＋ 添加教育经历</button>
              </div>
            )}

            {activeSection === "skills" && (
              <div className="detail-editor stacked-editor">
                {data.skills.map((group) => (
                  <div className="skill-row" key={group.id}>
                    <input className="skill-label" value={group.label} onChange={(event) => updateSkill(group.id, "label", event.target.value)} />
                    <textarea value={group.items} rows={2} onChange={(event) => updateSkill(group.id, "items", event.target.value)} />
                  </div>
                ))}
                <button className="text-button" onClick={addSkillGroup}>＋ 添加技能分组</button>
              </div>
            )}

            {activeSection === "profile" && (
              <div className="detail-editor stacked-editor">
                <Field label="姓名" value={data.profile.name} onChange={(value) => updateProfile("name", value)} />
                <Field label="定位" value={data.profile.headline} onChange={(value) => updateProfile("headline", value)} />
                <Field label="城市" value={data.profile.city} onChange={(value) => updateProfile("city", value)} />
                <Field label="电话" value={data.profile.phone} onChange={(value) => updateProfile("phone", value)} />
                <Field label="邮箱" value={data.profile.email} onChange={(value) => updateProfile("email", value)} />
                <Field label="LinkedIn" value={data.profile.linkedin} onChange={(value) => updateProfile("linkedin", value)} />
                <label className="field">
                  <span>职业简介</span>
                  <textarea rows={6} value={data.profile.summary} onChange={(event) => updateProfile("summary", event.target.value)} />
                </label>
              </div>
            )}
          </div>
          <div className="privacy-note"><span>⌂</span><p><strong>只存于此设备</strong>你的经历不会上传到服务器。建议定期下载 JSON 备份。</p></div>
        </aside>

        <section className={`target-panel panel ${mobilePanel === "target" ? "mobile-active" : ""}`}>
          <div className="target-intro">
            <p className="eyebrow">TAILORING DESK</p>
            <h1>为这个岗位生成一版</h1>
            <p>粘贴职位描述，系统只从你的真实素材中筛选，不虚构经历。</p>
          </div>
          <div className="target-form">
            <Field label="目标岗位" placeholder="例：Senior Business Analyst" value={data.target.title} onChange={(value) => updateTarget("title", value)} />
            <Field label="公司（可选）" placeholder="例：Shopify" value={data.target.company} onChange={(value) => updateTarget("company", value)} />
            <label className="field">
              <span>职位描述 / 关键要求</span>
              <textarea className="requirements" rows={10} value={data.target.requirements} onChange={(event) => updateTarget("requirements", event.target.value)} placeholder="粘贴 Job Description，或只写关键职责、工具和能力要求…" />
            </label>
            <button className="generate-button" onClick={tailorResume}>
              <span className="spark">✦</span>
              <span><strong>智能生成岗位版</strong><small>筛选经历 · 调整顺序 · 生成简介</small></span>
              <b>→</b>
            </button>
          </div>

          {coverage.length > 0 && (
            <div className="keyword-box">
              <div className="mini-heading"><strong>岗位关键词</strong><span>{matchingWords.length}/{targetWords.length} 已覆盖</span></div>
              <div className="chip-list">
                {coverage.map((word) => (
                  <span className={matchingWords.includes(word) ? "matched" : ""} key={word}>
                    {matchingWords.includes(word) ? "✓ " : "+ "}{word}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="selection-box">
            <div className="mini-heading"><strong>本版内容选择</strong><span>{data.selectedBulletIds.length} 条已选</span></div>
            <p>按经历和项目分组；勾选决定是否显示，拖动已选条目可调整组内顺序。</p>
            <div className="selection-groups">
              {selectionGroups.map((experience) => (
                <section className="selection-group" key={experience.id}>
                  <header className="selection-group-header">
                    <span className="selection-group-mark">
                      {experience.company.slice(0, 1)}
                    </span>
                    <span>
                      <strong>{experience.role}</strong>
                      <small>
                        {experience.company} · {experience.selectedCount}/
                        {experience.bullets.length} 条已选
                      </small>
                    </span>
                  </header>
                  <div className="selection-list">
                    {experience.bullets.map((bullet) => {
                      const score = fitScore(bullet, targetWords);
                      const isSelected = data.selectedBulletIds.includes(
                        bullet.id,
                      );
                      return (
                        <div
                          className={`selection-card ${
                            isSelected ? "selected" : ""
                          } ${
                            dragOverBulletId === bullet.id ? "drag-over" : ""
                          }`}
                          key={bullet.id}
                          onDragOver={(event) =>
                            allowBulletDrop(event, bullet.id)
                          }
                          onDrop={(event) => {
                            event.preventDefault();
                            if (draggedBulletId) {
                              reorderBullet(draggedBulletId, bullet.id);
                            }
                          }}
                        >
                          <label className="selection-content">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleBullet(bullet.id)}
                            />
                            <span>
                              {bullet.text}
                              {data.bulletOverrides[bullet.id] && (
                                <small className="tailored-note">
                                  岗位版已使用定制表达
                                </small>
                              )}
                              {targetWords.length > 0 && (
                                <small>
                                  {score > 0
                                    ? `${score} 个关键词匹配`
                                    : "补充性经历"}
                                </small>
                              )}
                            </span>
                          </label>
                          {isSelected && (
                            <div className="order-controls">
                              <span
                                className="drag-handle"
                                draggable
                                title="拖动调整当前组内顺序"
                                aria-label="拖动调整顺序"
                                onDragStart={(event) =>
                                  beginBulletDrag(event, bullet.id)
                                }
                                onDragEnd={() => {
                                  setDraggedBulletId(null);
                                  setDragOverBulletId(null);
                                }}
                              >
                                ⠿
                              </span>
                              <button
                                type="button"
                                aria-label="向上移动"
                                title="向上移动"
                                disabled={!canMoveBullet(bullet.id, -1)}
                                onClick={() => moveBullet(bullet.id, -1)}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                aria-label="向下移动"
                                title="向下移动"
                                disabled={!canMoveBullet(bullet.id, 1)}
                                onClick={() => moveBullet(bullet.id, 1)}
                              >
                                ↓
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>

          {data.versions.length > 0 && (
            <div className="history-box">
              <div className="mini-heading"><strong>岗位版本</strong><span>自动留存最近 12 版</span></div>
              {data.versions.slice(0, 4).map((version) => (
                <button key={version.id} onClick={() => restoreVersion(version)}>
                  <span><strong>{version.title}</strong><small>{version.company || "未指定公司"} · {new Date(version.createdAt).toLocaleDateString("zh-CN")}</small></span>
                  <b>恢复</b>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className={`resume-panel panel ${mobilePanel === "resume" ? "mobile-active" : ""}`}>
          <div className="resume-toolbar">
            <div className="template-toggle">
              <button className={data.template === "classic" ? "active" : ""} onClick={() => setData((current) => ({ ...current, template: "classic" }))}>经典</button>
              <button className={data.template === "modern" ? "active" : ""} onClick={() => setData((current) => ({ ...current, template: "modern" }))}>现代</button>
            </div>
            {Object.keys(data.bulletOverrides).length > 0 && (
              <button
                className="toolbar-button tailored-state"
                onClick={() =>
                  setData((current) => ({ ...current, bulletOverrides: {} }))
                }
                title="清除岗位版改写，恢复素材库原文"
              >
                {Object.keys(data.bulletOverrides).length} 条岗位改写 · 恢复原文
              </button>
            )}
            <label className="accent-picker"><span>主题色</span><input type="color" value={data.accent} onChange={(event) => setData((current) => ({ ...current, accent: event.target.value }))} /></label>
            <button
              className="toolbar-button word-button"
              onClick={exportWord}
              disabled={isExportingWord}
              title="导出为可编辑的 Microsoft Word 文档"
            >
              {isExportingWord ? "生成中…" : "WORD"}
            </button>
            <button className="toolbar-button" onClick={exportText}>TXT</button>
            <button className="toolbar-button" onClick={() => window.print()}>PDF</button>
          </div>

          <div className="paper-stage">
            <article className={`resume-paper ${data.template}`} id="resume-paper" style={resumeStyle}>
              <header className="resume-header">
                <input className="resume-name" aria-label="姓名" value={data.profile.name} onChange={(event) => updateProfile("name", event.target.value)} />
                <input className="resume-headline" aria-label="职业定位" value={data.profile.headline} onChange={(event) => updateProfile("headline", event.target.value)} />
                <div className="contact-line">
                  {(["city", "phone", "email", "linkedin"] as const).map((key) => (
                    <input key={key} aria-label={key} value={data.profile[key]} onChange={(event) => updateProfile(key, event.target.value)} />
                  ))}
                </div>
              </header>

              <section className="resume-section">
                <h2>Professional Summary</h2>
                <textarea aria-label="职业简介" value={data.profile.summary} onChange={(event) => updateProfile("summary", event.target.value)} rows={4} />
              </section>

              <section className="resume-section">
                <h2>Professional Experience</h2>
                {selectedExperiences.map((experience) => (
                  <div className="resume-entry" key={experience.id}>
                    <div className="entry-heading">
                      <div>
                        <input className="entry-role" value={experience.role} aria-label="职位" onChange={(event) => updateExperience(experience.id, "role", event.target.value)} />
                        <input className="entry-company" value={`${experience.company} · ${experience.location}`} aria-label="公司和地点" readOnly />
                      </div>
                      <input className="entry-date" value={`${experience.start} – ${experience.end}`} aria-label="任职时间" readOnly />
                    </div>
                    <ul>
                      {experience.bullets.map((bullet) => (
                        <li
                          className={
                            dragOverBulletId === bullet.id ? "drag-over" : ""
                          }
                          key={bullet.id}
                          onDragOver={(event) =>
                            allowBulletDrop(event, bullet.id)
                          }
                          onDrop={(event) => {
                            event.preventDefault();
                            if (draggedBulletId) {
                              reorderBullet(draggedBulletId, bullet.id);
                            }
                          }}
                        >
                          <div className="resume-bullet-row">
                            <span
                              className="resume-drag-handle"
                              draggable
                              title="拖动调整当前经历内的顺序"
                              aria-label="拖动调整顺序"
                              onDragStart={(event) =>
                                beginBulletDrag(event, bullet.id)
                              }
                              onDragEnd={() => {
                                setDraggedBulletId(null);
                                setDragOverBulletId(null);
                              }}
                            >
                              ⠿
                            </span>
                            <textarea
                              aria-label="岗位版成果描述"
                              value={bullet.text}
                              rows={2}
                              onChange={(event) =>
                                updateResumeBullet(
                                  bullet.id,
                                  event.target.value,
                                )
                              }
                            />
                            <div className="resume-order-controls">
                              <button
                                type="button"
                                aria-label="向上移动"
                                title="向上移动"
                                disabled={!canMoveBullet(bullet.id, -1)}
                                onClick={() => moveBullet(bullet.id, -1)}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                aria-label="向下移动"
                                title="向下移动"
                                disabled={!canMoveBullet(bullet.id, 1)}
                                onClick={() => moveBullet(bullet.id, 1)}
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

              <section className="resume-section">
                <h2>Education</h2>
                {data.education.map((education) => (
                  <div className="education-line" key={education.id}>
                    <div>
                      <strong>{education.degree}</strong>
                      <span>{education.school} · {education.location}</span>
                      {education.detail && <small>{education.detail}</small>}
                    </div>
                    <span>{education.start} – {education.end}</span>
                  </div>
                ))}
              </section>
              <section className="resume-section skills-section">
                <h2>Skills</h2>
                {data.skills.map((group) => <p key={group.id}><strong>{group.label}:</strong> {group.items}</p>)}
              </section>
            </article>
          </div>

          <div className="ats-bar">
            <div className="score-ring" style={{ "--score": `${atsScore * 3.6}deg` } as CSSProperties}><span>{atsScore}</span></div>
            <div><strong>ATS 健康度良好</strong><p>{wordCount} 个核心词 · {metricCount} 条量化成果 · 无头像/表格</p></div>
            <button onClick={() => setToast(metricCount < 3 ? "建议再补充可验证的数字、比例或规模" : "结构、联系方式和量化表达均符合北美常见标准")}>查看建议</button>
          </div>
        </section>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
