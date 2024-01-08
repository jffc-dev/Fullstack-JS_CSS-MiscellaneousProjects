import './style.css'


//initialize canvas
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const $score = document.querySelector('span')
const audio = new window.Audio('Tetris.mp3')

const BLOCK_SIZE = 20
const BOARD_WIDTH = 14
const BOARD_HEIGT = 30

let score = 0
audio.volume = 0.5

canvas.width = BOARD_WIDTH * BLOCK_SIZE
canvas.height = BOARD_HEIGT * BLOCK_SIZE

context.scale(BLOCK_SIZE, BLOCK_SIZE)

// board

const createBoard = (width, height) => {
  return Array(height).fill().map(()=>Array(width).fill(0))
}

const board = createBoard(BOARD_WIDTH,BOARD_HEIGT)

//current piece

const piece = {
  position: {x: 5, y: 5},
  shape: [
    [1, 1],
    [1, 1]
  ]
}

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


// game loop
// const update = () => {
//   draw()
//   window.requestAnimationFrame(update)
// }

let dropCounter = 0
let lastTime = 0

const update = (time = 0) => {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime

  if(dropCounter > 1000){
    piece.position.y++
    dropCounter = 0

    if(checkCollision()){
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }
  draw()
  window.requestAnimationFrame(update)
}

const draw = () => {
  context.fillStyle = "#000"
  context.fillRect(0, 0, canvas.width, canvas.height)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value === 1){
        context.fillStyle = '#fff'
        context.fillRect(x, y, 1, 1)
      }
    })
  })

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value === 1){
        context.fillStyle = 'yellow'
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
    const rotated = []

    for(let i = 0; i < piece.shape[0].length; i++){
      const row = []

      for(let j = piece.shape.length - 1; j >= 0; j--){
        row.push(piece.shape[j][i])
      }

      rotated.push(row)
    }

    const previousShape = piece.shape

    piece.shape = rotated

    if(checkCollision())
    piece.shape = previousShape
  }
})

const checkCollision = () => {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return value !== 0 && board[y + piece.position.y]?.[x + piece.position.x] !== 0
    })
  })
}

const solidifyPiece = () => {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value === 1)
        board[y + piece.position.y][x + piece.position.x] = 1
    })
  })

  //get random shape
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
  //reset position
  piece.position.y = 0
  piece.position.x = 0

  if(checkCollision()){
    window.alert('Game over')
    board.forEach((row) => row.fill(0))
  }
}

const removeRows = () => {
  const rowsToRemove = []

  board.forEach((row, y) => {
    if(row.every(value => value === 1)){
      rowsToRemove.push(y)
    }
  })

  rowsToRemove.forEach(y => {
    board.splice(y,1)
    const newRow = Array(BOARD_WIDTH).fill(0)
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
