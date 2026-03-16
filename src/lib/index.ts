import { invoke } from '@tauri-apps/api/core'
import type { Result } from 'neverthrow'
import { ok, err } from 'neverthrow'
import { isPromise, tryit } from 'radash'
export const tryResult = <T extends (...args: unknown[]) => unknown>(
  fn: T
): ((...args: Parameters<T>) => Result<ReturnType<T>, Error>) => {
  const safe = tryit(fn)

  return (...args: Parameters<T>): Result<ReturnType<T>, Error> => {
    const result = safe(...args)
    if (isPromise(result)) {
      return err(
        new Error(
          'tryResult can only execute synchronous functions. To execute asynchronous functions, use tryResultAsync.'
        )
      )
    }

    const [e, res] = result

    return e ? err(e) : ok(res)
  }
}

export const tryResultAsync = <
  T extends (...args: unknown[]) => Promise<unknown>,
>(
  fn: T
): ((...args: Parameters<T>) => Promise<Result<ReturnType<T>, Error>>) => {
  const safe = tryit(fn)

  return async (
    ...args: Parameters<T>
  ): Promise<Result<ReturnType<T>, Error>> => {
    const [e, res] = await safe(...args)
    return e ? err(e) : ok(res)
  }
}

export const parseJson = (str: string): Result<unknown, Error> => {
  const [e, result] = tryit(JSON.parse)(str) as
    | [Error, undefined]
    | [undefined, unknown]
  return e ? err(e) : ok(result)
}

export const tryCMD = async <T>(
  ...args: Parameters<typeof invoke>
): Promise<Result<T, Error>> => {
  const [e, res] = await tryit(invoke<T>)(...args)
  return e ? err(e) : ok(res)
}
