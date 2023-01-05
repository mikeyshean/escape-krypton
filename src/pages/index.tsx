import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef } from "react";
import GameController from '../components/GameController'
import { CanvasProvider } from "../context/CanvasContext";


const Home: NextPage = () => {

  const phone_input = useRef<HTMLElement|null>(null)
  useEffect(() => {
    phone_input.current = document.getElementById("phone")
    phone_input.current?.addEventListener('input', () => {
      (phone_input.current as HTMLInputElement).setCustomValidity('');
      (phone_input.current as HTMLInputElement).checkValidity();
    });
  
    phone_input.current?.addEventListener('invalid', () => {
      if((phone_input.current as HTMLInputElement).value === '') {
        (phone_input.current as HTMLInputElement).setCustomValidity('Enter phone number!');
      } else {
        (phone_input.current as HTMLInputElement).setCustomValidity('Enter phone number in this format: 123-456-7890');
      }
    });
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
          <span className="submit">Submit<br/> Best</span>
          <form id="score-form">
            <input className="name no-outline" type="text" />
            <input 
              id="phone"
              maxLength={16}
              className="phone no-outline" 
              type="text" 
            />
            {/* <input className="message no-outline" type="text" /> */}
          </form>
          <span id="taunt-1" className="taunt taunt-1">HaHa!</span>
          <span id="taunt-2" className="taunt taunt-2">Sorry!</span>
          <span id="taunt-3" className="taunt taunt-3">Gotcha!</span>
          <span className="form-cancel">Cancel</span>
          <span className="form-submit">Submit</span>
        </div>
        <CanvasProvider>
          <GameController />
        </CanvasProvider>
        </div>
      </div>
    </>
  );
};

export default Home;
