export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald'
    },
    container: {
      base: 'max-w-5xl'
    },
    card: {
      slots: {
        header: 'flex flex-wrap items-center justify-between'
      },
      body: 'space-y-4'
    }
  }
})
