import { Props } from './type'

export const isProperty = (key: string) => key !== 'children' && !isEvent(key)

export const isNext = (pre: Props, next: Props) => (key: string) => pre[key] !== next[key]

export const isOnlyPre = (next: Props) => (key: string) => !(key in next)

export const isEvent = (key: string) => key.startsWith('on')

export const getEventName = (name: string) => name.toLowerCase().substring(2)
