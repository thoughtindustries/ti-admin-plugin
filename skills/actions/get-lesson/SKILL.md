---
name: get-lesson
description: "Action: Fetch a single lesson by ID via GET /lessons/{id}."
---

# Get Lesson

This is an **Action** skill — a single, unambiguous API call. It is deterministic and narrowly scoped.

## Endpoint

`GET /incoming/v2/lessons/{id}`

## When to use

- Reading details of a specific lesson within a section.
- Checking lesson metadata (title, openType, position) before updating.

## Agent instructions

1. Require the lesson `id` (UUID).
2. Run `get-lesson.js --id=UUID`.
3. Return the lesson object.

## Run the script

```bash
node skills/actions/get-lesson/get-lesson.js --id=LESSON_UUID
```

<HARD-GATE>
Do not modify, create, or delete any content. This is a read-only action.
</HARD-GATE>
