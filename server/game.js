const {
  ROOM_WIDTH,
  ROOM_HEIGHT,
  RANK,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  CHARACTER_WEAPON_ANGLE,
  ATTACK_SPEED
} = require("./constant");
function initGame() {
  const state = createGameState();
  //randomFood(state);
  return state;
}
function createGameState() {
  const initPlayer = getRandomPos();
  return {
    players: [createNewPlayer()],
  };
}

function createNewPlayer() {
  const initPlayer = getRandomPos();
  return {
    id: 0,
    // x: initPlayer.x, // vi tri chinh giua cua player
    // y: initPlayer.y,
    x:0,
    y:0,
    rank: RANK[0],
    point: 0,
    angle: 0,
    weapon: {
      x_0: initPlayer.x + RANK[0].width / 2,
      y_0: initPlayer.y,
      x_1: initPlayer.x + RANK[0].width / 2 + RANK[0].weapon_w,
      y_1: initPlayer.y + RANK[0].weapon_h,
      angle: CHARACTER_WEAPON_ANGLE,
      recover_time:0
    },
  };
}

function getRandomPos() {
  return {
    x: Math.random() * ROOM_WIDTH,
    y: Math.random() * ROOM_HEIGHT,
  };
}
function gameLoop(state, number) {
  if (!state) return;
  let currPlayer = { ...state.players[number] };
  if(currPlayer.recover_time > 380){
    let move_angle;
    if(currPlayer.angle>-Math.PI/2 && currPlayer.angle < Math.PI/2 ){
      move_angle = currPlayer.weapon.angle + ATTACK_SPEED;
    }else move_angle = currPlayer.weapon.angle-ATTACK_SPEED;
    if(move_angle< -Math.PI){ move_angle *= -1}
    state.players[number].weapon = updateWeaponByAngle({ ...state.players[number] }, move_angle);
  }else {
    let pos = getUpdatedVelocity(currPlayer);
    state.players[number].x += pos.x;
    state.players[number].y += pos.y;
    state.players[number].angle = pos.angle;
    state.players[number].weapon = getUpdateWeapon({ ...state.players[number] },CHARACTER_WEAPON_ANGLE);
  }
  state.players[number].recover_time -= ATTACK_SPEED *180/Math.PI;
  return false;
}
function updateWeaponByAngle(player, angle) {
  let r = player.rank.width / 4;
  return {
    x_0: player.x + r * Math.cos(player.angle),
    y_0: player.y + r * Math.sin(player.angle),
    x_1: player.x + player.rank.weapon_h * Math.cos(angle),
    y_1: player.y + player.rank.weapon_h * Math.sin(angle),
    angle
  };
}
function checkCharacterDeath(state ,client ){
  if(!state) return;
  // for(let i = 0; i< state.players.length;++i){
  //   let thisPlayer = state.players[i];
  //   for (let j = 0; j<state.players.length ;++j){
  //       if (i==j) continue;
  //       let victim = state.players[j];
  //       if(thisPlayer.weapon.x_1 >= victim.x-victim.width/2 && thisPlayer.weapon.x_1 <= victim.x+victim.width/2 &&
  //       thisPlayer.weapon.y_1 >= victim.y-victim.height/2 && thisPlayer.weapon.y_1 <= victim.y+victim.height/2  ){
  //         client.emit('gameover');
  //       }
  //   }
  // }
}
function getUpdateWeapon(player,char_weapon_angle) {
  let player_angle = (player.angle * 180) / Math.PI;
  let angle;
  if (player_angle > -90 && player_angle < 90) {
    angle = player_angle - char_weapon_angle;
  } else {
    angle = player_angle + char_weapon_angle;
    if (angle > 180) {
      angle = angle - 360;
    }
  }
  angle = (angle * Math.PI) / 180;
  return {
   ...updateWeaponByAngle(player,angle)
  };
}
         
function getUpdatedVelocity(
  currPlayer,
  mouseX = undefined,
  mouseY = undefined
) {
  if(!currPlayer) return;
  let angle;
  if (mouseX)
    angle = Math.atan2(mouseY - SCREEN_HEIGHT / 2, mouseX - SCREEN_WIDTH / 2);
  else angle = currPlayer.angle;
  return {
    x: currPlayer.rank.vel * Math.cos(angle),
    y: currPlayer.rank.vel * Math.sin(angle),
    angle,
  };
}

module.exports = { initGame, gameLoop, getUpdatedVelocity, createNewPlayer , checkCharacterDeath };
