import { describe, expect, it } from 'vitest'
import { createCodeRenderer, createProjectRenderer } from '../_createCodeRenderer'

describe('reference', () => {
  it('type alias -> type alias', () => {
    const renderer = createCodeRenderer(`
type Role = 'admin' | 'user'
type User = { name: string, role: Role }
`)
    expect(renderer.renderTypeByName('User', './main.ts')).toEqual(`
{
  name: string,
  role: 'admin' | 'user'
}
    `.trim())
  })

  it('type alias -> type alias', () => {
    const renderer = createCodeRenderer(`
type Role = 'admin' | 'user'
interface User { name: string, role: Role }
`)
    expect(renderer.renderTypeByName('User', './main.ts')).toEqual(`
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

    expect(renderer.renderTypeByName('User', './main.ts')).toEqual(`
{
  role: 'admin' | 'user'
  age: number
  name: string
}
    `.trim())
  })

  it('import', () => {
    const { renderer, addFile } = createProjectRenderer()

    addFile('./main.ts', `
import type { Role } from './test/renderer/types/__src/user.ts'
import { Gender } from './test/renderer/types/__src/user.ts'
type User = { name: string, role: Role, gender: Gender }
`)

    expect(renderer.renderTypeByName('User', './main.ts')).toEqual(`
{
  name: string,
  role: 'admin' | 'user',
  gender: 'male' | 'female' | '🤖'
}
        `.trim())
  })

  it('global types', () => {
    const { renderer, addFile } = createProjectRenderer()

    addFile('./main.ts', `
type User = { name: string, div: HTMLElement, type: SomeGlobalType }
`)

    expect(renderer.renderTypeByName('User', './main.ts')).toEqual(`
{
  name: string,
  div: HTMLElement,
  type: SomeGlobalType
}
        `.trim())
  })

  it('re-exported type', () => {
    const { renderer, addFile } = createProjectRenderer()

    addFile('./main.ts', `
    import type { NestedType } from './test/renderer/types/__src/'
    type User = { name: string, nested: NestedType }
    `)

    expect(renderer.renderTypeByName('User', './main.ts')).toEqual(`
{
  name: string,
  nested: { test: number }
}`.trim())
  })

  it('generic', () => {
    const { renderer, addFile } = createProjectRenderer()

    addFile('./main.ts', `
  type Gamer = { name: string, games: string[] }
  type User<Child> = { name: string, children: Child[] }
    `)

    expect(renderer.renderTypeByName('User<Gamer>', './main.ts')).toEqual(`
{
  name: string,
  children: {
    name: string,
    games: string[]
  }[]
}`.trim())
  })

  it('generic with default', () => {
    const { renderer, addFile } = createProjectRenderer()

    addFile('./main.ts', `
  type Gamer = { name: string, games: string[] }
  type User<Child = Gamer> = { name: string, children: Child[] }
    `)

    expect(renderer.renderTypeByName('User', './main.ts')).toEqual(`
<Child = {
  name: string,
  games: string[]
}>{
  name: string,
  children: Child[]
}`.trim())
  })
})
