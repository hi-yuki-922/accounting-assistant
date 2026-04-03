$LibDir = Resolve-Path (Join-Path $PSScriptRoot "..\.obsidian-lib")

$LibDir = $LibDir.Path

& npx.cmd @bitbonsai/mcpvault@latest "$LibDir"
