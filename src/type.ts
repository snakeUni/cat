export interface Props {
  [key: string]: any
}

export type TypeI = Function | string

export interface Hook {
  state: any
  dep?: any[]
}

export interface FiberNode {
  // Instance
  type: any
  tag: string
  key: string | number

  // FiberInfo
  child: any
  sibling: FiberNode
  return: FiberNode
  index: number

  ref: any

  props: {
    [key: string]: any
  }
  dom: HTMLElement | Text

  // alternate current tree
  alternate: FiberNode

  effectTag: string

  hooks: Hook[]
}

/**
 * requestIdleCallback polyfill
 */

type RequestIdleCallbackHandle = any
type RequestIdleCallbackOptions = {
  timeout: number
}
export type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean
  timeRemaining: () => number
}

export type CallbackFn = (deadline: RequestIdleCallbackDeadline) => void

export type RequestIdleCallback = (
  callback: CallbackFn,
  opts?: RequestIdleCallbackOptions
) => RequestIdleCallbackHandle

export type CancelIdleCallback = (handle: RequestIdleCallbackHandle) => void

declare global {
  interface Window {
    requestIdleCallback: RequestIdleCallback
    cancelIdleCallback: CancelIdleCallback
  }
}
