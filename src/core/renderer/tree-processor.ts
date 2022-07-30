import { resolve, dirname } from 'path'
import type { Node, Project } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'
import { unQuote } from '../extractTypesToUntype'
import { walk } from '../walk-ast'
import { getNodeChildren, isTypeDeclaration, nodeNameOrThrow } from './node-getters'

const isImport = (node: Node) => {
  return node.getKindName() === 'ImportDeclaration'
}

export class UntypeTreeProcessor {
  protected imports: Map<string, string> = new Map()
  protected typeDeclarations: Map<string, Node> = new Map()
  protected project: Project

  constructor(project: Project) {
    this.project = project
  }

  private processImport(node: Node, filePath: string) {
    const path = getNodeChildren(node).find((node: { getKind: () => SyntaxKind }) => node.getKind() === SyntaxKind.StringLiteral)?.getText()

    walk(node, (child) => {
      if (child.getKind() === SyntaxKind.ImportSpecifier) {
        const name = nodeNameOrThrow(child)
        this.imports.set(name, resolve(dirname(filePath), `${unQuote(path!)}.ts`))
      }
    })
  }

  private processTypeDeclaration(node: Node) {
    const name = nodeNameOrThrow(node)
    this.typeDeclarations.set(name, node)
  }

  protected resolveImport(path: string) {
    this.processTree(this.project.addSourceFileAtPathIfExists(path)!, path)
  }

  public processTree(node: Node, filePath: string) {
    walk(node, (child) => {
      if (isImport(child)) {
        this.processImport(child, filePath)
      }
      if (isTypeDeclaration(child)) {
        this.processTypeDeclaration(child)
      }
    })
  }
}
