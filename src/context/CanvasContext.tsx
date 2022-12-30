import React, { useState, useEffect, useContext } from 'react'

type CanvasContextType = {
  canvas: CanvasRenderingContext2D,
}

const CanvasContext = React.createContext({} as CanvasContextType)

function useCanvasContext() {
    return useContext(CanvasContext)
}

function CanvasProvider({children}: {children: React.ReactNode}) {

    const [canvas, setCanvas] = useState(undefined as CanvasRenderingContext2D|undefined)
    
    useEffect(() => {
      const canvasElement = document.getElementById('canvas') as HTMLCanvasElement
      const canvasContext = canvasElement.getContext('2d')
      if (canvasContext) {
        setCanvas(canvasContext)
      }
    }, [])

    if (!canvas) {
      return (
        <>
          Loading...
        </>
      )
    }

    return (
        <CanvasContext.Provider
          value={{
            canvas,
          }}
        >
         {children}
        </CanvasContext.Provider>
    )
}

export { useCanvasContext, CanvasProvider }