import { type NextPage, GetStaticPropsContext } from "next"
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
            <input 
              id="phone"
              maxLength={16}
              className="phone no-outline" 
              type="text" 
            />
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
