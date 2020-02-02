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

// 后续更改
export function useState(initialState: any) {
  const oldHook = getOldHook()
  const wipFiber = getWipFiber()

  const hook = {
    state: oldHook ? oldHook.state : initialState
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
