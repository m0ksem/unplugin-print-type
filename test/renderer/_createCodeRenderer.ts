import { Project } from 'ts-morph'
import { createRenderer } from '../../src/core/renderer/createRenderer'

export const createCodeRenderer = (code: string) => {
  const project = new Project()

  const renderer = createRenderer(project)

  renderer.addFile('./main.ts', code)

  return renderer
}

export const createProjectRenderer = () => {
  const project = new Project()
  const renderer = createRenderer(project)

  return {
    renderer,
    addFile: (filePath: string, code: string) => {
      project.createSourceFile(filePath, code)
      renderer.addFile(filePath, code)
    },
  }
}
