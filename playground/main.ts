import type { UnpluginContext } from 'unplugin'
import type { PrintTypePluginOptions } from '../src/types'
import type { NestedType } from './src'

interface Animal {
  roar: () => string
}

type User = {
  name: string
  age: number
} & Animal & NestedType

interface Plugin {
  user: User
  config: PrintTypePluginOptions
  context: UnpluginContext
}

console.log(PrintType<Plugin>())
