---
name: get-course-group
description: "Action: Fetch a single course group by ID via GET /courseGroups/{id}. Returns metadata, settings, and publishing state."
---

# Get Course Group

This is an **Action** skill — a single, unambiguous API call. It is deterministic and narrowly scoped.

## Endpoint

`GET /incoming/v2/courseGroups/{id}`

## When to use

- Retrieving metadata for a specific course group before reading its structure.
- Checking publishing state, slug, or settings of a course group.

## Agent instructions

1. Require the course group `id` (UUID).
2. Run `get-course-group.js --id=UUID`.
3. Return the full course group object.

## Run the script

```bash
node skills/actions/get-course-group/get-course-group.js --id=COURSE_GROUP_UUID
```

<HARD-GATE>
Do not modify, create, or delete any content. This is a read-only action.
</HARD-GATE>
