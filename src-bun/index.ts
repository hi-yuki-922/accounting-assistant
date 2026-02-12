type Command = {
  id: string,
  func: 'requestLLM'
  params?: Record<string, any>
}

type Response = {
  id: string
  success: boolean
  data?: any
  error?: string
}

const functions = {
  requestLLM: async (params?: any) => {}
}

const handleCommand = async (cmd: Command): Promise<Response> => {
  try {
    const handler = functions[cmd.func]
    if (!handler) {
      throw new Error(`不支持的函数：${cmd.func}`)
    }
    const data = await handler(cmd.params || {})
    return {
      id: cmd.id,
      success: true,
      data
    }
  } catch (e) {
    return {
      id: cmd.id,
      success: false,
      error: e instanceof Error ? e.message : "未知错误"
    }
  }
}

const main = async () => {
  const stdin = Bun.stdin.stream()
  const decoder = new TextDecoder()

  let buffer = ""

  for await (const chunk of stdin) {
    buffer += decoder.decode(chunk, {stream: true})

    const lines = buffer.split('\n');
    buffer = lines.pop() || "";

    for (let line of lines) {
      if (!line.trim()) continue
      try {
        const cmd: Command = JSON.parse(line)
        const res = await handleCommand(cmd)
        console.log(JSON.stringify(res))
      } catch (e) {
        const errorRes: Response = {
          id: crypto.randomUUID(),
          success: false,
          error: `解析指令失败：${e instanceof Error ? e.message : e}`
        }
        console.log(JSON.stringify(errorRes))
      }
    }
  }
}

main().catch(e => {
  console.error("sidecar 异常：",e)
  process.exit(1)
})

process.on("SIGTERM",() => {
  process.exit(0)
})
