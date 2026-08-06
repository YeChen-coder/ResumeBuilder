import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Packer } from "docx";
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
