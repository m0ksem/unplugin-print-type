import { resolve } from 'path'
import { createUnplugin } from 'unplugin'
import { Project } from 'ts-morph'
import { UntypeCompiler } from './core/renderer/index'
import type { UntypePluginOptions } from './types'
import { extractTypeToUntype } from './core/extractTypesToUntype'

let project: Project
let compiler: UntypeCompiler

export default createUnplugin<UntypePluginOptions>(() => ({
  name: 'unplugin-untype',

  buildStart() {
    console.log(resolve('./tsconfig.json'))
    project = new Project({})

    // TODO: Move to options
    project.addSourceFilesAtPaths('./**/*{.d.ts,.ts}')
  },

  transformInclude(id) {
    return id.endsWith('main.ts')
  },
  transform(code, id) {
    compiler = new UntypeCompiler(project)

    const typesToUntype = extractTypeToUntype(code)

    const ast = project.getSourceFile(id)

    if (!ast)
      return

    const nodeMap = new Map()

    compiler.processTree(ast, id)

    typesToUntype.forEach((typeName) => {
      nodeMap.set(typeName, compiler.renderType(typeName))
    })

    for (const [type, untyped] of nodeMap) {
      code = code.replace(new RegExp(`Untype\\("${type}"\\)`, 'gm'), compiler.toUntypeObject(untyped))
    }

    return code
  },
}))
