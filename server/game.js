const {
  ROOM_WIDTH,
  ROOM_HEIGHT,
  RANK,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  CHARACTER_WEAPON_ANGLE,
  ATTACK_SPEED,
  FRAME_RATE,
} = require("./constant");
const { getCurrentPlayer, checkValueInArray } = require("./utils");
let botId = 100000;
function initGame(name) {
  const state = createGameState(name);
  botId = 100000;
  //create bot
  createListBot(state);
  return state;
}
function createGameState(name) {
  return {
    players: [createNewPlayer(true, name)],
    food: getRandomFood(50),
  };
}

function createNewPlayer(isPlayer, name) {
  const initPlayer = getRandomPos();
  return {
    id: 0,
    name,
    // vi tri chinh giua cua player
    x: initPlayer.x,
    y: initPlayer.y,
    isPlayer,
    rank: RANK[0],
    point: 0,
    angle: 0,
    weapon: {
      x_0: initPlayer.x + RANK[0].width / 2,
      y_0: initPlayer.y,
      x_1: initPlayer.x + RANK[0].width / 2 + RANK[0].weapon_w,
      y_1: initPlayer.y + RANK[0].weapon_h,
      angle: CHARACTER_WEAPON_ANGLE*Math.PI/180,
    },
    recover_time: 0,
    bot_change_direction_time: 800,
  };
}
function getRandomFood(min) {
  let arraysFood = [];
  let numberofFood = min + Math.random() * 100;
  for (let i = 0; i < numberofFood; ++i) {
    let typeFood = parseInt(1 + Math.random() * 50);
    arraysFood.push({ ...getRandomPos(), type: typeFood });
  }
  return arraysFood;
}

function getRandomPos() {
  return {
    x: Math.random() * ROOM_WIDTH,
    y: Math.random() * ROOM_HEIGHT,
  };
}
function getUpdatePlayer(thisPlayer) {
  if (thisPlayer.recover_time > 380) {
    let move_angle;
    // attack direction will be made by the angle of character and it will lock the movement of character
    if (thisPlayer.angle > -Math.PI / 2 && thisPlayer.angle < Math.PI / 2) {
      move_angle = thisPlayer.weapon.angle + ATTACK_SPEED;
    } else move_angle = thisPlayer.weapon.angle - ATTACK_SPEED;
    if (move_angle < -Math.PI) {
      move_angle += 2 * Math.PI;
    } else if (move_angle > Math.PI) move_angle -= 2 * Math.PI;
    thisPlayer.weapon = updateWeaponByAngle(thisPlayer, move_angle);
  } else {
    // update character movement
    let pos = getUpdatedVelocity(thisPlayer);
    thisPlayer.x += pos.x;
    thisPlayer.y += pos.y;
    thisPlayer.angle = pos.angle;
    thisPlayer.weapon = getUpdateWeapon(
      { ...thisPlayer },
      CHARACTER_WEAPON_ANGLE
    );
  }
  // this happen when character will be upgrade level
  if (thisPlayer.point > thisPlayer.rank.exp) {
    if (thisPlayer.rank.level < 2) {
      thisPlayer.rank = RANK[thisPlayer.rank.level + 1];
    } else if (!thisPlayer.isPlayer) return false;
    else {
      return thisPlayer.id;
    }
  }

  if (thisPlayer.recover_time > 0)
    thisPlayer.recover_time -= (ATTACK_SPEED * 180) / Math.PI;
  return false;
}
function gameLoop(state, number) {
  if (!state) return;
  let thisPlayer = getCurrentPlayer(state, number);
  if (!thisPlayer) return;
  // handle attack
  let returnStatement = getUpdatePlayer(thisPlayer);
  //eatFood
  eatFood(state);
  return returnStatement;
}

function eatFood(state) {
  for (let i = 0; i < state.players.length; ++i) {
    for (let j = 0; j < state.food.length; ++j) {
      if (
        state.players[i].x - state.players[i].rank.width / 2 <
          state.food[j].x &&
        state.players[i].x + state.players[i].rank.width / 2 >
          state.food[j].x &&
        state.players[i].y - state.players[i].rank.height / 2 <
          state.food[j].y &&
        state.players[i].y + state.players[i].rank.height / 2 > state.food[j].y
      ) {
        state.players[i].point += 0.5;
        state.food.splice(j, 1);
        j--;
      }
    }
  }
  if (state.food.length < 30) {
    state.food = state.food.concat(getRandomFood(50));
  }
}

function checkCharacterDeath(state, io) {
  if (!state) return;
  let victims = [];
  for (let i = 0; i < state.players.length; ++i) {
    let thisPlayer = state.players[i];
    for (let j = 0; j < state.players.length; ++j) {
      if (i === j) continue;
      let victim = state.players[j];
      // check vị trí chạm của victim vì người nó chỉ chiếm nửa bức ảnh vẽ ra mà tọa độ hiện tại là ở trung tâm
      // và check khi đang vụt thì ms tính
      if (
        (checkLineIntersectLine(
          {
            x1: thisPlayer.weapon.x_0,
            y1: thisPlayer.weapon.y_0,
            x2: thisPlayer.weapon.x_1,
            y2: thisPlayer.weapon.y_1,
          },
          {
            x1: victim.x - victim.rank.width / 4,
            y1: victim.y - victim.rank.height / 4,
            x2: victim.x + victim.rank.width / 4,
            y2: victim.y - victim.rank.height / 4,
          }
        ) ||
          checkLineIntersectLine(
            {
              x1: thisPlayer.weapon.x_0,
              y1: thisPlayer.weapon.y_0,
              x2: thisPlayer.weapon.x_1,
              y2: thisPlayer.weapon.y_1,
            },
            {
              x1: victim.x - victim.rank.width / 4,
              y1: victim.y - victim.rank.height / 4,
              x2: victim.x - victim.rank.width / 4,
              y2: victim.y + victim.rank.height / 4,
            }
          ) ||
          checkLineIntersectLine(
            {
              x1: thisPlayer.weapon.x_0,
              y1: thisPlayer.weapon.y_0,
              x2: thisPlayer.weapon.x_1,
              y2: thisPlayer.weapon.y_1,
            },
            {
              x1: victim.x + victim.rank.width / 4,
              y1: victim.y - victim.rank.height / 4,
              x2: victim.x + victim.rank.width / 4,
              y2: victim.y + victim.rank.height / 4,
            }
          ) ||
          checkLineIntersectLine(
            {
              x1: thisPlayer.weapon.x_0,
              y1: thisPlayer.weapon.y_0,
              x2: thisPlayer.weapon.x_1,
              y2: thisPlayer.weapon.y_1,
            },
            {
              x1: victim.x - victim.rank.width / 4,
              y1: victim.y + victim.rank.height / 4,
              x2: victim.x + victim.rank.width / 4,
              y2: victim.y + victim.rank.height / 4,
            }
          )) &&
        thisPlayer.recover_time > 380
      ) {
        victims.push(victim.id);
        thisPlayer.point += getPointByKillCharacter(victim.rank.level);
        if (victim.isPlayer) {
          io.sockets.emit(
            "gameover",
            JSON.stringify({ number: victim.id, isWinner: false })
          );
        }
      }
    }
  }
  if (victims.length !== 0) {
    state.players = state.players.filter(
      (e) => !checkValueInArray(victims, e.id)
    );
  }

  // after kill bot or players
  createListBot(state);
}
function checkLineIntersectLine(line1, line2) {
  let x =
    (line2.y1 -
      ((line2.y1 - line2.y2) / (line2.x1 - line2.x2)) * line2.x1 -
      (line1.y1 - ((line1.y1 - line1.y2) / (line1.x1 - line1.x2)) * line1.x1)) /
    ((line1.y1 - line1.y2) / (line1.x1 - line1.x2) -
      (line2.y1 - line2.y2) / (line2.x1 - line2.x2));
  // don't need to calculate y_intersect ( below is calculate y_intersect)
  //let y= (line1.y1-line1.y2)/(line1.x1-line1.x2)*(x-line1.x1)+line1.y1;
  let inLine1 =
    (x >= line1.x1 && x <= line1.x2) || (x >= line1.x2 && x <= line1.x1);
  let inLine2 =
    (x >= line2.x1 && x <= line2.x2) || (x >= line2.x2 && x <= line2.x1);
  return inLine1 && inLine2;
}
function getUpdateWeapon(player, char_weapon_angle) {
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
    ...updateWeaponByAngle(player, angle),
  };
}
function updateWeaponByAngle(player, angle) {
  let r = player.rank.width / 4;
  return {
    x_0: player.x + r * Math.cos(player.angle),
    y_0: player.y + r * Math.sin(player.angle),
    x_1: player.x + player.rank.weapon_h * Math.cos(angle),
    y_1: player.y + player.rank.weapon_h * Math.sin(angle),
    angle,
  };
}
function getUpdatedVelocity(
  thisPlayer,
  mouseX = undefined,
  mouseY = undefined
) {
  if (!thisPlayer) return;
  let angle;
  if (mouseX)
    angle = Math.atan2(mouseY - SCREEN_HEIGHT / 2, mouseX - SCREEN_WIDTH / 2);
  else angle = thisPlayer.angle;
  let x = thisPlayer.rank.vel * Math.cos(angle);
  let y = thisPlayer.rank.vel * Math.sin(angle);
  x =
    thisPlayer.x + x > ROOM_WIDTH || thisPlayer.x + x < 0
      ? 0
      : thisPlayer.rank.vel * Math.cos(angle);
  y =
    thisPlayer.y + y > ROOM_HEIGHT || thisPlayer.y + y < 0
      ? 0
      : thisPlayer.rank.vel * Math.sin(angle);
  return {
    x,
    y,
    angle,
  };
}
function getPointByKillCharacter(lv) {
  switch (lv) {
    case 0:
      return 2;
    case 1:
      return 5;
    case 2:
      return 10;
  }
}
/* -----------------------------------handle with bot ----------------------------------------- */
function createListBot(state) {
  if (state.players.length > 10) return;
  for (let i = 0; i < 20 - state.players.length; ++i) {
    let bot = createNewPlayer(false, "Bot" + (botId - 100000));
    bot.id = botId++;
    state.players.push(bot);
  }
}
function removeBot(state) {
  if (state.players.length < 40) return true;
  let isRemove = false;
  for (let i = 0; i < state.players.length; ++i) {
    if (!state.players[i].isPlayer) {
      state.players.splice(i, 1);
      isRemove = true;
      break;
    }
  }
  return isRemove;
}
function getUpdateBotsDirection(state) {
  if (!state) return;
  for (let i = 0; i < state.players.length; ++i) {
    if (!state.players[i].isPlayer) {
      getUpdatePlayer(state.players[i]);
      if (state.players[i].bot_change_direction_time > 0) {
        state.players[i].bot_change_direction_time -= 1000 / FRAME_RATE;
        continue;
      } else {
        state.players[i].bot_change_direction_time = 800;
        state.players[i].angle =
          Math.random() < 0.5
            ? Math.random() * Math.PI * -1
            : Math.random() * Math.PI;
      }
    }
  }
}
function checkBotCombat(state) {
  if (!state) return;
  for (let i = 0; i < state.players.length; ++i) {
    if (!state.players[i].isPlayer) {
      let thisBot = state.players[i];
      for (let j = 0; j < state.players.length; ++j) {
        if (i == j) continue;
        let victim = state.players[j];
        let r = Math.sqrt(
          (thisBot.x - victim.x) ** 2 + (thisBot.y - victim.y) ** 2
        );
        if (r < (thisBot.rank.width / 2 + thisBot.rank.weapon_h) * 1.2) {
          thisBot.angle =
            victim.angle > 0 ? victim.angle - Math.PI : victim.angle + Math.PI;
          if (thisBot.recover_time <= 0) thisBot.recover_time = 500;
          break;
        }
      }
    }
  }
}

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
  createNewPlayer,
  checkCharacterDeath,
  removeBot,
  getUpdateBotsDirection,
  checkBotCombat,
};
