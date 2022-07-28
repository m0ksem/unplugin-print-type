import type { Node } from 'ts-morph'
import type { UntypeObject } from '../types'

// TODO: Rename to nodeToString
export const parseAst = (node: Node): UntypeObject => {
  if (node.getKindName() !== 'InterfaceDeclaration') {
    throw new Error('Only interface declaration is supported')
  }

  const symbol = node.getSymbol()

  if (!symbol) {
    throw new Error('Unexpected error: Node symbol doesn\'t exist')
  }

  const properties = symbol.getMembers().reduce((acc, member) => {
    const name = member.getName()

    acc[name] = member.getDeclarations()[0].getText()

    return acc
  }, {} as Record<string, string>)

  const name = symbol.getName()
  const definition = `{ ${Object.keys(properties).map((key: string) => `${properties[key]}`).join('; ')} }`

  return {
    definition,
    name,
    text: `type ${name} = ${definition}`,
  }
}
