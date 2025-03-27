import React, { useState, useEffect } from "react";
import Game from "./Game";
import "./App.css";

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const handleStartGame = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      if (countdown === 1) {
        setCountdown(null);
        setGameStarted(true);
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);
  // Easter egg Antonello approva
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === "a") {
        document.addEventListener(
          "keydown",
          (ev) => {
            if (ev.key.toLowerCase() === "n") {
              alert("✨ Antonello approva la tua dedizione glicemica!");
            }
          },
          { once: true }
        );
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="App">
      {!gameStarted && countdown === null && (
        <div className="start-screen">
          <img
            src="/face-sad.png"
            alt="Antonello faccia"
            className="mb-1 shadow-lg"
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "100%",
              animation: "bounce 1s infinite",
            }}
          />
          <h1>🍕 Antonello Game – La Sfida Glucosica Definitiva 🍕</h1>
          <p>
            Benvenuti nell’universo pixelato di Antonello, l’eroe calvo dal
            cranio aerodinamico e lo sguardo incazzato che potrebbe sciogliere
            un freezer. Ma non fatevi ingannare dalla sua testolina lucida:
            Antonello ha un nemico giurato… e no, non è il barbiere.👊 <br /> Il
            suo vero incubo? Il cibo grasso. 🍔🍟🍕
            <br /> Ovunque si volti, ci sono hamburger grondanti, patatine
            sorridenti, pizze invitanti... tutte pronte a sabotare il suo
            fragile equilibrio glicemico.
            <br />
            Perché sì, Antonello è diabetico. E ogni dolcetto fuori posto o
            snack unto è una provocazione diretta al suo pancreas. Ma
            attenzione: non è solo una questione di salute. Se Antonello non
            supera gli ostacoli... si incazza. Ma si incazza come solo lui sa
            fare.
            <br />
            Immagina Hulk ma con meno capelli e più rancore.
            <br />
            🎮 Il tuo compito è guidarlo con precisione chirurgica (e un po’ di
            fortuna) attraverso questo delirio alimentare, facendo salti epici
            per evitare i trabocchetti calorici. Ogni errore è un passo verso
            l’ira funesta, ogni vittoria un punto in più nella lotta per il
            glucosio perfetto.
            <br />
            🔥 Preparati a sudare, ridere e temere la collera di un uomo a
            dieta… perché quando Antonello perde, non è solo Game Over. È
            Antonello Over.
            <br />
            Buona fortuna, e ricordati: un Antonello sereno è un mondo migliore
            per tutti.{" "}
          </p>
          <button onClick={handleStartGame}>Avvia l'Antonello Game</button>
        </div>
      )}

      {countdown !== null && (
        <div className="countdown-screen">
          <h1>{countdown === 1 ? "VAI CON IL DIABETE!" : countdown}</h1>
        </div>
      )}

      {gameStarted && <Game onExit={() => setGameStarted(false)} />}
    </div>
  );
}

export default App;
