import type { Node } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'
import { getNodeChildren, isNodePrimitive, isType, nodeName, nodeType, nodeTypes } from './node-getters'
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
    const kind = node.getKind()
    const parent = this.parent

    console.log(name, node.getKindName())

    if (kind === SyntaxKind.TypeReference && name) {
      const cached = this.typeDeclarations.get(name)
      if (!cached) {
        const args = nodeTypes(node)

        if (args.length === 0) { return name }

        return `${name}<${args.map(arg => this.renderNode(arg)).join(', ')}>`
      }
      return this.withParent(node, () => this.renderNode(cached))
    }

    if (name) {
      if (this.processed.includes(name)) { return name }
      else { this.processed.push(name) }
    }

    if (isNodePrimitive(node)) {
      console.log(node.getKindName(), node.getText())
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

    if (kind === SyntaxKind.TypeAliasDeclaration) {
      return this.renderNode(nodeType(node))
    }

    if (kind === SyntaxKind.InterfaceDeclaration || kind === SyntaxKind.TypeLiteral) {
      return `{ ${nodeTypes(node).map(child => this.renderNode(child)).join(', ')} }`
    }

    if (kind === SyntaxKind.ArrayType) {
      return `${this.renderNode(nodeType(node))}[]`
    }

    if (kind === SyntaxKind.PropertySignature) {
      return `${name}: ${this.renderNode(nodeType(node))}`
    }

    if (kind === SyntaxKind.ParenthesizedType) {
      return `(${nodeType(node)})`
    }

    if (kind === SyntaxKind.FunctionType) {
      const children = getNodeChildren(node)
      const params = children
        .filter(child => child.getKind() === SyntaxKind.Parameter)
        .map(child => `${nodeName(child)}: ${this.renderNode(nodeType(child))}`)
        .join(', ')
      const returnType = this.renderNode(children.find(child => child.getKind() === SyntaxKind.TypeReference)!)

      return `(${params}) => ${returnType}`
    }

    return 'UNKNOWN'
  }

  renderType(typeName: string): string {
    const type = this.typeDeclarations.get(typeName)
    return type ? this.renderNode(type) : `Type Not found: Available types ${[...this.typeDeclarations.keys()]}`
  }
}
