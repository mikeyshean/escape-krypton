import { type AppType } from "next/app";
import { trpc } from "../utils/trpc";
import "../styles/globals.css";
import { GameSessionProvider } from "../context/GameSessionContext";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <GameSessionProvider>
        <Component {...pageProps} />;
      </GameSessionProvider>
    </>
  )
};

export default trpc.withTRPC(MyApp);
