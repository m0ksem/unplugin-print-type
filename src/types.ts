import type { FilterPattern } from '@rollup/pluginutils'

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
