import Axios, { InternalAxiosRequestConfig } from 'axios'
import { firebaseAuth } from '@/lib/firebase'

async function requestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json'

    const { currentUser } = firebaseAuth
    if (currentUser) {
      const token = await currentUser.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
}

export const apiClient = Axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

apiClient.interceptors.request.use(requestInterceptor)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error)
  }
)
