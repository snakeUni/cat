import { createDom } from './create-dom'
import { RequestIdleCallbackDeadline, CallbackFn, FiberNode } from './type'

let nextUnitOfWork: any = null
let wipRoot: any = null
let currentRoot: any = null
let deletions: any[] = []

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
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  const elements = fiber.props.children
  reconcilerChildren(fiber, elements)

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

function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber: FiberNode) {
  if (!fiber) return

  const parentDom = fiber.return.dom

  if (parentDom) {
    if (fiber.effectTag === 'ADD' && fiber.dom !== null) {
      parentDom.appendChild(fiber.dom)
    } else if (fiber.effectTag === 'DELETE') {
      parentDom.removeChild(fiber.dom)
    }
  }

  commitWork(fiber.sibling)
  commitWork(fiber.child)
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
      wipFiber.child = newFiber
    } else {
      presibling.sibling = newFiber
    }

    // 记录上一个
    presibling = newFiber
    index++
  }
}
