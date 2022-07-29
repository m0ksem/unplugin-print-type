import type { Node } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'
import { getNodeChildren, isNodePrimitive, isOptional, isType, nodeName, nodeParameter, nodeType, nodeTypes } from './node-getters'
import { UntypeTreeProcessor } from './tree-processor'

export class UntypeRenderer extends UntypeTreeProcessor {
  private processed: string[] = []
  private cachedRenders: Map<string, string> = new Map()
  private parent: Node | null = null

  private withParent<T>(parent: Node, cb: () => T) {
    this.parent = parent
    const rt = cb()
    this.parent = null
    return rt
  }

  private renderNode(node: Node): string {
    if (!node) { return '' }
    const name = nodeName(node)
    const kind = node.getKind()
    const parent = this.parent

    // console.log(name, node.getKindName())

    if (kind === SyntaxKind.TypeReference && name) {
      const cached = this.typeDeclarations.get(name)
      if (!cached) {
        const args = nodeTypes(node)

        if (args.length === 0) { return name }

        return `${name}<${args.map(arg => this.renderNode(arg)).join(', ')}>`
      }
      const renderedReference = this.withParent(node, () => this.renderNode(cached))
      this.cachedRenders.set(name, renderedReference)
      return renderedReference
    }

    if (name && kind !== SyntaxKind.PropertySignature) {
      if (this.processed.includes(name)) {
        return this.cachedRenders.get(name) ?? name
      }
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
      const type = getNodeChildren(node).map(child =>
        child.getKind() === SyntaxKind.ParenthesizedType
          ? `(${this.renderNode(child)})`
          : this.renderNode(child)).join(' | ')
      if (getParentTypeKind()) { return `(${type})` }
      return type
    }

    if (kind === SyntaxKind.IntersectionType) {
      const type = getNodeChildren(node).map(child =>
        child.getKind() === SyntaxKind.ParenthesizedType
          ? `(${this.renderNode(child)})`
          : this.renderNode(child)).join(' & ')
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
      const optional = isOptional(node)
      return `${name}${optional ? '?' : ''}: ${this.renderNode(nodeType(node))}`
    }

    if (kind === SyntaxKind.IndexSignature) {
      const parameter = nodeParameter(node)
      const type = nodeType(node)

      return `[${this.renderNode(parameter!)}]: ${this.renderNode(type)}`
    }

    if (kind === SyntaxKind.Parameter) {
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
      const returnType = this.renderNode(children.find(child => child.getKind() !== SyntaxKind.Parameter)!)

      return `(${params}) => ${returnType}`
    }

    return 'UNKNOWN'
  }

  renderType(typeName: string): string {
    const type = this.typeDeclarations.get(typeName)
    return type ? this.renderNode(type) : `Type Not found: Available types ${[...this.typeDeclarations.keys()]}`
  }
}
