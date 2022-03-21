const io = require('socket.io')(3000);
const {initGame ,gameLoop , getUpdatedVelocity ,createNewPlayer , checkCharacterDeath} = require('./game');
const {FRAME_RATE} = require('./constant');
let state;
let count=0;
io.on('connection', client => {
    client.on('newGame', handleNewgame);
    client.on('mousemove', handleMouseMove);
    client.on('combat', handleCombat);

    function handleMouseMove(clientX,clientY){
        if(!state) return;
        let currPlayer = state.players[client.number];
        if(currPlayer.recover_time>0) return;
        const pos = getUpdatedVelocity(currPlayer,clientX, clientY);
        state.players[client.number].angle = pos.angle;
    }
    function handleNewgame(){
        if(!state) {
            state = initGame();
        }else{
            state.players.push(createNewPlayer());
        }
        client.number = count++;
        client.emit('init',client.number);
    }
    function startInterval(){
        const intervalId = setInterval(() => {
            const winner = gameLoop(state , client.number);
            console.log(state);
            checkCharacterDeath(state,client);
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
    function handleCombat(){
        // đánh xuống góc 120  
        let thisPlayer = state.players[client.number];
        if(thisPlayer.recover_time >0) return;
        thisPlayer.recover_time = 500;
    }
    startInterval();
});

