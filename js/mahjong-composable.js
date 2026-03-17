// Requires: Vue (global), mahjong-utils.js loaded before this file

function useMahjong() {
  const { ref, computed } = Vue

  const tiles    = ref([])
  const selected = ref(null)
  const moves    = ref(0)
  const pairs    = ref(0)
  const history  = ref([])
  const status   = ref('playing') // playing won or stuck
  const hintIds  = ref([])

  const remaining = computed(() => tiles.value.filter(t => !t.matched).length)
  const canUndo   = computed(() => history.value.length > 0)

  function newGame() {
    const positions = buildLayout()
    const typePool  = shuffle(buildTileTypes())
    const cnt       = Math.min(positions.length, typePool.length)
    const evenCnt   = cnt % 2 === 0 ? cnt : cnt - 1

    tiles.value = positions.slice(0, evenCnt).map(([col, row, layer], i) => ({
      id: i,
      suit: typePool[i].suit,
      val:  typePool[i].val,
      col, row, layer,
      matched:  false,
      selected: false,
    }))

    selected.value = null
    moves.value    = 0
    pairs.value    = 0
    history.value  = []
    status.value   = 'playing'
    hintIds.value  = []
  }

  function checkGameState() {
    if (remaining.value === 0) {
      status.value = 'won'
      return
    }
    if (!hasMovesRemaining(tiles.value)) {
      status.value = 'stuck'
    }
  }

  function clickTile(id) {
    if (status.value !== 'playing') return
    const tile = tiles.value.find(t => t.id === id)
    if (!tile || tile.matched || !isFree(tile, tiles.value)) return

    hintIds.value = []

    if (selected.value === id) {
      tile.selected  = false
      selected.value = null
      return
    }

    if (selected.value === null) {
      tile.selected  = true
      selected.value = id
      return
    }

    const prev = tiles.value.find(t => t.id === selected.value)
    prev.selected  = false
    selected.value = null

    if (tilesMatch(prev, tile)) {
      prev.matched = true
      tile.matched = true
      history.value.push({ aId: prev.id, bId: tile.id })
      moves.value++
      pairs.value++
      checkGameState()
    } else {
      tile.selected  = true
      selected.value = id
    }
  }

  function showHint() {
    if (status.value !== 'playing') return
    const pair = findHintPair(tiles.value)
    hintIds.value = pair ? [pair[0].id, pair[1].id] : []
  }

  function undoMove() {
    if (!canUndo.value) return
    const { aId, bId } = history.value.pop()
    tiles.value.find(t => t.id === aId).matched = false
    tiles.value.find(t => t.id === bId).matched = false
    if (pairs.value > 0) pairs.value--
    moves.value++
    selected.value = null
    tiles.value.forEach(t => { t.selected = false })
    hintIds.value  = []
    status.value   = 'playing'
  }

  return {
    tiles, selected, moves, pairs, remaining,
    status, hintIds, canUndo,
    newGame, clickTile, showHint, undoMove,
  }
}