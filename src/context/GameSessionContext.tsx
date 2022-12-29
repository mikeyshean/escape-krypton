import React, { createContext, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from "../utils/trpc";

const SESSION_KEY = 'kryptonite-session'

type GameSession = {
  id: string,
  highScore: number,
}

type GameSessionContextType = {
  createSession: () => void,
  gameSession: GameSession,
  setGameSession: (game_session: GameSession) => void,
  isGameSession: () => boolean
  
}

const GameSessionContext = React.createContext({} as GameSessionContextType);

function useGameSessionContext() {
    return useContext(GameSessionContext)
}




function GameSessionProvider({children}: {children: React.ReactNode}) {

    const [gameSession, setGameSession] = useState({id: '', highScore: 0})
    console.log("first load GameSessionProvider: "+gameSession.id)
    
    const isGameSession = () => !!gameSession.id
    const gameSessionCreate = trpc.gameSession.create.useMutation()

    async function createSession() {
      const gameSession = await gameSessionCreate.mutateAsync(true)
      localStorage.setItem(SESSION_KEY, gameSession.id)
      
      setGameSession(gameSession)
    }

    useEffect(() => {
        console.log("GameSessionProvider useEffect: Checking for stored tokens")
        const storedSessionId = localStorage.getItem(SESSION_KEY) ? localStorage.getItem(SESSION_KEY) as string : ''
        if (storedSessionId) {
            console.log(`Found Token!    setGameSession with ${storedSessionId}`)
            setGameSession({id: storedSessionId, highScore: 0})
        } else {
          console.log("No token found.... creating one")
          createSession()
        }
    },[])

    return (
        <GameSessionContext.Provider
          value={{
            createSession,
            gameSession,
            setGameSession: (gameSession: GameSession) => setGameSession(gameSession),
            isGameSession,
          }}
        >
         {children}
        </GameSessionContext.Provider>
    );
};

export { useGameSessionContext, GameSessionProvider }