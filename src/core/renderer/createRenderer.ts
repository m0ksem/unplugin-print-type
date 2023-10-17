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
  const { resolveTypeReference, addFileToContext, resolveByName, typesToPrint, getNodeGenerics } = useTypeReferenceResolver(project)
  const { withParent, getParent } = useParentNode()
  const { cache, saveToCache: withCache } = useTypeReferenceCache<string>()
  const { withTab, tab } = useTabRenderer()

  const renderNode = (node: Node): string => {
    if (!node) {
      console.trace()
      throw new Error('Unexpected error: node is undefined')
    }

    const kind = node.getKind()

    if (kind === SyntaxKind.TypeReference || kind === SyntaxKind.ExpressionWithTypeArguments) {
      const typeReference = resolveTypeReference(node, node.getSourceFile().getFilePath())
      const name = nodeName(node)!

      if (getParent(0) && getParent(1)) {
        const argNames = getParent(0)?.getChildrenOfKind(SyntaxKind.TypeParameter).map(child => nodeName(child))
        let argValues = getParent(1)?.getChildrenOfKind(SyntaxKind.SyntaxList)?.[0]?.getChildren().map(child => child.getText())

        if (!argValues) {
          argValues = getParent(0)
            ?.getChildrenOfKind(SyntaxKind.TypeParameter)
            .map((child) => {
              if (child.getChildCount() === 3) {
                if (child.getChildAtIndex(1).getKind() !== SyntaxKind.EqualsToken) {
                  return undefined
                }

                if (child.getChildAtIndex(2).getText() === node.getText()) { return undefined }
                return renderNode(child.getChildAtIndex(2))
              }

              if (child.getChildCount() === 5) {
                if (child.getChildAtIndex(3).getKind() !== SyntaxKind.EqualsToken) {
                  return undefined
                }

                if (child.getChildAtIndex(4).getText() === node.getText()) { return undefined }
                return renderNode(child.getChildAtIndex(4))
              }

              return undefined
            })
            .filter(child => child !== undefined) as string[]
        }

        if (argNames?.includes(name)) {
          const argValue = argValues[argNames.indexOf(name)]

          if (argValue) { return argValue }
        }

        const parentGenerics = getParent(-1)?.getChildrenOfKind(SyntaxKind.TypeParameter).map(child => nodeName(child))
        const generics = getNodeGenerics(getParent(-1))

        if (generics) {
          const genericNameIndex = parentGenerics?.indexOf(name)
          const originalName = generics[genericNameIndex!]

          if (originalName) {
            const resolved = resolveByName(originalName, node.getSourceFile().getFilePath())

            if (resolved) {
              return renderNode(resolved)
            }
          }
        }
      }

      if (!typeReference) {
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

    if (kind === SyntaxKind.MethodSignature) {
      return `${nodeName(node)}(${renderNode(nodeParameter(node)!)}): ${renderNode(nodeType(node))}`
    }

    if (kind === SyntaxKind.IndexSignature) {
      const parameter = nodeParameter(node)
      const type = nodeType(node)

      return `[${renderNode(parameter!)}]: ${renderNode(type)}`
    }

    if (kind === SyntaxKind.TypeLiteral) {
      const types = nodeTypes(node)
      const parentTab = tab.toString()
      return withTab((tab) => {
        const children = types
          .map((child) => {
            if (child.getKind() === SyntaxKind.TypeParameter) {
              return undefined
            }

            if (child.getKind() === SyntaxKind.HeritageClause) {
              return getNodeChildren(child).map((child) => {
                const rendered = renderNode(child)
                if (rendered === '{}') { return '' }
                if (rendered.startsWith('{ ')) { return rendered.slice(2, -2) }
                return rendered
              }).join(`\n${tab}`)
            }

            if (child.getKind() === SyntaxKind.PropertySignature) {
              return withParent(node, () => renderNode(child))
            }

            return renderNode(child)
          })
          .filter(child => child !== undefined)

        if (children.length === 0) { return '{}' }
        if (children.length === 1 && !children[0]?.includes('\n')) { return ` ${children[0]} ` }

        return `{\n${tab}${children.join(`,\n${tab}`)}\n${parentTab}}`
      })
    }

    if (kind === SyntaxKind.TypeAliasDeclaration) {
      const literal = node.getFirstChildByKind(SyntaxKind.TypeLiteral) || nodeType(node)

      const inner = withParent(node, () => renderNode(literal))
      const genericTypes = node.getChildrenOfKind(SyntaxKind.TypeParameter)

      if (genericTypes.length > 0 && !getParent() && !getNodeGenerics(node)) {
        const genericType = genericTypes.map(child => renderNode(child)).join(', ')

        return `<${genericType}>${inner}`
      }

      return inner
    }

    if (kind === SyntaxKind.InterfaceDeclaration) {
      const types = nodeTypes(node)
      const parentTab = tab.toString()

      const inner = withTab((tab) => {
        const children = types
          .map((child) => {
            if (child.getKind() === SyntaxKind.TypeParameter) {
              return undefined
            }

            if (child.getKind() === SyntaxKind.HeritageClause) {
              return getNodeChildren(child).map((child) => {
                const rendered = renderNode(child)
                if (rendered === '{}') { return '' }
                if (rendered.startsWith('{ ')) { return rendered.slice(2, -2) }
                return rendered
              }).join(`\n${tab}`)
            }

            if (child.getKind() === SyntaxKind.PropertySignature) {
              return withParent(node, () => renderNode(child))
            }

            return renderNode(child)
          })
          .filter(child => child !== undefined)

        if (children.length === 0) { return '' }
        if (children.length === 1 && !children[0]?.includes('\n')) { return ` ${children[0]} ` }

        return `\n${tab}${children.join(`\n${tab}`)}\n${parentTab}`
      })

      const genericTypes = node.getChildrenOfKind(SyntaxKind.TypeParameter)

      if (genericTypes.length > 0 && !getParent() && !getNodeGenerics(node)) {
        const genericType = genericTypes.map(child => renderNode(child)).join(', ')

        return `<${genericType}>{${inner}}`
      }

      return `{${inner}}`
    }

    // Merge and utils

    const isInUtil = () => {
      return node.getParentIfKind(SyntaxKind.UnionType) || node.getParentIfKind(SyntaxKind.IntersectionType)
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

    if (kind === SyntaxKind.TypeParameter) {
      const children = node.getChildrenOfKind(SyntaxKind.TypeReference)

      const childrenRendered = children
        .map((child) => {
          const keyword = child.getPreviousSibling()

          if (keyword?.getKind() === SyntaxKind.ExtendsKeyword) {
            return ` extends ${withParent(child, () => renderNode(child))}`
          }

          if (keyword?.getKind() === SyntaxKind.EqualsToken) {
            return ` = ${withParent(child, () => renderNode(child))}`
          }

          return null
        })
        .filter(child => child !== null)

      const name = nodeName(node)!

      return `${name}${childrenRendered}`
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
    return node ? renderNode(node) : typeName
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
