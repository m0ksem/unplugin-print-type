import type { Node, Project } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'
import {
  useParentNode,
  useTabRenderer,
  useTypeReferenceCache,
  useTypeReferenceResolver,
} from './composables'
import { getNodeChildren, isNodePrimitive, isOptional, nodeName, nodeParameter, nodeType, nodeTypes } from './node-getters'

export const createRenderer = (project: Project) => {
  const { resolveTypeReference, addFileToContext, resolveByName } = useTypeReferenceResolver(project)
  const { getParentWhile, withParent } = useParentNode()
  const { cache, withCache } = useTypeReferenceCache<string>()
  const { withTab, tab } = useTabRenderer()

  const renderNode = (node: Node): string => {
    if (!node) {
      throw new Error('Unexpected error: node is undefined')
    }

    const kind = node.getKind()

    if (kind === SyntaxKind.TypeReference) {
      const typeReference = resolveTypeReference(node)

      if (!typeReference) {
        const name = nodeName(node)!
        const args = nodeTypes(node)

        if (args.length === 0) { return name }

        return `${name}<${args.map(arg => renderNode(arg)).join(', ')}>`
      }

      if (cache.get(node)) {
        return cache.get(node)!
      }

      return withCache(node, () => withParent(node, () => renderNode(typeReference)))
    }

    if (isNodePrimitive(node)) {
      return node.getText()
    }

    if (kind === SyntaxKind.ParenthesizedType) {
      return `(${renderNode(nodeType(node))})`
    }

    if (kind === SyntaxKind.TypeAliasDeclaration) {
      return renderNode(nodeType(node))
    }

    if (kind === SyntaxKind.ArrayType) {
      return `${renderNode(nodeType(node))}[]`
    }

    // Function argument or index signature parameter
    if (kind === SyntaxKind.Parameter) {
      return `${nodeName(node)}: ${renderNode(nodeType(node))}`
    }

    if (kind === SyntaxKind.FunctionType) {
      const children = getNodeChildren(node)
      const returnType = renderNode(children.find(child => child.getKind() !== SyntaxKind.Parameter)!)
      const params = children
        .filter(child => child.getKind() === SyntaxKind.Parameter)
        .map(child => `${nodeName(child)}: ${renderNode(nodeType(child))}`)
        .join(', ')

      return `(${params}) => ${returnType}`
    }

    // Literals

    if (kind === SyntaxKind.PropertySignature) {
      return `${nodeName(node)}${isOptional(node) ? '?' : ''}: ${renderNode(nodeType(node))}`
    }

    if (kind === SyntaxKind.IndexSignature) {
      const parameter = nodeParameter(node)
      const type = nodeType(node)

      return `[${renderNode(parameter!)}]: ${renderNode(type)}`
    }

    if (kind === SyntaxKind.InterfaceDeclaration || kind === SyntaxKind.TypeLiteral) {
      const types = nodeTypes(node)
      const parentTab = tab.toString()

      const inner = withTab((tab) => {
        const children = types
          .map(child => renderNode(child))

        if (children.length === 0) { return '' }
        if (children.length === 1) { return ` ${children[0]} ` }

        return `\n${tab}${children.join(`\n${tab}`)}\n${parentTab}`
      })

      return `{${inner}}`
    }

    // Merge and utils

    const isInUtil = () => {
      return getParentWhile(current => ['UnionType', 'IntersectionType'].includes(current.getKindName()))
    }

    if (kind === SyntaxKind.UnionType) {
      const type = getNodeChildren(node)
        .map(child => renderNode(child))
        .join(' | ')

      return isInUtil() ? `(${type})` : type
    }

    if (kind === SyntaxKind.IntersectionType) {
      const type = getNodeChildren(node)
        .map(child => renderNode(child))
        .join(' & ')

      return isInUtil() ? `(${type})` : type
    }

    if (kind === SyntaxKind.TemplateLiteralType || kind === SyntaxKind.TemplateLiteralTypeSpan) {
      return getNodeChildren(node).reduce((acc, child) => acc + renderNode(child), '')
    }

    if ([SyntaxKind.TemplateHead, SyntaxKind.TemplateMiddle, SyntaxKind.TemplateTail].includes(kind)) {
      return node.getText()
    }

    console.warn(`Unexpected node kind: ${node.getKindName()}. Rendered as unknown type.`)

    return 'unknown'
  }

  const addFile = (filePath: string) => {
    const ast = project.getSourceFileOrThrow(filePath)
    return addFileToContext(ast, filePath)
  }

  const renderTypeByName = (typeName: string) => {
    const node = resolveByName(typeName)
    return node ? renderNode(node) : typeName
  }

  const createUntypeObject = (renderedType: string) => {
    return `({
      definition: \`${renderedType}\`,
    })`
  }

  return {
    renderNode,
    addFile,
    renderTypeByName,
    createUntypeObject,
  }
}
