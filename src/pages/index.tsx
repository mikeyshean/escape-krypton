import { type NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { trpc } from "../utils/trpc";
import GameView from '../lib/GameView'
import $ from "jquery";

const Home: NextPage = () => {
  // const hello = trpc.example.hello.useQuery({ text: "from tRPC" });

  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    var ctx = canvas.getContext('2d')
    var $el = $(".game-wrapper")
    var $leaderList = $(".leaderboard-list")
    if (ctx && $el) {
      var gameView = new GameView(ctx, $el, $leaderList)
      gameView.showMenu()
    }
  }, [])

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
            <span className="submit">Submit<br/> Score</span>
          </div>
          <div className="leaderboard">
            <span className="leaderboard-title">Leaderboard</span>
            <ul id="leaderboard-list" className="leaderboard-list">
            </ul>
          </div>
          {/* {hello.data?.greeting} */}
        </div>
      </div>
    </>
  );
};

export default Home;
