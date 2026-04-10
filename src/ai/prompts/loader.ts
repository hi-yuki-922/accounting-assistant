/**
 * 提示词加载与组合
 * 使用 tauri-plugin-fs 读取 Markdown 文件，按规则组合为完整系统提示词
 */

import { BaseDirectory, readTextFile } from '@tauri-apps/plugin-fs'

/**
 * 提示词文件路径配置
 */
const PROMPT_FILES = {
  shared: {
    base: 'prompts/shared/base.md',
    guardrails: 'prompts/shared/guardrails.md',
    domainKnowledge: 'prompts/shared/domain-knowledge.md',
  },
  agents: {
    teamLeader: 'prompts/agents/team-leader.md',
  },
} as const

/**
 * 从资源目录加载单个提示词文件
 * @param path - 相对于 $RESOURCE 的文件路径
 * @returns 文件内容，文件不存在或为空时返回空字符串
 */
export const loadPromptFile = async (path: string): Promise<string> => {
  try {
    const content = await readTextFile(path, {
      baseDir: BaseDirectory.Resource,
    })
    return content.trim()
  } catch (error) {
    throw new Error(
      `加载提示词文件失败: ${path} — ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    )
  }
}

/**
 * 加载并组合事务组长的系统提示词
 * 按顺序拼接：base + guardrails + domain-knowledge + team-leader
 * @returns 完整的系统提示词字符串
 */
export const loadTeamLeaderPrompt = async (): Promise<string> => {
  const parts = await Promise.all([
    loadPromptFile(PROMPT_FILES.shared.base),
    loadPromptFile(PROMPT_FILES.shared.guardrails),
    loadPromptFile(PROMPT_FILES.shared.domainKnowledge),
    loadPromptFile(PROMPT_FILES.agents.teamLeader),
  ])

  return parts.filter(Boolean).join('\n\n')
}
