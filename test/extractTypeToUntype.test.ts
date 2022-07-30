import { describe, expect, it } from 'vitest'
import { extractTypeToUntype } from '../src/core/extractTypesToUntype'

describe('extractTypesToUntype', () => {
  it('extract one type', () => {
    expect(extractTypeToUntype('Untype(\'User\')')).toEqual(['User'])
  })

  it('extract one type', () => {
    expect(extractTypeToUntype(`
Untype('User').definition
Untype('Role').definition
    `)).toEqual(['User', 'Role'])
  })

  it('extract with junk', () => {
    expect(extractTypeToUntype(`
import { User } from './User'
const untyped = Untype('User')

document.body.innerHTML = Untype('Role').definition
    `)).toEqual(['User', 'Role'])
  })
})
