import { existsSync, readFileSync } from 'fs'
import { isAbsolute, resolve } from 'path'
import { useRendererContext } from '../../../composables/useRendererContext'

const isTsModule = (path: string) => !path.startsWith('.') && !isAbsolute(path)

export const useTsModuleResolver = () => {
  const context = useRendererContext()

  /**
   * @param path path to module
   */
  const resolveTypesFile = (path: string) => {
    const moduleDirs = context.moduleDirs // TODO: Move to context
    const moduleDir = moduleDirs.find(dir => existsSync(resolve(dir, path)))
    if (!moduleDir) {
      return
    }

    const modulePath = resolve(moduleDir, path)
    const packageJsonPath = resolve(modulePath, 'package.json')
    if (!existsSync(packageJsonPath)) { throw new Error(`${packageJsonPath} is not a module`) }

    const packageJson = JSON.parse(readFileSync(packageJsonPath).toString())

    if (!packageJson.types) { return undefined }

    const typesPath = resolve(modulePath, packageJson.types)

    if (!context.filter(typesPath)) { return }

    return typesPath
  }

  return {
    resolveTypesFile,
    isTsModule,
  }
}
