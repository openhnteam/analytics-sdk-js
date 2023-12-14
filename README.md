# analytics-sdk-js

基于 Typescript + rollup 进行开发

## 联系我们

联系我们，给您最优的服务。欢迎访问 [openhn官网](https://www.openhn.com)

<img width="300" src="./example/官方二维码.JPG" alt="官方二维码">

## 接入sdk

<h2>fire-bird-mini（小程序端sdk）</h2>
## Install

```bash
# using npm
npm install fire-bird-mini-sdk
# using yarn
yarn add fire-bird-mini-sdk
```

## 使用说明
```typescript
// 入口文件
import firebird from 'fire-bird-mini-sdk'

// 初始化函数
firebird.init({
  appKey: 'appKey',
  salt: 'xxx',
  appVersion: 'appVersion',
  host: '',
  uni: uni, // 依赖于uniapp的uni实例
  appUserId: '' // 可选：用户的id
})
```

## 事件埋点
```typescript
import firebird from 'fire-bird-mini-sdk'
// 在需要进行埋点的地方调用 trackEvent
firebird.trackEvent({
  key: 'xxxx', // 页面埋点需要的key,业务开发自定义或者pm提供，例：点击登录按钮：loginClick
  segmentation: {
    page:'xxxxx'
    ... // 在这里写需要上传的信息（segmentation是一个对象，可以在里面埋自己想要的属性）
  }
})
```

<h2>fire-bird-browser（web端sdk）</h2>

## Install

```bash
# using npm
npm install fire-bird-browser-sdk
# using yarn
yarn add fire-bird-browser-sdk
```

## 使用说明
```typescript
// 入口文件
import firebird from 'fire-bird-browser-sdk'

// 初始化函数
firebird.init({
  appKey: 'appKey',
  appVersion: 'appVersion',
  host: '',
  appUserId: '' // 可选：用户的id
})
```

## 事件埋点
```typescript
import firebird from 'fire-bird-browser-sdk'
// 在需要进行埋点的地方调用 trackEvent
firebird.trackEvent({
  key: 'xxxx', // 页面埋点需要的key,业务开发自定义或者pm提供，例：点击登录按钮：loginClick
  segmentation: {
    page:'xxxxx'
    ... // 在这里写需要上传的信息（segmentation是一个对象，可以在里面埋自己想要的属性）
  }
})
```







