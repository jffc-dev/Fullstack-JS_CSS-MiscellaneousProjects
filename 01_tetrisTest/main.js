import './style.css'


//initialize canvas
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const $score = document.querySelector('span')
const $button = document.querySelector('button')
const $icon = document.querySelector('button i')
const audio = new window.Audio('Tetris.mp3')

const BLOCK_SIZE = 20
const BOARD_WIDTH = 14
const BOARD_HEIGT = 30

let score = 0
let stop = false
audio.volume = 0.5

canvas.width = BOARD_WIDTH * BLOCK_SIZE
canvas.height = BOARD_HEIGT * BLOCK_SIZE

context.scale(BLOCK_SIZE, BLOCK_SIZE)

// board

const createBoard = (width, height) => {
  return Array(height).fill().map(()=>Array(width).fill({status: 0, color: 'black'}))
}

const board = createBoard(BOARD_WIDTH,BOARD_HEIGT)

//current piece
const PIECES = [
  [
    [1, 1, 1]
  ],
  [
    [1, 1],
    [1, 1]
  ],
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [1, 0, 0],
    [1, 1, 1]
  ],
]

const COLORS = ['yellow','red','deeppink','green','blue','orange','white','greenyellow','cyan','salmon','teal','gray','magenta','blueviolet','brown','khaki','chocolate','burlywood']

let piece = generatePiece()

let dropCounter = 0
let lastTime = 0

const update = (time = 0) => {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime

  if(dropCounter > 500){
    piece.position.y++
    dropCounter = 0

    if(checkCollision()){
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }
  draw()

  if(!stop){
    window.requestAnimationFrame(update)
  }else{
    audio.pause()
    $icon.classList.remove('fa-pause')
    $icon.classList.add('fa-play')
  }
}

const draw = () => {
  context.fillStyle = "#000"
  context.fillRect(0, 0, canvas.width, canvas.height)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value.status === 1){
        context.fillStyle = value.color
        context.fillRect(x, y, 1, 1)
      }
    })
  })

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value === 1){
        context.fillStyle = piece.color
        context.fillRect(piece.position.x + x, piece.position.y + y, 1, 1)
      }
    })
  })

  $score.innerText = score.toString()
}

document.addEventListener('keydown', event => {
  if(event.key === 'ArrowLeft'){
    piece.position.x--
    if(checkCollision())
      piece.position.x++
  }
  if(event.key === 'ArrowRight'){
    piece.position.x++
    if(checkCollision())
      piece.position.x--
  }
  if(event.key === 'ArrowDown'){
    piece.position.y++
    if(checkCollision()){
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }
  if(event.key === 'ArrowUp'){
    
    const newPiece = turnPiece(piece.shape)
    const previousShape = piece.shape

    piece.shape = newPiece

    if(checkCollision())
    piece.shape = previousShape
  }
})

const checkCollision = () => {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return value !== 0 && board[y + piece.position.y]?.[x + piece.position.x]?.['status'] !== 0
    })
  })
}

const solidifyPiece = () => {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value === 1){
        board[y + piece.position.y][x + piece.position.x] = {status: 1, color: piece.color}
      }
      
    })
  })

  //get random shape
  let newPiece = generatePiece()
  piece = newPiece

  if(checkCollision()){
    window.alert('Game over')
    board.forEach((row) => row.fill({status: 0, color: 'black'}))
  }
}

const removeRows = () => {
  const rowsToRemove = []

  board.forEach((row, y) => {
    if(row.every(value => value.status === 1)){
      rowsToRemove.push(y)
    }
  })

  rowsToRemove.forEach(y => {
    board.splice(y,1)
    const newRow = Array(BOARD_WIDTH).fill({status: 0, color: 'black'})
    board.unshift(newRow)
    score += 10
  })
}

const $section = document.querySelector('section')

$section.addEventListener('click', ()=>{
  update()
  $section.remove()
  audio.play()
})

$button.addEventListener('click', () => {
  stop = !stop

  if(!stop){
    audio.play()
    update()
    $icon.classList.remove('fa-play')
    $icon.classList.add('fa-pause')
  }
}, false);

audio.addEventListener('ended', function() {
  this.currentTime = 0;
  this.play();
}, false);

document.addEventListener("visibilitychange", () => {
  stop = true
  audio.pause()
  $icon.classList.add('fa-play')
  $icon.classList.remove('fa-pause')
});