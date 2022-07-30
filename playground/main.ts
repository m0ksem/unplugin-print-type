import type { PrintTypePluginOptions } from '../src/types'

interface Animal {
  roar: () => string
}

type User = {
  name: string
  age: number
} & Animal

interface Plugin {
  user: User
  config: PrintTypePluginOptions
}

console.log(PrintType<Plugin>())
