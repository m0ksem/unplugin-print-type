import { UntypeRenderer } from './rendrer'

export class UntypeCompiler extends UntypeRenderer {
  toUntypeObject(type: string) {
    return `({
      definition: \`${type}\`,
    })`
  }
}
