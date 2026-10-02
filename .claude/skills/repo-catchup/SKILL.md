---
name: repo-catchup
description: Use for repository instruction-manifest workflows. repo catchup verifies or maintains CLAUDE.md/agent instructions, checks repo evidence, and responds to the user in Vietnamese.
effort: xhigh
---

# Repo Catchup

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

Use this skill when the user asks to catch up with a repository/branch, inspect what changed since the last work session, compare with main/origin, or decide whether the repository instruction manifest is outdated.

## Procedure

1. Inspect repository state:
   - `git status --short`
   - current branch
   - current HEAD commit
   - configured remotes
2. Identify the comparison base:
   - Use the previous known working marker if the conversation or repo documentation clearly provides one.
   - Otherwise inspect the 20 most recent commits.
   - Also compare current branch against `origin/main`, `main`, `origin/master`, or `master`, choosing the most appropriate available base.
3. Inspect changes:
   - commit list
   - diff summary
   - changed files
   - important implementation/config/schema/API files
4. Read important changed files before making claims.
5. Check whether build/test/run commands changed by looking at package manifests, solution/project files, Makefile/justfile, Docker/Compose files, CI workflows, and README/docs.
6. Check whether new coding conventions or patterns appeared.
7. Check whether `CLAUDE.md`, `.claude/`, or workflows are outdated. (⛔ `AGENTS.md` and `.clinerules/` were removed workspace-wide — do not look for them and do not recreate them.)
8. Do not edit anything unless the user explicitly approves an update.

## Vietnamese Response Format

Return the final answer in Vietnamese with this structure:

```markdown
## Catchup branch hiện tại

### Git state

- Branch: ...
- HEAD: ...
- Working tree: ...

### 1. Kiến trúc/module vừa thay đổi

- ...

### 2. API/DB/config/env bị ảnh hưởng

- ...

### 3. Build/test/run command có đổi không

- ...

### 4. Coding convention hoặc pattern mới

- ...

### 5. Rủi ro khi tiếp tục sửa code

- ...

### 6. Manifest agent hiện tại có lỗi thời không

- ...

### Đề xuất cập nhật manifest

- Cần/không cần cập nhật: ...
- Nội dung cần thêm/sửa nếu có: ...

### Trạng thái file

Chưa sửa file.
```
