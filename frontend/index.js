const socket = io("https://mysterious-brook-80094.herokuapp.com/", { transports: ["websocket"] });

let canvas, ctx;
let oldPlayerState = {};
let playerNumber;
let gameActive;
let background;
let rect;
let main_idx = 1;
let listCharacterImage;

$(document).ready(function () {
  $("#myModal").modal("show");
});

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameover", handleGameOver);
socket.on("fullOfRoom", handleFullOfRoom);

/*--------------------------------handle event-----------------------------*/

function joinGame() {
  $("#myModal").modal("hide");
  init();
  socket.emit("newGame", document.getElementById("nickname").value);
}

function init() {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  rect = canvas.getBoundingClientRect();
  background = initBG();
  paintBackGround();
  // paintRestrictBg();
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("click", handleClick);
  gameActive = true;
}
function handleFullOfRoom() {
  alert("This room is full! Please try later!");
}

function handleMouseMove(evt) {
  if (!gameActive) return;
  socket.emit("mousemove", evt.clientX - rect.left, evt.clientY - rect.top);
}
function handleClick(evt) {
  if (!gameActive) return;
  socket.emit("combat");
}

function handleInit(_playerNumber) {
  playerNumber = _playerNumber;
}

function handleGameState(state) {
  state = JSON.parse(state);
  if (!gameActive || !state) {
    return;
  }
  requestAnimationFrame(() => paintgame(state));
}
function handleGameOver(_gameover_state) {
  if (!gameActive) return;
  const gameover_state = JSON.parse(_gameover_state);
  if (playerNumber != gameover_state.number) return;
  if (!gameover_state.isWinner) {
    alert("You losed!");
  } else {
    alert("You win!");
  }
  gameActive = false;
}
/*--------------------------paint--------------------------------------- */
function paintgame(state) {
  let thisPlayer = getCurrentPlayer(state, playerNumber);
  if(!thisPlayer){
    console.log('player not found error!');
    return;
  }
  updateBackground(thisPlayer);
  displayTopPlayers(state);
  //paint restrict bg
  paintRestrictBg(thisPlayer);
  //paint food
  paintFood(state.food, thisPlayer);
  oldPlayerState = { ...thisPlayer };
  state.players.forEach((player) => paintPlayer(player, thisPlayer));
}

function displayTopPlayers(state) {
  // red , blue , purple
  let colors = ['red','blue','#7b5396' ,'#e0b61d','green'];
  ctx.font = "40px Arial Bold";
  ctx.textAlign = "center";
  ctx.fillStyle='white';
  ctx.fillText("Leaderboard", canvas.width-150, 100);
  state.players.sort((a, b) => b.point - a.point);
  for (let i = 0; i < 5; ++i) {
    ctx.font = "30px Arial Bold";
    ctx.textAlign = "start";
    ctx.fillStyle = colors[i];
    ctx.fillText('#'+(i+1), canvas.width-300, 100+40*(i+1));
    ctx.fillText(state.players[i].name, canvas.width-250, 100+40*(i+1));
    ctx.fillText(state.players[i].point, canvas.width-100, 100+40*(i+1));
  }
  ctx.fillStyle='black';
}

async function paintPlayer(player, thisPlayer) {
  const prefix = getPrefixByLevel(player.rank.level);
  await drawImageRotate(ctx, {
    x: player.x - thisPlayer.x + SCREEN_WIDTH / 2,
    y: player.y - thisPlayer.y + SCREEN_HEIGHT / 2,
    width: player.rank.width,
    height: player.rank.height,
    weapon: {
      ...player.weapon,
      x_0: player.weapon.x_0 - thisPlayer.x + SCREEN_WIDTH / 2,
      y_0: player.weapon.y_0 - thisPlayer.y + SCREEN_HEIGHT / 2,
      x_1: player.weapon.x_1 - thisPlayer.x + SCREEN_WIDTH / 2,
      y_1: player.weapon.y_1 - thisPlayer.y + SCREEN_HEIGHT / 2,
      width: player.rank.weapon_w,
    },
    angle: player.angle,
    prefix,
  });
}
async function paintFood(food, thisPlayer) {
  food.forEach(async (e) => {
    let img = await loadImageByAngle(pre_food, e.type);
    ctx.drawImage(
      img,
      e.x - thisPlayer.x + SCREEN_WIDTH / 2,
      e.y - thisPlayer.y + SCREEN_HEIGHT / 2,
      FOOD_SIZE,
      FOOD_SIZE
    );
  });
}
/*------------------------------back ground handle---------------------------------------*/
function initBG() {
  return [
    {
      index: 0,
      img: "background_img1",
      x: -SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT / 2,
    },
    {
      index: 1,
      img: "background_img2",
      x: SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT / 2,
    },
    {
      index: 2,
      img: "background_img3",
      x: -SCREEN_WIDTH / 2,
      y: -SCREEN_HEIGHT / 2,
    },
    {
      index: 3,
      img: "background_img4",
      x: SCREEN_WIDTH / 2,
      y: -SCREEN_HEIGHT / 2,
    },
  ];
}

function paintBackGround() {
  background.forEach((e) => {
    drawImage(ctx, e.img, {
      x: e.x,
      y: e.y,
      width: canvas.width,
      height: canvas.height,
    });
  });
}
function paintRestrictBg(thisPlayer) {
  // draw in the right of screen
  if (
    thisPlayer.x >
    (ROOM_WIDTH - SCREEN_WIDTH / 2 + thisPlayer.rank.width / 2)
  ) {
    let x =
      SCREEN_WIDTH -
      (SCREEN_WIDTH / 2 -
        ROOM_WIDTH +
        thisPlayer.x -
        thisPlayer.rank.width / 2);
    //drawImage(ctx, 'restrict_bg_1',{x,y:0,width:canvas.width,height:canvas.height});
    ctx.fillRect(x, 0, canvas.width, canvas.height, "#787675");
  } else if (thisPlayer.x < SCREEN_WIDTH / 2 - thisPlayer.rank.width / 2) {
    let x =
      -SCREEN_WIDTH -
      thisPlayer.x +
      SCREEN_WIDTH / 2 -
      thisPlayer.rank.width / 2;
    // drawImage(ctx, 'restrict_bg_1',{x,y:0, width:canvas.width, height:canvas.height});
    ctx.fillRect(x, 0, canvas.width, canvas.height, "#787675");
  }
  // draw in bottom of screen
  if (
    thisPlayer.y >
    ROOM_HEIGHT - SCREEN_HEIGHT / 2 + thisPlayer.rank.height / 2
  ) {
    let y =
      SCREEN_HEIGHT -
      (SCREEN_HEIGHT / 2 -
        ROOM_HEIGHT +
        thisPlayer.y -
        thisPlayer.rank.height / 2);
    //drawImage(ctx, 'restrict_bg_2',{x: 0,y,width:canvas.width,height:canvas.height});
    ctx.fillRect(0, y, canvas.width, canvas.height, "#787675");
  } else if (thisPlayer.y < SCREEN_HEIGHT / 2 - thisPlayer.rank.height / 2) {
    let y =
      -SCREEN_HEIGHT -
      thisPlayer.y +
      SCREEN_HEIGHT / 2 -
      thisPlayer.rank.height / 2;
    // drawImage(ctx, 'restrict_bg_2',{x:0,y, width:canvas.width, height:canvas.height});
    ctx.fillRect(0, y, canvas.width, canvas.height, "#787675");
  }
}
function updateBackground(currPlayer) {
  if (!oldPlayerState.x) {
    return;
  }
  const translation_x = currPlayer.x - oldPlayerState.x;
  const translation_y = currPlayer.y - oldPlayerState.y;
  background[main_idx] = {
    ...background[main_idx],
    x: background[main_idx].x - translation_x,
    y: background[main_idx].y - translation_y,
  };
  // case main back ground index vẫn nằm trong màn hình
  if (
    background[main_idx].x >= 0 &&
    background[main_idx].x <= SCREEN_WIDTH &&
    background[main_idx].y >= 0 &&
    background[main_idx].y <= SCREEN_HEIGHT
  ) {
    updateOtherBG(background[main_idx]);
  } else {
    // case thằng main bg đã out màn hình
    const getOtherBG = background.filter((e) => e.index != main_idx);
    // set lại vị trí cho thằng bg cùng hàng vs thằng main (lấy ngẫu nhiên thằng index 0 trong mảng)
    if (background[main_idx].x < 0) {
      background[getOtherBG[0].index] = {
        ...background[getOtherBG[0].index],
        x: background[main_idx].x + SCREEN_WIDTH,
        y: background[main_idx].y,
      };
    } else {
      background[getOtherBG[0].index] = {
        ...background[getOtherBG[0].index],
        x: background[main_idx].x - SCREEN_WIDTH,
        y: background[main_idx].y,
      };
    }
    // set lại vị trí cho thằng bg cùng cột vs thằng main (lấy ngẫu nhiên thằng index 1 trong mảng)
    if (background[main_idx].y < 0) {
      background[getOtherBG[1].index] = {
        ...background[getOtherBG[1].index],
        x: background[main_idx].x,
        y: background[main_idx].y + SCREEN_HEIGHT,
      };
    } else {
      background[getOtherBG[1].index] = {
        ...background[getOtherBG[1].index],
        x: background[main_idx].x,
        y: background[main_idx].y - SCREEN_HEIGHT,
      };
    }

      background[getOtherBG[2].index] = {
        ...background[getOtherBG[2].index],
        x: background[getOtherBG[0].index].x,
        y: background[getOtherBG[1].index].y,
      };
    updateOtherBG(foundMainBg());
  }
}
function foundMainBg() {
  for(let i=0;i<background.length;i++){
    if (background[i].x >= 0 && background[i].x <= SCREEN_WIDTH && background[i].y >= 0 && background[i].y <= SCREEN_HEIGHT) {
      main_idx = i;
      return background[i];
    }
  }
}

function updateOtherBG(main_bg) {
  const renderBg = background.filter((e) => e.index !== main_bg.index);
  background[renderBg[0].index] = {
    ...background[renderBg[0].index],
    x: main_bg.x - SCREEN_WIDTH,
    y: main_bg.y,
  };
  background[renderBg[1].index] = {
    ...background[renderBg[1].index],
    x: main_bg.x,
    y: main_bg.y - SCREEN_HEIGHT,
  };
  background[renderBg[2].index] = {
    ...background[renderBg[2].index],
    x: main_bg.x - SCREEN_WIDTH,
    y: main_bg.y - SCREEN_HEIGHT,
  };
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paintBackGround();
}
