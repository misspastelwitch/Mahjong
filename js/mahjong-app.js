// Requires: Vue (global), mahjong-utils.js, mahjong-composable.js

const { createApp, onMounted, onUnmounted, ref, computed } = Vue

// tiles
const MahjongTile = {
  props: {
    tile:      { type: Object,  required: true },
    allTiles:  { type: Array,   required: true },
    isHinted:  { type: Boolean, default: false },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const free = () => isFree(props.tile, props.allTiles)
    return { free, getFace, getLabel, tileX, tileY, tileZIndex }
  },
  template: `
    <div
      class="tile"
      :class="[
        'suit-' + tile.suit,
        tile.matched  ? 'matched'  : '',
        free()        ? 'free'     : 'blocked',
        tile.selected ? 'selected' : '',
        isHinted      ? 'hinted'   : '',
      ]"
      :style="{
        left:   tileX(tile.col, tile.layer) + 'px',
        top:    tileY(tile.row, tile.layer) + 'px',
        zIndex: tileZIndex(tile),
      }"
      @click="$emit('click', tile.id)"
    >
      <span class="tile-face">{{ getFace(tile.suit, tile.val) }}</span>
      <span class="tile-suit">{{ getLabel(tile.suit) }}</span>
    </div>
  `,
}

// board
const MahjongBoard = {
  props: {
    tiles:       { type: Array,  required: true },
    hintIds:     { type: Array,  default: () => [] },
    boardWidth:  { type: Number, required: true },
    boardHeight: { type: Number, required: true },
  },
  emits: ['tileClick'],
  components: { MahjongTile },
  setup(props) {
    const sorted = () => [...props.tiles].sort((a, b) => a.layer - b.layer)
    return { sorted }
  },
  template: `
    <div
      class="board-wrap">
      <MahjongTile
        v-for="tile in sorted()"
        :key="tile.id"
        :tile="tile"
        :all-tiles="tiles"
        :is-hinted="hintIds.includes(tile.id)"
        @click="$emit('tileClick', $event)"
      />
    </div>`,
}

// Toolbar
const MahjongToolbar = {
  props: {
    canUndo: { type: Boolean, default: false },
  },
  emits: ['newGame', 'hint', 'undo'],
  template: `
    <div class="toolbar">
      <button class="btn btn-new"  @click="$emit('newGame')">Shuffle it!</button>
      <button class="btn btn-hint" @click="$emit('hint')">Clue</button>
      <button class="btn btn-undo" :disabled="!canUndo" @click="$emit('undo')">Undo</button>
    </div>
  `,
}

// Stats
const MahjongStats = {
  props: {
    remaining: { type: Number, required: true },
    moves:     { type: Number, required: true },
    pairs:     { type: Number, required: true },
  },
  template: `
    <div class="stats">
      <span>Tiles left: <strong>{{ remaining }}</strong></span>
      <span>Moves: <strong>{{ moves }}</strong></span>
      <span>Pairs: <strong>{{ pairs }}</strong></span>
    </div>
  `,
}

// win/lose
const MahjongMessage = {
  props: {
    status: { type: String, required: true },
  },
  emits: ['newGame'],
  setup() {
    const messages = {
      won:   { title: 'Yay, you won!',      body: 'Want to play again?' },
      stuck: { title: 'Uh-Oh', body: 'There are no more pairs. Try again!' },
    }
    return { messages }
  },
  template: `
    <Transition name="fade">
      <div v-if="status !== 'playing'" class="message-overlay">
        <div class="message-box">
          <h2>{{ messages[status].title }}</h2>
          <p>{{ messages[status].body }}</p>
          <button class="btn btn-new" @click="$emit('newGame')">Play Again</button>
        </div>
      </div>
    </Transition>
  `,
}

// app
const App = {
  components: { MahjongBoard, MahjongToolbar, MahjongStats, MahjongMessage },
  setup() {
    const game = useMahjong()

    // Reactive board dimensions
    const bw = ref(boardWidth())
    const bh = ref(boardHeight())

    function onResize() {
      computeScale()
      bw.value = boardWidth()
      bh.value = boardHeight()
    }

    onMounted(() => {
      game.newGame()
      window.addEventListener('resize', onResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', onResize)
    })

    return { ...game, bw, bh }
  },
  template: `
    <div class="mahjong-page">
      <h1 class="page-title">✿ Cute Mahjong ✿</h1>
      <p class="page-subtitle">match pairs of free tiles to clear the board!</p>
      <p class="page-subtitle">made by</p>
      <a class="page-subtitle" href="https://github.com/misspastelwitch/Mahjong" target="_blank">misspastelwitch</a>
      <MahjongToolbar
        :can-undo="canUndo"
        @new-game="newGame"
        @hint="showHint"
        @undo="undoMove"
      />
      <MahjongStats
        :remaining="remaining"
        :moves="moves"
        :pairs="pairs"
      />
      <MahjongBoard
        :tiles="tiles"
        :hint-ids="hintIds"
        :board-width="bw"
        :board-height="bh"
        @tile-click="clickTile"
      />
      <MahjongMessage
        :status="status"
        @new-game="newGame"
      />
    </div>
  `,
}

createApp(App).mount('#app')