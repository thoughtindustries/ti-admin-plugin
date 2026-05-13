---
name: get-topics-by-lesson
description: "Action: Fetch all topics under a lesson via GET /topics/lesson/{lessonId}. Returns topic list with body content."
---

# Get Topics by Lesson

This is an **Action** skill — a single, unambiguous API call. It is deterministic and narrowly scoped.

## Endpoint

`GET /incoming/v2/topics/lesson/{lessonId}`

## When to use

- Reading all topics (content blocks) within a specific lesson at once.
- Preparing to rewrite a lesson — read all its topics before generating new content.

## Agent instructions

1. Require the `lessonId` (UUID).
2. Run `get-topics-by-lesson.js --lessonId=UUID`.
3. Return the array of topic objects with their body content.

## Run the script

```bash
node skills/actions/get-topics-by-lesson/get-topics-by-lesson.js --lessonId=LESSON_UUID
```

<HARD-GATE>
Do not modify, create, or delete any content. This is a read-only action.
</HARD-GATE>
