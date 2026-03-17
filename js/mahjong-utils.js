const SUITS = [
  {
    id: 'bamboo',
    label: 'BAM',
    faces: ['一','二','三','四','五','六','七','八','九'],
  },
  {
    id: 'coins',
    label: 'COI',
    faces: ['1','2','3','4','5','6','7','8','9'],
  },
  {
    id: 'chars',
    label: 'CHA',
    faces: ['一','二','三','四','五','六','七','八','九'],
  },
  {
    id: 'winds',
    label: 'WIN',
    faces: ['東','南','西','北'],
  },
  {
    id: 'dragons',
    label: 'DRA',
    faces: ['中','發','白'],
  },
  {
    id: 'flowers',
    label: 'HUA',
    faces: ['梅','蘭','菊','0'],
  },
  {
    id: 'seasons',
    label: 'SEA',
    faces: ['春','夏','秋','冬'],
  },
]

function getSuit(id) {
  return SUITS.find(s => s.id === id)
}

function getFace(suit, val) {
  const s = getSuit(suit)
  return s.faces[val % s.faces.length]
}

// suit names are on tiles

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

// Tile dimensions
const TILE_W       = 56
const TILE_H       = 72
const GAP_X        = 60
const GAP_Y        = 76
const LAYER_OFFSET = 5

function tileX(col, layer) { return 24 + col * GAP_X + layer * LAYER_OFFSET }
function tileY(row, layer) { return 12 + row * (TILE_H + 4) + layer * LAYER_OFFSET }
function tileZIndex(tile)  { return tile.layer * 200 + tile.row * 2 + (tile.selected ? 9999 : 0) }