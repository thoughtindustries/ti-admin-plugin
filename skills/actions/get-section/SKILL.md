---
name: get-section
description: "Action: Fetch a single section by ID via GET /sections/{id}."
---

# Get Section

This is an **Action** skill — a single, unambiguous API call. It is deterministic and narrowly scoped.

## Endpoint

`GET /incoming/v2/sections/{id}`

## When to use

- Reading details of a specific section (module) within a course.

## Agent instructions

1. Require the section `id` (UUID).
2. Run `get-section.js --id=UUID`.
3. Return the section object.

## Run the script

```bash
node skills/actions/get-section/get-section.js --id=SECTION_UUID
```

<HARD-GATE>
Do not modify, create, or delete any content. This is a read-only action.
</HARD-GATE>
