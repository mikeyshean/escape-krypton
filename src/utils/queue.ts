interface IQueue<T> {
  add(item: T): void;
  pop(): T | undefined;
  size(): number;
}

class Queue<T> implements IQueue<T> {
  private items: { [key: number]: T} = {}
  private itemSet: Set<T>
  private frontIndex = 0
  private backIndex = 0

  constructor() {
    this.items = {}
    this.itemSet = new Set()
    this.frontIndex = 0
    this.backIndex = 0
  }

  add(item: T): void {
    this.items[this.backIndex] = item
    this.itemSet.add(item)
    this.backIndex++
  }

  pop(): T | undefined {
    const item = this.items[this.frontIndex]
    if (item) {
      this.itemSet.delete(item)
    }
    delete this.items[this.frontIndex]
    this.frontIndex++
    return item
  }

  peek() {
    return this.items[this.frontIndex]
  }

  size(): number {
    return this.backIndex - this.frontIndex
  }

  unordered_items(): Set<T> {
    return this.itemSet
  }
}

export default Queue