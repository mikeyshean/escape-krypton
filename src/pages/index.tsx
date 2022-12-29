import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { trpc } from "../utils/trpc";
import GameController from '../components/GameController'
import $ from "jquery";
import { string } from "zod";
import { useGameSessionContext } from "../context/GameSessionContext";

const Home: NextPage = () => {
  const { gameSession, isGameSession } = useGameSessionContext()

  return (
    <>
      <Head>
        <title>Escape from Krypton</title>
        <meta name="description" content="Escape from Krypton" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="window-container">
        <div className="main">
          <GameController />
          {/* <div className="game-wrapper">
            <canvas id="canvas" width="800" height="400"></canvas>
            <span className="restart">Restart</span>
            <span className="submit">Submit<br/> Score</span>
          </div>
          <div className="leaderboard">
            <span className="leaderboard-title">Leaderboard</span>
            <ul id="leaderboard-list" className="leaderboard-list">
            </ul>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Home;
