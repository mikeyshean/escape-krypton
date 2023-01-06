import { type NextPage } from "next"
import Head from "next/head";
import GameController from '../components/GameController'
import { CanvasProvider } from "../context/CanvasContext"
import { trpc } from "../utils/trpc"
import { useRef, useState } from 'react'

type Taunts = {
  id: string;
  text: string;
}[]

const Home: NextPage = () => {
  const taunts = useRef<Taunts>()
  const [visitorCount, setVisitorCount] = useState<number>()
  const [gameCount, setGameCount] = useState<number>()
  trpc.taunt.list.useQuery(undefined, {
    onSuccess: (data) => {
      taunts.current = data
    }
  })
  trpc.gameSession.count.useQuery(undefined, {
    onSuccess: (data) => {
      setVisitorCount(data)
    }
  })
  trpc.game.count.useQuery(undefined, {
    onSuccess: (data) => {
      setGameCount(data)
    }
  })

  if (!taunts.current) {
    return (
      <>
        Loading...
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Escape from Krypton</title>
        <meta name="description" content="Escape from Krypton" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="window-container">
        <div className="main">

        <div className="game-wrapper">
          <canvas id="canvas" width="800" height="400"></canvas>
          <span className="restart">Restart</span>
          <span className="submit">Submit<br/> Best</span>
          <form id="score-form">
            <input className="name no-outline" type="text" />
            <div className="tooltip tooltip-phone">
              <span className="question-icon">?</span>
              <span className="tooltiptext">
                <p>- Get notified if anyone passes your rank</p>
                <p>- If you have multiple positions on the board, you&apos;ll only be notified once</p>
                <p>* Required to enter the leaderboard</p>
              </span>
            </div>
            <input 
              id="phone"
              maxLength={16}
              className="phone no-outline" 
              type="text" 
            />
            <div className="tooltip tooltip-taunt">
              <span className="question-icon">?</span>
              <span className="tooltiptext">Send a message to everyone you pass on the leaderboard</span>
            </div>
            {
              taunts.current?.map((taunt, idx) => {
                const key = `taunt-${idx+1}`
                return (
                  <span id={key} key={key} className={`taunt ${key}`} data-id={taunt.id}>{taunt.text}</span>
                )
              })
            }
            <span className="form-cancel">Cancel</span>
            <span className="form-submit">Submit</span>
          </form>
        </div>
        <div className="counter-container">
          <div className="counter visitor">Visitors: {visitorCount?.toLocaleString("en-US")}</div>
          <div className="counter games">Games Played: {gameCount?.toLocaleString("en-US")}</div>
        </div>
        <CanvasProvider>
          <GameController />
        </CanvasProvider>
        </div>
      </div>
    </>
  );
};

export default Home
