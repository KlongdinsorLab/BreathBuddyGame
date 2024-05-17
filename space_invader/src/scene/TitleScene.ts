import Phaser from 'phaser'
import MergedInput, { Player as InputPlayer } from 'phaser3-merged-input'
//import Player from 'component/player/Player'
import SoundManager from 'component/sound/SoundManager'
import { MARGIN, MEDIUM_FONT_SIZE } from 'config'
import I18nSingleton from 'i18n/I18nSingleton'

export default class TitleScene extends Phaser.Scene {
  //	private background!: Phaser.GameObjects.TileSprite
  private mergedInput?: MergedInput
  private controller1?: InputPlayer | any
  //	private player?: Player
  private bgm?: Phaser.Sound.BaseSound
  private hasController = false
  private statusText!: Phaser.GameObjects.Text

  constructor() {
    super('title')
  }

  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

    this.load.image('titleBackground', 'assets/background/title-background.jpg')
    this.load.image('logo', 'assets/logo/logo_1-01.png')
    //		this.load.image('player', 'assets/character/player/playerShip1_blue.png')
    this.load.image('fire', 'assets/effect/fire03.png')
    // this.load.audio('bgm', 'sound/hofman-138068.mp3')
    this.load.audio('bgm', 'sound/BGM_GameScene.mp3')

    this.load.scenePlugin('mergedInput', MergedInput)

    this.load.audioSprite('tutorialWarmupSound', 'sound/audio_sprites/tt-warmup-boss-sound.json', [
      'sound/audio_sprites/tt-warmup-boss-sound.mp3'
    ]);

    this.load.audioSprite('mcSound', 'sound/audio_sprites/mc1-sound.json', [
    'sound/audio_sprites/mc1-sound.mp3'
    ]);
    
		this.load.audioSprite('bossSound', 'sound/audio_sprites/b1-sound.json', [
			'sound/audio_sprites/b1-sound.mp3',
		])
  }

  create() {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    this.hasController = urlParams.get('controller') === 'true'

    const { width, height } = this.scale
    //		const i18n = I18nSingleton.getInstance()
    //		this.background = this.add
    //			.tileSprite(0, 0, width, height, 'titleBackground')
    //			.setOrigin(0)
    //			.setScrollFactor(0, 0)

    this.add
      .tileSprite(0, 0, width, height, 'titleBackground')
      .setOrigin(0)
      .setScrollFactor(0, 0)

    this.add.image(width / 2, height / 2, 'logo').setOrigin(0.5, 1)
    I18nSingleton.getInstance()
      .createTranslatedText(this, width / 2, height / 2, 'start text')
      .setFontSize(MEDIUM_FONT_SIZE)
      .setOrigin(0.5, 0)

    this.controller1 = this.mergedInput?.addPlayer(0)
    this.mergedInput
      ?.defineKey(0, 'LEFT', 'LEFT')
      .defineKey(0, 'RIGHT', 'RIGHT')
      .defineKey(0, 'B0', 'SPACE')

    //		this.player = new Player(this)
    //		this.player.addJetEngine()

    this.bgm = this.sound.add('bgm', {volume: 0.5, loop: true})
    const soundManager = new SoundManager(this)
    soundManager.init()
    soundManager.play(this.bgm)

    /* TODO comment just for testing
    const isSetup = localStorage.getItem('setup') ?? false
    if (!isSetup) {
      this.scene.pause()
      this.scene.launch('setup')
    }
    */

    this.statusText = this.add
    .text(
      width / 2,
      height - 2* MARGIN,
      "Start",
    )
    .setFontSize("4em")
    .setOrigin(0.5, 1)

    if (!this.hasController && this.input?.gamepad?.total === 0) {
      this.statusText.setText("Please Connect Controller")
      this.input.gamepad.once(
        'connected',
        () => {
          this.statusText.setText("Controller Connected")
          // this.startGame()
        },
        this,
      )
    }

    const installButton = this.add
      .rectangle(width / 2, height / 2 + 4 * MARGIN, 300, 150, 0x999999)
      .setOrigin(0.5, 0.5)
      installButton.setInteractive()
      installButton.on('pointerup', () => {
        window.dispatchEvent(new Event("installClick"))
        this.statusText.setText("Install App")
    })

    this.add.text(width / 2, height / 2 + 4 * MARGIN, "Install App").setFontSize("3em").setOrigin(0.5, 0.5)
  }

  update() {
    if (this.controller1?.buttons.B5 > 0){
      this.statusText.setText("Home Clicked")
      setTimeout(() => this.startGame(), 1000)
    }

    if (
      this.hasController &&
      (this.controller1?.direction.LEFT ||
        this.controller1?.direction.RIGHT ||
        this.controller1?.buttons.B5 > 0 ||
        this.input.pointer1.isDown)
    ) {
      this.startGame()
    }
  }

  startGame() {
    I18nSingleton.getInstance().destroyEmitter()
    this.scene.start(import.meta.env.VITE_START_SCEN || 'game')
    new SoundManager(this).stop(this.bgm!)
  }
}
