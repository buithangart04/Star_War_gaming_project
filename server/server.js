const io = require("socket.io")(3000);
const {
  initGame,
  gameLoop,
  getUpdatedVelocity,
  createNewPlayer,
  checkCharacterDeath,
  removeBot
} = require("./game");
const { getCurrentPlayer } = require("./utils");
const { FRAME_RATE } = require("./constant");
let state;
let count = 0;
io.on("connection", (client) => {
  client.on("newGame", handleNewgame);
  client.on("mousemove", handleMouseMove);
  client.on("combat", handleCombat);

  function handleMouseMove(clientX, clientY) {
    if (!state) return;
    let thisPlayer = getCurrentPlayer(state, client.number);
    if (!thisPlayer) return;
    if (thisPlayer.recover_time > 0) return;
    const pos = getUpdatedVelocity(thisPlayer, clientX, clientY);
    thisPlayer.angle = pos.angle;
  }
  function handleNewgame(name) {
    name = name.trim()==''?'Unknown Warrior'+count:name;
    if (!state) {
      state = initGame(name);
    } else {
      let isRemove = removeBot(state);
      if(!isRemove) {client.emit('fullOfRoom'); return;}
      state.players.push(createNewPlayer(true,name));
    }
    client.number = count;
    count++;
    let length = state.players.length;
    state.players[length-1].id = client.number;
    client.emit("init", client.number);
  }
  function startInterval() {
    const intervalId = setInterval(() => {
      const winner = gameLoop(state, client.number);
      if (!winner) {
          checkCharacterDeath(state, io);
          emitGameState(state);
      } else {
        io.emit(
          "gameover",
          JSON.stringify({ number: winner, isWinner: true })
        );
        //clearInterval(intervalId);
      }
    }, 1000 / FRAME_RATE);
  }
  function emitGameState(gameState) {
    // Send this event to everyone in the room.
    io.emit("gameState", JSON.stringify(gameState));
  }
  function handleCombat() {
    // this will attack an angle 120 degrees
    let thisPlayer = getCurrentPlayer(state, this.number);
    if (thisPlayer.recover_time > 0) return;
    thisPlayer.recover_time = 500;
  }
  startInterval();
});