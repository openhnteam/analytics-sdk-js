export const enum WxAppEvents {
  AppOnLaunch = 'AppOnLaunch',
  AppOnShow = 'AppOnShow',
  AppOnHide = 'AppOnHide',
  AppOnError = 'AppOnError',
  AppOnPageNotFound = 'AppOnPageNotFound',
  AppOnUnhandledRejection = 'AppOnUnhandledRejection'
}

export const enum WxPageEvents {
  PageOnLoad = 'PageOnLoad',
  PageOnShow = 'PageOnShow',
  PageOnReady = 'PageOnReady',
  PageOnUnload = 'PageOnUnload',
  PageOnHide = 'PageOnHide',
  PageOnShareAppMessage = 'PageOnShareAppMessage',
  PageOnShareTimeline = 'PageOnShareTimeline',
  PageOnTabItemTap = 'PageOnTabItemTap'
}

export const enum WxRouteEvents {
  SwitchTab = 'switchTab',
  ReLaunch = 'reLaunch',
  RedirectTo = 'redirectTo',
  NavigateTo = 'navigateTo',
  NavigateBack = 'navigateBack',
  NavigateToMiniProgram = 'navigateToMiniProgram',
  RouteFail = 'routeFail'
}

/**
 *微信小程序需要监听的事件类型
 *
 * @export
 *  const const@enum {number}
 */
export const enum WxBaseEventTypes {
  REQUEST = 'request',
  CONSOLE = 'console',
  ROUTE = 'route',
  DOM = 'dom',
  //
  MINI_PERFORMANCE = 'miniPerformance',
  MINI_MEMORY_WARNING = 'miniMemoryWarning',
  MINI_NETWORK_STATUS_CHANGE = 'miniNetworkStatusChange',
  MINI_BATTERY_INFO = 'miniBatteryInfo'
}

export const enum LinstenerTypes {
  Touchmove = 'touchmove',
  Tap = 'tap',
  Longtap = 'longtap',
  Longpress = 'longpress'
}

// merge const enum
// export const WxEventTypes = Object.assign({}, WxAppEvents, WxPageEvents, WxBaseEventTypes)
export type WxEventTypes = WxAppEvents | WxPageEvents | WxBaseEventTypes
