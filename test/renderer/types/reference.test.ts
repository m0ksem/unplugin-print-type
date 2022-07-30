import { describe, expect, it } from 'vitest'
import { createCodeRenderer, createProjectRenderer } from '../_createCodeRenderer'

describe('reference', () => {
  it('type alias -> type alias', () => {
    const renderer = createCodeRenderer(`
type Role = 'admin' | 'user'
type User = { name: string, role: Role }
`)
    expect(renderer.renderTypeByName('User')).toEqual(`
{
  name: string
  role: 'admin' | 'user'
}
    `.trim())
  })

  it('type alias -> type alias', () => {
    const renderer = createCodeRenderer(`
type Role = 'admin' | 'user'
interface User { name: string, role: Role }
`)
    expect(renderer.renderTypeByName('User')).toEqual(`
{
  name: string
  role: 'admin' | 'user'
}
    `.trim())
  })

  it('interface -> interface', () => {
    const renderer = createCodeRenderer(`
interface WithRole { role: 'admin' | 'user' }
interface WithAge { age: number }
interface User extends WithRole, WithAge { name: string }
`)

    expect(renderer.renderTypeByName('User')).toEqual(`
{
  role: 'admin' | 'user'
  age: number
  name: string
}
    `.trim())
  })

  it('import', () => {
    const { renderer, addFile } = createProjectRenderer()

    addFile('./panel.ts', `
export type Role = 'admin' | 'user'
export type Gender = 'male' | 'female' | '🤖'
`)

    addFile('./main.ts', `
import type { Role } from './panel.ts'
import { Gender } from './panel.ts'
type User = { name: string, role: Role, gender: Gender }
`)

    expect(renderer.renderTypeByName('User')).toEqual(`
{
  name: string
  role: 'admin' | 'user'
  gender: 'male' | 'female' | '🤖'
}
        `.trim())
  })

  it('global types', () => {
    const { renderer, addFile } = createProjectRenderer()

    addFile('./main.ts', `
type User = { name: string, div: HTMLElement, type: SomeGlobalType }
`)

    expect(renderer.renderTypeByName('User')).toEqual(`
{
  name: string
  div: HTMLElement
  type: SomeGlobalType
}
        `.trim())
  })
})
