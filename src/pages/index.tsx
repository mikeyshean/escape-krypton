import { type NextPage } from "next"
import Head from "next/head";
import superjson from 'superjson';
import { createProxySSGHelpers } from '@trpc/react-query/ssg'
import GameController from '../components/GameController'
import { CanvasProvider } from "../context/CanvasContext"
import { appRouter } from '../server/trpc/router/_app'
import { createContextInner } from '../server/trpc/context'
import { trpc } from "../utils/trpc"


export async function getStaticProps() {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({}),
    transformer: superjson,
  });
  await ssg.taunt.list.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
}

const Home: NextPage = () => {
  const tauntsQuery = trpc.taunt.list.useQuery()
  const { data: taunts } = tauntsQuery

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
              taunts && taunts.map((taunt, idx) => {
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
        <CanvasProvider>
          <GameController />
        </CanvasProvider>
        </div>
      </div>
    </>
  );
};

export default Home
