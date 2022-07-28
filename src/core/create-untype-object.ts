import type { UntypeObject } from '../types'

export const createUntypeFunction = (type: UntypeObject) => {
  return `({
    definition: \"${type.definition}\",
    name: \"${type.name}\",
    toString: () => \"${type.text}\",
    text: \"${type.text}\",
  })`
}
