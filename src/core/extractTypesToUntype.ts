const untypeSyntaxParseRegex = /Untype\((.*)\)/gm

const unQoute = (str: string) => str.replace(/'|"|`/g, '')

export const extractTypeToUntype = (code: string) => {
  const matched = code.matchAll(untypeSyntaxParseRegex)

  const types: string[] = []

  for (const match of matched) {
    const type = match[1]

    if (type)
      types.push(unQoute(type))
  }

  return types
}
