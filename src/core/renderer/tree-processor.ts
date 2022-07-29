import type { Node } from 'ts-morph'
import { walk } from '../walk-ast'
import { isTypeDeclaration, nodeNameOrThrow } from './node-getters'

const isImport = (node: Node) => {
  return node.getKindName() === 'ImportDeclaration'
}

export class UntypeTreeProcessor {
  protected imports: Map<string, Node> = new Map()
  protected typeDeclarations: Map<string, Node> = new Map()

  private processImport(node: Node) {
    const name = nodeNameOrThrow(node)
    this.imports.set(name, node)
  }

  private processTypeDeclaration(node: Node) {
    const name = nodeNameOrThrow(node)
    this.typeDeclarations.set(name, node)
  }

  public processTree(node: Node) {
    walk(node, (child) => {
      if (isImport(child)) {
        this.processImport(child)
      }
      if (isTypeDeclaration(child)) {
        this.processTypeDeclaration(child)
      }
    })
  }
}
