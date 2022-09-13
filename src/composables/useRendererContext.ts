import { createFilter } from '@rollup/pluginutils'
import type { PrintTypePluginOptions } from '../types'

interface RuntimeContext {
  filter: ReturnType<typeof createFilter>
}

const defaultOptions: PrintTypePluginOptions & RuntimeContext = {
  fnName: 'PrintType',
  exclude: [/node_modules/],
  include: [/.ts$/, /.d.ts$/],
  aliases: {
    '@': './src',
    '~': './src',
  },
  moduleDirs: ['node_modules', '../node_modules'],

  filter: createFilter([]),
}

const scope = {
  context: {
    ...defaultOptions,
  },
}

export type RendererContext = (typeof scope)['context']

export const createRendererContext = (context?: Partial<PrintTypePluginOptions>) => {
  scope.context = {
    ...scope.context,
    ...context,
    aliases: {
      ...defaultOptions.aliases,
      ...(context?.aliases || {}),
    },
  }

  scope.context.filter = createFilter(scope.context.include, scope.context.exclude)

  return scope.context
}

export const useRendererContext = (): RendererContext => scope.context
