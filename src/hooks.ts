import { getWipFiber, scheduleWork } from './reconciler'
import { isFunction } from './utils'
import { Hook } from './type'

let hookIndex: number = 0

function getOldHook(): Hook | null {
  const wipFiber = getWipFiber()

  if (wipFiber) {
    return wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex]
  }

  return null
}

function compare(oldDeps: any[] = [], newDeps: any[] = []) {
  if (oldDeps.length !== newDeps.length) {
    return true
  }

  for (const index in newDeps) {
    if (oldDeps[index] !== newDeps[index]) {
      return true
    }
  }
  return false
}

// 后续更改
export function useState(initialState: any) {
  const oldHook = getOldHook()
  const wipFiber = getWipFiber()

  const hook = {
    state: oldHook ? oldHook.state : isFunction(initialState) ? initialState() : initialState
  }

  const setState = (state: any) => {
    if (isFunction(state)) {
      hook.state = state(hook.state)
    } else {
      hook.state = state
    }
    scheduleWork()
  }

  wipFiber?.hooks.push(hook)
  hookIndex++

  return [hook.state, setState]
}

export function useReducer(reducer: (state: any, action: any) => any, initialState: any) {
  const oldHook = getOldHook()
  const wipFiber = getWipFiber()

  const hook = {
    state: oldHook ? oldHook.state : isFunction(initialState) ? initialState() : initialState
  }

  const dispatch = (action: any) => {
    hook.state = reducer ? reducer(hook.state, action) : hook.state
    scheduleWork()
  }

  wipFiber?.hooks.push(hook)
  hookIndex++

  return [hook.state, dispatch]
}

export function useMemo(callback: () => any, dep: any[]) {
  const oldHook = getOldHook()

  if (oldHook) {
    if (compare(oldHook.dep, dep)) {
      oldHook.state = callback()
      oldHook.dep = dep
    }
  }

  return oldHook?.state
}

export function useCallback(callback: () => any, dep: any[]) {
  return useMemo(() => callback, dep)
}

export function useRef(state: any) {
  const oldHook = getOldHook()

  if (oldHook) {
    oldHook.state = { current: state }
  }

  return oldHook?.state
}
