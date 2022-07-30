import type { Node } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'

/** Get children without stuff like =, type, ; etc. */
export const getNodeChildren = (node: Node) => {
  const nodes: Node[] = []
  node.forEachChild((child) => { nodes.push(child) })
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
    SyntaxKind.Parameter,
    SyntaxKind.QuestionToken,
    SyntaxKind.TemplateHead,
  ].includes(child.getKind()))
}

export const nodeParameter = (node: Node) => {
  return getNodeChildren(node).find(node => node.getKind() === SyntaxKind.Parameter)
}

export const nodeType = (node: Node) => {
  return nodeTypes(node)[0]
}

export const isTypeDeclaration = (node: Node) => {
  return ['InterfaceDeclaration', 'TypeAliasDeclaration'].includes(node.getKindName())
}

export const isOptional = (node: Node) => {
  return getNodeChildren(node).find(node => node.getKind() === SyntaxKind.QuestionToken)
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
  SyntaxKind.UnknownKeyword,
]
export const isNodePrimitive = (node: Node) => {
  return primitives.includes(node.getKind())
}
