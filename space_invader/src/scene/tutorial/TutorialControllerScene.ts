import Phaser from 'phaser'
import { LARGE_FONT_SIZE, MARGIN, PLAYER_START_MARGIN } from 'config'
import I18nSingleton from 'i18n/I18nSingleton'
import SoundManager from 'component/sound/SoundManager'
import WebFont from 'webfontloader'
import Player from 'component/player/Player'
import EventEmitter = Phaser.Events.EventEmitter
import { BossByName } from 'scene/boss/bossInterface'

export type Controller = {
	player: Player
	event: EventEmitter
}

export default class TutorialControllerScene extends Phaser.Scene {
	private player!: Player
	private event!: EventEmitter

	constructor() {
		super('tutorial controller')
	}

	init({ player, event }: Controller) {
		this.player = player
		this.event = event
	}

	preload() {
		this.load.atlas(
			'player',
			'assets/character/player/mc1_spritesheet.png',
			'assets/character/player/mc1_spritesheet.json',
		)
		this.load.svg('finger press', 'assets/icon/finger-press.svg')
	}

	create() {
		this.event = new EventEmitter()
		const soundManager = new SoundManager(this)
		const isMute = soundManager.isMute()
		const tutorialSound = this.sound.addAudioSprite('tutorialWarmupSound')
		tutorialSound.play('tutorial-direction')

		const { width, height } = this.scale
		this.add.rectangle(0, 0, width, height, 0, 0.5).setOrigin(0, 0)

		const graphics = this.add.graphics({ fillStyle: { color: 0xffffff } })

		const i18n = I18nSingleton.getInstance()
		const controlInstruction = i18n
			.createTranslatedText(this, width / 2, 3 * MARGIN, 'tutorial_controller')
			.setFontSize(LARGE_FONT_SIZE)
			.setAlign('center')
			.setOrigin(0.5, 0)

		const line = new Phaser.Geom.Line(
			width / 2,
			controlInstruction.y + controlInstruction.height + MARGIN,
			width / 2,
			height - PLAYER_START_MARGIN - 2 * MARGIN,
		)

		const points = line.getPoints(12)

		for (let i = 0; i < points.length; i++) {
			const p = points[i]
			graphics.fillRect(p.x - 2, p.y - 2, 8, 32)
			graphics.setAlpha(0.5)
		}

		this.player.hide()

		const tutorialPlayer = this.physics.add.sprite(
			width / 2,
			height - PLAYER_START_MARGIN,
			'player',
		)

		this.anims.create({
			key: 'run',
			frames: this.anims.generateFrameNames('player', {
				prefix: 'mc1_normal_',
				suffix: '.png',
				start: 0,
				end: 12,
				zeroPad: 5,
			}),
			frameRate: 18,
			repeat: -1,
		})

		tutorialPlayer.play('run')

		const finger = this.add
			.image(width / 2 + width / 4, height / 2, 'finger press')
			.setOrigin(0.5, 0.5)
		finger.setRotation(-Math.PI / 8)

		const fingerAnimation = this.tweens.add({
			targets: [finger, tutorialPlayer],
			scale: 0.9,
			duration: 500,
			ease: 'sine.inout',
			yoyo: true,
			loop: -1,
			onLoop: () => {
				fingerAnimation.pause()
				const moveToX =
					finger.x === width / 4 ? width / 2 + width / 4 : width / 4
				this.tweens.add({
					targets: [finger, tutorialPlayer],
					x: moveToX,
					duration: 1000,
					loopDelay: 500,
					ease: 'sine.inout',
					onComplete: () => {
						fingerAnimation.resume()
					},
				})
			},
		})

		WebFont.load({
			google: {
				families: ['Mali'],
			},
			active: function () {
				const tutorialUiStyle = {
					fontFamily: 'Mali',
				}
				controlInstruction.setStyle(tutorialUiStyle)
			},
		})

		const bossName =
			`B${this.registry.get('boss_id')}` as keyof typeof BossByName

		this.input.once(
			'pointerdown',
			() => {
				this.player.show()
				isMute ? soundManager.mute() : soundManager.unmute()
				i18n.removeAllListeners(this)
				this.scene.start('game', {
					event: this.event,
					bossName: bossName,
				})
				this.scene.stop()
				this.scene.stop('tutorial character')
				this.scene.stop('tutorial HUD')
				localStorage.setItem('tutorial', 'true')
			},
			this,
		)
	}
}
