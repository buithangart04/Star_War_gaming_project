const io = require('socket.io')(3000);
const {initGame ,gameLoop , getUpdatedVelocity ,createNewPlayer} = require('./game');
const {FRAME_RATE} = require('./constant');
let state;
io.on('connection', client => {
    client.on('newGame', handleNewgame);
    client.on('mousemove', handleMouseMove);
    function handleMouseMove(clientX,clientY){
        if(!state) return;
        let currPlayer = state.players[client.number];
        const pos = getUpdatedVelocity(currPlayer,clientX, clientY);
        state.players[client.number].angle = pos.angle;
    }
    function handleNewgame(){
        if(!state) {
            state = initGame();
        }else{
            state.players.push(createNewPlayer());
        }
        client.number = state.players.length-1;
        client.emit('init',client.number);
    }
    function startInterval(){
        const intervalId = setInterval(() => {
            const winner = gameLoop(state , client.number);
            if (!winner) {
              emitGameState(state)
            } else {
              emitGameOver( winner);
              clearInterval(intervalId);
            }
          }, 1000 / FRAME_RATE);
    }
    function emitGameState(gameState) {
        // Send this event to everyone in the room.
        io.emit('gameState', JSON.stringify(gameState));
    }
    startInterval();
});

