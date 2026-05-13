---
name: get-topic
description: "Action: Fetch a single topic by ID via GET /topics/{id}. Returns the topic including its body content (HTML)."
---

# Get Topic

This is an **Action** skill — a single, unambiguous API call. It is deterministic and narrowly scoped.

## Endpoint

`GET /incoming/v2/topics/{id}`

## When to use

- Reading the full content body of a specific topic (the actual lesson text/HTML).
- Inspecting a topic's type, title, or content before rewriting.

## Agent instructions

1. Require the topic `id` (UUID).
2. Run `get-topic.js --id=UUID`.
3. Return the topic object including its body content.

## Run the script

```bash
node skills/actions/get-topic/get-topic.js --id=TOPIC_UUID
```

<HARD-GATE>
Do not modify, create, or delete any content. This is a read-only action.
</HARD-GATE>
