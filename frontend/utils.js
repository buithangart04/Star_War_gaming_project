let imgStorage = {};
function drawImage(ctx, img_id, pos) {
  const img = document.getElementById(img_id);
  ctx.drawImage(img, pos.x, pos.y, pos.width, pos.height);
}
async function drawImageRotate(ctx, info) {
  //draw rotate image
  let angle = - parseInt(info.angle * 180 / Math.PI / 10);
  if(angle== -18 ) angle= 18;
  let img_char = await loadImageByAngle(info.prefix.character, angle);
  ctx.drawImage(
    img_char,
    info.x - info.width / 2,
    info.y - info.height / 2,
    info.width,
    info.height
  );
  if(info.weapon.angle> Math.PI||info.weapon.angle< -Math.PI)console.log(info.weapon.angle);
    //draw weapon
  let weapon_angle = -parseInt(info.weapon.angle * 180/Math.PI /10); 
  if(weapon_angle==-18) weapon_angle=18;
  let x_render = info.weapon.x_0 <  info.weapon.x_1? info.weapon.x_0 : info.weapon.x_1  
  , y_render = info.weapon.y_0 <  info.weapon.y_1? info.weapon.y_0 : info.weapon.y_1;
  
    // sau đoạn vừa rồi là có tâm trục quay
  let img_weapon = await loadImageByAngle(info.prefix.weapon, weapon_angle);
  ctx.drawImage(
    img_weapon,
    x_render ,
    y_render,
    Math.abs(info.weapon.x_0 - info.weapon.x_1)>30? Math.abs(info.weapon.x_0 - info.weapon.x_1): info.weapon.width,
    Math.abs(info.weapon.y_0 - info.weapon.y_1)>30? Math.abs(info.weapon.y_0 - info.weapon.y_1): info.weapon.width
  );
      // ctx.fillRect( info.weapon.x_0 -10 , info.weapon.y_0-10,20,20,'red');
    // ctx.fillRect( info.weapon.x_1 -10 , info.weapon.y_1-10,20,20,'red');
    // ctx.fillRect( info.x -10 , info.y-10,20,20,'red');
    // ctx.fillRect( info.x - info.width/2 -5 , info.y-5,10,10,'red');
    // ctx.fillRect( info.x + info.width/2 - 5 , info.y-5,10,10,'red');
    // ctx.fillRect( info.x-5  , info.y - info.height/2 -5,10,10,'red');
    // ctx.fillRect( info.x-5  , info.y + info.height/2 -5,10,10,'red');
}
function getPrefixByLevel(lv) {
  switch (lv) {
    case 0:
      return { character: pre_charater_lv1, weapon: pre_weapon_lv1 };
    case 1:
      return { character: pre_charater_lv2, weapon: pre_weapon_lv2 };
    case 2:
      return { character: pre_charater_lv3, weapon: pre_weapon_lv3 };
  }
}

async function loadImageByAngle(prefix, angle) {
  // degree
  if (imgStorage[prefix + angle]) return imgStorage[prefix + angle];
  imgStorage[prefix + angle] = await loadImage(prefix + angle + ".png");
  return imgStorage[prefix + angle];
}

function loadImage(url) {
  return new Promise((r) => {
    let i = new Image();
    i.onload = () => r(i);
    i.src = url;
  });
}
function getCurrentPlayer(state,number){
  for(let i=0;i< state.players.length;++i){
      if(state.players[i].id == number) return state.players[i];
  }
  return false;
}

