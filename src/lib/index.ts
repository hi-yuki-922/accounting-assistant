import { isPromise, tryit } from 'radash'
import { ok, err, Result } from 'neverthrow'
import { invoke } from "@tauri-apps/api/core"
export function tryResult<T extends (...args:any[]) => any>(fn: T) {
  const safe = tryit(fn)

  return (...args: Parameters<T>): Result<ReturnType<T>,Error> => {
    const result = safe(...args)
    if (isPromise(result)) return err(new Error("tryResult can only execute synchronous functions. To execute asynchronous functions, use tryResultAsync."))

    const [e, res] = result

    return e ? err(e) : ok(res)
  }
}

export function tryResultAsync<T extends (...args: any[]) => Promise<any>>(fn: T) {
  const safe = tryit(fn)

  return async (...args: Parameters<T>): Promise<Result<ReturnType<T>, Error>> => {
    const [e, res] = await safe(...args)
    return e ? err(e) : ok(res)
  }
}

export function parseJson(str: string) {
  const [e, result] = tryit(JSON.parse)(str) as [Error,undefined] | [undefined, any]
  return e ? err(e) : ok(result)
}

export async function tryCMD<T>(...args: Parameters<typeof invoke>): Promise<Result<T,Error>> {
  const [e,res] = await tryit(invoke<T>)(...args)
  return e ? err(e) : ok(res)
}
