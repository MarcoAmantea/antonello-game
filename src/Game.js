// Game.js
import React, { useRef, useEffect, useState } from 'react';

const Game = ({ onExit }) => {
  const canvasRef = useRef(null);
  const playerRef = useRef({ x: 50, y: 200, width: 60, height: 60, vy: 0, jumping: false });
  const obstaclesRef = useRef([]);  // Ostacoli normali
  const obstacleTimer = useRef(0);
  const obstacleDelay = useRef(120);
  const scoreRef = useRef(0);
  const particlesRef = useRef([]);
  const [gameOver, setGameOver] = useState(false);
  const [restart, setRestart] = useState(0);
  const [victory, setVictory] = useState(false); // Stato per la vittoria
  const gameOverRef = useRef(false);
  const gameOverSoundPlayedRef = useRef(false);
  const gameOverAudioRef = useRef(null);
  const obstacleAudioRef = useRef(null);
  const obstacleSpeedRef = useRef(3);

  const gravity = 0.6;
  const jumpStrength = -16;

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Imposta un delay maggiore su mobile
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      obstacleDelay.current = 220;
    } else {
      obstacleDelay.current = 120;
    }

    // Reset degli stati e riferimenti all'avvio o al restart (NOTA: victory non viene resettato qui)
    playerRef.current = { x: 50, y: 200, width: 60, height: 60, vy: 0, jumping: false };
    obstaclesRef.current = [];
    obstacleTimer.current = 0;
    scoreRef.current = 0;
    particlesRef.current = [];
    setGameOver(false);
    gameOverRef.current = false;
    gameOverSoundPlayedRef.current = false;
    obstacleSpeedRef.current = 3;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTime = performance.now();

    const faceImage = new Image();
    faceImage.src = '/face.png';
    const faceSadImage = new Image();
    faceSadImage.src = '/face-sad.png';
    const backgroundImage = new Image();
    backgroundImage.src = '/background.png';

    const obstacleImagePaths = [
      "/pizza.png",
      "/burger.png",
      "/fries.png",
      "/hotdog.png",
      "/icecream.png",
      "/donut.png",
      "/soda.png",
      "/cake.png",
    ];
    const obstacleImages = obstacleImagePaths.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const passedSoundPaths = ['/passed1.mp3', '/passed2.mp3', '/passed3.mp3'];
    const gameOverSoundPaths = ['/gameover1.mp3'];

    const totalImages = 3 + obstacleImages.length;
    let loadedImages = 0;
    const onImageLoad = () => {
      loadedImages++;
      if (loadedImages === totalImages) {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    faceImage.onload = onImageLoad;
    faceSadImage.onload = onImageLoad;
    backgroundImage.onload = onImageLoad;
    obstacleImages.forEach(img => (img.onload = onImageLoad));

    // Avvio forzato dopo 3 secondi se le immagini non sono tutte caricate
    setTimeout(() => {
      if (loadedImages < totalImages) {
        animationFrameId = requestAnimationFrame(update);
      }
    }, 3000);

    const update = (timestamp) => {
      const deltaTime = (timestamp - lastTime) / 16.67;
      lastTime = timestamp;

      // Se il punteggio è già >= 100 (vittoria), esegui un ultimo frame e blocca il game loop
      if (scoreRef.current >= 100) {
        // Blocca definitivamente il loop
        gameOverRef.current = true;
        // Disegna un ultimo frame (opzionale, dato che l'overlay React lo mostra)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        const player = playerRef.current;
        ctx.drawImage(faceImage, player.x, player.y, player.width, player.height);
        ctx.fillStyle = 'yellow';
        ctx.font = 'bold 60px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 10;
        ctx.fillText(`Score: ${scoreRef.current}`, canvas.width / 2, 100);
        ctx.fillStyle = 'green';
        ctx.font = 'bold 50px "Press Start 2P", monospace';
        ctx.fillText("🎉 Antonello ha vinto! 🎉", canvas.width / 2, canvas.height / 2);
        // Imposta gli stati di vittoria e game over (se non già impostati)
        if (!victory) {
          setVictory(true);
          setGameOver(true);
        }
        return; // Ferma il game loop: il canvas resta congelato
      }

      // Aggiorna il canvas normalmente
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

      // Aggiornamento fisica del giocatore
      const player = playerRef.current;
      player.vy += gravity * deltaTime;
      player.y += player.vy * deltaTime;
      if (player.y + player.height > canvas.height - 30) {
        player.y = canvas.height - 30 - player.height;
        player.jumping = false;
        player.vy = 0;
      }

      // Disegna il giocatore (se il gioco è in gameOver viene usata la faccia triste)
      const faceToDraw = gameOverRef.current ? faceSadImage : faceImage;
      ctx.drawImage(faceToDraw, player.x, player.y, player.width, player.height);

      // Aggiornamento e disegno delle particelle
      particlesRef.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
        p.y -= 1 * deltaTime;
        p.alpha -= 0.02 * deltaTime;
      });
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);

      // Aggiorna posizione degli ostacoli e rimuovi quelli fuori schermo
      obstaclesRef.current = obstaclesRef.current
        .map(obstacle => ({ ...obstacle, x: obstacle.x - obstacleSpeedRef.current * deltaTime }))
        .filter(obstacle => obstacle.x + obstacle.width > 0);

      obstacleTimer.current++;
      if (obstacleTimer.current > obstacleDelay.current) {
        const randomIndex = Math.floor(Math.random() * obstacleImages.length);
        obstaclesRef.current.push({
          x: canvas.width,
          y: canvas.height - 30 - 50,
          width: 50,
          height: 50,
          scored: false,
          image: obstacleImages[randomIndex],
        });
        obstacleTimer.current = 0;
      }

      // Disegna gli ostacoli
      obstaclesRef.current.forEach(obstacle => {
        ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });

      // Aggiorna il punteggio: se un ostacolo è passato il giocatore e non è stato ancora segnato
      for (const obstacle of obstaclesRef.current) {
        if (!obstacle.scored && obstacle.x + obstacle.width < player.x) {
          obstacle.scored = true;
          scoreRef.current++;

          if (scoreRef.current % 10 === 0) {
            obstacleSpeedRef.current += 0.5;
            obstacleDelay.current += 10;
          }

          if (!obstacleAudioRef.current || obstacleAudioRef.current.ended) {
            const index = Math.floor(Math.random() * passedSoundPaths.length);
            const sound = new Audio(passedSoundPaths[index]);
            obstacleAudioRef.current = sound;
            sound.play().catch(console.error);
          }
        }
      }

      // Se il punteggio non ha raggiunto 100, prosegui con la verifica delle collisioni…
      for (let obstacle of obstaclesRef.current) {
        if (
          player.x < obstacle.x + obstacle.width &&
          player.x + player.width > obstacle.x &&
          player.y < obstacle.y + obstacle.height &&
          player.y + player.height > obstacle.y
        ) {
          if (!gameOverSoundPlayedRef.current) {
            const index = Math.floor(Math.random() * gameOverSoundPaths.length);
            const sound = new Audio(gameOverSoundPaths[index]);
            gameOverAudioRef.current = sound;
            sound.play().catch(console.error);
            gameOverSoundPlayedRef.current = true;
            gameOverRef.current = true;
            setTimeout(() => setGameOver(true), 50);
          }
          return; // Ferma il game loop in caso di collisione
        }
      }

      // Disegna lo score in stile arcade
      ctx.fillStyle = 'yellow';
      ctx.font = 'bold 60px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 10;
      ctx.fillText(`Score: ${scoreRef.current}`, canvas.width / 2, 100);

      // Pianifica il prossimo frame solo se il gioco non è finito
      if (!gameOverRef.current && scoreRef.current < 100) {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      if (gameOverAudioRef.current) {
        gameOverAudioRef.current.pause();
        gameOverAudioRef.current.currentTime = 0;
      }
      if (obstacleAudioRef.current) {
        obstacleAudioRef.current.pause();
        obstacleAudioRef.current.currentTime = 0;
      }
    };
  // NOTA: il dependency array contiene solo [restart] per evitare re-inizializzazioni indesiderate
  }, [restart]);

  const handleKeyDown = (e) => {
    if (e.key === ' ' && !playerRef.current.jumping && !gameOver) {
      playerRef.current.vy = jumpStrength;
      playerRef.current.jumping = true;
      particlesRef.current.push({
        x: playerRef.current.x + playerRef.current.width / 2,
        y: playerRef.current.y + playerRef.current.height,
        radius: 10,
        alpha: 1,
      });
    }
  };

  return (
    <div
      tabIndex="0"
      onKeyDown={handleKeyDown}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        outline: 'none',
        overflow: 'auto',
        touchAction: 'none'
      }}
      onTouchStart={() => {
        if (!playerRef.current.jumping && !gameOver) {
          playerRef.current.vy = jumpStrength;
          playerRef.current.jumping = true;
          particlesRef.current.push({
            x: playerRef.current.x + playerRef.current.width / 2,
            y: playerRef.current.y + playerRef.current.height,
            radius: 10,
            alpha: 1,
          });
        }
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          touchAction: 'none'
        }}
      />

      {gameOver && !victory && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '3rem',
            borderRadius: '20px',
            zIndex: 99,
            width: '90%',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 0 20px black',
          }}
        >
          <h1
            className="gameover-title"
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'red',
              textShadow: '2px 2px black',
              marginBottom: '1rem',
            }}
          >
            😡 GAME OVER 😡
          </h1>

          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Hai evitato <strong>{scoreRef.current}</strong> schifezze. <br />
            Antonello è <em>leggermente incazzato</em>... per ora. 🍕😬
          </p>
          <div>
            <img
              src="/fire.png"
              alt="fire"
              style={{ width: '200px', height: '300px' }}
            />
          </div>

          <button
            onClick={onExit}
            className="btn btn-danger fw-bold px-4 py-3 shadow d-flex align-items-center justify-content-center gap-3"
            style={{
              fontSize: '1.3rem',
              borderRadius: '15px',
              border: '3px solid white',
              background: 'linear-gradient(45deg, #ff0000, #ff9900)',
              color: 'white',
            }}
          >
            🔁 Ricomincia la sfida!
          </button>
        </div>
      )}

      {victory && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '3rem',
            borderRadius: '20px',
            zIndex: 99,
            width: '90%',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 0 20px black',
          }}
        >
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'green',
              textShadow: '2px 2px black',
              marginBottom: '1rem',
            }}
          >
            🎉 VITTORIA 🎉
          </h1>

          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Antonello ha superato tutti i cibi! Ha vinto con <strong>{scoreRef.current}</strong> punti! 🎉
          </p>

          <button
            onClick={onExit}
            className="btn btn-success fw-bold px-4 py-3 shadow d-flex align-items-center justify-content-center gap-3"
            style={{
              fontSize: '1.3rem',
              borderRadius: '15px',
              border: '3px solid white',
              background: 'linear-gradient(45deg, #00cc00, #66ff66)',
              color: 'white',
            }}
          >
            🎮 Ricomincia la sfida!
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
