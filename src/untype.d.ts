declare type Untype<T> = string

/** 
 * Compiler macro. Will transform type to human readable string.
 * 
 * @usage
 * 
 * Untype<User>()
 */
declare function Untype(typeName: string): {
  definition: string
  name: string
  text: string
} 