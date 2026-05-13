---
name: get-course-structure
description: "Action: Fetch the full tree (sections, lessons, topics) of a course via GET /courses/{courseId}/structure."
---

# Get Course Structure

This is an **Action** skill — a single, unambiguous API call. It is deterministic and narrowly scoped.

## Endpoint

`GET /incoming/v2/courses/{courseId}/structure`

## When to use

- Reading the full hierarchy of a course in one call (sections → lessons → topics).
- Understanding the layout before updating or rewriting content.
- Generating a table of contents from an existing course.

## Agent instructions

1. Require the course `courseId` (UUID — this is the course ID within a course group, not the course group ID).
2. Run `get-course-structure.js --id=UUID`.
3. Return the nested structure.

## Run the script

```bash
node skills/actions/get-course-structure/get-course-structure.js --id=COURSE_UUID
```

<HARD-GATE>
Do not modify, create, or delete any content. This is a read-only action.
</HARD-GATE>
