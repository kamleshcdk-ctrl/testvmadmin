export default defineNuxtPlugin((nuxtApp) => {
  // const toast = useToast()

  nuxtApp.vueApp.config.errorHandler = (error) => { // instance, info
    // toast.add({ title: `- ${error}` })
    // eslint-disable-next-line
    console.log("error:", error)
  }
})
