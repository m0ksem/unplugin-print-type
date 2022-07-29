import type { Node } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'

/** Get children without stuff like =, type, ; etc. */
export const getNodeChildren = (node: Node) => {
  const nodes: Node[] = []
  node.forEachChild((child) => {
    nodes.push(child)
    return undefined
  })
  return nodes
}

export const nodeName = (node: Node) => {
  return node.getFirstChildByKind(SyntaxKind.Identifier)?.getText()
}

export const nodeNameOrThrow = (node: Node) => {
  const name = nodeName(node)
  if (!name) {
    throw new Error('Unexpected error: Node name doesn\'t exist')
  }
  return name
}

export const nodeTypes = (node: Node) => {
  return getNodeChildren(node).filter(child => ![
    SyntaxKind.Identifier,
    SyntaxKind.ExportKeyword,
  ].includes(child.getKind()))
}

export const nodeType = (node: Node) => {
  return nodeTypes(node)[0]
}

export const getNodeChildrenKinds = (node: Node) => getNodeChildren(node).map(node => node.getKindName())

export const getNodeTypeArguments = (node: Node) => {
  return nodeTypes(node)
}

export const isTypeDeclaration = (node: Node) => {
  return ['InterfaceDeclaration', 'TypeAliasDeclaration'].includes(node.getKindName())
}

export const isType = (node: Node) => {
  return ['UnionType', 'IntersectionType'].includes(node.getKindName())
}

const primitives = [
  SyntaxKind.StringKeyword,
  SyntaxKind.NumberKeyword,
  SyntaxKind.BooleanKeyword,
  SyntaxKind.AnyKeyword,
  SyntaxKind.VoidKeyword,
  SyntaxKind.NullKeyword,
  SyntaxKind.UndefinedKeyword,
  SyntaxKind.NeverKeyword,
  SyntaxKind.SymbolKeyword,
  SyntaxKind.ObjectKeyword,
  SyntaxKind.StringLiteral,
  SyntaxKind.NumericLiteral,
  SyntaxKind.LiteralType,
  SyntaxKind.TrueKeyword,
  SyntaxKind.FalseKeyword,
]
export const isNodePrimitive = (node: Node) => {
  return primitives.includes(node.getKind())
}
