import { createUnplugin } from 'unplugin'
import { Project } from 'ts-morph'
import type { UntypePluginOptions } from './types'
import { extractTypeToUntype } from './core/extractTypesToUntype'
import { createRenderer } from './core/renderer/createRenderer'

let project: Project

export default createUnplugin<UntypePluginOptions>(() => ({
  name: 'unplugin-untype',

  buildStart() {
    project = new Project({})

    // // TODO: Move to options
    project.addSourceFilesAtPaths('./**/*{.d.ts,.ts}')
  },

  transformInclude(id) {
    return id.endsWith('main.ts')
  },
  transform(code, id) {
    const renderer = createRenderer(project)
    const typesToUntype = extractTypeToUntype(code)

    renderer.addFile(id)

    for (const typeName of typesToUntype) {
      const untyped = renderer.renderTypeByName(typeName)
      code = code.replace(new RegExp(`Untype\\("${typeName}"\\)`, 'gm'), renderer.createUntypeObject(untyped))
    }

    return code
  },
}))
