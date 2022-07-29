import type { Node } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'
import { getNodeChildren, isNodePrimitive, isType, nodeName, nodeType } from './node-getters'
import { UntypeTreeProcessor } from './tree-processor'

export class UntypeRenderer extends UntypeTreeProcessor {
  private processed: string[] = []
  private parent: Node | null = null

  private withParent<T>(parent: Node, cb: () => T) {
    this.parent = parent
    const rt = cb()
    this.parent = null
    return rt
  }

  private renderNode(node: Node): string {
    const name = nodeName(node)
    // const kindName = node.getKindName()
    const kind = node.getKind()
    const parent = this.parent

    if (kind === SyntaxKind.TypeReference && name) {
      const cached = this.typeDeclarations.get(name)
      if (!cached) { throw new Error('Unexpected error: Type declaration doesn\'t exist') }
      return this.withParent(node, () => this.renderNode(cached))
    }

    if (name) {
      if (this.processed.includes(name)) { return name }
      else { this.processed.push(name) }
    }

    if (isNodePrimitive(node)) {
      return node.getText()
    }

    if (node.getKind() === SyntaxKind.ParenthesizedType) {
      return this.renderNode(getNodeChildren(node)[0])
    }

    const getParentTypeKind = () => {
      const originParent = node.getParentWhile((current) => {
        return isType(current)
      })

      if (originParent) { return originParent }

      return parent?.getParentWhile((current) => {
        return isType(current)
      })
    }

    if (kind === SyntaxKind.UnionType) {
      const type = getNodeChildren(node).map(child => this.renderNode(child)).join(' | ')
      if (getParentTypeKind()) { return `(${type})` }
      return type
    }

    if (kind === SyntaxKind.IntersectionType) {
      const type = getNodeChildren(node).map(child => this.renderNode(child)).join(' & ')
      if (getParentTypeKind()) { return `(${type})` }
      return type
    }

    if (kind === SyntaxKind.TypeAliasDeclaration || kind === SyntaxKind.InterfaceDeclaration) {
      const type = nodeType(node)
      return this.renderNode(type)
    }

    return ''
  }

  renderType(typeName: string): string {
    const type = this.typeDeclarations.get(typeName)
    return type ? this.renderNode(type) : `Type Not found: Available types ${[...this.typeDeclarations.keys()]}`
  }
}
