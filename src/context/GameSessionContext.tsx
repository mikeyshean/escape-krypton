import React, { createContext, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from "../utils/trpc";
import Error from "next/error"
import { SlowBuffer } from 'buffer';

const SESSION_KEY = 'kryptonite-session'

type GameSession = {
  id: string,
  highScore: number,
  bestGameId: string,
}

type GameSessionContextType = {
  createSession: () => void,
  gameSession: GameSession,
  updateLocalHighScore: (highScore: number, gameId: string) => void
  setGameSession: (gameSession: GameSession) => void
}

const GameSessionContext = React.createContext({} as GameSessionContextType);

function useGameSessionContext() {
    return useContext(GameSessionContext)
}

function GameSessionProvider({children}: {children: React.ReactNode}) {

    const [gameSession, setGameSession] = useState({id: '', highScore: 0, bestGameId: ''})
    const getSessionQuery = trpc.gameSession.get.useQuery({id: gameSession.id}, {retry: false})
    const createSessionQuery = trpc.gameSession.create.useMutation()
    
    useEffect(() => {
        // Get or Create GameSession
        const storedSession = localStorage.getItem(SESSION_KEY) ? JSON.parse(localStorage.getItem(SESSION_KEY) as string) : ''
        if (storedSession) {
            setGameSession({id: storedSession.id, highScore: storedSession.highScore, bestGameId: storedSession.bestGameId})
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
            updateLocalHighScore,
            setGameSession: (gameSession: GameSession) => setGameSession(gameSession)
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
      const gameSession = {...newSession, bestGameId: ''}
      localStorage.setItem(SESSION_KEY, JSON.stringify(gameSession))
      
      setGameSession(gameSession)
    }

    function updateLocalHighScore(highScore: number, gameId: string) {
      const newLocalSession = {...gameSession, highScore: highScore, bestGameId: gameId}
      localStorage.setItem(SESSION_KEY, JSON.stringify(newLocalSession))
    }
};

export { useGameSessionContext, GameSessionProvider }