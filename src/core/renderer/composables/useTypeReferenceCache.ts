import type { Node } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'

/**
 * Cache type references to prevent recursion call.
 * Cache by text, because type references can have different Generic Arguments
 */
export const useTypeReferenceCache = <T>() => {
  const cached = new Map<string, T>()

  return {
    cache: {
      get: (node: Node) => {
        if (node.getKind() !== SyntaxKind.TypeReference) { return undefined }

        return cached.get(node.getText())
      },
      set: (node: Node, cache: T) => {
        cached.set(node.getText(), cache)
      },
    },

    saveToCache: (node: Node, cb: () => T) => {
      const result = cb()
      cached.set(node.getText(), result)
      return result
    },
  }
}
