/**
 * uniapp的实例，通过调用方传进来
 */

export let uniExample: any = null

export const setUniExample = (uni) => {
  uniExample = uni
}

export const getUniExample = () => {
  return uniExample
}
