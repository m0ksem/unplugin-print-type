import { dirname, resolve } from 'path'
import { existsSync } from 'fs'
import { SyntaxKind } from 'ts-morph'
import type { Node, Project } from 'ts-morph'
import { unQuote } from '../../extractTypesToUntype'
import { nodeName, nodeType } from '../node-getters'
import { walk } from '../../walk-ast'
import type { RendererContext } from '../../../composables/useRendererContext'
import { useRendererContext } from '../../../composables/useRendererContext'
import { useTsModuleResolver } from './useTsModuleResolver'

export const isNodeImport = (node: Node) => {
  return node && (node.getKind() === SyntaxKind.ImportDeclaration)
}

export const isNodeTypeDeclaration = (node: Node) => {
  return [
    SyntaxKind.TypeAliasDeclaration,
    SyntaxKind.InterfaceDeclaration,
    SyntaxKind.ClassDeclaration,
    SyntaxKind.EnumDeclaration,
    SyntaxKind.FunctionDeclaration,
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

export const isNodeImportSpecifier = (node: Node) => {
  return node && node.getKind() === SyntaxKind.ImportSpecifier
}

// const moduleDirs = ['node_modules', '../node_modules']

/** Allow to resolve type reference from file or imports */
export const useTypeReferenceResolver = (project: Project) => {
  const declarations = new Map<string, Node>()
  const typesToPrint = new Map<string, Node>()

  const { isTsModule, resolveTypesFile } = useTsModuleResolver()

  const options = useRendererContext()

  const addFileToContext = (node: Node) => {
    walk(node, (child) => {
      if (!child) { return }

      if (isNodePrintTypeFunction(child, options)) {
        typesToPrint.set(nodeName(nodeType(child))!, child)
      }
    })
  }

  const resolveImportFilePath = (path: string, importer: string) => {
    path = unQuote(path)

    if (options.aliases?.[path]) {
      path = options.aliases[path]
    }

    if (isTsModule(path)) {
      return resolveTypesFile(resolve('node_modules', path))
    }

    const tsFile = path.endsWith('.ts') ? resolve(dirname(importer), path) : resolve(dirname(importer), `${(path)}.ts`)

    if (existsSync(tsFile)) {
      return tsFile
    }

    const indexTsFile = resolve(dirname(importer), `${(path)}/index.ts`)

    if (existsSync(indexTsFile)) {
      return indexTsFile
    }

    console.warn('Cannot resolve import path', resolve(dirname(importer), path), 'from', importer)
  }

  const findNodeDeclaration = (source: Node, filePath: string, name: string) => {
    let node: Node | null = null

    if (!source) {
      return
    }

    // Process exports
    walk(source, (child) => {
      if (!child) { return }

      if (child.getKind() === SyntaxKind.ExportDeclaration) {
        const identifiers = child.getChildrenOfKind(SyntaxKind.Identifier)

        if (identifiers.length === 0) {
          const importedPath = child?.getLastChildByKind(SyntaxKind.StringLiteral)?.getText()

          if (!importedPath) {
            return
          }

          const tsFile = resolveImportFilePath(importedPath, filePath)

          if (!tsFile) {
            return
          }

          const found = findNodeDeclaration(project.addSourceFileAtPathIfExists(tsFile)!, tsFile, name)

          if (!found) {
            return
          }

          node = found
        }
      }

      if (child.getKind() === SyntaxKind.ExportSpecifier) {
        if (child.getLastChildByKind(SyntaxKind.Identifier)?.getText() !== name) {
          return
        }
        const identifiers = child.getChildrenOfKind(SyntaxKind.Identifier)
        // Have 'as' keyword
        if (identifiers.length > 1) {
          name = child.getFirstChildByKind(SyntaxKind.Identifier)!.getText()
        }

        const declaration = child.getFirstAncestorByKind(SyntaxKind.ExportDeclaration)

        const importedPath = declaration?.getLastChildByKind(SyntaxKind.StringLiteral)?.getText()

        if (!importedPath) {
          return
        }

        const tsFile = resolveImportFilePath(importedPath, filePath)

        if (!tsFile) {
          return
        }

        const found = findNodeDeclaration(project.addSourceFileAtPathIfExists(tsFile)!, tsFile, name)

        if (!found) {
          return
        }

        node = found
      }
    })

    if (node) { return node }

    walk(source, (child) => {
      if (!child) { return }

      if (child.getKind() === SyntaxKind.ImportSpecifier) {
        const importName = child.getLastChildByKind(SyntaxKind.Identifier)?.getText()

        if (importName !== name) { return }

        const declaration = child
          .getAncestors()
          .find(ancestor => ancestor.getKind() === SyntaxKind.ImportDeclaration)

        if (child.getChildrenOfKind(SyntaxKind.Identifier).length > 1) {
          name = child.getFirstChildByKind(SyntaxKind.Identifier)!.getText()
        }

        if (!declaration) { return }

        const path = unQuote(declaration.getDescendantsOfKind(SyntaxKind.StringLiteral)![0].getText())
        const tsFile = resolveImportFilePath(path, filePath)

        if (!tsFile) {
          return
        }

        const found = findNodeDeclaration(project.addSourceFileAtPathIfExists(tsFile)!, tsFile, name)

        if (!found) { return }

        node = found
      }

      if (nodeName(child) === name) {
        if (isNodeTypeDeclaration(child)) {
          node = child
        }
      }
    })

    return node
  }

  const resolveByName = (name: string, filePath: string) => {
    if (filePath) {
      const file = project.addSourceFileAtPathIfExists(filePath)
      const dec = findNodeDeclaration(file!, filePath, name)

      if (dec) { return dec }
    }

    return declarations.get(name)
  }

  const resolveTypeReference = (node: Node, filePath: string) => {
    const name = nodeName(node)!

    return resolveByName(name, filePath)
  }

  return {
    // TOOD: Maybe we need here a way to add file from source
    addFileToContext,
    resolveTypeReference,
    resolveByName,
    typesToPrint,
  }
}
