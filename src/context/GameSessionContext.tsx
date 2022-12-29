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
  updateLocalHighScore: (highScore: number) => void
}

const GameSessionContext = React.createContext({} as GameSessionContextType);

function useGameSessionContext() {
    return useContext(GameSessionContext)
}

function GameSessionProvider({children}: {children: React.ReactNode}) {

    const [gameSession, setGameSession] = useState({id: '', highScore: 0})
    
    const gameSessionCreate = trpc.gameSession.create.useMutation()

    async function createSession() {
      const newSession = await gameSessionCreate.mutateAsync(true)
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
      
      setGameSession(newSession)
    }

    function updateLocalHighScore(highScore: number) {
      const newLocalSession = {...gameSession}
      newLocalSession.highScore = highScore
      localStorage.setItem(SESSION_KEY, JSON.stringify(newLocalSession))
    }

    useEffect(() => {
        // Get or Create GameSession
        const storedSession = localStorage.getItem(SESSION_KEY) ? JSON.parse(localStorage.getItem(SESSION_KEY) as string) : ''
        if (storedSession) {
            setGameSession({id: storedSession.id, highScore: storedSession.highScore})
        } else {
          createSession()
        }
    },[])

    return (
        <GameSessionContext.Provider
          value={{
            createSession,
            gameSession,
            updateLocalHighScore: updateLocalHighScore,
          }}
        >
         {children}
        </GameSessionContext.Provider>
    );
};

export { useGameSessionContext, GameSessionProvider }