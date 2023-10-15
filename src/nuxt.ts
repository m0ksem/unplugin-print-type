import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'
import { defaultOptions } from './composables/useRendererContext'
import vite from './vite'
import webpack from './webpack'
import type { PrintTypePluginOptions } from './types'
import '@nuxt/schema'

export default defineNuxtModule<PrintTypePluginOptions>({
  meta: {
    name: 'nuxt-unplugin-starter',
    configKey: 'unpluginStarter',
  },
  defaults: defaultOptions,
  setup(options) {
    addVitePlugin(() => vite(options))
    addWebpackPlugin(() => webpack(options))
  },
})
