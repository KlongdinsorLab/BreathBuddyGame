/* eslint-disable @typescript-eslint/no-this-alias */
import Player from 'component/player/Player'
import InhaleGaugeRegistry from 'component/ui/InhaleGaugeRegistry'
import Score from 'component/ui/Score'
import {
	BULLET_COUNT,
	BUTTON_MAP,
	DARK_BROWN,
	GAME_TIME_LIMIT_MS,
	HOLD_DURATION_MS,
	LASER_FREQUENCY_MS,
	MARGIN,
	RELOAD_COUNT,
} from 'config'
import Phaser from 'phaser'
import MergedInput, { Player as PlayerInput } from 'phaser3-merged-input'
import { Meteor } from 'component/enemy/Meteor'
import { MeteorFactory } from 'component/enemy/MeteorFactory'
import Menu from 'component/ui/Menu'
import ReloadCount from 'component/ui/ReloadCount'
import WebFont from 'webfontloader'
import EventEmitter = Phaser.Events.EventEmitter
import { BossCutScene } from 'component/enemy/boss/Boss'
import SoundManager from 'component/sound/SoundManager'
import { BossByName } from './boss/bossInterface'
import { ShootingPhase } from 'component/player/Player'

import { boosters } from './booster/RedeemScene'
import { BoosterUI } from 'component/booster/boosterUI'

import { boosterByName } from 'component/booster/boosterByName'
import { Booster, BoosterEffect } from 'component/booster/booster'
import { LaserFactoryByName } from 'component/equipment/weapon/LaserFactoryByName'
import { LaserFactory } from 'component/equipment/weapon/LaserFactory'
import supabaseAPIService from 'services/API/backend/supabaseAPIService'

export default class GameScene extends Phaser.Scene {
	private background!: Phaser.GameObjects.TileSprite
	private player!: Player
	private gaugeRegistry!: InhaleGaugeRegistry
	private score!: Score
	private scoreNumber = 0
	private reloadCountNumber = RELOAD_COUNT

	private reloadCount!: ReloadCount
	private mergedInput?: MergedInput
	private controller1!: PlayerInput | undefined | any

	private meteorFactory!: MeteorFactory
	private tutorialMeteor!: Meteor
	private isCompleteWarmup = false
	private isCompleteGaugeWarmup = false
	private isCompleteBoss = false
	private menu!: Menu
	private bossName!: keyof typeof BossByName
	private bossId!: number

	private event!: EventEmitter
	private gameLayer!: Phaser.GameObjects.Layer

	private bgm!: Phaser.Sound.BaseSound
	private soundManager: SoundManager
	private soundEffect!:
		| Phaser.Sound.NoAudioSound
		| Phaser.Sound.WebAudioSound
		| Phaser.Sound.HTML5AudioSound

	private subScenes!: string[]

	private boosterByName!: keyof typeof boosterByName
	private booster!: Booster
	private boosterEffect!: BoosterEffect

	private laserFactory!: LaserFactory

	private apiService!: supabaseAPIService

	constructor() {
		super({ key: 'game' })
		this.soundManager = new SoundManager(this)
	}

	preload() {
		this.load.image(
			'background',
			`assets/background/b${this.bossId}_normal_map.png`,
		)

		this.load.atlas(
			'player',
			'assets/character/player/mc1_spritesheet.png',
			'assets/character/player/mc1_spritesheet.json',
		)

		this.load.atlas(
			'ui',
			'assets/ui/asset_warmup.png',
			'assets/ui/asset_warmup.json',
		)
		this.load.atlas(
			'bossAsset',
			'assets/sprites/boss/asset_boss.png',
			'assets/sprites/boss/asset_boss.json',
		)

		this.load.image('laser', 'assets/effect/mc_bullet.png')
		this.load.image('charge', 'assets/effect/chargeBlue.png')
		this.load.image('explosion', 'assets/effect/explosionYellow.png')
		this.load.image('chevron', 'assets/icon/chevron-down.svg')

		this.load.atlas(
			'inGameUI',
			'assets/ui/ingameui_spritesheet.png',
			'assets/ui/ingameui_spritesheet.json',
		)
		this.load.image('sensor_1', 'assets/ui/sensor_1.png')
		this.load.image('sensor_2', 'assets/ui/sensor_2.png')
		this.load.image('sensor_3', 'assets/ui/sensor_3.png')
		this.load.image('sensor_4', 'assets/ui/sensor_4.png')
		this.load.image('sensor_5', 'assets/ui/sensor_5.png')
		this.load.image('obstacle', 'assets/character/enemy/obstacle.png')

		this.load.image('ring', 'assets/icon/chargebar_C0_normal.png')

		this.load.svg('resume', 'assets/icon/resume.svg')

		// this.load.audio('shootSound', 'sound/shooting-sound-fx-159024.mp3')
		// this.load.audio('meteorDestroyedSound', 'sound/rock-destroy-6409.mp3')
		// this.load.audio('lapChangedSound', 'sound/soundeffect_count_round.mp3')
		this.load.audio('chargingSound', 'sound/futuristic-beam-81215.mp3')
		this.load.audio('chargedSound', 'sound/sci-fi-charge-up-37395.mp3')

		// this.load.audio('mcHit1', 'sound/mc1-hit1.mp3')
		// this.load.audio('mcHit2', 'sound/mc1-hit2.mp3')
		// this.load.audio('mcHit3', 'sound/mc1-hit3.mp3')

		this.load.scenePlugin('mergedInput', MergedInput)
		this.load.script(
			'webfont',
			'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
		)
	}

	init({
		score,
		reloadCount,
		isCompleteBoss,
		bossName,
	}: {
		score: number
		reloadCount: number
		isCompleteBoss: boolean
		bossName: keyof typeof BossByName
	}) {
		this.scoreNumber = score ?? 0
		this.reloadCountNumber = reloadCount ?? RELOAD_COUNT
		this.isCompleteBoss = isCompleteBoss ?? false
		this.bossName = bossName
		this.bossId = +bossName.substring(bossName.length - 1)
		this.soundManager.unmute()
	}

	create() {
		console.log(this.bossName)
		console.log(this.bossId)
		const { width, height } = this.scale
		this.setGameTimeout()

		this.apiService = new supabaseAPIService()

		this.bgm = this.sound.add('bgm', { volume: 1, loop: true })
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
			?.defineKey(0, BUTTON_MAP['left'].controller, BUTTON_MAP['left'].keyboard)
			.defineKey(
				0,
				BUTTON_MAP['right'].controller,
				BUTTON_MAP['right'].keyboard,
			)
			.defineKey(
				0,
				BUTTON_MAP['charge'].controller,
				BUTTON_MAP['charge'].keyboard,
			)
			//            .defineKey(0, 'B1', 'CTRL')
			//            .defineKey(0, 'B2', 'ALT')
			.defineKey(0, BUTTON_MAP[1].controller, BUTTON_MAP[1].keyboard)
			.defineKey(0, BUTTON_MAP[2].controller, BUTTON_MAP[2].keyboard)
			.defineKey(0, BUTTON_MAP[3].controller, BUTTON_MAP[3].keyboard)
			.defineKey(0, BUTTON_MAP[4].controller, BUTTON_MAP[4].keyboard)

		// .defineKey(0, 'B5', 'ONE')
		// .defineKey(0, 'B7', 'TWO')
		// .defineKey(0, 'B4', 'THREE')
		// .defineKey(0, 'B6', 'FOUR')
		//

		this.gameLayer = this.add.layer()
		this.player = new Player(this, this.gameLayer)
		// TODO comment just for testing
		// this.player.addJetEngine()

		this.player.addChargeParticle()

		this.gaugeRegistry = new InhaleGaugeRegistry(this)
		this.gaugeRegistry.createbyDivision(1)

		this.reloadCount = new ReloadCount(this, width / 2, MARGIN)
		this.reloadCount.getBody().setOrigin(0.5, 0)
		this.reloadCount.setCount(this.reloadCountNumber)

		this.score = new Score(this)
		this.score.setScore(this.scoreNumber)
		// this.timerText = this.add.text(width - MARGIN, MARGIN, `time: ${Math.floor(GAME_TIME_LIMIT_MS / 1000)}`, {fontSize: '42px'}).setOrigin(1, 0)

		this.meteorFactory = new MeteorFactory()

		this.subScenes = [
			'warmup',
			'warmupGauge',
			'tutorial HUD',
			'tutorial controller',
			'tutorial character',
		]
		this.menu = new Menu(this, this.subScenes)

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

		//todo: if have more than one booster, refactor this
		//set ui for booster
		boosters.forEach((booster) => {
			const boosterUI = new BoosterUI(this, booster, { x: 594, y: 1142 })
			boosterUI.create()
		})

		this.boosterEffect = {
			remainingUses: 0,
			remainingTime: 0,
			hitMeteorScore: 1,
			laserFrequency: 1,
			bulletCount: 1,
			shootingPhase: 1,
			destroyMeteorScore: 1,
			laserFactory: 'single',
			releasedBullet: 1,
			bulletMultiply: 1,
			score: 1,
		}
		if (this.reloadCountNumber > 5) {
			boosters.forEach((booster) => {
				this.boosterByName = booster
				this.booster = new boosterByName[this.boosterByName]()
				const boosterEffect = this.booster.getBoosterEffect()
				this.boosterEffect = {
					remainingUses:
						this.boosterEffect.remainingUses + boosterEffect.remainingUses,
					remainingTime:
						this.boosterEffect.remainingTime + boosterEffect.remainingTime,
					hitMeteorScore:
						this.boosterEffect.hitMeteorScore - boosterEffect.hitMeteorScore,
					laserFrequency:
						this.boosterEffect.laserFrequency - boosterEffect.laserFrequency,
					bulletCount:
						this.boosterEffect.bulletCount + boosterEffect.bulletCount,
					shootingPhase:
						this.boosterEffect.shootingPhase + boosterEffect.shootingPhase,
					destroyMeteorScore:
						this.boosterEffect.destroyMeteorScore +
						boosterEffect.destroyMeteorScore,
					laserFactory:
						this.boosterEffect.laserFactory === 'triple'
							? this.boosterEffect.laserFactory
							: boosterEffect.laserFactory,
					releasedBullet:
						this.boosterEffect.releasedBullet + boosterEffect.releasedBullet,
					bulletMultiply:
						this.boosterEffect.bulletMultiply + boosterEffect.bulletMultiply,
					score: this.boosterEffect.score + boosterEffect.score,
				}
			})
			this.scene.scene.registry.set('boosterEffect', this.boosterEffect)
		}
		this.laserFactory = new LaserFactoryByName[
			this.boosterEffect?.laserFactory ?? 'single'
		]()

		const self = this
		WebFont.load({
			google: {
				families: ['Jua'],
			},
			active: function () {
				const menuUiStyle = {
					fontFamily: 'Jua',
					color: `#${DARK_BROWN.toString(16)}`,
				}
				self.score.getBody().setStyle(menuUiStyle)
				self.reloadCount.getBody().setStyle(menuUiStyle)
			},
		})

		// this.reloadCount.setCount(6)
	}

	isCompleteTutorial = () => localStorage.getItem('tutorial') || false

	update(_: number, delta: number) {
		const gauge = this.gaugeRegistry?.get(0)
		this.menu.updateGameState(
			this.score.getScore(),
			RELOAD_COUNT - this.reloadCount.getCount(),
		)

		this.event.once('completeWarmup', () => (this.isCompleteWarmup = true))
		this.event.once('completeGaugeWarmUp', () => {
			this.isCompleteGaugeWarmup = true
		})

		if (!this.isCompleteWarmup && this.isCompleteTutorial()) {
			this.scene.pause()
			this.isCompleteWarmup = true

			this.scene.launch('warmup', { event: this.event })
		}

		if (
			this.isCompleteTutorial() &&
			this.isCompleteWarmup &&
			this.isCompleteGaugeWarmup
		) {
			this.meteorFactory.createByTime(
				this,
				this.player,
				this.score,
				this.soundEffect,
				delta,
			)
		}

		// TODO move to controller class
		if (!this.controller1) return
		// Must be in this order if B3 press with B6, B3 will be activated
		if (
			this.isCompleteTutorial() &&
			!this.player.getIsAttacking() &&
			this.controller1?.buttons.B16 > 0
		) {
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
			if (this.player.isRightOf(x)) {
				this.player.moveRight(delta)
			}
			if (this.player.isLeftOf(x)) {
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

		this.laserFactory.createByTime(
			this,
			this.player,
			[...this.meteorFactory.getMeteors()],
			delta,
			{
				laserFrequency: LASER_FREQUENCY_MS * this.boosterEffect.laserFrequency,
			},
		)

		if (this.reloadCount.isDepleted()) {
			gauge.deplete()
			this.scene.launch('end game', { score: this.score.getScore() })
			this.scene.pause()
		}

		if (
			gauge.getDuratation() > HOLD_DURATION_MS &&
			this.controller1?.buttons.B16 > 0
		) {
			this.player.startReload()
			gauge.setFullCharge()
			this.event.emit('fullInhale')

			if (this.reloadCount.isBossShown(this.isCompleteBoss)) {
				this.soundManager.stop(this.bgm)
				this.scene.stop()
				this.scene.launch(BossCutScene.VS, {
					name: this.bossName ?? 'B1',
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
			// Fully Reloaded
			this.laserFactory.set(
				ShootingPhase.NORMAL * this.boosterEffect.shootingPhase,
			)

			this.time.addEvent({
				delay:
					LASER_FREQUENCY_MS *
					this.boosterEffect.laserFrequency *
					ShootingPhase.NORMAL *
					this.boosterEffect.shootingPhase,
				callback: async () => {
					this.reloadCount.decrementCount()
					const data = await this.apiService.updateGameSession({
						score: this.score.getScore(),
						lap: this.scene.scene.registry.get('lap'),
					})
					console.log(data)
					this.isCompleteBoss = false
				},
				loop: false,
			})

			if (!this.reloadCount.isBossShown(this.isCompleteBoss)) {
				this.player.reloadSet(
					ShootingPhase.NORMAL * this.boosterEffect.shootingPhase,
					LASER_FREQUENCY_MS * this.boosterEffect.laserFrequency,
				)
				console.log(this.boosterEffect)
				gauge.set(
					BULLET_COUNT *
						this.boosterEffect.bulletCount *
						this.boosterEffect.bulletMultiply,
					LASER_FREQUENCY_MS * this.boosterEffect.laserFrequency,
					this.boosterEffect.releasedBullet,
				)
			} else {
				this.player.attack()
			}

			if (this.reloadCount.isDepleted()) {
				this.time.addEvent({
					delay:
						LASER_FREQUENCY_MS *
						this.boosterEffect.laserFrequency *
						ShootingPhase.NORMAL *
						this.boosterEffect.shootingPhase,
					callback: () => {
						this.scene.pause()
						this.scene.launch('end game', { score: this.score.getScore() })
					},
					loop: false,
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

		// console.log(gauge.getDuratation())
	}

	setGameTimeout() {
		setTimeout(() => {
			this.scene.launch('end game', { score: this.score.getScore() })
		}, GAME_TIME_LIMIT_MS)
	}
}

// TODO create test
