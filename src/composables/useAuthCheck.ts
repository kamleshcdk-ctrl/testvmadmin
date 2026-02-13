import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

export function useAuthCheck(intervalMs = 10000) {
  const notAuthenticated = ref(false)

  const checkAuth = async () => {
    try {
      const result = await axios.get('/api/status', {
        headers: {
          // This header asks cloudflare to return a 401 when not authenticated
          'X-Requested-With': 'XMLHttpRequest',
        }
      })
      if (result.status === 401) {
        notAuthenticated.value = true
      } else {
        notAuthenticated.value = false
      }
      return result;

    } catch (error) {
      // @ts-expect-error error.status
      if (error?.status === 401) {
        notAuthenticated.value = true
      }
    }
  }

  const startAuthChecker = async () => {
    await checkAuth()
  }

  onMounted(() => {
    const interval = setInterval(startAuthChecker, intervalMs)
    onUnmounted(() => clearInterval(interval))
  })

  return { notAuthenticated }
}
