import type { Node } from 'ts-morph'

/** Used for type aliases to have parent */
export const useParentNode = () => {
  const parents = [] as Node[]

  /** Get all parents parents */
  const getParentWhile = (predicate: (node: Node) => boolean) => {
    let cursor = parents.length - 1

    while (cursor >= 0) {
      const parent = parents[cursor]
      const desired = parent.getParentWhile(predicate)

      if (desired) { return desired }

      cursor--
    }

    return undefined
  }

  const withParent = <T>(parent: Node, cd: () => T): T => {
    parents.push(parent)
    const result = cd()
    parents.pop()
    return result
  }

  return {
    getParentWhile,
    withParent,
  }
}
