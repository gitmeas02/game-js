import './style.css'
import Phaser, { Scene } from 'phaser'
const size={
  width: 500,
  height: 500
}
const speedDown = 600
class GameScene extends Phaser.Scene{
  constructor(){
    super('scene-game')
    this.player
    this.cursor
    this.apple
    this.playerSpeed = speedDown+50
    this.score = 0
    this.scoreText
    this.textTime
    this.timedEvent
    this.remainingTime
  }
  preload(){
   this.load.image("bg",'/assets/bg.png')
   this.load.image("basket","/assets/basket.png")
   this.load.image("apple", "/assets/apple.png")
  }
  create(){
   this.add.image(0,0,"bg").setOrigin(0,0);
   this.player  = this.physics.add.image(0,size.height-100,"basket").setOrigin(0,0);
   this.player.setImmovable(true)
   this.player.body.allowGravity= false
   this.player.setCollideWorldBounds(true)
   // Make hitbox small and at bottom
    this.player.body.setSize(
    this.player.displayWidth * 0.8,   // width of hitbox
    this.player.displayHeight * 0.25  // only bottom 25%
    );

    this.player.body.setOffset(
    this.player.displayWidth * 0.1,   // center horizontally
    this.player.displayHeight * 0.75  // push to bottom
    );
  // 
  this.apple = this.physics.add.image(0,0,"apple").setOrigin(0,0)
  this.apple.setMaxVelocity(0, speedDown)
  this.apple.setVelocityY(speedDown)
  this.physics.add.overlap(this.apple,this.player, this.appleCatched,null,this)
  // 
  this.scoreText = this.add.text(size.width-220,0,"Score: 0",{
    fontSize: "20px",
    fill: "#000"
  }) 
  this.textTime = this.add.text(20,0,"Remaining Time: 00",{
      fontSize: "20px",
      fill: "#000"
    }
  )
  this.timedEvent = this.time.delayedCall(3000,this.gameOver,[],this) // 30s timer
   this.cursor = this.input.keyboard.createCursorKeys()
  }
  update(){
    this.remainingTime = Math.max(0, Math.ceil(this.timedEvent.getRemainingSeconds()))
    this.textTime.setText(`Remaining Time: ${this.remainingTime}`)
    const {left , right} = this.cursor
    if(left.isDown){
      // this.player.x -= this.playerSpeed * this.game.loop.delta / 1000
      this.player.setVelocityX(-this.playerSpeed)
    }
     else if(right.isDown){
      // this.player.x += this.playerSpeed * this.game.loop.delta / 1000
      this.player.setVelocityX(this.playerSpeed)
    }
    else {
      this.player.setVelocityX(0)
    }
    // Reset apple if it goes out of bounds
    if(this.apple.y >= size.height){
      this.apple.setY(0)
      this.apple.setX(this.getRandomX())
      this.apple.setVelocityY(speedDown)
    }
  }
  getRandomX(){
    return Math.floor(Math.random() * (size.width - this.apple.width))
  }
  appleCatched(){
    this.apple.setY(0)
    this.apple.setX(this.getRandomX())
    this.apple.setVelocityY(speedDown)
    this.score++
    this.scoreText.setText(`Score: ${this.score}`)
  }

  gameOver(){
    this.physics.pause()
    this.player.setTint(0xff0000)
    
    this.add.text(size.width/2, size.height/2, 'GAME OVER!\nFinal Score: ' + this.score, {
      fontSize: '32px',
      fill: '#000',
      align: 'center'
    }).setOrigin(0.5, 0.5)
    
    this.input.keyboard.enabled = false
  }
}
const config ={
 type: Phaser.WEBGL,
 width: size.width,
 height: size.height,
 canvas: document.getElementById('gameCanvas'),
 physics: {
  default: 'arcade',
  arcade: {
    gravity: { y: speedDown },
    debug: true
  }
 },
 scene: [
  GameScene
 ]
}

const game = new Phaser.Game(config)