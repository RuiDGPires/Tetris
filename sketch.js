const GRID_WIDTH = 10;
const GRID_HEIGHT = 25;
const cell_size = 25;

const X = 0;
const Y = 1;

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

    for (let i = 0; i < this.type[0].length; i++){
      for (let j = 0; j < this.type[0].length; j++){
        if (new_form[j][i] != 1) continue;
        if (this.position[X] + i - this.center< 0 || this.position[X] + i - this.center >= GRID_WIDTH) return
        if (grid[this.position[Y] + j - this.center][this.position[X] + i - this.center] == 1) return;
      }
    }
    this.rotation = new_rot;
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
  console.log(grid);
}

let current_piece;
let gravity;
const BASE_GRAVITY = 1.4;

function newPiece(){
  current_piece = new Piece(random(Object.values((PieceType))));
}

function setup() {
  randomSeed();
  newPiece();
  createGrid();
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


function pieceDies(form, corner){
  console.log(form)
  for (let i = 0; i < form.length; i++){
    for (let j = 0; j < form.length; j++){
      if (form[j][i] == 1){
        grid[j + corner[Y]][i + corner[X]] = 1;
      }
    }
  }
  newPiece();
}

function drawGrid(){
  for(var j = 0; j < GRID_HEIGHT; j++){
    for (var i = 0; i < GRID_WIDTH; i++){
      drawCell(i,j, grid[j][i] == 0);
    }
  }
}

function draw() {
  background(20);
  drawGrid();
  current_piece.draw();
}

function keyPressed() {
  if (keyCode === LEFT_ARROW){
    current_piece.move(-1);
  }else if (keyCode === RIGHT_ARROW){
    current_piece.move(1);
  }else if (keyCode === UP_ARROW){
    current_piece.rotate();
  }else if (keyCode === DOWN_ARROW){
    clearInterval(gravity);
    gravity = setInterval(() => {current_piece.down()}, 120/BASE_GRAVITY);
  }
}

function keyReleased(){
  if (keyCode === DOWN_ARROW){
    clearInterval(gravity);
    gravity = setInterval(() => {current_piece.down()}, 1000/BASE_GRAVITY);
  }
}