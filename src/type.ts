export interface Props {
  [key: string]: any
}

export interface TypeFn extends Function {
  defaultProps?: Props
}

export type TypeI = string | TypeFn
