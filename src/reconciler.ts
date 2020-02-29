import { createDom } from './create-dom'
import { isNext, isOnlyPre, isProperty, isEvent, getEventName } from './utils'
import { RequestIdleCallbackDeadline, CallbackFn, FiberNode, Props } from './type'

let nextUnitOfWork: any = null
let wipRoot: any = null
let currentRoot: any = null
let deletions: any[] = []

let wipFiber: FiberNode | null = null

export function render(element: FiberNode, container: HTMLElement) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  }
  deletions = []

  nextUnitOfWork = wipRoot
}

function workLoop(deadline: RequestIdleCallbackDeadline) {
  let shouldYield = false

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

// 执行 workloop
requestIdleCallback(workLoop)

function requestIdleCallback(callback: CallbackFn) {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(callback)
  }
}

function performUnitOfWork(fiber: FiberNode) {
  const isFunctionComponent = fiber.type instanceof Function

  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }

    nextFiber = nextFiber.return
  }
}

function updateHostComponent(fiber: FiberNode) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  const elements = fiber.props.children
  reconcilerChildren(fiber, elements)
}

function updateFunctionComponent(fiber: FiberNode) {
  wipFiber = fiber
  wipFiber.hooks = []

  const children = [fiber.type(fiber.props)]
  reconcilerChildren(fiber, children)
}

export function getWipFiber() {
  return wipFiber
}

export function scheduleWork() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot
  }
  nextUnitOfWork = wipRoot
  deletions = []
}

function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber: FiberNode) {
  if (!fiber) return

  let parent = fiber.return

  //  find the parent of a DOM node we’ll need to go up the fiber tree until we find a fiber with a DOM node.
  while (!parent.dom) {
    parent = parent.return
  }

  const parentDom = parent.dom

  if (parentDom) {
    if (fiber.effectTag === 'ADD' && fiber.dom !== null) {
      parentDom.appendChild(fiber.dom)
    } else if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
      updateDom(fiber.dom, fiber.alternate.props, fiber.props)
    } else if (fiber.effectTag === 'DELETE') {
      commitDeletion(fiber, parentDom)
    }
  }

  commitWork(fiber.sibling)
  commitWork(fiber.child)
}

// when removing a node we also need to keep going until we find a child with a DOM node
function commitDeletion(fiber: FiberNode, parentDom: HTMLElement | Text) {
  if (fiber.dom) {
    parentDom.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, parentDom)
  }
}

function reconcilerChildren(wipFiber: FiberNode, elements: any) {
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let presibling: any = null

  // 构建 fiber 结构
  while (index < elements.length || oldFiber !== null) {
    const ele = elements[index]
    let newFiber = null

    /**
     * To compare them we use the type:
     * if the old fiber and the new element have the same type, we can keep the DOM node and just update it with the new props
     * if the type is different and there is a new element, it means we need to create a new DOM node
     * and if the types are different and there is an old fiber, we need to remove the old node
     */
    const sameType = oldFiber && ele && ele.type === oldFiber.type

    if (sameType) {
      // update node
      newFiber = {
        type: oldFiber.type,
        props: ele.props,
        dom: oldFiber.dom,
        return: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }

    if (ele && !sameType) {
      // add node
      newFiber = {
        type: ele.type,
        props: ele.props,
        dom: null,
        return: wipFiber,
        alternate: null,
        effectTag: 'ADD'
      }
    }

    if (oldFiber && !sameType) {
      // delete node
      oldFiber.effectTag = 'DELETE'
      deletions.push(oldFiber)
    }

    if (index === 0) {
      // 第一个就是子元素
      wipFiber.child = newFiber
    } else {
      presibling.sibling = newFiber
    }

    // 记录上一个
    presibling = newFiber
    index++
  }
}

function updateDom(dom: HTMLElement | Text, preProps: Props, nextProps: Props) {
  // remove old properties
  Object.keys(preProps)
    .filter(isProperty)
    .filter(isOnlyPre(nextProps))
    .forEach(name => {
      ;(dom as any)[name] = ''
    })

  // update or set properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNext(preProps, nextProps))
    .forEach(name => {
      ;(dom as any)[name] = nextProps[name]
    })

  // update event listeners
  Object.keys(preProps)
    .filter(isEvent)
    .filter(key => isOnlyPre(nextProps)(key) || isNext(preProps, nextProps)(key))
    .forEach(name => {
      const eventName = getEventName(name)
      dom.removeEventListener(eventName, preProps[name])
    })

  // add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNext(preProps, nextProps))
    .forEach(name => {
      const eventName = getEventName(name)
      dom.addEventListener(eventName, nextProps[name])
    })
}
