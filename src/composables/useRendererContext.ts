import type { PrintTypePluginOptions } from '../types'

const defaultOptions: PrintTypePluginOptions = {
  fnName: 'PrintType',
  exclude: [/node_modules/, /\.git/],
  include: [/.ts$/],
  aliases: {
    '@': './src',
    '~': './src',
  },
  moduleDirs: ['node_modules', '../node_modules'],
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
  return scope.context
}

export const useRendererContext = (): RendererContext => scope.context
