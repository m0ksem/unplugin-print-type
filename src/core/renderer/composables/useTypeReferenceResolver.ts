import { dirname, resolve } from 'path'
import type { Node, Project } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'
import { unQuote } from '../../extractTypesToUntype'
import { getNodeChildren, nodeName, nodeNameOrThrow, nodeType } from '../node-getters'
import { walk } from '../../walk-ast'
import type { RendererContext } from '../../../composables/useRendererContext'
import { useRendererContext } from '../../../composables/useRendererContext'

export const isNodeImport = (node: Node) => {
  return node && node.getKind() === SyntaxKind.ImportDeclaration
}

export const isNodeTypeDeclaration = (node: Node) => {
  return [
    SyntaxKind.TypeAliasDeclaration,
    SyntaxKind.InterfaceDeclaration,
  ].includes(node.getKind())
}

export const isNodeTypeReference = (node: Node) => {
  return node && node.getKind() === SyntaxKind.TypeReference
}

export const isNodePrintTypeFunction = (node: Node, options: RendererContext) => {
  if (node.getKind() !== SyntaxKind.CallExpression) { return false }
  const fnName = nodeName(node)
  if (fnName === options.fnName) { return true }
}

/** Allow to resolve type reference from file or imports */
export const useTypeReferenceResolver = (project: Project) => {
  const importPaths = new Map<string, string>()
  const declarations = new Map<string, Node>()
  const typesToPrint = new Map<string, Node>()

  const processImport = (node: Node, filePath: string) => {
    const path = getNodeChildren(node).find((node: { getKind: () => SyntaxKind }) => node.getKind() === SyntaxKind.StringLiteral)?.getText()

    walk(node, (child) => {
      if (child.getKind() === SyntaxKind.ImportSpecifier) {
        const name = nodeNameOrThrow(child)
        importPaths.set(name, resolve(dirname(filePath), `${unQuote(path!)}.ts`))
      }
    })
  }

  const addFileToContext = (node: Node, filePath: string) => {
    const options = useRendererContext()

    walk(node, (child) => {
      if (!child) { return }

      if (isNodeImport(child)) {
        processImport(child, filePath)
      }
      if (isNodeTypeDeclaration(child)) {
        declarations.set(nodeName(child)!, child)
      }
      if (isNodePrintTypeFunction(child, options)) {
        typesToPrint.set(nodeName(nodeType(child))!, child)
      }
    })
  }

  const resolveImport = (path: string) => {
    // TODO: Not sure how to handle types from .tsx, .d.ts etc.
    if (path.endsWith('.ts.ts')) {
      path = path.slice(0, -3)
    }
    const file = project.addSourceFileAtPathIfExists(path)
    if (file) {
      addFileToContext(file, path)
    }
  }

  const resolveTypeReference = (node: Node) => {
    const name = nodeName(node)!

    const importPath = importPaths.get(name)

    if (importPath) { resolveImport(importPath) }

    return declarations.get(name)
  }

  const resolveByName = (name: string) => {
    const importPath = importPaths.get(name)

    if (importPath) { resolveImport(importPath) }

    return declarations.get(name)
  }

  return {
    // TOOD: Maybe we need here a way to add file from source
    addFileToContext,
    resolveTypeReference,
    resolveByName,
    typesToPrint,
  }
}
