import type { Node } from 'ts-morph'
import type { UntypeCompiler } from '.'

export type CompiledAst = string
export type UntypeNodeProcessor = (this: UntypeCompiler, node: Node) => CompiledAst
