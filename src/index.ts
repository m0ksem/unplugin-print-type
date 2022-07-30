import { createUnplugin } from 'unplugin'
import { Project } from 'ts-morph'
import { createFilter } from '@rollup/pluginutils'
import { createRendererContext } from './composables/useRendererContext'
import type { PrintTypePluginOptions } from './types'
import { createRenderer } from './core/renderer/createRenderer'

export default createUnplugin<Partial<PrintTypePluginOptions>>((options) => {
  const ctx = createRendererContext(options)
  const filter = createFilter(ctx.include, ctx.exclude)

  const project = new Project()
  const printTypeFunctionCallRegex = new RegExp(`${ctx.fnName}<.*>\(\)`, 'gm')

  return {
    name: 'unplugin-print-type',

    enforce: 'pre',

    transformInclude(id) {
      return filter(id)
    },

    transform(code, id) {
      if (!printTypeFunctionCallRegex.test(code)) { return }

      const renderer = createRenderer(project)

      project.createSourceFile(id, code, { overwrite: true })
      renderer.addFile(id)

      const typeNames = [...renderer.typesToPrint.keys()]

      for (const typeToPrint of typeNames) {
        const untyped = renderer.renderTypeByName(typeToPrint)
        code = code.replace(new RegExp(`${ctx.fnName}<${typeToPrint}>\\(\\)`, 'gm'), renderer.createUntypeObject(untyped))
      }

      return code
    },
  }
})
