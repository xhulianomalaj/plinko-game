import React, { useRef, useEffect, useState } from "react";
import "./Plinko.css";

const numRows = 10;
const pegRadius = 5.5;
const ballRadius = 13;
const gravity = 0.8;
const bounceFactor = 0.5;
const NUM_SINKS = 9;
const sinkWidth = 36;


const MULTIPLIERS = {
  1: 13,
  2: 3,
  3: 1.3,
  4: 0.7,
  5: 0.4,
  6: 0.7,
  7: 1.3,
  8: 3,
  9: 13,
};

// const test = Number(Math.random().toFixed(0) * 7)
const ApiDropResponse = 2;

// console.log(ApiDropResponse)

const ballDropArr = [
  [128.1, 129],               // 1
  [425, 424],                 // 2
  [80, 84, 102, 113],         // 3
  [87.1, 91.7, 116],          // 4
  [52, 57],                   // 5 
  [87.1, 90, 91, 99],         // 6
  [210.51, 93, 112, 855],     // 7
  [105, 31, 123456, 65479],   // 8
  [198.1, 528],               // 9
];

const createSinks = (width, height) => {
  const sinks = [];
  const totalWidth = sinkWidth * NUM_SINKS;
  const spacing = (width - totalWidth) / (NUM_SINKS + 1);
  const adjustedSpacing = spacing * 0.29;
  const startX =
    (width - totalWidth - (NUM_SINKS - 1) * adjustedSpacing) / 1.95;

  for (let i = 0; i < NUM_SINKS; i++) {
    const x = startX + i * (sinkWidth + adjustedSpacing);
    const y = height - 55;
    const w = sinkWidth;
    const h = 40;
    sinks.push({
      index: i + 1,
      x,
      y,
      width: w,
      height: h,
      multiplier: MULTIPLIERS[i + 1],
    });
  }

  return sinks;
};

const PlinkoCanvas = () => {
  const canvasRef = useRef(null);
  const [balls, setBalls] = useState([]);
  const sinksRef = useRef([]);
  const pegsRef = useRef([]);
  const [walletAmount, setWalletAmount] = useState(0);
  const [betAmount, setBetAmount] = useState("");
  const [initialWalletAmount, setInitialWalletAmount] = useState("");
  const [netEarnings, setNetEarnings] = useState(0);

  // ------
  const handleDropBall = (targetSinkIndex = ApiDropResponse) => {
    if (betAmount <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }
  
    if (betAmount > walletAmount) {
      alert("Your bet amount exceeds your wallet amount.");
      return;
    }
  
    setWalletAmount((prevAmount) => prevAmount - betAmount);
  
    const targetSink = sinksRef.current.find(
      (sink) => sink.index === targetSinkIndex
    );
  
    if (!targetSink) {
      console.error(`Sink ${targetSinkIndex} not found.`);
      return;
    }
  
    const startX = targetSink.x + targetSink.width / 2;
    const velocityOptions = ballDropArr[ApiDropResponse - 1];
    const initialVelocityX =
      (startX - canvasRef.current.width / 2) /
      velocityOptions[Math.floor(Math.random() * velocityOptions.length)];
  
    const newBall = {
      x: canvasRef.current.width / 2,
      y: ballRadius,
      vx: initialVelocityX,
      vy: 2,
      inSink: false,
      initialVelocityX: initialVelocityX,
    };
  
    console.log("Dropping new ball:", newBall);
  
    setBalls((prevBalls) => [...prevBalls, newBall]);
  };
  
  

  const handleWalletChange = (event) => {
    const value = parseFloat(event.target.value);
    // console.log("Wallet changed:", value);
    setInitialWalletAmount(isNaN(value) ? 0 : value);
    setWalletAmount(isNaN(value) ? 0 : value);
    setNetEarnings(0);
  };

  const handleBetChange = (event) => {
    const value = parseFloat(event.target.value);
    // console.log("Bet changed:", value);
    setBetAmount(isNaN(value) ? 0 : value);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const sinks = createSinks(width, height);
    sinksRef.current = sinks;
    // console.log("Sinks initialized:", sinks);

    const rowSpacing = 45;
    const pegSpacing = 35;
    const pegs = [];

    for (let row = 2; row < numRows; row++) {
      const numPegsInRow = row + 1;
      const rowWidth =
        numPegsInRow * pegRadius * 2 + (numPegsInRow - 1.5) * pegSpacing;
      const startX = (width - rowWidth) / 2;

      for (let col = 0; col < numPegsInRow; col++) {
        const x = startX + col * (pegRadius * 2 + pegSpacing);
        const y = 2 + row * rowSpacing;
        pegs.push({ x, y });
      }
    }
    pegsRef.current = pegs;
    // console.log("Pegs initialized:", pegs);

    const drawPeg = (peg) => {
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, pegRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#333";
      ctx.fill();
    };

    const drawBall = (ball) => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
    };

    const drawSinks = () => {
      sinks.forEach((sink) => {
        ctx.fillStyle = getColor(sink.index).background;
        ctx.fillRect(sink.x, sink.y - sink.height / 2, sink.width, sink.height);

        ctx.fillStyle = getColor(sink.index).color;
        ctx.font = "normal 13px Arial";

        const text = `${sink.multiplier}x`;
        const textWidth = ctx.measureText(text).width;
        const textHeight = 50;

        const textX = sink.x + (sink.width - textWidth) / 2;
        const textY = sink.y + textHeight / 2 - sink.height / 2;

        ctx.fillText(text, textX, textY);
      });
    };

    const getColor = (index) => {
      if (index < 2 || index > NUM_SINKS - 1) {
        return { background: "#ff003f", color: "black" };
      }
      if (index < 4 || index > NUM_SINKS - 3) {
        return { background: "#ff7f00", color: "black" };
      }
      if (index < 5 || index > NUM_SINKS - 4) {
        return { background: "#ffff00", color: "black" };
      }
      return { background: "#7fff00", color: "black" };
    };

    const updateBall = (ball) => {
      if (ball.inSink) return;

      ball.vy += gravity;
      ball.x += ball.vx;
      ball.y += ball.vy;
    
      for (let i = 0; i < sinks.length; i++) {
        const sink = sinks[i];
        if (
          ball.x > sink.x - sink.width / 1.85 &&
          ball.x < sink.x + sink.width / 1.85 &&
          ball.y + ballRadius > sink.y - sink.height / 1.85
        ) {
          ball.x = sink.x + sink.width / 2;
          ball.y = sink.y - sink.height / 2 + ballRadius;
    
          ball.vx = 0;
          ball.vy = 0;
          ball.inSink = true;
          
          const totalEarnings = betAmount * sink.multiplier;
          const newWalletAmount = walletAmount + totalEarnings;
          const earnings = newWalletAmount - initialWalletAmount;
          setNetEarnings(earnings);
          setWalletAmount(newWalletAmount);
          console.log(
            `Ball fell into sink ${sink.index} with multiplier ${sink.multiplier}. Total Earnings: ${totalEarnings}, Net Earnings: ${earnings}`
          );
          break;
        }
      }
    
      pegsRef.current.forEach((peg) => {
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const dist = Math.hypot(dx, dy);
    
        if (dist < ballRadius + pegRadius) {
          const angle = Math.atan2(dy, dx);
          const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
    
          ball.vx = Math.cos(angle) * speed * bounceFactor;
          ball.vy = Math.sin(angle) * speed * bounceFactor;
    
          const overlap = ballRadius + pegRadius - dist;
          ball.x += Math.cos(angle) * overlap;
          ball.y += Math.sin(angle) * overlap;
        }
      });
    
    
      const pyramidLeft = Math.min(...pegs.map((peg) => peg.x - pegRadius));
      const pyramidRight = Math.max(...pegs.map((peg) => peg.x + pegRadius));
    
      if (ball.x < pyramidLeft + ballRadius) {
        ball.x = pyramidLeft + ballRadius;
        ball.vx = 0;
      } else if (ball.x > pyramidRight - ballRadius) {
        ball.x = pyramidRight - ballRadius;
        ball.vx = 0;
      }
    };
    
    const gameLoop = () => {
      ctx.clearRect(0, 0, width, height);

      pegsRef.current.forEach(drawPeg);
      balls.forEach((ball) => {
        updateBall(ball);
        drawBall(ball);
      });
      drawSinks();

      requestAnimationFrame(gameLoop);
    };

    gameLoop();
  }, [balls, walletAmount, betAmount, initialWalletAmount]);

  return (
    <div className="container">
      <h1>Plinko Game</h1>
      <div>
        <label>
          Wallet Amount:{" "}
          <input
            type="number"
            value={initialWalletAmount}
            onChange={handleWalletChange}
            min="0"
          />
        </label>
        <label>
          Bet Amount:{" "}
          <input
            type="number"
            value={betAmount}
            onChange={handleBetChange}
            min=""
            max={walletAmount}
          />
        </label>
        <button onClick={() => handleDropBall()}>Drop Ball</button> 
      </div>
      <canvas
        ref={canvasRef}
        width={700}
        height={500}
        style={{
          border: "1px solid #000",
          backgroundColor: "#c3c3c3",
          margin: "10px auto",
          display: "block",
        }}
      />
      <div>
        <div>Wallet: {walletAmount.toFixed(2)}</div>
        <div>Net Earnings: {netEarnings.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default PlinkoCanvas;
