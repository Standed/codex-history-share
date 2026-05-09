# codex-history-share

让 Codex 在切换 API provider、中转 API、ChatGPT 登录模式后，左侧边栏里的本地历史会话仍然可见。

这个项目基于 [`codex-provider-sync`](https://github.com/Dailin521/codex-provider-sync) 的底层修复能力，补上更适合日常使用的一层：

- `status`：查看当前 provider、历史会话分布、项目侧边栏可见性。
- `sync`：把本地历史会话同步到当前 provider，让侧边栏重新可见。
- `watch`：监听 `auth.json`、`config.toml`、`state_5.sqlite` 等变化，自动同步。
- `install-agent`：在 macOS 安装后台 LaunchAgent，开机/登录后自动 watch。
- `export`：导出 Markdown/JSON 索引，至少保证历史标题、项目、首条用户消息可检索。
- `restore`：从底层工具创建的备份中恢复。

## 能解决什么

Codex 的本地历史会话会带着 provider metadata。你从 ChatGPT 登录模式切到 API，或者从一个中转 provider 切到另一个 provider 后，旧会话可能从 Desktop 左侧边栏或 `/resume` 里消失。

多数情况下，文件没有丢，只是当前 provider 看不到旧 provider 的索引。本工具就是把这些本地索引同步到当前 provider。

## 不能承诺什么

本工具不会解密或重新加密 `encrypted_content`。

因此：旧会话通常可以重新显示在侧边栏，但如果它是用另一个账号/provider 生成的，加密内容可能无法在新 provider 下继续对话或 compact，可能报 `invalid_encrypted_content`。这种历史适合查看和参考，继续长期工作建议开新会话。

本工具也不会把 ChatGPT 网页版/官方 App 的云端聊天记录导入 Codex。它只处理本机 `~/.codex` 里的 Codex 历史。

## 安装

需要 Node.js 24+。

从 GitHub 直接安装：

```bash
npm install -g git+https://github.com/Standed/codex-history-share.git
codex-history status
```

或者使用安装脚本：

```bash
curl -fsSL https://raw.githubusercontent.com/Standed/codex-history-share/main/scripts/install.sh | bash
```

## 常用命令

手动同步一次：

```bash
codex-history sync
```

后台监听当前终端：

```bash
codex-history watch
```

安装 macOS 后台服务：

```bash
codex-history install-agent
```

停止后台服务：

```bash
codex-history uninstall-agent
```

导出历史索引：

```bash
codex-history export
```

恢复备份：

```bash
codex-history restore ~/.codex/backups_state/provider-sync/<timestamp>
```

## 日志

```text
~/.codex-history-share/watch.log
~/.codex-history-share/launchd.out.log
~/.codex-history-share/launchd.err.log
```

## 备份

每次 `sync` 都会通过 `codex-provider-sync` 创建备份：

```text
~/.codex/backups_state/provider-sync
```

## Codex Skill

仓库里带了一个 Skill：

```text
skills/codex-history-share
```

把这个目录复制到你的 Codex skills 目录后，agent 就能按固定流程帮用户诊断、同步和导出历史。
