
let imgStorage = {};
function drawImage(ctx, img_id, pos) {
  const img = document.getElementById(img_id);
  ctx.drawImage(img, pos.x,pos.y, pos.width, pos.height);
}
 async function drawImageRotate(ctx,info){
  let angle = parseInt(-(info.angle*180 /Math.PI)/10);
  let img_char = await loadImageByAngle(info.prefix.character,angle);
  ctx.drawImage(img_char, info.x -info.width/2, info.y- info.height/2,info.width, info.height);

  let weapon_angle = parseInt(-(info.weapon.angle*180 /Math.PI)/10);
  let img_weapon = await loadImageByAngle(info.prefix.weapon,weapon_angle);
  ctx.drawImage(img_weapon, info.weapon.x , info.weapon.y,info.weapon.width, info.weapon.height);

}
function getPrefixByLevel(lv) {
  switch (lv) {
    case 0:
        return {character:pre_charater_lv1, weapon: pre_weapon_lv1};
    case 1:
        return {character:pre_charater_lv2, weapon: pre_weapon_lv2};
    case 2:
        return {character:pre_charater_lv3 ,weapon: pre_weapon_lv3};
  }
}

async function  loadImageByAngle (prefix,angle){// degree
  if(imgStorage[prefix+angle]) return imgStorage[prefix+angle];
  imgStorage[prefix+angle] = await loadImage(prefix+angle+'.png');
  return imgStorage[prefix+angle];
}

function loadImage(url) {
  return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
}
function getWeaponPos(player , currPlayer ){
  let r = player.rank.width/4;
  let angle;
     if((player.angle> (-Math.PI/2) && player.angle<Math.PI/2)){
    angle = player.angle- WEAPON_CHARACTER_ANGLE;
    }else{
    angle = player.angle+ WEAPON_CHARACTER_ANGLE;
     }
    angle= angle  > Math.PI ? angle - 2* Math.PI: angle< -(Math.PI) ? angle+2* Math.PI: angle;
  return {
    //player.x - currPlayer.x + SCREEN_WIDTH / 2
    x : player.x + r*Math.cos(angle) - currPlayer.x +  SCREEN_WIDTH / 2,
    y : player.y + r*Math.sin(angle) - currPlayer.y +  SCREEN_HEIGHT / 2,
    angle
  }
}
