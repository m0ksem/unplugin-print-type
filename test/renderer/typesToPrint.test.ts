import { describe, expect, it } from 'vitest'
import { createCodeRenderer } from './_createCodeRenderer'

describe('primitive', () => {
  it('find one type', () => {
    const renderer = createCodeRenderer('PrintType<User>()')

    expect([...renderer.typesToPrint.keys()]).toEqual(['User'])
  })
})
