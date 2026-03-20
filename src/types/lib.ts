import type { Result } from "neverthrow";
import type { invoke } from "@tauri-apps/api/core";

export type  SafeAsync<T> = Promise<Result<T, Error>>

export type Safe<T> = Result<T, Error>

export type TryCMD = {
  (...args: Parameters<typeof invoke>): SafeAsync<undefined>
  <T>(...args: Parameters<typeof invoke>): SafeAsync<T>
}

