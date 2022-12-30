import React, { createContext, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from "../utils/trpc";
import Error from "next/error"
import { SlowBuffer } from 'buffer';

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
    const getSessionQuery = trpc.gameSession.get.useQuery({id: gameSession.id}, {retry: false})
    const createSessionQuery = trpc.gameSession.create.useMutation()
    
    useEffect(() => {
        // Get or Create GameSession
        const storedSession = localStorage.getItem(SESSION_KEY) ? JSON.parse(localStorage.getItem(SESSION_KEY) as string) : ''
        if (storedSession) {
            setGameSession({id: storedSession.id, highScore: storedSession.highScore})
        } else {
          createSession()
        }
    }, [])

    // Edge case for invalid local sessions, fallback to create new session
    verifyLocalSession()

    if (!isValidGameState()) {
      return (
        <>
          Loading...
        </>
      )
    }

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

    function verifyLocalSession() {
      if (getSessionQuery.isError && localStorage.getItem(SESSION_KEY)) {
        const localSession = JSON.parse(localStorage.getItem(SESSION_KEY) as string)
        if (gameSession.id == localSession.id) {
          localStorage.removeItem(SESSION_KEY)
          createSession()
        }
      }
    }

    function isValidGameState() {
      return getSessionQuery.isSuccess && getSessionQuery.data?.id
    }

    async function createSession() {
      const newSession = await createSessionQuery.mutateAsync(true)
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
      
      setGameSession(newSession)
    }

    function updateLocalHighScore(highScore: number) {
      const newLocalSession = {...gameSession}
      newLocalSession.highScore = highScore
      localStorage.setItem(SESSION_KEY, JSON.stringify(newLocalSession))
    }
};

export { useGameSessionContext, GameSessionProvider }