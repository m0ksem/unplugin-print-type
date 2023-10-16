import { describe, expect, it } from 'vitest'
import { createCodeRenderer } from '../_createCodeRenderer'

describe('primitive', () => {
  [
    'string',
    'number',
    'boolean',
    'undefined',
    'any',
    'null',
    'never',
    'true',
    'false',
    '0',
    '100',
    '\'hello world\'',
    'any[]',
    '{}',
  ].forEach((type) => {
    it(type, () => {
      const renderer = createCodeRenderer(`type Primitive = ${type}`)
      expect(renderer.renderTypeByName('Primitive', './main.ts')).toEqual(type)
    })
  })
})
