export interface Props {
  [key: string]: any
}

export interface TypeFn extends Function {
  defaultProps?: Props
}

export type TypeI = string | TypeFn

export interface FiberNode {
  // Instance
  type: TypeI
  tag: string
  key: string | number

  // FiberInfo
  child: any
  sibling: any
  return: any
  index: number

  ref: any

  pendingProps: any
  memoizedProps: any
  memoizedState: any

  // alternate current tree
  alternate: any
}
