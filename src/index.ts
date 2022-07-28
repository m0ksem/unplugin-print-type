import { resolve } from 'path'
import { createUnplugin } from 'unplugin'
import { Project } from 'ts-morph'
import { walkAst } from './core/walk-ast'
import type { Options } from './types'
import { extractTypeToUntype } from './core/extractTypesToUntype'
import { parseAst } from './core/parse-ast'
import { createUntypeFunction } from './core/create-untype-object'

let project: Project

export default createUnplugin<Options>(() => ({
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
    const typesToUntype = extractTypeToUntype(code)

    const ast = project.getSourceFile(id)

    if (!ast)
      return

    const nodeMap = new Map()

    walkAst(ast, (node) => {
      if (node.getKindName() === 'InterfaceDeclaration') {
        walkAst(node, (child) => {
          if (child.getKindName() !== 'Identifier') { return }
          if (!typesToUntype.includes(child.getText())) { return }

          nodeMap.set(child.getText(), parseAst(node))
        })
      }
    })

    for (const [type, untyped] of nodeMap) {
      code = code.replace(new RegExp(`Untype\\("${type}"\\)`, 'gm'), createUntypeFunction(untyped))
    }

    return code
  },
}))
