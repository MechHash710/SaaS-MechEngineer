---
description: Analyze project Kanban status and generate structured AI prompts for next steps using the translate-to-prompt skill.
---

# Workflow: Analyze Kanban and Generate Prompts

## Overview
This workflow orchestrates the following actions:
1. Parse the current Kanban board (`project8-kanban-update.jsx`) to extract tasks and milestones.
2. Summarize project progress (completed, in‑progress, upcoming).
3. Feed the summary to the **translate‑to‑prompt** skill to produce well‑structured prompts for the next actions.
4. Output the generated prompts for the user to review.

## Steps
1. **Parse Kanban**
   ```bash
   python .agent/agent-orchestrator/scripts/parse_kanban.py Kanban/project8-kanban-update/project8-kanban-update.jsx
   # → creates tasks.json
   ```
2. **Generate Summary** (simple Python script could be added later; for now we use a placeholder command that reads `tasks.json` and builds a markdown summary).
   ```bash
   python -c "import json, sys; data=json.load(open('scripts/tasks.json'));\n   completed=[t for t in data if t['status']=='Done'];\n   inprog=[t for t in data if t['status']=='In Progress'];\n   upcoming=[t for t in data if t['status']=='To Do'];\n   print('# Project Progress Summary\n');\n   print('## Completed');\n   for t in completed: print(f"- {t['id']}: {t['title']}");\n   print('\n## In Progress');\n   for t in inprog: print(f"- {t['id']}: {t['title']}");\n   print('\n## Upcoming');\n   for t in upcoming: print(f"- {t['id']}: {t['title']}");" > project_summary.md
   ```
3. **Run Translate‑to‑Prompt Skill**
   Use the orchestrator to invoke the skill with the generated summary:
   ```bash
   claude-with-access-to-the-skill --skill .agent/translate-prompt-skill/SKILL.md --prompt "$(cat project_summary.md)"
   ```
   The skill will output a structured prompt ready for downstream AI tasks.
4. **Present Result**
   The workflow ends by printing the skill output to the console and saving it to `generated_prompt.md`.
   ```bash
   echo "$(claude-with-access-to-the-skill ... )" > generated_prompt.md
   cat generated_prompt.md
   ```

## Notes for the Orchestrator
- Ensure the **translate‑to‑prompt** skill is registered (its folder name is `translate-prompt-skill`).
- The orchestrator should acquire any necessary file locks before modifying `tasks.json` or `project_summary.md`.
- After generating the prompt, the orchestrator can dispatch further skills (e.g., code generation, documentation) based on the prompt content.

---
