// composables/useApiFetch.js - 客户端API请求封装
export function useApiFetch() {
  const config = useRuntimeConfig()
  const token = useCookie('UToken').value
  const apiBase = config.public.apiBase

  // 将对象转为URL编码格式
  const toUrlEncoded = (obj) =>
    Object.keys(obj)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&')

  const request = async (method, url, data = {}, headers = {}) => {
    const res = await useFetch(apiBase + url, {
      method,
      query: method === 'GET' ? data : undefined,
      body: method === 'POST' ?
        toUrlEncoded(data) :
        undefined,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(token ? {
          Usertoken: token
        } : {}),
        ...headers,
      }
    })
    // Nuxt useFetch可能返回已解析对象或原始字符串，统一处理
    const result = typeof res.data.value === 'string' ? JSON.parse(res.data.value) : res.data.value
    // 401未授权时跳转登录页
    if (result && result.code == 401) {
      navigateTo('/login')
    }
    return result
  }

  return {
    get: (url, data = {}, headers = {}) => request('GET', url, data, headers),
    post: (url, data = {}, headers = {}) => request('POST', url, data, headers),
  }
}