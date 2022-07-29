import type { Node } from 'ts-morph'

export const walk = (ast: Node, cb: (node: Node) => void) => {
  cb(ast)

  ast.getChildren().forEach((child) => {
    walk(child, cb)
  })
}
