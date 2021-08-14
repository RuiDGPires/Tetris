const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const cell_size = 35;

const X = 0;
const Y = 1;

let points = 0;
let freeze = false;

const PieceType = {
  T: [[[0,0,0],
      [1,1,1],
      [0,1,0]],

      [[0,1,0],
      [1,1,0],
      [0,1,0]],

      [[0,1,0],
      [1,1,1],
      [0,0,0]],

      [[0,1,0],
      [0,1,1],
      [0,1,0]]],
  LL: [[[0,0,0],
      [1,1,1],
      [1,0,0]],

      [[1,1,0],
      [0,1,0],
      [0,1,0]],

      [[0,0,0],
      [0,0,1],
      [1,1,1]],

      [[0,1,0],
      [0,1,0],
      [0,1,1]]],
  LR: [[[0,0,0],
      [1,1,1],
      [0,0,1]],

      [[0,1,0],
      [0,1,0],
      [1,1,0]],

      [[0,0,0],
      [1,0,0],
      [1,1,1]],

      [[0,1,1],
      [0,1,0],
      [0,1,0]]],
  S: [[[0,0,0],
      [0,1,1],
      [1,1,0]],

      [[1,0,0],
      [1,1,0],
      [0,1,0]]],
  Z: [[[0,0,0],
      [1,1,0],
      [0,1,1]],

      [[0,0,1],
      [0,1,1],
      [0,1,0]]],
  SQUARE: [[[1,1],
            [1,1]],],
  LINE: [[[0,0,0,0],
          [1,1,1,1],
          [0,0,0,0],
          [0,0,0,0]],

          [[0,0,1,0],
          [0,0,1,0],
          [0,0,1,0],
          [0,0,1,0]],]
};

let grid = [];

class Piece {
  constructor(type){
    this.rotation = 0;
    this.mod = type.length
    this.position = [GRID_WIDTH/2, 0];
    this.type = type
    this.center = Math.ceil(type[0].length / 2) - 1
  }
  down(){
    if (this.colides()){
      pieceDies(this.type[this.rotation], this.position.map(x => x-this.center));
    }else{
      this.position[Y] += 1;
    }
  }
  move(dir){
    for (let i = 0; i < this.type[0].length; i++){
      for (let j = 0; j < this.type[0].length; j++){
        if (this.type[this.rotation][j][i] != 1) continue;
        if (this.position[X] + i - this.center + dir < 0 || this.position[X] + i - this.center + dir >= GRID_WIDTH) return
        if (grid[this.position[Y] + j - this.center][this.position[X] + i - this.center + dir] == 1) return;
      }
    }
    this.position[X] += dir;
  }
  rotate(){
    let new_rot = (this.rotation + 1) % this.mod;
    let new_form = this.type[new_rot];

    if (this.formFits(new_form)){
      this.rotation = new_rot;
    }
  }
  formFits(form){
    for (let i = 0; i < this.type[0].length; i++){
      for (let j = 0; j < this.type[0].length; j++){
        if (form[j][i] != 1) continue;
        if (this.position[X] + i - this.center< 0 || this.position[X] + i - this.center >= GRID_WIDTH) return false;
        if (grid[this.position[Y] + j - this.center][this.position[X] + i - this.center] == 1) return false;
      }
    }
    return true;
  }

  colides(){
    for (let i = 0; i < this.type[0].length; i++){
      for (let j = 0; j < this.type[0].length; j++){
        if (this.type[this.rotation][j][i] != 1) continue;
        if (this.position[Y] + j - this.center + 1 >= GRID_HEIGHT) return true;
        if (grid[this.position[Y] + j - this.center + 1][this.position[X] + i - this.center] == 1) return true;
      }
    }
  }

  draw(){
    push();
    fill(255, 14, 0);
    noStroke();
    let size = this.type[0].length
    for (let i = 0; i < size; i++){
      for (let j = 0; j < size; j++){
        if (this.type[this.rotation][j][i] == 1){
          let point = gridToScreen(this.position[X] + i - this.center, this.position[Y] + j - this.center);
          square(point[X], point[Y], cell_size);
        }
      }
    }
    pop();
  }
}


function gridToScreen(x, y){
  return [(x - GRID_WIDTH/2)*cell_size + windowWidth/2, (y - GRID_HEIGHT/2)*cell_size + windowHeight/2]
}

function createGrid(){
  let aux = [];
  for (let i = 0; i < GRID_WIDTH; i++){
    aux.push(0);
  }
  for (let i = 0; i < GRID_HEIGHT; i++){
    grid.push([].concat(aux));
  }
}

let current_piece;
let next_piece = null;

let gravity;
const BASE_GRAVITY = 1.4;

function newPiece(){
  if (next_piece == null){
    next_piece = random(Object.values((PieceType)));
  }
  current_piece = new Piece(next_piece);

  if (!current_piece.formFits(current_piece.type[current_piece.rotation])){
    endGame();
  }
  next_piece = random(Object.values((PieceType)));
}

function setup() {
  randomSeed();
  createGrid();
  newPiece();
  gravity = setInterval(() => {current_piece.down()}, 1000/BASE_GRAVITY);
  frameRate(14);
  createCanvas(windowWidth*0.99, windowHeight*0.99);
}

function drawCell(grid_x, grid_y, empty) {
  push();
  if (empty){
    fill(0);
  }else{
    fill(100);
  }

  strokeWeight(0.3);
  stroke(100);
  let point = gridToScreen(grid_x, grid_y)
  square(point[X], point[Y], cell_size);
  pop();
}

function drawGrid(){
  for(var j = 0; j < GRID_HEIGHT; j++){
    for (var i = 0; i < GRID_WIDTH; i++){
      drawCell(i,j, grid[j][i] == 0);
    }
  }
}

function drawPoints(){
  push();
  fill(250,250,255);
  textStyle(BOLD);
  textSize(windowWidth/50);
  textAlign(CENTER);
  text("Score: " + points, windowWidth/3, windowHeight/4);
  pop();
}

function drawNextPiece(){
  push();

  fill(5, 180, 60);
  stroke(5, 180, 60)

  let offset = [windowWidth*23/37, windowHeight*3/17]
  for (var i = 0; i < next_piece[0].length; i++){
    for (var j = 0; j < next_piece[0].length; j++){
      if (next_piece[0][j][i] == 1){
        square(offset[X] + i*cell_size, offset[Y]+ j*cell_size, cell_size);
      }
    }
  }
  
  pop();
}

function draw() {
  background(20);
  drawGrid();
  drawPoints();
  if (current_piece != null){
    current_piece.draw();
  }
  drawNextPiece();
}

function checkTetris(){
  let n = 0;
  for(let y = GRID_HEIGHT - 1; y >= 0; y--){
    let isTetris = true;
    for (let x = 0; x < GRID_WIDTH; x ++){
      if (grid[y][x] == 0){
        isTetris = false;
      }
    } 
    if (!isTetris){
      for (let x = 0; x < GRID_WIDTH; x++){
        grid[y+n][x] = grid[y][x];
      }
    }else{
      n += 1;
    }
  }
  points += n*10;
}


function pieceDies(form, corner){
  points += 1;
  for (let i = 0; i < form.length; i++){
    for (let j = 0; j < form.length; j++){
      if (form[j][i] == 1){
        grid[j + corner[Y]][i + corner[X]] = 1;
      }
    }
  }
  checkTetris();
  newPiece();
}


let checkKey;
let continuousMove;

function sparkMove(dir){
  continuousMove = setInterval(()=>current_piece.move(dir), 100);
}

let speed_gravity;

function keyPressed() {
  if (freeze) return;
  if (keyCode === LEFT_ARROW){
    checkKey = setTimeout(()=>sparkMove(-1), 420);
    current_piece.move(-1);
  }else if (keyCode === RIGHT_ARROW){
    checkKey = setTimeout(()=>sparkMove(1), 420);
    current_piece.move(1);
  }else if (keyCode === UP_ARROW){
    current_piece.rotate();
  }else if (keyCode === DOWN_ARROW){
    current_piece.down();
    speed_gravity = setTimeout(()=>{
      clearInterval(gravity);
      gravity = setInterval(() => {current_piece.down()}, 60/BASE_GRAVITY);
    }, 420);
  }
}

function keyReleased(){
  if (freeze) return;
  if (keyCode === DOWN_ARROW){
    clearTimeout(speed_gravity);
    clearInterval(gravity);
    gravity = setInterval(() => {current_piece.down()}, 1000/BASE_GRAVITY);
  }else if (keyCode == RIGHT_ARROW || keyCode == LEFT_ARROW){
    clearTimeout(checkKey);
    clearInterval(continuousMove);
  }
}

function endGame(){
  current_piece = null;
  draw();
  freeze = true;
  clearInterval(gravity);
  fill(250,250,255);
  textStyle(BOLD);
  textSize(windowWidth/20);
  textAlign(CENTER);
  text("GAME OVER | YOUR SCORE: " + points, windowWidth/2, windowHeight/2);
  frameRate(0);
}