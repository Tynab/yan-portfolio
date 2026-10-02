---
name: repo-audit
description: Use for repository instruction-manifest workflows. repo audit verifies or maintains CLAUDE.md/agent instructions, checks repo evidence, and responds to the user in Vietnamese.
effort: xhigh
---

# Repo Manifest Audit

## Global Output Contract

- Write all final responses to the user in Vietnamese.
- Keep the skill instructions and internal procedure in English.
- Do not expose hidden reasoning. Show only concise findings, evidence, decisions, and next actions.
- Do not modify files when the user says "do not edit", "read only", "chưa sửa file", "chưa update", or equivalent.
- Before editing anything, inspect `git status --short` and avoid overwriting user changes.
- Never run destructive commands such as `git reset --hard`, `git clean`, deleting files, migration rollback, force push, or mass formatting unless the user explicitly approves that exact action.
- Do not invent build/test/run commands. Only claim commands after verifying them from repository files such as README, package manifests, solution/project files, Makefile, justfile, Docker/Compose files, CI config, scripts, or existing documentation.
- If a command cannot be verified, say that it needs verification instead of presenting it as fact.
- Separate verified facts from assumptions.

## Purpose

Use this skill when the user asks to audit, verify, shorten, or correct the repository instruction manifest for an AI coding agent, such as `CLAUDE.md` or `.claude/CLAUDE.md`. (⛔ `AGENTS.md` and `.clinerules/` were removed workspace-wide on 2026-07-30/2026-08-16 — do not target them and do not recreate them.)

## Target Selection

1. Prefer the manifest explicitly named by the user.
2. If none is named:
   - For Claude Code, use `CLAUDE.md` or `.claude/CLAUDE.md`.
3. If multiple manifests exist, explain which ones were found and audit the one most likely to affect the current agent.

## Procedure

1. Read the current manifest.
2. Inspect the repository structure without editing:
   - top-level files and directories
   - package/build manifests
   - solution/project files
   - README or docs
   - CI workflows
   - Docker/Compose files
   - test directories and scripts
   - environment/config templates
3. Verify each claim in the manifest against actual repository evidence.
4. Mark each claim as:
   - Verified
   - Possibly wrong or speculative
   - Missing
   - Too verbose or not useful for every session
5. Draft a shorter replacement manifest that contains only durable, verified, agent-useful information.

## Vietnamese Response Format

Return the final answer in Vietnamese with this structure:

````markdown
## Kết quả audit

### 1. Phần đúng

- ...

### 2. Phần có thể sai hoặc đang suy đoán

- ...

### 3. Phần còn thiếu

- ...

### 4. Bản đề xuất mới

```md
# <CLAUDE.md title>

...
```
````

### 5. Trạng thái file

Chưa sửa file.

```

```
