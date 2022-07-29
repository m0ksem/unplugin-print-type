# unplugin-untype

Experimental untype plugin. Used to get type string. Can be helpful to write docs.

## Spec

Plugin must provide global compiler macros `Untype(type: string): UntypeObject`. Function returns object, that contains type value.

[![NPM version](https://img.shields.io/npm/v/unplugin-untype?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-untype)

Untype template for [unplugin](https://github.com/unjs/unplugin).

## Install

```bash
npm i unplugin-untype
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import Untype from 'unplugin-untype/vite'

export default defineConfig({
  plugins: [
    Untype({ /* options */ }),
  ],
})
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import Untype from 'unplugin-untype/rollup'

export default {
  plugins: [
    Untype({ /* options */ }),
  ],
}
```

<br></details>


<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-untype/webpack')({ /* options */ })
  ]
}
```

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
export default {
  buildModules: [
    ['unplugin-untype/nuxt', { /* options */ }],
  ],
}
```

> This module works for both Nuxt 2 and [Nuxt Vite](https://github.com/nuxt/vite)

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('unplugin-untype/webpack')({ /* options */ }),
    ],
  },
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import Untype from 'unplugin-untype/esbuild'

build({
  plugins: [Untype()],
})
```

<br></details>
