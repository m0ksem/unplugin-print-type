import { describe, expect, it } from 'vitest'
import { createCodeRenderer } from '../_createCodeRenderer'

describe('merging', () => {
  [
    'string | number',
    'string & number',
    'number[]',
    // eslint-disable-next-line no-template-curly-in-string
    '`${number}-${string}`',
  ].forEach((type) => {
    it(type, () => {
      const renderer = createCodeRenderer(`type MergedType = ${type}`)
      expect(renderer.renderTypeByName('MergedType', './main.ts')).toEqual(type)
    })
  })
})
