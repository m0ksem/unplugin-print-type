import type { UntypePluginOptions } from '../src/types'

interface Animal {
  roar: () => string
}

type User = {
  name: string
  age: number
} & Animal

interface Plugin {
  user: User
  config: UntypePluginOptions
}

console.log(Untype<Plugin>('Plugin').definition)
