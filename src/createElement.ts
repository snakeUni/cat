import { Props, TypeI } from './type'

function createElement(type: TypeI, props: Props, children: any) {
  let normalizedProps: Props = {},
    i

  for (i in props) {
    if (i !== 'key' && i !== 'ref') {
      normalizedProps[i] = props[i]
    }
  }

  if (arguments.length > 3) {
    children = [children]

    for (i = 3; i < arguments.length; i++) {
      children.push(arguments[i])
    }
  }

  if (children !== null) {
    normalizedProps.children = children
  }

  if (typeof type === 'function' && type.defaultProps) {
    for (i in type.defaultProps) {
      // 应用 defaultProps
      if (normalizedProps[i] === undefined) {
        normalizedProps[i] = type.defaultProps[i]
      }
    }
  }

  return catElement(type, normalizedProps, props && props.key, props && props.ref)
}

function catElement(type: TypeI, props: Props, key: string, ref: any) {}
