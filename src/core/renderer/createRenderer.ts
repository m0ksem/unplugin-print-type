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
  const { resolveTypeReference, addFileToContext, resolveByName, typesToPrint } = useTypeReferenceResolver(project)
  const { getParentWhile, withParent } = useParentNode()
  const { cache, saveToCache: withCache } = useTypeReferenceCache<string>()
  const { withTab, tab } = useTabRenderer()

  const renderNode = (node: Node, filePath: string): string => {
    if (!node) {
      throw new Error('Unexpected error: node is undefined')
    }

    const kind = node.getKind()

    if (kind === SyntaxKind.TypeReference || kind === SyntaxKind.ExpressionWithTypeArguments) {
      const typeReference = resolveTypeReference(node, filePath)

      if (!typeReference) {
        const name = nodeName(node)!
        const args = nodeTypes(node)

        if (args.length === 0) { return name }

        return `${name}<${args.map(arg => renderNode(arg, filePath)).join(', ')}>`
      }

      if (cache.get(node)) {
        return cache.get(node)!
      }

      return withCache(node, () => withParent(node, () => renderNode(typeReference, filePath)))
    }

    if (isNodePrimitive(node)) {
      return node.getText()
    }

    if (kind === SyntaxKind.ParenthesizedType) {
      return `(${renderNode(nodeType(node), filePath)})`
    }

    if (kind === SyntaxKind.TypeAliasDeclaration) {
      return renderNode(nodeType(node), filePath)
    }

    if (kind === SyntaxKind.ArrayType) {
      return `${renderNode(nodeType(node), filePath)}[]`
    }

    // Function argument or index signature parameter
    if (kind === SyntaxKind.Parameter) {
      return `${nodeName(node)}: ${renderNode(nodeType(node), filePath)}`
    }

    if (kind === SyntaxKind.FunctionType) {
      const children = getNodeChildren(node)
      const returnType = renderNode(children.find(child => child.getKind() !== SyntaxKind.Parameter)!, filePath)
      const params = children
        .filter(child => child.getKind() === SyntaxKind.Parameter)
        .map(child => `${nodeName(child)}: ${renderNode(nodeType(child), filePath)}`)
        .join(', ')

      return `(${params}) => ${returnType}`
    }

    // Literals

    if (kind === SyntaxKind.PropertySignature) {
      return `${nodeName(node)}${isOptional(node) ? '?' : ''}: ${renderNode(nodeType(node), filePath)}`
    }

    if (kind === SyntaxKind.MethodSignature) {
      return `${nodeName(node)}(${renderNode(nodeParameter(node)!, filePath)}): ${renderNode(nodeType(node), filePath)}`
    }

    if (kind === SyntaxKind.IndexSignature) {
      const parameter = nodeParameter(node)
      const type = nodeType(node)

      return `[${renderNode(parameter!, filePath)}]: ${renderNode(type, filePath)}`
    }

    if (kind === SyntaxKind.InterfaceDeclaration || kind === SyntaxKind.TypeLiteral) {
      const types = nodeTypes(node)
      const parentTab = tab.toString()

      const inner = withTab((tab) => {
        const children = types
          .map((child) => {
            if (child.getKind() === SyntaxKind.HeritageClause) {
              return getNodeChildren(child).map((child) => {
                const rendered = renderNode(child, filePath)
                if (rendered === '{}') { return '' }
                if (rendered.startsWith('{ ')) { return rendered.slice(2, -2) }
                return rendered
              }).join(`\n${tab}`)
            }
            return renderNode(child, filePath)
          })

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
        .map(child => renderNode(child, filePath))
        .join(' | ')

      return isInUtil() ? `(${type})` : type
    }

    if (kind === SyntaxKind.IntersectionType) {
      const type = getNodeChildren(node)
        .map(child => renderNode(child, filePath))
        .join(' & ')

      return isInUtil() ? `(${type})` : type
    }

    if (kind === SyntaxKind.TemplateLiteralType || kind === SyntaxKind.TemplateLiteralTypeSpan) {
      return getNodeChildren(node).reduce((acc, child) => acc + renderNode(child, filePath), '')
    }

    if ([SyntaxKind.TemplateHead, SyntaxKind.TemplateMiddle, SyntaxKind.TemplateTail].includes(kind)) {
      return node.getText()
    }

    console.warn(`Unexpected node kind: ${node.getKindName()}. Rendered as unknown type.`)

    return 'unknown'
  }

  const addFile = (filePath: string, code: string) => {
    const ast = project.createSourceFile(filePath, code, { overwrite: true })
    return addFileToContext(ast)
  }

  const renderTypeByName = (typeName: string, filePath: string) => {
    const node = resolveByName(typeName, filePath)
    return node ? renderNode(node, filePath) : typeName
  }

  const createUntypeObject = (renderedType: string) => {
    return `\`${renderedType}\``
  }

  return {
    renderNode,
    addFile,
    renderTypeByName,
    createUntypeObject,
    typesToPrint,
  }
}
