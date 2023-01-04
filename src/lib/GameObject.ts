interface GameObject {
  step: () => void
  isOffScreen: () => boolean
  draw: () => void
}

export default GameObject