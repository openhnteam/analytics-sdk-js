# fire-bird-browser

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
// envType 标识接入环境。 dev:测试环境，prod:生产。 
firebird.init({
  appKey: 'appKey',
  salt: 'xxx',
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



