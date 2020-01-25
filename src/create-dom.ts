import { FiberNode } from './type'

// svg is leg
export function createDom(fiber: FiberNode): Text | HTMLElement {
  const dom =
    fiber.type === 'TEXT' ? document.createTextNode('') : document.createElement(fiber.type)

  const isProperty = (key: string) => key !== 'children'

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      ;(dom as any)[name] = fiber.props[name]
    })

  return dom
}
