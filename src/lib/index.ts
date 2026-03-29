import { invoke } from '@tauri-apps/api/core'
import type { Result } from 'neverthrow'
import { ok, err } from 'neverthrow'
import { isPromise, tryit } from 'radash'

import type { Safe, SafeAsync, TryCMD } from '@/types/lib.ts'
// oxlint-disable-next-line typescript/no-explicit-any
export const tryResult = <T extends (...args: any[]) => any>(
  fn: T
): ((...args: Parameters<T>) => Safe<ReturnType<T>>) => {
  const safe = tryit(fn)

  return (...args: Parameters<T>) => {
    const result = safe(...args)
    if (isPromise(result)) {
      return err(
        new Error(
          'tryResult can only execute synchronous functions. To execute asynchronous functions, use tryResultAsync.'
        )
      )
    }

    const [e, res] = result

    return e ? err(e) : ok(res as ReturnType<T>)
  }
}
// Promise<Result<Awaited<ReturnType<T>>, Error>>
export const tryResultAsync = <
  // oxlint-disable-next-line typescript/no-explicit-any
  T extends (...args: any[]) => Promise<any>,
>(
  fn: T
): ((...args: Parameters<T>) => SafeAsync<Awaited<ReturnType<T>>>) => {
  const safe = tryit<Parameters<T>, Promise<ReturnType<T>>>(fn)

  return async (...args) => {
    const [e, res] = await safe(...args)
    return e ? err(e) : ok(res)
  }
}

// oxlint-disable-next-line typescript/no-explicit-any
export const parseJson = (str: string): Result<any, Error> => {
  const [e, result] = tryit(JSON.parse)(str) as
    | [Error, undefined]
    // oxlint-disable-next-line typescript/no-explicit-any
    | [undefined, any]
  return e ? err(e) : ok(result)
}

export const tryCMD: TryCMD = async <T>(
  ...args: Parameters<typeof invoke>
): Promise<Result<T, Error>> => {
  const [e, res] = await tryit(invoke<T>)(...args)
  return e ? err(e as Error) : ok(res as T)
}
