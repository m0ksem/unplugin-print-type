/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FilterPattern } from '@rollup/pluginutils'

declare global {
  /**
 * Compiler macro. Will transform type to human readable string.
 *
 * @usage
 *
 * PrintType<User>()
 */
  function PrintType<T>(): string
}

export interface PrintTypePluginOptions {
  fnName: 'PrintType'

  /**
 * Rules to include transforming target.
 *
 * @default [/\.ts$/]
 */
  include?: FilterPattern

  /**
  * Rules to exclude transforming target.
  *
  * @default [/node_modules/, /\.git/]
  */
  exclude?: FilterPattern
}

export interface UntypeObject {
  definition: string
  name: string
  text: string
}
