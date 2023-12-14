// utils/xhr.js
function AxiosError(message, code, config, request, response) {
  try {
    Error.call(this)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = new Error().stack
    }

    this.message = message
    this.name = 'AxiosError'
    code && (this.code = code)
    config && (this.config = config)
    request && (this.request = request)
    response && (this.response = response)
  } catch (error) {
    console.error('AxiosError', error)
  }
}

function buildURL(url, params) {
  try {
    let arr = []
    if (params) {
      for (let key in params) {
        arr.push(key + '=' + params[key])
      }
    }
    return url + (arr.length ? '?' + arr.join('&') : '')
  } catch (error) {
    return ''
  }
}

export function xhrAdapter(config) {
  return new Promise(function (resolve, reject) {
    let requestData = config.data
    let requestHeaders = config.headers
    let request = new XMLHttpRequest()
    request.open((config.method && config.method.toUpperCase()) || 'GET', buildURL(config.url, config.params), true)
    request.timeout = config.timeout

    function onloadend() {
      if (!request) {
        return
      }

      let responseHeaders = {}

      if ('getAllResponseHeaders' in request) {
        let headers = request.getAllResponseHeaders()
        let arr = headers.trim().split(/[\r\n]+/)
        arr.forEach(function (line) {
          let parts = line.split(': ')
          let header = parts.shift()
          let value = parts.join(': ')
          responseHeaders[header] = value
        })
      }

      let response = {
        data: JSON.parse(request.responseText),
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      }
      resolve(response.data) 
      request = null
    } 

    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return
      } 
      setTimeout(onloadend)
    }

    request.onerror = function handleError() {
      reject(new AxiosError('Network Error', 'ERR_NETWORK', config, request, null)) 

      request = null
    }

    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded'

      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage
      }

      reject(new AxiosError(timeoutErrorMessage, 'ECONNABORTED', config, request, null)) // Clean up request

      request = null
    } 

    if ('setRequestHeader' in request && requestHeaders) {
      for (let key in requestHeaders) {
        request.setRequestHeader(key, requestHeaders[key].toString())
      }
    } else {
      request.setRequestHeader('Content-Type', 'application/json')
    }

    if (!requestData) {
      requestData = null
    }

    request.send(config.data)
  }).catch((err) => {
    console.error('xhrAdapter', err)
  })
}
