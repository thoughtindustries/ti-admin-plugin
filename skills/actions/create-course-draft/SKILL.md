---
name: create-course-draft
description: "Action: Create a new course (courseGroup, microCourse, article) as a draft via POST /content/course/create. Content is never auto-published."
---

# Create Course Draft

This is an **Action** skill — a single, unambiguous API call. It is deterministic and narrowly scoped.

## Endpoint

`POST /incoming/v2/content/course/create`

## When to use

- Creating a new course (courseGroup, microCourse, article, SCORM/xAPI) from a JSON payload.
- Staging AI-generated course outlines as drafts in the TI platform.

## Agent instructions

1. Gather required fields: `title`, `kind` (courseGroup, microCourse, article).
2. For courseGroup kind, optionally include nested `sections` → `lessons` → `topics`.
3. Run `create-course-draft.js --dry-run --file=course.json` first to validate.
4. Then run without `--dry-run` to create.
5. The API returns course IDs. For SCORM uploads, a `backgroundJob` may be returned — poll with `GET /jobs/{id}`.

## Limits

- Max **100 courses** per request (`courseAttributes` array length).
- Max **25 child entities** per course (sections + lessons + topics combined — confirm against live docs).

## Run the script

```bash
node skills/actions/create-course-draft/create-course-draft.js --dry-run --file=course.json
node skills/actions/create-course-draft/create-course-draft.js --file=course.json
node skills/actions/create-course-draft/create-course-draft.js --json='{"title":"My Course","kind":"courseGroup"}'
```

## Payload shapes

Single course:
```json
{ "title": "Intro to APIs", "kind": "courseGroup", "description": "..." }
```

With nested structure:
```json
{
  "title": "Intro to APIs",
  "kind": "courseGroup",
  "sections": [
    {
      "title": "Getting Started",
      "lessons": [
        {
          "title": "What is an API?",
          "openType": "text",
          "topics": [
            { "title": "Overview", "body": "<p>An API is...</p>" }
          ]
        }
      ]
    }
  ]
}
```

<HARD-GATE>
- NEVER call PUT /content/{id}/releaseContent. All content created by this action stays as a DRAFT until a human author publishes it manually in the TI admin UI.
- NEVER auto-publish or suggest publishing generated content.
</HARD-GATE>
