import type { Node } from 'ts-morph'

export const walkAst = (ast: Node, cb: (node: Node) => void) => {
  cb(ast)

  ast.getChildren().forEach((child) => {
    walkAst(child, cb)
  })
}
