---
name: rewrite-lesson
description: "Routine: Read an existing lesson's content, rewrite it in a different tone/length/reading level, and stage the rewrite as a draft update."
---

# Rewrite Lesson

This is a **Routine** skill — a reliable, repeatable sequence of Actions. Follow the steps exactly. Minimize judgment — the process is fixed.

## Purpose

Take an existing lesson in a TI course, rewrite its topic content according to user-specified parameters (tone, length, reading level), and stage the rewritten content as a draft update.

## Process

### Step 1 — Gather parameters

Ask the user for:
- **Lesson ID** (UUID) — or help them find it by browsing with `list-course-groups` → `get-course-structure`
- **Rewrite parameters** (at least one):
  - **Tone**: formal, conversational, technical, friendly, academic
  - **Length**: shorter, longer, or target word count
  - **Reading level**: grade level (e.g., 8th grade), or audience (e.g., "non-technical executives")
  - **Other**: specific instructions (e.g., "add more examples", "remove jargon")

### Step 2 — Read current content

Invoke the **`get-topics-by-lesson`** action to fetch all topics under the lesson:

```bash
node skills/actions/get-topics-by-lesson/get-topics-by-lesson.js --lessonId=LESSON_UUID
```

Record each topic's `id`, `title`, and `body` (current content).

### Step 3 — Rewrite

For each topic:
1. Take the current `body` (HTML content).
2. Rewrite it according to the user's parameters.
3. Preserve the HTML structure (headings, lists, images, embeds) unless the user asks to restructure.
4. Preserve any embedded media references, links, or interactive elements.

### Step 4 — Show diff to user

Present the rewritten content alongside the original for each topic. Use a clear before/after format. Ask the user to approve, request changes, or reject.

Do NOT proceed to Step 5 until the user explicitly approves.

### Step 5 — Stage the update

Invoke the **`update-course-content`** action with the approved rewrites:

```bash
node skills/actions/update-course-content/update-course-content.js --file=rewrite.json
```

The payload should update only the `topics` that were rewritten:

```json
{
  "topics": [
    { "id": "TOPIC_UUID_1", "body": "<p>Rewritten content...</p>" },
    { "id": "TOPIC_UUID_2", "body": "<p>Rewritten content...</p>" }
  ]
}
```

Report the update result to the user.

<HARD-GATE>
- All updates are staged as DRAFT. Never call releaseContent.
- Never skip Step 4 (user approval). The user must see and approve the rewritten content before it is pushed to TI.
- Never discard or overwrite embedded media, assessments, or interactive elements unless the user explicitly asks.
</HARD-GATE>
