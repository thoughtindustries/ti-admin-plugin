---
name: list-course-groups
description: "Action: List/search course groups from the TI catalog via GET /courseGroups. Supports cursor pagination, kind filter, and perPage."
---

# List Course Groups

This is an **Action** skill — a single, unambiguous API call. It is deterministic and narrowly scoped.

## Endpoint

`GET /incoming/v2/courseGroups`

## When to use

- Browsing or searching the course catalog.
- Finding a course group by title or kind before reading its structure.
- Paginating through all published content.

## Agent instructions

1. Accept optional filters: `perPage`, `cursor`, `kind`, `isTemplate`, `archived`.
2. Run `list-course-groups.js` with appropriate flags.
3. Return the list of course groups and pagination info (`pageInfo.cursor`).

## Run the script

```bash
node skills/actions/list-course-groups/list-course-groups.js
node skills/actions/list-course-groups/list-course-groups.js --perPage=10
node skills/actions/list-course-groups/list-course-groups.js --perPage=5 --cursor=Mg
node skills/actions/list-course-groups/list-course-groups.js --kind=courseGroup
```

<HARD-GATE>
Do not modify, create, or delete any content. This is a read-only action.
</HARD-GATE>
