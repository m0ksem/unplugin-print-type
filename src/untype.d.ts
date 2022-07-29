declare type Untype<T> = string

/** 
 * Compiler macro. Will transform type to human readable string.
 * 
 * @usage
 * 
 * Untype<User>()
 */
declare function Untype<T>(typeName: string): {
  definition: string
  name: string
  text: string
} 