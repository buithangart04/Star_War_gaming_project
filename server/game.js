const {ROOM_WIDTH,ROOM_HEIGHT, RANK ,SCREEN_WIDTH, SCREEN_HEIGHT } = require('./constant');
function initGame(){
  const state = createGameState()
  //randomFood(state);
  return state;
}
function createGameState() { 
    const initPlayer= getRandomPos();
    return {
      players:[
          {   id: 0,
              x: initPlayer.x,
              y: initPlayer.y,
              rank: RANK[0] ,
              point:0,
              angle:0
          }
      ]
    };
  }
  function createNewPlayer(){
    const initPlayer= getRandomPos();
      return {
        id:0,
        x: initPlayer.x, // vốn dĩ thằng này nó đã là tâm của ảnh 
        y: initPlayer.y,
        rank: RANK[0] ,
        point:0,
        angle:0
    }
  }

  function getRandomPos(){
    return{
        x: Math.random()* ROOM_WIDTH,
        y: Math.random()* ROOM_HEIGHT
    }
  }
  function gameLoop(state , number){
    if(!state) return;
    let currPlayer = {...state.players[number] };
    let pos = getUpdatedVelocity(currPlayer);
    state.players[number].x += pos.x;
    state.players[number].y += pos.y;
    state.players[number].angle = pos.angle;
    return false;
  }
  function getUpdatedVelocity(currPlayer , mouseX = undefined, mouseY = undefined ){
    let angle;
    if(mouseX) angle = Math.atan2(mouseY- SCREEN_HEIGHT/2, mouseX- SCREEN_WIDTH/2);
    else angle = currPlayer.angle ;
    return {
       x: currPlayer.rank.vel * Math.cos(angle),
       y: currPlayer.rank.vel* Math.sin(angle),
       angle
    }

  }

  module.exports= {initGame , gameLoop , getUpdatedVelocity ,createNewPlayer}
