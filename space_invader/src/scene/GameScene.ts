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
import Menu from 'component/ui/Menu'
import ReloadCount from 'component/ui/ReloadCount'
import WebFont from 'webfontloader'
// import { Boss } from '../component/enemy/boss/Boss'
// import I18nSingleton from '../i18n/I18nSingleton'
import Tutorial, { Step } from './tutorial/Tutorial'
import EventEmitter = Phaser.Events.EventEmitter
import { BossCutScene, ShootingPhase } from 'component/enemy/boss/Boss'
import SoundManager from 'component/sound/SoundManager'
import { B1ObstacleFactory } from 'component/enemy/obstacle/B1ObstacleFactory'
import { B1Obstacle } from 'component/enemy/obstacle/B1Obstacle'
import { BackgroundByBoss, BossByName } from './boss/bossInterface'

export default class GameScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite
  private player!: Player
  private gaugeRegistry!: InhaleGaugeRegistry
  private score!: Score
  private scoreNumber = 0
  private reloadCountNumber = RELOAD_COUNT
  private bossName!: keyof typeof BossByName

  private reloadCount!: ReloadCount
  //	private reloadCount = RELOAD_COUNT
  //	private reloadCountText!: Phaser.GameObjects.Text

  private mergedInput?: MergedInput
  private controller1!: PlayerInput | undefined | any
  //    private timerText!: Phaser.GameObjects.Text;

  private singleLaserFactory!: SingleLaserFactory
  private obstacleFactory!: B1ObstacleFactory
  private tutorial!: Tutorial
  private tutorialObstacle!: B1Obstacle
  private isCompleteWarmup = false
  private isCompleteBoss = false
  private menu!: Menu

  private event!: EventEmitter
  private gameLayer!: Phaser.GameObjects.Layer

  private bgm!: Phaser.Sound.BaseSound
  private soundManager: SoundManager

  constructor() {
    super({ key: 'game' })
    this.soundManager = new SoundManager(this)
  }

  preload() {
    this.load.image('b1_game_map', 'assets/background/background.jpg')

    this.load.atlas(
      'player',
      'assets/character/player/mc1_spritesheet.png',
      'assets/character/player/mc1_spritesheet.json',
    );

    this.load.atlas('ui', 'assets/ui/asset_warmup.png', 'assets/ui/asset_warmup.json');
    this.load.atlas('bossAsset', 'assets/sprites/boss/asset_boss.png', 'assets/sprites/boss/asset_boss.json');

    this.load.image('fire', 'assets/effect/fire03.png')
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

    this.load.audio('shootSound', 'sound/shooting-sound-fx-159024.mp3')
    this.load.audio('meteorDestroyedSound', 'sound/rock-destroy-6409.mp3')
    this.load.audio('lapChangedSound', 'sound/soundeffect_count_round.mp3')
    this.load.audio('chargingSound', 'sound/futuristic-beam-81215.mp3')
    this.load.audio('chargedSound', 'sound/sci-fi-charge-up-37395.mp3')

    this.load.audio('mcHit1', 'sound/mc1-hit1.mp3')
    this.load.audio('mcHit2', 'sound/mc1-hit2.mp3')
    this.load.audio('mcHit3', 'sound/mc1-hit3.mp3')

    this.load.scenePlugin('mergedInput', MergedInput)
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  init({ bossName, score, reloadCount, isCompleteBoss }: { bossName: keyof typeof BossByName, score: number, reloadCount: number, isCompleteBoss: boolean }) {
    if(score)
      this.scoreNumber = score
    if(reloadCount)
      this.reloadCountNumber = reloadCount
    if(isCompleteBoss !== undefined)
      this.isCompleteBoss = isCompleteBoss
    this.bossName = bossName ?? "B1"
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


    this.background = this.add
      .tileSprite(0, 0, width, height, BackgroundByBoss[this.bossName].GameBackground)
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

    this.obstacleFactory = new BossByName[this.bossName].ObstacleFactory()
    this.singleLaserFactory = new SingleLaserFactory()
    this.tutorial = new Tutorial(this)

    this.menu = new Menu(this)

    if (!this.isCompleteTutorial()) {
      this.tutorialObstacle = this.obstacleFactory.create(
        this,
        this.player,
        this.score,
        true,
      )
      this.gameLayer.add(this.tutorialObstacle.getBody())
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
        obstacle: this.tutorialObstacle,
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
      })
    }

    if (!this.isCompleteWarmup && this.isCompleteTutorial()) {
      this.scene.pause()
      this.isCompleteWarmup = true
      this.scene.launch('warmup', { event: this.event })
    }

    if (this.isCompleteTutorial() && this.isCompleteWarmup) {
      this.obstacleFactory.createByTime(this, this.player, this.score, delta)
    }

    // TODO move to controller class
    if (!this.controller1) return
    // Must be in this order if B3 press with B6, B3 will be activated
    if (!this.player.getIsAttacking() && this.controller1?.buttons.B16 > 0) {
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
      [...this.obstacleFactory.getObstacles()],
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

    if (this.player.getIsReload() && !(this.controller1?.buttons.B16 > 0)) {
      this.singleLaserFactory.set(ShootingPhase.NORMAL)
      setTimeout(() => {
        this.reloadCount.decrementCount()
        this.isCompleteBoss = false
      }, LASER_FREQUENCY_MS * BULLET_COUNT)

      if (!this.reloadCount.isBossShown(this.isCompleteBoss)) {
        this.player.reloadSet(ShootingPhase.NORMAL)
        gauge.set(ShootingPhase.NORMAL)
      } else {
        this.player.attack()
      }

      if (this.reloadCount.isDepleted()) {
        setTimeout(() => {
          this.scene.pause()
          this.scene.launch('end game', { score: this.score.getScore() })
        }, LASER_FREQUENCY_MS * BULLET_COUNT)
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
