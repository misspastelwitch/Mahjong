const SUITS = [
  {
    id: 'bamboo',
    label: 'BAM',
    faces: ['\u{1F010}','\u{1F011}','\u{1F012}','\u{1F013}','\u{1F014}','\u{1F015}','\u{1F016}','\u{1F017}','\u{1F018}'],
  },
  {
    id: 'coins',
    label: 'COI',
    faces: ['\u{1F019}','\u{1F01A}','\u{1F01B}','\u{1F01C}','\u{1F01D}','\u{1F01E}','\u{1F01F}','\u{1F020}','\u{1F021}'],
  },
  {
    id: 'chars',
    label: 'CHA',
    faces: ['\u{1F007}','\u{1F008}','\u{1F009}','\u{1F00A}','\u{1F00B}','\u{1F00C}','\u{1F00D}','\u{1F00E}','\u{1F00F}'],
  },
  {
    id: 'winds',
    label: 'WIN',
    faces: ['\u{1F000}','\u{1F001}','\u{1F002}','\u{1F003}'],
  },
  {
    id: 'dragons',
    label: 'DRA',
    faces: ['中','\u{1F005}','\u{1F006}'],
  },
  {
    id: 'flowers',
    label: 'HUA',
    faces: ['\u{1F022}','\u{1F023}','\u{1F024}','\u{1F025}'],
  },
  {
    id: 'seasons',
    label: 'SEA',
    faces: ['\u{1F026}','\u{1F027}','\u{1F028}','\u{1F029}'],
  },
]

function getSuit(id) {
  return SUITS.find(s => s.id === id)
}

function getFace(suit, val) {
  const s = getSuit(suit)
  return s.faces[val % s.faces.length]
}

function getLabel(suit) {
  return getSuit(suit).label
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildLayout() {
  const pos = []
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 12; c++)
      pos.push([c, r, 0])
  for (let r = 1; r < 7; r++)
    for (let c = 1; c < 11; c++)
      pos.push([c, r, 1])
  for (let r = 2; r < 6; r++)
    for (let c = 2; c < 10; c++)
      pos.push([c, r, 2])
  for (let r = 3; r < 5; r++)
    for (let c = 3; c < 9; c++)
      pos.push([c, r, 3])
  pos.push([5.5, 3.5, 4])
  for (let r = 3; r < 5; r++) {
    pos.push([-1, r, 0])
    pos.push([13, r, 0])
  }
  return pos
}

function buildTileTypes() {
  const types = []
  for (const suit of ['bamboo', 'coins', 'chars'])
    for (let v = 0; v < 9; v++)
      for (let k = 0; k < 4; k++)
        types.push({ suit, val: v })
  for (let v = 0; v < 4; v++)
    for (let k = 0; k < 4; k++)
      types.push({ suit: 'winds', val: v })
  for (let v = 0; v < 3; v++)
    for (let k = 0; k < 4; k++)
      types.push({ suit: 'dragons', val: v })
  for (let v = 0; v < 4; v++) types.push({ suit: 'flowers', val: v })
  for (let v = 0; v < 4; v++) types.push({ suit: 'seasons', val: v })
  return types
}

function isFree(tile, allTiles) {
  if (tile.matched) return false
  const active = allTiles.filter(o => !o.matched && o.id !== tile.id)
  const onTop = active.some(
    o => o.layer === tile.layer + 1
      && Math.abs(o.col - tile.col) < 1
      && Math.abs(o.row - tile.row) < 1
  )
  if (onTop) return false
  const sameLayer    = active.filter(o => o.layer === tile.layer)
  const leftBlocked  = sameLayer.some(o => Math.abs(o.row - tile.row) < 1 && o.col === tile.col - 1)
  const rightBlocked = sameLayer.some(o => Math.abs(o.row - tile.row) < 1 && o.col === tile.col + 1)
  return !(leftBlocked && rightBlocked)
}

function tilesMatch(a, b) {
  if (a.suit === 'flowers' && b.suit === 'flowers') return true
  if (a.suit === 'seasons' && b.suit === 'seasons') return true
  return a.suit === b.suit && a.val === b.val
}

function findHintPair(tiles) {
  const free = tiles.filter(t => isFree(t, tiles))
  for (let i = 0; i < free.length; i++)
    for (let j = i + 1; j < free.length; j++)
      if (tilesMatch(free[i], free[j]))
        return [free[i], free[j]]
  return null
}

function hasMovesRemaining(tiles) {
  return findHintPair(tiles) !== null
}

// Tile sizes

const BOARD_COLS  = 15
const BOARD_ROWS  = 8
const MAX_LAYERS  = 4

// Tile sizes for desktop
const BASE_W      = 56
const BASE_H      = 72
const BASE_GAP_X  = 60
const BASE_GAP_Y  = 76
const BASE_OFFSET = 5

// tile sizes for mobile
const SMALL_W      = 40
const SMALL_H      = 52
const SMALL_OFFSET = 4

let TILE_SCALE = 1
let GAP_X = BASE_GAP_X
let GAP_Y = BASE_GAP_Y
let OFFSET = BASE_OFFSET

function computeScale() {
  const vw = window.innerWidth

  const isSmall = vw < 660
  GAP_X  = isSmall ? BASE_W  : BASE_GAP_X
  GAP_Y  = isSmall ? BASE_H  : BASE_GAP_Y
  OFFSET = isSmall ? 3       : BASE_OFFSET

  TILE_SCALE = (vw * 0.75) / (BOARD_COLS * GAP_X)

  const tileW = BASE_GAP_X * TILE_SCALE
  const tileH = BASE_GAP_Y * TILE_SCALE

  const root = document.documentElement
  root.style.setProperty('--tile-w', tileW.toFixed(2) + 'px')
  root.style.setProperty('--tile-h', tileH.toFixed(2) + 'px')
  root.style.setProperty('--tile-face-size', rem(tileW * 0.044))
  root.style.setProperty('--tile-suit-size', rem(tileW * 0.0106))
}

function rem(n) { return n.toFixed(3) + 'rem' }

function boardWidth() {
  return 24 + BOARD_COLS * GAP_X * TILE_SCALE
       + MAX_LAYERS * OFFSET * TILE_SCALE
}
function boardHeight() {
  return 12 + BOARD_ROWS * GAP_Y * TILE_SCALE
       + MAX_LAYERS * OFFSET * TILE_SCALE + 20
}

function tileX(col, layer) {
  const tileGroupW = BOARD_COLS * GAP_X * TILE_SCALE
  const centerOffset = (boardWidth() - tileGroupW) / 2
  return centerOffset + (col * GAP_X + layer * OFFSET) * TILE_SCALE
}
function tileY(row, layer) {
  return (12 + row * GAP_Y + layer * OFFSET) * TILE_SCALE
}
function tileZIndex(tile) {
  return tile.layer * 200 + tile.row * 2 + (tile.selected ? 9999 : 0)
}

computeScale()
window.addEventListener('resize', computeScale)