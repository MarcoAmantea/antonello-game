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
      {/* Schermata introduttiva */}
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
          <h1>Antonello Game<br/> La Sfida Glucosica Definitiva</h1>
          <p>
          Benvenuti nell’universo pixelato di Antonello, l’eroe calvo dal cranio aerodinamico e lo sguardo incazzato che potrebbe sciogliere un freezer. Ma non fatevi ingannare dalla sua testolina lucida: Antonello ha un nemico giurato… e no, non è il barbiere. 👊
  <br /><br />
  Il suo vero incubo? Il cibo grasso. 🍔🍟🍕 Ovunque si volti, ci sono hamburger grondanti, patatine sorridenti, pizze invitanti... tutte pronte a sabotare il suo fragile equilibrio glicemico.
  <br /><br />
  Perché sì, Antonello è diabetico. E ogni dolcetto fuori posto o snack unto è una provocazione diretta al suo pancreas. Ma attenzione: non è solo una questione di salute. Se Antonello non supera gli ostacoli... si incazza. Immagina Hulk, ma con meno capelli e più rancore.
  <br /><br />
  🎮 Il tuo compito? Guidarlo con precisione chirurgica (e un pizzico di fortuna) attraverso questo inferno alimentare, saltando come un ninja su caffeina per evitare i trabocchetti calorici. Gli ostacoli all’inizio sono lenti, quasi teneri… ma più sopravvivi, più corrono. E non per abbracciarti.
  <br /><br />
  🏁 Supera 100 cibi grassosi e Antonello ti premierà con la sua approvazione silenziosa (che è più rara dell’unicorno vegano): hai VINTO la partita. Hai domato la fame, l’ira... e Antonello.
  <br /><br />
  🔥 Preparati a sudare, ridere e temere la collera di un uomo a dieta… perché quando Antonello perde, non è solo Game Over. È Antonello Over.
  <br /><br />
  Buona fortuna, e ricordati: un Antonello sereno è un mondo migliore per tutti.
</p>
          <button onClick={handleStartGame}>Avvia l'Antonello Game</button>
        </div>
      )}

      {/* Schermata di countdown */}
      {countdown !== null && (
        <div className="countdown-screen">
          <h1>{countdown === 1 ? "DIABETE GAME!" : countdown}</h1>
        </div>
      )}

      {/* Quando il gioco è avviato, il Game viene renderizzato in un container full screen */}
      {gameStarted && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1000, // Il gioco sovrasta il background
          }}
        >
          <Game onExit={() => setGameStarted(false)} />
        </div>
      )}
    </div>
  );
}

export default App;
