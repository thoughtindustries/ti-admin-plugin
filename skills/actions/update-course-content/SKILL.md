---
name: update-course-content
description: "Action: Update existing course content (topics, lessons, sections) by UUID via PUT /content/course/update. Content stays as draft."
---

# Update Course Content

This is an **Action** skill — a single, unambiguous API call. It is deterministic and narrowly scoped.

## Endpoint

`PUT /incoming/v2/content/course/update`

## When to use

- Updating the body of existing topics (e.g., after rewriting a lesson).
- Changing titles, positions, or metadata of sections/lessons/topics.
- Adding new child nodes (omit `id` to create under an existing parent).

## Agent instructions

1. All entities being updated must have their `id` (UUID). Use read actions first to obtain IDs.
2. New child nodes (no `id`) are created under the parent whose `id` is specified.
3. Run `update-course-content.js --dry-run --file=update.json` first to validate.
4. Confirm `restartProgress` semantics with the user if replacing SCORM on an existing topic.

## Limits

- The update payload is an **object** (not an array like create). It contains optional arrays: `courseGroups`, `courses`, `sections`, `lessons`, `topics`.

## Run the script

```bash
node skills/actions/update-course-content/update-course-content.js --dry-run --file=update.json
node skills/actions/update-course-content/update-course-content.js --file=update.json
```

## Payload shape

```json
{
  "topics": [
    { "id": "TOPIC_UUID", "body": "<p>Updated content here</p>" }
  ]
}
```

Or with explicit wrapper:
```json
{
  "courseAttributes": {
    "topics": [
      { "id": "TOPIC_UUID", "title": "New Title", "body": "<p>...</p>" }
    ]
  }
}
```

<HARD-GATE>
- NEVER call PUT /content/{id}/releaseContent. All content updated by this action stays as a DRAFT until a human author publishes it manually in the TI admin UI.
- NEVER auto-publish or suggest publishing generated content.
</HARD-GATE>
