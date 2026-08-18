import {
  AlignmentType,
  BorderStyle,
  Document,
  LevelFormat,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";

export function resumeWordFilename(data) {
  return `${data.profile.name}_${data.target.title || "Resume"}`
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, "_");
}

export function buildResumeWordDocument(data, selectedExperiences) {
  const accent = data.accent.replace("#", "").toUpperCase();
  const ink = "17201D";
  const muted = "515B57";
  const rightTab = 10440;
  const paragraphs = [];
  const sectionHeading = (text) =>
    new Paragraph({
      style: "ResumeSectionHeading",
      keepNext: true,
      children: [new TextRun({ text: text.toUpperCase() })],
    });

  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 30 },
      keepNext: true,
      children: [
        new TextRun({
          text: data.profile.name,
          bold: true,
          font: "Arial",
          size: 44,
          color: ink,
        }),
      ],
    }),
  );

  if (data.profile.headline) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        keepNext: true,
        children: [
          new TextRun({
            text: data.profile.headline.toUpperCase(),
            bold: true,
            font: "Arial",
            size: 20,
            color: accent,
            characterSpacing: 12,
          }),
        ],
      }),
    );
  }

  const contactLine = [
    data.profile.city,
    data.profile.phone,
    data.profile.email,
    data.profile.linkedin,
  ]
    .filter(Boolean)
    .join(" | ");
  if (contactLine) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: contactLine,
            font: "Arial",
            size: 18,
            color: muted,
          }),
        ],
      }),
    );
  }

  if (data.profile.summary) {
    paragraphs.push(
      sectionHeading("Professional Summary"),
      new Paragraph({
        spacing: { after: 80, line: 240 },
        children: [
          new TextRun({
            text: data.profile.summary,
            font: "Arial",
            size: 20,
            color: ink,
          }),
        ],
      }),
    );
  }

  if (selectedExperiences.length > 0) {
    paragraphs.push(sectionHeading("Professional Experience"));
    selectedExperiences.forEach((experience) => {
      const dateLine = [experience.start, experience.end]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" - ");
      const organizationLine = dateLine
        ? [experience.company, experience.location]
            .map((value) => value.trim())
            .filter(Boolean)
            .join(" | ")
        : "";
      paragraphs.push(
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: rightTab }],
          spacing: { before: 50, after: organizationLine ? 10 : 30 },
          keepNext: true,
          children: [
            new TextRun({
              text: experience.role,
              bold: true,
              font: "Arial",
              size: 21,
              color: ink,
            }),
            ...(dateLine
              ? [
                  new TextRun({
                    text: `\t${dateLine}`,
                    font: "Arial",
                    size: 18,
                    color: muted,
                  }),
                ]
              : []),
          ],
        }),
      );
      if (organizationLine) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 30 },
            keepNext: experience.bullets.length > 0,
            children: [
              new TextRun({
                text: organizationLine,
                italics: true,
                font: "Arial",
                size: 18,
                color: muted,
              }),
            ],
          }),
        );
      }
      experience.bullets.forEach((bullet) => {
        paragraphs.push(
          new Paragraph({
            numbering: { reference: "resume-bullets", level: 0 },
            spacing: { after: 34, line: 240 },
            children: [
              new TextRun({
                text: bullet.text,
                font: "Arial",
                size: 20,
                color: ink,
              }),
            ],
          }),
        );
      });
    });
  }

  if (data.education.length > 0) {
    paragraphs.push(sectionHeading("Education"));
    data.education.forEach((education) => {
      paragraphs.push(
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: rightTab }],
          spacing: { before: 30, after: 10 },
          keepNext: true,
          children: [
            new TextRun({
              text: education.degree,
              bold: true,
              font: "Arial",
              size: 20,
              color: ink,
            }),
            new TextRun({
              text: `\t${education.start} - ${education.end}`,
              font: "Arial",
              size: 18,
              color: muted,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: education.detail ? 10 : 40 },
          keepNext: Boolean(education.detail),
          children: [
            new TextRun({
              text: [education.school, education.location]
                .filter(Boolean)
                .join(" | "),
              font: "Arial",
              size: 18,
              color: muted,
            }),
          ],
        }),
      );
      if (education.detail) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: education.detail,
                font: "Arial",
                size: 18,
                color: muted,
              }),
            ],
          }),
        );
      }
    });
  }

  if (data.skills.length > 0) {
    paragraphs.push(sectionHeading("Skills"));
    data.skills.forEach((group) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 24, line: 240 },
          children: [
            new TextRun({
              text: `${group.label}: `,
              bold: true,
              font: "Arial",
              size: 19,
              color: ink,
            }),
            new TextRun({
              text: group.items,
              font: "Arial",
              size: 19,
              color: ink,
            }),
          ],
        }),
      );
    });
  }

  return new Document({
    creator: "Resume Canvas",
    title: `${data.profile.name} - ${data.target.title || "Resume"}`,
    subject: "Editable resume",
    description: "Editable resume exported from Resume Canvas",
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 20, color: ink },
          paragraph: { spacing: { after: 0, line: 240 } },
        },
      },
      paragraphStyles: [
        {
          id: "ResumeSectionHeading",
          name: "Resume Section Heading",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { font: "Arial", size: 20, bold: true, color: accent },
          paragraph: {
            spacing: { before: 130, after: 55 },
            border: {
              bottom: {
                color: accent,
                style: BorderStyle.SINGLE,
                size: 8,
                space: 2,
              },
            },
          },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "resume-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 300, hanging: 180 },
                  spacing: { after: 34, line: 240 },
                },
                run: { font: "Arial", size: 20, color: accent },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: {
              top: 720,
              right: 792,
              bottom: 720,
              left: 792,
              header: 360,
              footer: 360,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });
}
