import Player from 'component/player/Player'
import InhaleGaugeRegistry from 'component/ui/InhaleGaugeRegistry'
import Score from 'component/ui/Score'
import { SingleLaserFactory } from 'component/weapon/SingleLaserFactory'
import {
  BULLET_COUNT,
  DARK_BROWN, HOLD_DURATION_MS,
  LASER_FREQUENCY_MS,
  MARGIN,
  RELOAD_COUNT
} from 'config'
import Phaser from 'phaser'
import MergedInput, { Player as PlayerInput } from 'phaser3-merged-input'
//import { TripleLaserFactory} from "../component/weapon/TripleLaserFactory";
import { Meteor } from 'component/enemy/Meteor'
import { MeteorFactory } from 'component/enemy/MeteorFactory'
import Menu from 'component/ui/Menu'
import ReloadCount from 'component/ui/ReloadCount'
import WebFont from 'webfontloader'
// import { Boss } from '../component/enemy/boss/Boss'
// import I18nSingleton from '../i18n/I18nSingleton'
import Tutorial, { Step } from './tutorial/Tutorial'
import EventEmitter = Phaser.Events.EventEmitter
import { BossCutScene, ShootingPhase } from 'component/enemy/boss/Boss'
import SoundManager from 'component/sound/SoundManager'
import { BossByName } from './boss/bossInterface'

export default class GameScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite
  private player!: Player
  private gaugeRegistry!: InhaleGaugeRegistry
  private score!: Score
  private scoreNumber = 0
  private reloadCountNumber = RELOAD_COUNT

  private reloadCount!: ReloadCount
  //	private reloadCount = RELOAD_COUNT
  //	private reloadCountText!: Phaser.GameObjects.Text

  private mergedInput?: MergedInput
  private controller1!: PlayerInput | undefined | any
  //    private timerText!: Phaser.GameObjects.Text;

  private singleLaserFactory!: SingleLaserFactory
  private meteorFactory!: MeteorFactory
  private tutorial!: Tutorial
  private tutorialMeteor!: Meteor
  private isCompleteWarmup = false
  private isCompleteBoss = false
  private menu!: Menu
  private bossName!: keyof typeof BossByName

  private event!: EventEmitter
  private gameLayer!: Phaser.GameObjects.Layer

  private bgm!: Phaser.Sound.BaseSound
  private soundManager: SoundManager
  private soundEffect!: Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound

  constructor() {
    super({ key: 'game' })
    this.soundManager = new SoundManager(this)
  }

  preload() {
    this.load.image('background', 'assets/background/background.jpg')

    this.load.atlas(
      'player',
      'assets/character/player/mc1_spritesheet.png',
      'assets/character/player/mc1_spritesheet.json',
    );

    this.load.atlas('ui', 'assets/ui/asset_warmup.png', 'assets/ui/asset_warmup.json');
    this.load.atlas('bossAsset', 'assets/sprites/boss/asset_boss.png', 'assets/sprites/boss/asset_boss.json');

    this.load.image('laser', 'assets/effect/mc_bullet.png')
    this.load.image('charge', 'assets/effect/chargeBlue.png')
    this.load.image('explosion', 'assets/effect/explosionYellow.png')
    this.load.image('chevron', 'assets/icon/chevron-down.svg')

    this.load.image('progress_bar', 'assets/ui/progress_bar.png')
    this.load.image('sensor_1', 'assets/ui/sensor_1.png')
    this.load.image('sensor_2', 'assets/ui/sensor_2.png')
    this.load.image('sensor_3', 'assets/ui/sensor_3.png')
    this.load.image('sensor_4', 'assets/ui/sensor_4.png')
    this.load.image('sensor_5', 'assets/ui/sensor_5.png')

    this.load.image('ring', 'assets/icon/chargebar_C0_normal.png')

    this.load.svg('resume', 'assets/icon/resume.svg')
    this.load.svg('finger press', 'assets/icon/finger-press.svg')

    // this.load.audio('shootSound', 'sound/shooting-sound-fx-159024.mp3')
    // this.load.audio('meteorDestroyedSound', 'sound/rock-destroy-6409.mp3')
    // this.load.audio('lapChangedSound', 'sound/soundeffect_count_round.mp3')
    this.load.audio('chargingSound', 'sound/futuristic-beam-81215.mp3')
    this.load.audio('chargedSound', 'sound/sci-fi-charge-up-37395.mp3')

    // this.load.audio('mcHit1', 'sound/mc1-hit1.mp3')
    // this.load.audio('mcHit2', 'sound/mc1-hit2.mp3')
    // this.load.audio('mcHit3', 'sound/mc1-hit3.mp3')

    this.load.scenePlugin('mergedInput', MergedInput)
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  init({ score, reloadCount, isCompleteBoss, bossName }: { score: number, reloadCount: number, isCompleteBoss: boolean, bossName: keyof typeof BossByName }) {
    if(score)
      this.scoreNumber = score
    if(reloadCount)
      this.reloadCountNumber = reloadCount
    if(isCompleteBoss !== undefined)
      this.isCompleteBoss = isCompleteBoss
    this.bossName = bossName
    this.soundManager.unmute()
	}

  create() {

    const { width, height } = this.scale
    // const queryString = window.location.search;
    // const urlParams = new URLSearchParams(queryString);
    // this.controlType = <'tilt' | 'touch'>urlParams.get('control')

    this.bgm = this.sound.add('bgm', {volume: 1, loop: true})
    this.soundManager.init()
    this.soundManager.play(this.bgm)
    this.soundEffect = this.sound.addAudioSprite('mcSound')

    this.background = this.add
      .tileSprite(0, 0, width, height, 'background')
      .setOrigin(0)
      .setScrollFactor(0, 0)

    this.controller1 = this.mergedInput?.addPlayer(0)
    // https://github.com/photonstorm/phaser/blob/v3.51.0/src/input/keyboard/keys/KeyCodes.js#L7
    // XBOX controller B0=A, B1=B, B2=X, B3=Y
    this.mergedInput
      ?.defineKey(0, 'LEFT', 'LEFT')
      .defineKey(0, 'RIGHT', 'RIGHT')
      .defineKey(0, 'B16', 'SPACE')
      //            .defineKey(0, 'B1', 'CTRL')
      //            .defineKey(0, 'B2', 'ALT')
      .defineKey(0, 'B6', 'ONE')
      .defineKey(0, 'B4', 'TWO')
      .defineKey(0, 'B7', 'THREE')
      .defineKey(0, 'B5', 'FOUR')

    this.gameLayer = this.add.layer();
    this.player = new Player(this, this.gameLayer)
    // TODO comment just for testing
    // this.player.addJetEngine()

    this.player.addChargeParticle()

    // TODO Move to UI
    //	this.add
    //		.rectangle(0, height, width, HOLD_BAR_HEIGHT + MARGIN * 2, 0x000000)
    //		.setOrigin(0, 1)
    //		.setAlpha(0.25)

    this.gaugeRegistry = new InhaleGaugeRegistry(this)
    this.gaugeRegistry.createbyDivision(1)

    this.reloadCount = new ReloadCount(this, width / 2, MARGIN)
    this.reloadCount.getBody().setOrigin(0.5, 0)
    this.reloadCount.setCount(this.reloadCountNumber)

    this.score = new Score(this)
    this.score.setScore(this.scoreNumber)
    // this.timerText = this.add.text(width - MARGIN, MARGIN, `time: ${Math.floor(GAME_TIME_LIMIT_MS / 1000)}`, {fontSize: '42px'}).setOrigin(1, 0)

    this.meteorFactory = new MeteorFactory()
    this.singleLaserFactory = new SingleLaserFactory()
    this.tutorial = new Tutorial(this)

    this.menu = new Menu(this)

    if (!this.isCompleteTutorial()) {
      this.tutorialMeteor = this.meteorFactory.create(
        this,
        this.player,
        this.score,
        this.soundEffect,
        true,
      )
      this.gameLayer.add(this.tutorialMeteor.getBody())
    }

    this.isCompleteWarmup = this.reloadCountNumber !== RELOAD_COUNT
    this.event = new EventEmitter()

    const self = this
    WebFont.load({
      google: {
        families: ['Jua']
      },
      active: function() {
        const menuUiStyle = {
          fontFamily: 'Jua', color: `#${DARK_BROWN.toString(16)}`
        }
        self.score.getBody().setStyle(menuUiStyle)
        self.reloadCount.getBody().setStyle(menuUiStyle)
      }
    });
  }

  isCompleteTutorial = () => localStorage.getItem('tutorial') || false
  isCompleteControlerTutorial = () =>
    this.tutorial.getStep() > Step.CONTROLLER || this.isCompleteTutorial()

  update(_: number, delta: number) {
    //        if (this.input.gamepad.total === 0) {
    //            const text = this.add.text(0, height / 2, START_TEXT, {fontSize: '24px'}).setOrigin(0);
    //            text.x = width / 2 - text.width / 2
    //            this.input.gamepad.once('connected', function () {
    //                text.destroy();
    //            }, this);
    //            return;
    //        }
    //        const pad = this.input.gamepad.gamepads[0]

    const gauge = this.gaugeRegistry?.get(0)

    //        const timeLeft = Math.floor((GAME_TIME_LIMIT_MS - time) / 1000)
    //        this.timerText.text = `time: ${timeLeft}`
    //        if (timeLeft <= 0) {
    //            this.scene.pause()
    //        }

    // Tutorial
    if (!this.isCompleteTutorial()) {
      this.tutorial.launchTutorial(Step.CHARACTER, delta, {
        meteor: this.tutorialMeteor,
        player: this.player,
        gameLayer: this.gameLayer,
      })

      this.tutorial.launchTutorial(Step.HUD, delta, {
        score: this.score,
        gauge: gauge,
        menu: this.menu,
        reloadCount: this.reloadCount,
      })

      this.tutorial.launchTutorial(Step.CONTROLLER, delta, {
        player: this.player,
        event: this.event
      })
    }

    this.event.once("completeWarmup", () => this.isCompleteWarmup = true)

    if (!this.isCompleteWarmup && this.isCompleteTutorial()) {
      this.scene.pause()
      this.isCompleteWarmup = true
      this.scene.launch('warmup', { event: this.event })
    }

    if (this.isCompleteTutorial() && this.isCompleteWarmup) {
      this.meteorFactory.createByTime(this, this.player, this.score,this.soundEffect, delta)
    }

    // TODO move to controller class
    if (!this.controller1) return
    // Must be in this order if B3 press with B6, B3 will be activated
    if (this.isCompleteTutorial() && !this.player.getIsAttacking() && this.controller1?.buttons.B16 > 0) {
      gauge.hold(delta)
    } else if (this.controller1?.buttons.B4 > 0) {
      gauge.setStep(1)
    } else if (this.controller1?.buttons.B6 > 0) {
      gauge.setStep(0)
    } else if (this.controller1?.buttons.B7 > 0) {
      gauge.setStep(2)
    } else if (this.controller1?.buttons.B5 > 0) {
      gauge.setStep(3)
    } else {
      gauge.setVisible(false)
    }

    if (this.input.pointer1.isDown) {
      const { x } = this.input.pointer1
      if (this.player.isRightOf(x) && this.isCompleteControlerTutorial()) {
        this.player.moveRight(delta)
      }
      if (this.player.isLeftOf(x) && this.isCompleteControlerTutorial()) {
        this.player.moveLeft(delta)
      }
    }

    if (this.controller1?.direction.LEFT) {
			this.player.moveLeft(delta)
		}

		if (this.controller1?.direction.RIGHT) {
			this.player.moveRight(delta)
		}

    // scroll the background
    this.background.tilePositionY += 1.5

    this.singleLaserFactory.createByTime(
      this,
      this.player,
      [...this.meteorFactory.getMeteors()],
      delta,
    )

    if (this.reloadCount.isDepleted()) {
      gauge.deplete()
      this.scene.launch('end game', {score: this.score.getScore()})
      this.scene.pause()
    }

    if (
      gauge.getDuratation() > HOLD_DURATION_MS &&
      this.controller1?.buttons.B16 > 0
    ) {
      this.player.startReload()
      gauge.setFullCharge()
      this.event.emit('fullInhale')
      if(this.reloadCount.isBossShown(this.isCompleteBoss)) {
        this.soundManager.stop(this.bgm)
        this.scene.stop()
        this.scene.launch(BossCutScene.VS, {
          name: this.bossName,
          score: this.score.getScore(),
          playerX: this.player.getBody().x,
          reloadCount: this.reloadCount.getCount(),
        })
      }
    } else if (
      gauge.getDuratation() <= HOLD_DURATION_MS &&
      gauge.getDuratation() !== 0 &&
      this.controller1?.buttons.B16 > 0 &&
      !this.player.getIsAttacking()
    ) {
      this.player.charge()
      gauge.charge(delta)
      this.event.emit('inhale')
    }

    if (this.player.getIsReload() && !(this.controller1?.buttons.B16 > 0)) { // Fully Reloaded
      this.singleLaserFactory.set(ShootingPhase.NORMAL)

      this.time.addEvent({
        delay : LASER_FREQUENCY_MS * BULLET_COUNT,
        callback : () => {
          this.reloadCount.decrementCount()
          this.isCompleteBoss = false
        },
        loop : false,
      })

      if (!this.reloadCount.isBossShown(this.isCompleteBoss)) {
        this.player.reloadSet(ShootingPhase.NORMAL)
        gauge.set(ShootingPhase.NORMAL)
      } else {
        this.player.attack()
      }

      if (this.reloadCount.isDepleted()) {
        this.time.addEvent({
          delay : LASER_FREQUENCY_MS * BULLET_COUNT,
          callback : () => {
            this.scene.pause()
            this.scene.launch('end game', { score: this.score.getScore() })
          },
          loop : false,
        })
      }
    }

    if (this.player.getIsReloading() && !(this.controller1?.buttons.B16 > 0)) {
      this.player.reloadResetting()
      gauge.resetting()
    }

    if (gauge.isReducing()) {
      gauge.release(delta)
    }
  }
}

// TODO create test
