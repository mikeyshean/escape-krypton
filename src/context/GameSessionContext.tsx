import React, { useState, useEffect, useContext } from 'react'
import { trpc } from "../utils/trpc"

const SESSION_KEY = 'kryptonite-session'

type GameSession = {
  id: string,
  highScore: number,
  bestGameId: string,
  phoneNumber: string|null,
  playerName: string|null
}

type GameSessionContextType = {
  createSession: () => void,
  gameSession: GameSession,
  updateLocalHighScore: (highScore: number, gameId: string) => void,
  updateSessionPhone: (phoneNumber: string) => void,
  updateSessionName: (playerName: string) => void,
  setGameSession: (gameSession: GameSession) => void
}

const GameSessionContext = React.createContext({} as GameSessionContextType)

function useGameSessionContext() {
    return useContext(GameSessionContext)
}

function GameSessionProvider({children}: {children: React.ReactNode}) {

    const [gameSession, setGameSession] = useState<GameSession>({id: '', highScore: 0, bestGameId: '', phoneNumber: '', playerName: ''})
    const getSessionQuery = trpc.gameSession.get.useQuery({id: gameSession.id}, {
      retry: false,
      onSuccess: (data) => {
        updateLocalSession(data)
      }
    })
    const createSessionQuery = trpc.gameSession.create.useMutation()
    const updateSessionQuery = trpc.gameSession.update.useMutation()
    
    useEffect(() => {
        // Get from local or Create GameSession
        const storedSession = getLocalSession()
        if (Object.keys(storedSession).length > 0) {
          setGameSession({
            id: storedSession.id,
            highScore: storedSession.highScore,
            bestGameId: storedSession.bestGameId,
            phoneNumber: storedSession.phoneNumber,
            playerName: storedSession.playerName
          })
        } else {
          createSession()
        }
    }, [])

    // Validate local session on backend
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
            updateSessionPhone,
            updateSessionName,
            setGameSession: (gameSession: GameSession) => setGameSession(gameSession)
          }}
        >
         {children}
        </GameSessionContext.Provider>
    )

    function getLocalSession() {
      return localStorage.getItem(SESSION_KEY) ? JSON.parse(localStorage.getItem(SESSION_KEY) as string) : {}
    }

    function verifyLocalSession() {
      // Edge case for invalid local sessions falls back to create new session
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
      const gameSession = {...newSession, bestGameId: '', highScore: 0}
      localStorage.setItem(SESSION_KEY, JSON.stringify(gameSession))
      
      setGameSession(gameSession)
    }

    function updateLocalHighScore(highScore: number, gameId: string) {
      const localSession = getLocalSession()
      const newLocalSession = {...localSession, highScore: highScore, bestGameId: gameId}
      localStorage.setItem(SESSION_KEY, JSON.stringify(newLocalSession))
    }

    function updateSessionPhone(phoneNumber: string) {
      const localSession = getLocalSession()
      const newLocalSession = {...localSession, phoneNumber: phoneNumber}
      localStorage.setItem(SESSION_KEY, JSON.stringify(newLocalSession))
      updateSessionQuery.mutate({id: gameSession.id, phoneNumber: phoneNumber})
    }

    function updateSessionName(playerName: string) {
      const localSession = getLocalSession()
      const newLocalSession = {...localSession, playerName: playerName}
      localStorage.setItem(SESSION_KEY, JSON.stringify(newLocalSession))
      updateSessionQuery.mutate({id: gameSession.id, playerName: playerName})
    }

    function updateLocalSession(gameSession: {
      id: string;
      phoneNumber: string | null;
      playerName: string | null;
    } | null) {
      const localSession = getLocalSession()
      const newLocalSession = {...localSession, playerName: gameSession?.playerName, phoneNumber: gameSession?.phoneNumber}
      localStorage.setItem(SESSION_KEY, JSON.stringify(newLocalSession))
    }
}

export { useGameSessionContext, GameSessionProvider }