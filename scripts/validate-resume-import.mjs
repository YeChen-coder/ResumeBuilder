import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("缺少导入文件路径。");
  console.error("用法：npm run validate:import -- imports/resume-canvas-import.json");
  process.exit(1);
}

const errors = [];
const warnings = [];
const ids = new Set();
const bulletIds = new Set();

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireObject(value, path) {
  if (!object(value)) errors.push(`${path} 必须是对象`);
}

function requireArray(value, path) {
  if (!Array.isArray(value)) errors.push(`${path} 必须是数组`);
}

function requireString(value, path, allowEmpty = false) {
  if (typeof value !== "string") {
    errors.push(`${path} 必须是字符串`);
  } else if (!allowEmpty && !value.trim()) {
    errors.push(`${path} 不能为空`);
  }
}

function registerId(id, path, bullet = false) {
  requireString(id, path);
  if (typeof id !== "string" || !id) return;
  if (ids.has(id)) errors.push(`${path} 的 ID "${id}" 与其他记录重复`);
  ids.add(id);
  if (bullet) bulletIds.add(id);
}

let data;
const absolutePath = resolve(inputPath);

try {
  data = JSON.parse(await readFile(absolutePath, "utf8"));
} catch (error) {
  console.error(`无法读取或解析 JSON：${absolutePath}`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

requireObject(data, "根节点");

if (object(data)) {
  requireObject(data.profile, "profile");
  if (object(data.profile)) {
    for (const key of ["name", "headline", "city", "phone", "email", "linkedin", "summary"]) {
      requireString(data.profile[key], `profile.${key}`, key !== "name");
    }
  }

  requireArray(data.experiences, "experiences");
  if (Array.isArray(data.experiences)) {
    data.experiences.forEach((experience, expIndex) => {
      const path = `experiences[${expIndex}]`;
      requireObject(experience, path);
      if (!object(experience)) return;
      registerId(experience.id, `${path}.id`);
      for (const key of ["company", "role", "location", "start", "end"]) {
        requireString(experience[key], `${path}.${key}`);
      }
      requireArray(experience.bullets, `${path}.bullets`);
      if (Array.isArray(experience.bullets)) {
        if (experience.bullets.length === 0) warnings.push(`${path} 没有 bullet`);
        experience.bullets.forEach((bullet, bulletIndex) => {
          const bulletPath = `${path}.bullets[${bulletIndex}]`;
          requireObject(bullet, bulletPath);
          if (!object(bullet)) return;
          registerId(bullet.id, `${bulletPath}.id`, true);
          requireString(bullet.text, `${bulletPath}.text`);
          requireArray(bullet.tags, `${bulletPath}.tags`);
          if (Array.isArray(bullet.tags)) {
            bullet.tags.forEach((tag, tagIndex) =>
              requireString(tag, `${bulletPath}.tags[${tagIndex}]`),
            );
          }
        });
      }
    });
  }

  requireArray(data.education, "education");
  if (Array.isArray(data.education)) {
    data.education.forEach((education, index) => {
      const path = `education[${index}]`;
      requireObject(education, path);
      if (!object(education)) return;
      registerId(education.id, `${path}.id`);
      for (const key of ["school", "degree", "location", "start", "end"]) {
        requireString(education[key], `${path}.${key}`);
      }
      requireString(education.detail, `${path}.detail`, true);
    });
  }

  requireArray(data.skills, "skills");
  if (Array.isArray(data.skills)) {
    data.skills.forEach((skill, index) => {
      const path = `skills[${index}]`;
      requireObject(skill, path);
      if (!object(skill)) return;
      registerId(skill.id, `${path}.id`);
      requireString(skill.label, `${path}.label`);
      requireString(skill.items, `${path}.items`);
    });
  }

  requireArray(data.selectedBulletIds, "selectedBulletIds");
  if (Array.isArray(data.selectedBulletIds)) {
    const selected = new Set();
    data.selectedBulletIds.forEach((id, index) => {
      requireString(id, `selectedBulletIds[${index}]`);
      if (selected.has(id)) errors.push(`selectedBulletIds 中重复引用了 "${id}"`);
      selected.add(id);
    });
    for (const id of selected) {
      if (!bulletIds.has(id)) errors.push(`selectedBulletIds 引用了不存在的 bullet "${id}"`);
    }
    for (const id of bulletIds) {
      if (!selected.has(id)) warnings.push(`bullet "${id}" 默认未选入简历`);
    }
  }

  requireObject(data.bulletOverrides, "bulletOverrides");
  if (object(data.bulletOverrides)) {
    for (const [id, text] of Object.entries(data.bulletOverrides)) {
      if (!bulletIds.has(id)) {
        errors.push(`bulletOverrides 引用了不存在的 bullet "${id}"`);
      }
      requireString(text, `bulletOverrides.${id}`);
      if (
        Array.isArray(data.selectedBulletIds) &&
        !data.selectedBulletIds.includes(id)
      ) {
        warnings.push(`bulletOverrides 中的 "${id}" 没有出现在 selectedBulletIds 中`);
      }
    }
  }

  requireObject(data.target, "target");
  if (object(data.target)) {
    for (const key of ["title", "company", "requirements"]) {
      requireString(data.target[key], `target.${key}`, true);
    }
  }

  requireArray(data.versions, "versions");
  if (Array.isArray(data.versions) && data.versions.length > 0) {
    warnings.push("资料导入文件通常应将 versions 保持为空数组");
  }

  if (!["classic", "modern"].includes(data.template)) {
    errors.push('template 必须是 "classic" 或 "modern"');
  }
  if (typeof data.accent !== "string" || !/^#[0-9a-f]{6}$/i.test(data.accent)) {
    errors.push("accent 必须是六位十六进制颜色，例如 #275d4c");
  }
}

if (warnings.length) {
  console.warn("\n提醒：");
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (errors.length) {
  console.error("\n校验失败：");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const experienceCount = data.experiences.length;
const bulletCount = data.experiences.reduce(
  (total, experience) => total + experience.bullets.length,
  0,
);

console.log("\n导入文件校验通过。");
console.log(`文件：${absolutePath}`);
console.log(`工作经历：${experienceCount}`);
console.log(`成果要点：${bulletCount}`);
console.log(`教育经历：${data.education.length}`);
console.log(`技能分组：${data.skills.length}`);
