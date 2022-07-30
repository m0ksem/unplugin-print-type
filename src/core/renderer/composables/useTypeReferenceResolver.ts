import { dirname, resolve } from 'path'
import type { Node, Project } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'
import { unQuote } from '../../extractTypesToUntype'
import { getNodeChildren, nodeName, nodeNameOrThrow } from '../node-getters'
import { walk } from '../../walk-ast'

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

/** Allow to resolve type reference from file or imports */
export const useTypeReferenceResolver = (project: Project) => {
  const importPaths = new Map<string, string>()
  const declarations = new Map<string, Node>()

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
    walk(node, (child) => {
      if (!child) { return }

      if (isNodeImport(child)) {
        processImport(child, filePath)
      }
      if (isNodeTypeDeclaration(child)) {
        declarations.set(nodeName(child)!, child)
      }
    })
  }

  const resolveImport = (path: string) => {
    // TODO: Not sure how to handle types from .tsx, .d.ts etc.
    if (path.endsWith('.ts.ts')) {
      path = path.slice(0, -3)
    }
    const file = project.addSourceFileAtPathIfExists(path)
    if (!file) {
      throw new Error(`File ${path} not found.\n\nAvailable files:\n${project.getSourceFiles().map(file => file.getFilePath()).join(',\n')}`)
    }
    addFileToContext(file, path)
  }

  const resolveTypeReference = (node: Node) => {
    if (!isNodeTypeReference(node)) {
      throw new Error(`Expected node to be a type reference, got ${node.getKindName()}`)
    }

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
  }
}
