export const useTabRenderer = (tab = 2) => {
  const tabRenderer = {
    currentTab: 0,
    left() { this.currentTab -= tab },
    right() { this.currentTab += tab },
    toString() { return ' '.repeat(this.currentTab) },
  }
  return {
    tab: tabRenderer,
    withTab<T>(cb: (tab: typeof tabRenderer) => T) {
      tabRenderer.right()
      const result = cb(tabRenderer)
      tabRenderer.left()
      return result
    },
  }
}
