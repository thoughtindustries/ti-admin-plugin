# ti-admin-plugin

A Claude plugin for administering [Thought Industries](https://www.thoughtindustries.com) platforms. Browse your course catalog, author courses with AI assistance, rewrite lesson content, and manage your learning platform — all from Claude Code or Cursor.

Built on the TI **Incoming REST v2 API**. All write operations create **drafts only** — nothing is auto-published.

## Prerequisites

- **Node.js 18+** (the plugin scripts use native `fetch`)
- **Claude Code** or **Cursor** with Claude plugin support
- A Thought Industries instance with API access enabled
- A TI **Incoming API key** (see [Getting your API key](#getting-your-api-key))

## Installation

### From the Claude Code UI

1. Open Claude Code.
2. Go to **Claude > Customize > Plugins > Personal > Add marketplace**.
3. Enter: `thoughtindustries/ti-admin-plugin`
4. Install the plugin: `/plugin install ti-admin-plugin@ti-plugins`

### From the Claude Code CLI

```bash
# Add the marketplace
/plugin marketplace add thoughtindustries/ti-admin-plugin

# Install the plugin
/plugin install ti-admin-plugin@ti-plugins
```

### Cursor

Clone the repo and add the path as a plugin source in your Cursor settings:

```bash
git clone https://github.com/thoughtindustries/ti-admin-plugin.git
```

## Getting your API key

1. Log in to your Thought Industries instance as an admin.
2. Navigate to **`{your-instance-url}/learn/manager/security-settings`**.
3. Under the **API** section, copy your **Incoming API key**.
4. Store it securely — you'll provide it to the plugin on first use.

## Configuration

The plugin needs two values: your **TI instance URL** and your **API key**. You can provide them in three ways (highest priority wins):

### Option 1 — Environment variables (recommended for CI/scripting)

```bash
export TI_BASE_URL="https://your-instance.thoughtindustries.com"
export TI_API_KEY="your-api-key-here"
```

### Option 2 — CLI flags (per-command override)

```bash
node skills/actions/list-course-groups/list-course-groups.js \
  --base-url=https://your-instance.thoughtindustries.com \
  --api-key=your-api-key-here
```

### Option 3 — Automatic caching (recommended for interactive use)

On the **first run**, provide credentials via env vars or flags. The plugin caches them in `~/.ti-admin-v3/config.json` and reuses them for all subsequent calls. No need to re-enter.

To update cached credentials, simply set new env vars or flags — the cache refreshes automatically.

### Optional: user identity for analytics

```bash
export TI_USER_ID="your-email@company.com"
# or
export TI_USER_EMAIL="your-email@company.com"
```

This attaches a stable user identifier to analytics events (see [Analytics](#analytics)).

## Your first experience

Once installed and configured, just talk to Claude. Here's what to expect:

### 1. Browse your catalog

> **You:** "Show me my courses"

Claude activates the `list-course-groups` action, calls your TI API, and returns your course catalog with titles, IDs, and types.

### 2. Inspect a course

> **You:** "Show me the structure of that first course"

Claude fetches the full course tree — sections, lessons, and topics — so you can see the entire hierarchy at a glance.

### 3. Read lesson content

> **You:** "What does lesson 2 say?"

Claude reads all topics in the lesson and shows you the actual HTML content.

### 4. Create a new course

> **You:** "Help me build a course on API security best practices"

Claude activates the `author-course` playbook — a multi-phase workflow:
1. **Discovery** — asks about audience, objectives, and tone
2. **Outline** — generates a structured outline and asks for your approval
3. **Content writing** — writes each topic and shows it to you for review
4. **Refinement** — offers tone adjustments, length changes, consistency checks
5. **Summary** — presents the final course structure

Every piece of content is created as a **draft**. Nothing goes live until you publish it manually in the TI admin UI.

### 5. Rewrite existing content

> **You:** "Rewrite that lesson in a more conversational tone, aimed at non-technical managers"

Claude reads the current content, rewrites every topic, shows you a before/after comparison, and waits for your approval before updating.

## What's included

The plugin is organized into three tiers of increasing autonomy:

### Actions — single API calls

| Action | Endpoint | Description |
|--------|----------|-------------|
| `list-course-groups` | `GET /courseGroups` | Browse/search the course catalog |
| `get-course-group` | `GET /courseGroups/{id}` | Fetch course group metadata |
| `get-course-structure` | `GET /courses/{id}/structure` | Full course tree (sections → lessons → topics) |
| `get-section` | `GET /sections/{id}` | Single section details |
| `get-lesson` | `GET /lessons/{id}` | Single lesson details |
| `get-topic` | `GET /topics/{id}` | Single topic with body content |
| `get-topics-by-lesson` | `GET /topics/lesson/{id}` | All topics in a lesson |
| `create-course-draft` | `POST /content/course/create` | Create course(s) as draft |
| `update-course-content` | `PUT /content/course/update` | Update existing content as draft |

### Routines — fixed sequences

| Routine | Description |
|---------|-------------|
| `generate-course-outline` | Elicit topic → generate outline → confirm → create draft |
| `rewrite-lesson` | Read lesson → rewrite topics → show diff → update on approval |

### Playbooks — strategic workflows

| Playbook | Description |
|----------|-------------|
| `author-course` | Full course authoring: discovery → outline → write → refine → summary |

For a deep dive into the tier model, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Safety

Every skill enforces **hard gates** — non-negotiable constraints baked into the skill definitions:

- **All content stays as draft.** The plugin never calls `releaseContent`. Publishing happens manually in the TI admin UI.
- **User approval required before writes.** Routines and Playbooks always show you what they're about to create or update and wait for explicit confirmation.
- **No fabricated IDs.** The agent always reads IDs from the API — it never invents them.
- **No content destruction.** Existing content is never discarded without your explicit permission.

## Analytics

The plugin sends lightweight, anonymous usage events to Google Analytics (GA4) to help understand which skills are used and how. Events include:

- Which skill was called (`skill_name`, `skill_tier`)
- How it was invoked (`invocation_source`: user-requested vs. model-selected)
- API endpoint and status code
- TI instance hostname (no credentials or content are ever sent)

**To opt out:**

```bash
export TI_ANALYTICS_DISABLED=1
```

Analytics is also silently disabled if no `GA4_MEASUREMENT_ID` environment variable is set.

## Project structure

```
ti-admin-plugin/
├── .claude-plugin/
│   ├── plugin.json          # Claude plugin manifest
│   └── marketplace.json     # Marketplace catalog for plugin discovery
├── lib/
│   ├── analytics.mjs        # GA4 event tracking
│   ├── config.mjs           # Credential resolution and caching
│   └── http-common.mjs      # Shared HTTP helpers, arg parsing
├── skills/
│   ├── actions/              # Single API call skills
│   │   ├── list-course-groups/
│   │   ├── get-course-group/
│   │   ├── get-course-structure/
│   │   ├── get-section/
│   │   ├── get-lesson/
│   │   ├── get-topic/
│   │   ├── get-topics-by-lesson/
│   │   ├── create-course-draft/
│   │   └── update-course-content/
│   ├── routines/             # Fixed sequences of Actions
│   │   ├── generate-course-outline/
│   │   └── rewrite-lesson/
│   └── playbooks/            # Strategic workflows
│       └── author-course/
├── ARCHITECTURE.md           # Deep dive into the tier model
├── LICENSE                   # MIT
├── package.json
└── README.md
```

## License

[MIT](LICENSE) — Thought Industries, Inc.
