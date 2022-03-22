function getCurrentPlayer(state,number){
  for(let i=0;i< state.players.length;++i){
      if(state.players[i].id == number) return state.players[i];
  }
    return false;
}
function checkValueInArray(arr,value){
    for(let i =0; i<arr.length;i++){
      if(arr[i] == value ) return true;
    }
    return false;
  }
  
module.exports = {getCurrentPlayer,checkValueInArray};