/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FilterPattern } from '@rollup/pluginutils'

declare global {
  /**
 * Compiler macro. Will transform type to human readable string.
 *
 * @example
 *
 * ```ts
 * type User = { name: string, age: number }
 * const userType = PrintType<User>()
 * console.log(userType) // '{ name: string, age: number }'
 * ```
 */
  function PrintType<T>(): string
}

export type PrintTypePluginOptions = Partial<{
  fnName: 'PrintType'

  /**
  * Rules to include transforming target.
  *
  * @default [/\.ts$/]
  */
  include: FilterPattern

  /**
  * Rules to exclude transforming target.
  *
  * @default [/node_modules/]
  */
  exclude: FilterPattern

  /**
   * If you have type imported from non-relative path, you can use this option to specify alias. By default all absolute imports will not be deeply printed.
   */
  aliases: {
    [key: string]: string
  }

  moduleDirs: string[]
}>

export interface UntypeObject {
  definition: string
  name: string
  text: string
}
