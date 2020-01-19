// fork from react
interface Node {
  id: number
  sortIndex: number
}

type Heap = Node[]

export function push(heap: Heap, node: Node): void {
  const index = heap.length
  heap.push(node)
  siftUp(heap, node, index)
}

export function peek(heap: Heap): Node | null {
  const first = heap[0]
  return first === undefined ? null : first
}

export function pop(heap: Heap): Node | null {
  const first = heap[0]

  if (first !== undefined) {
    const last = heap.pop() as Node

    if (last !== first) {
      heap[0] = last
      siftDown(heap, last, 0)
    }
    return first
  } else {
    return null
  }
}

function siftUp(heap: Heap, node: Node, i: number): void {
  let index = i
  while (true) {
    const parentIndex = (index - 1) >>> 1
    const parent = heap[parentIndex]

    if (parent !== undefined && compare(parent, node) > 0) {
      // The parent is larger. Swap positions.
      heap[parentIndex] = node
      heap[index] = parent
      index = parentIndex
    } else {
      // The parent is smaller. Exit.
      return
    }
  }
}

function siftDown(heap: Heap, node: Node, i: number): void {
  let index = i
  const length = heap.length

  while (index < length) {
    const leftIndex = (index + 1) * 2 - 1
    const left = heap[leftIndex]
    const rightIndex = leftIndex + 1
    const right = heap[rightIndex]

    // If the left or right node is smaller, swap with the smaller of those.
    if (left !== undefined && compare(left, node) < 0) {
      if (right !== undefined && compare(right, left) < 0) {
        heap[index] = right
        heap[rightIndex] = node
        index = rightIndex
      } else {
        heap[index] = left
        heap[leftIndex] = node
        index = leftIndex
      }
    } else if (right !== undefined && compare(right, node) < 0) {
      heap[index] = right
      heap[rightIndex] = node
      index = rightIndex
    } else {
      // Neither child is smaller. Exit.
      return
    }
  }
}

function compare(a: Node, b: Node): number {
  // Compare sort index first, then task id.
  const diff = a.sortIndex - b.sortIndex
  return diff !== 0 ? diff : a.id - b.id
}
