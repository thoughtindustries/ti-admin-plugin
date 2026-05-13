---
name: author-course
description: "Playbook: Full AI-assisted course authoring workflow — outline, write, rewrite, review. All content staged as draft."
---

# Author Course

This is a **Playbook** skill — a comprehensive strategy that strings Routines and Actions together. You have autonomy to decide which steps to run and when, based on the user's intent.

## Purpose

Guide the user through a complete course authoring workflow: from initial idea to a fully written course draft in the TI platform. All generated content stays as draft — never auto-published.

## Strategy

### Phase 1 — Discovery

Understand what the user wants to build:
- What is the course about?
- Who is the target audience?
- What are the learning objectives?
- Is there existing source material (documents, outlines, legacy content)?
- What tone and reading level are appropriate?

If the user has an existing course they want to improve, use read actions (`list-course-groups`, `get-course-structure`, `get-topics-by-lesson`) to load and review the current state.

### Phase 2 — Outline

Invoke the **`generate-course-outline`** routine to create and confirm a structured outline. If the user already has a course in TI, skip this phase — go directly to Phase 3.

### Phase 3 — Content writing

For each lesson in the outline (or existing course):
1. Use `get-topics-by-lesson` to check if topics have placeholder or real content.
2. For each topic that needs content:
   - Generate the body content (HTML) based on the topic title, lesson context, and course objectives.
   - Match the agreed tone, length, and reading level.
3. Present the generated content to the user for review.
4. On approval, invoke `update-course-content` to stage the content.

You have autonomy to:
- Write multiple topics in a batch and present them together.
- Suggest restructuring if a topic is too broad or too narrow.
- Recommend splitting long topics or merging thin ones.

### Phase 4 — Refinement

After initial content is written, offer the user:
- **Tone adjustment**: Invoke the `rewrite-lesson` routine for any lessons that need a different voice.
- **Length adjustment**: Expand thin lessons or condense verbose ones.
- **Consistency check**: Review all lessons for consistent terminology, formatting, and style.
- **Assessment suggestions**: Suggest where quizzes or knowledge checks would improve retention (but do not create assessment content — that requires manual setup in TI).

### Phase 5 — Summary

When the user is satisfied:
1. Use `get-course-structure` to fetch the final state.
2. Present a summary: course title, section/lesson/topic counts, word counts, and status.
3. Remind the user that all content is in **draft** — they must publish manually in the TI admin UI when ready.

## Available Actions

| Action | Purpose |
|--------|---------|
| `list-course-groups` | Browse/search the catalog |
| `get-course-group` | Fetch course group metadata |
| `get-course-structure` | Read full course tree |
| `get-section` | Read section details |
| `get-lesson` | Read lesson details |
| `get-topic` | Read single topic with body |
| `get-topics-by-lesson` | Read all topics in a lesson |
| `create-course-draft` | Create new course as draft |
| `update-course-content` | Update existing content as draft |

## Available Routines

| Routine | Purpose |
|---------|---------|
| `generate-course-outline` | Generate and stage a course outline |
| `rewrite-lesson` | Rewrite a lesson in a different tone/length/level |

<HARD-GATE>
- ALL content is DRAFT. Never call releaseContent. Never suggest auto-publishing.
- Always get user approval before writing content to TI (both creates and updates).
- Never fabricate course IDs or topic IDs — always read them from the API first.
- Never discard existing content without explicit user permission.
</HARD-GATE>
