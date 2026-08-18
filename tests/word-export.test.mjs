import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Packer } from "docx";
import JSZip from "jszip";
import {
  buildResumeWordDocument,
  resumeWordFilename,
} from "../app/resumeWord.mjs";

test("builds an editable Word resume from selected material", async () => {
  const data = JSON.parse(
    await readFile(
      new URL("../demo/resume-canvas-demo.json", import.meta.url),
      "utf8",
    ),
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

  const buffer = await Packer.toBuffer(
    buildResumeWordDocument(data, selectedExperiences),
  );

  assert.ok(buffer.length > 5_000);
  assert.equal(buffer.subarray(0, 2).toString("ascii"), "PK");
  assert.equal(resumeWordFilename(data), "Jordan_Lee_Resume");
});

test("omits organization and date metadata when an experience has no dates", async () => {
  const data = JSON.parse(
    await readFile(
      new URL("../demo/resume-canvas-demo.json", import.meta.url),
      "utf8",
    ),
  );
  const experience = {
    ...data.experiences[0],
    role: "Coffee Matcher",
    company: "Independent Project",
    location: "",
    start: "",
    end: "",
  };
  const buffer = await Packer.toBuffer(
    buildResumeWordDocument(data, [experience]),
  );
  const packageFile = await JSZip.loadAsync(buffer);
  const documentXml = await packageFile.file("word/document.xml").async("string");

  assert.match(documentXml, /Coffee Matcher/);
  assert.doesNotMatch(documentXml, /Independent Project/);
  assert.doesNotMatch(documentXml, /<w:t[^>]*>\s*-\s*<\/w:t>/);
});
