# unplugin-print-type

Experimental TS type printer. 

Print TS type deeply handle all subtypes. Useful if you want to document types.

## Features
- Render type during build (Zero runtime-code)
- Render type aliases and interfaces to string
- Resolve imported types

## Usage

```ts
import type { UserRole } from './user'

interface User {
  name: string
  role: UserRole
}

console.log(`User type: ${PrintType<User>()}`)
```

Output
```plain
User type: {
  name: string
  role: 'admin' | 'user'
}
```

## Install

```bash
npm i unplugin-print-type
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import Untype from 'unplugin-print-type/vite'

export default defineConfig({
  plugins: [
    Untype({ /* options */ }),
  ],
})
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-print-type/webpack')({ /* options */ })
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
    ['unplugin-print-type/nuxt', { /* options */ }],
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
      require('unplugin-print-type/webpack')({ /* options */ }),
    ],
  },
}
```

<br></details>
