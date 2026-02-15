import './style.css'
import Phaser from 'phaser'

const size = {
  width: 500,
  height: 500
}
const FALL_SPEED = 600
const GAME_TIME = 30000 // 30 seconds

class GameScene extends Phaser.Scene {

  constructor() {
    super('scene-game')

    // Game objects
    this.player = null
    this.apple = null
    this.cursor = null

    // UI
    this.scoreText = null
    this.textTime = null

    // Game state
    this.score = 0
    this.remainingTime = 0
    this.timedEvent = null
    this.isGameOver = false
    this.gamePaused = false

    // Keys
    this.keyR = null
    this.keyP = null
  }

  preload() {
    this.load.image("bg", '/assets/bg.png')
    this.load.image("basket", "/assets/basket.png")
    this.load.image("apple", "/assets/apple.png")
  }

  create() {
    // Reset game state
    this.isGameOver = false
    this.gamePaused = false
    this.score = 0

    // Background
    this.add.image(0, 0, "bg").setOrigin(0, 0)

    // Player
    this.player = this.physics.add.image(250, size.height - 60, "basket")
    this.player.setImmovable(true)
    this.player.body.allowGravity = false
    this.player.setCollideWorldBounds(true)
    this.player.body.setSize(this.player.displayWidth * 0.8, this.player.displayHeight * 0.25)
    this.player.body.setOffset(this.player.displayWidth * 0.1, this.player.displayHeight * 0.75)

    // Apple
    this.apple = this.physics.add.image(this.getRandomX(), 0, "apple")
    this.apple.setVelocityY(FALL_SPEED)
    this.physics.add.overlap(this.apple, this.player, this.appleCatched, null, this)

    // UI
    if (this.scoreText) this.scoreText.destroy()
    this.scoreText = this.add.text(size.width - 220, 10, `Score: ${this.score}`, { fontSize: "20px", fill: "#000" })

    if (this.textTime) this.textTime.destroy()
    this.textTime = this.add.text(10, 10, "Remaining Time: 30", { fontSize: "20px", fill: "#000" })

    // Timer
    if (this.timedEvent) this.timedEvent.remove(false)
    this.timedEvent = this.time.delayedCall(GAME_TIME, this.gameOver, [], this)

    // Input
    this.cursor = this.input.keyboard.createCursorKeys()
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)
  }

  update() {
    // GameOver logic
    if (this.isGameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
        this.scene.restart()
      }
      return
    }

    // Update timer
    this.remainingTime = Math.max(0, Math.ceil(this.timedEvent.getRemainingSeconds()))
    this.textTime.setText(`Remaining Time: ${this.remainingTime}`)

    // Player movement
    if (!this.gamePaused) {
      if (this.cursor.left.isDown) {
        this.player.setVelocityX(-FALL_SPEED)
      } else if (this.cursor.right.isDown) {
        this.player.setVelocityX(FALL_SPEED)
      } else {
        this.player.setVelocityX(0)
      }
    }

    // Pause / Resume
    if (Phaser.Input.Keyboard.JustDown(this.keyP)) {
      this.gamePaused = !this.gamePaused
      if (this.gamePaused) {
        this.physics.pause()
        this.timedEvent.paused = true
        this.textTime.setText("Game Paused")
      } else {
        this.physics.resume()
        this.timedEvent.paused = false
      }
    }

    // Reset apple if missed
    if (this.apple.y >= size.height) {
      this.resetApple()
    }
  }

  appleCatched() {
    this.resetApple()
    this.score++
    this.scoreText.setText(`Score: ${this.score}`)
  }

  resetApple() {
    this.apple.setY(0)
    this.apple.setX(this.getRandomX())
    this.apple.setVelocityY(FALL_SPEED)
  }

  getRandomX() {
    return Phaser.Math.Between(20, size.width - 20)
  }

  gameOver() {
    this.isGameOver = true
    this.physics.pause()
    this.player.setTint(0xff0000)

    this.add.text(
      size.width / 2,
      size.height / 2,
      `GAME OVER\nFinal Score: ${this.score}\nPress R to Restart`,
      { fontSize: "28px", fill: "#000", align: "center" }
    ).setOrigin(0.5)
  }
}

// Phaser game config
const config = {
  type: Phaser.WEBGL,
  width: size.width,
  height: size.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [GameScene]
}

new Phaser.Game(config)
