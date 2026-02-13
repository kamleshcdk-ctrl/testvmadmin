export default defineNuxtPlugin(async (nuxtApp) => {
  nuxtApp.hook('apollo:error', async (error) => {
    try {
      const networkError = error?.networkError;
      // @ts-expect-error statusCode
      const statusCode = networkError?.statusCode;

      if (statusCode === 401) {
        // eslint-disable-next-line
        console.log("Apollo error code is 401 during background request")
        reloadNuxtApp() // Present cloudflare login
      }
    } catch (error) {
      // eslint-disable-next-line
      console.log("Apollo error thrown :", error);
    }
  })
})
