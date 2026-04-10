---
name: translate-to-prompt
description: Convert user-provided text into a clean, well‑structured prompt suitable for AI models. Trigger on any request to "turn this into a prompt", "write a prompt for", or similar phrasing.
---

# Translate‑to‑Prompt Skill

## Purpose
This skill takes free‑form user text (descriptions, requirements, notes) and produces a concise, unambiguous prompt that can be fed directly to an LLM or other AI tool. It ensures:
- Clear intent
- Proper formatting (sections, bullet points, code fences when needed)
- Inclusion of relevant context (e.g., file names, data samples)
- No ambiguous language

## When to Trigger
- The user asks to *create*, *write*, *generate*, or *translate* text **into a prompt**.
- Phrases like "turn this into a prompt", "write a prompt for", "prompt me for", or "convert my notes to a prompt".
- The request involves multiple steps or details that would benefit from a structured prompt.

## Expected Output Format
```markdown
# Prompt Title (optional)

## Goal
<Brief description of the task>

## Instructions
- Step‑by‑step actions the model should perform
- Any required input format
- Desired output format

## Context (if provided)
- Files, data snippets, or references

## Example
```
<generated prompt>
```
```

## Usage Example
User: "I have a CSV with sales data and I need a summary of total revenue per region, sorted descending. Turn this into a prompt."
Skill Output:
```markdown
# Summarize Sales CSV

## Goal
Generate a summary of total revenue per region from the provided CSV, sorted from highest to lowest revenue.

## Instructions
1. Load the CSV file.
2. Group rows by the `region` column.
3. Sum the `revenue` column for each group.
4. Sort the results in descending order of revenue.
5. Output a table with two columns: `region` and `total_revenue`.

## Context
- Input file: `sales_data.csv`
- Columns: `region`, `revenue`
```
```

## Implementation Steps
1. **Capture Intent** – Identify the core task and any constraints.
2. **Extract Context** – Pull out file names, data formats, or examples the user mentions.
3. **Structure Prompt** – Fill the template above with the extracted information.
4. **Validate** – Ensure the prompt is unambiguous and contains all necessary details.
5. **Return Prompt** – Output the formatted markdown.

## Test Cases (to be added by the user)
- Convert a description of a data‑visualization request into a prompt.
- Translate a multi‑step software‑setup description into a prompt.
- Turn a natural‑language request for a poem style into a prompt.

## Notes for the Orchestrator
- After generating the prompt, the orchestrator can feed it to the appropriate downstream skill (e.g., code‑generation, data‑analysis).
- This skill is lightweight and does not require external dependencies.
- Keep the description pushy so the orchestrator invokes it whenever relevant.

---

*End of SKILL.md*
