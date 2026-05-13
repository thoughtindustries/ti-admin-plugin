---
name: generate-course-outline
description: "Routine: Generate a structured course outline from a topic or source material, then stage it as a draft in TI Academy."
---

# Generate Course Outline

This is a **Routine** skill — a reliable, repeatable sequence of Actions. Follow the steps exactly. Minimize judgment — the process is fixed.

## Purpose

Take a topic, learning objectives, or source material from the user and produce a complete course structure (modules/sections/lessons/topics) staged as a draft in the TI platform.

## Process

### Step 1 — Elicit inputs

Ask the user for:
- **Topic or source material** (text, URL, document, or free-form description)
- **Target audience** (beginner, intermediate, advanced; role; industry)
- **Desired length** (number of modules/lessons, or approximate duration)
- **Tone** (formal, conversational, technical, etc.)

If the user provides source material (a document, URL content, or pasted text), use it as the foundation. If they provide only a topic, generate from domain knowledge.

### Step 2 — Generate the outline

Produce a structured outline in this format:

```
Course: [Title]
  Section 1: [Module Title]
    Lesson 1.1: [Lesson Title]
      Topic 1.1.1: [Topic Title] — [brief description]
      Topic 1.1.2: [Topic Title] — [brief description]
    Lesson 1.2: [Lesson Title]
      ...
  Section 2: [Module Title]
    ...
```

Guidelines:
- 3–7 sections (modules) per course
- 2–5 lessons per section
- 1–3 topics per lesson
- Each topic should have a clear, specific scope

### Step 3 — Confirm with user

Present the outline to the user. Ask for approval or edits. Iterate until the user confirms.

Do NOT proceed to Step 4 until the user explicitly approves.

### Step 4 — Create the draft

Invoke the **`create-course-draft`** action with the confirmed outline structured as the API payload:

```bash
node skills/actions/create-course-draft/create-course-draft.js --file=outline.json
```

Build the JSON payload with:
- `kind`: `"courseGroup"` (default) or as specified by user
- `title`: the course title
- `sections`: array with nested `lessons` and `topics`
- Each topic `body` should contain a placeholder: `<p>[Content to be written]</p>`

Report back the created course IDs to the user.

<HARD-GATE>
- All content is created as DRAFT. Never call releaseContent.
- Never skip Step 3 (user confirmation). The user must approve the outline before creating it in TI.
- Do not generate full lesson body content in this routine — only titles and placeholder bodies. Use the `rewrite-lesson` routine or the `author-course` playbook for content generation.
</HARD-GATE>
