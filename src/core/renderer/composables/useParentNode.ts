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

  const getLastParent = (): Node | undefined => parents[parents.length - 1]

  const getParent = (index = 0): Node | undefined => {
    if (index < 0) {
      return parents[index * -1 - 1]
    }

    return parents[parents.length - index - 1]
  }

  const withParent = <T>(parent: Node, cd: () => T): T => {
    parents.push(parent)
    const result = cd()
    parents.pop()
    return result
  }

  return {
    getParent,
    getLastParent,
    getParentWhile,
    withParent,
  }
}
