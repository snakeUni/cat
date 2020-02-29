import { Props, TypeI } from './type'

export function createElement(type: TypeI, props: Props, children: any) {
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

  return CatElement(type, normalizedProps, props && props.key, props && props.ref)
}

export function CatElement(type: TypeI, props: Props, key: string, ref: any) {
  const element = {
    type,
    props,
    key,
    ref
  }

  return element
}
