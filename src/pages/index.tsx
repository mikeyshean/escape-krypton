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
        </div>
      </div>
    </>
  );
};

export default Home;
