import { Boss, BossCutScene } from 'component/enemy/boss/Boss'
import { BossByName, BossInterface } from '../bossInterface'
// import SoundManager from 'component/sound/SoundManager'
import { BossVersion } from 'component/enemy/boss/BossVersion'
import WebFont from 'webfontloader'
import Score from 'component/ui/Score'
import { PlayerByName } from 'component/player/playerInterface'

export default class BossCutSceneVS extends Phaser.Scene {
	private props!: BossInterface
	private bossVersion!: BossVersion
	private boss!: Boss
	private bossId!: number
	private selectedCharacterId!: string

	constructor() {
		super({ key: BossCutScene.VS })
	}

	preload() {
		this.load.image(
			`background_b${this.bossId}_vs`,
			`assets/background/b${this.bossId}_vs_bg.png`,
		)

		this.load.atlas(
			'player',
			`assets/character/player/mc${this.selectedCharacterId}_spritesheet.png`,
			`assets/character/player/mc${this.selectedCharacterId}_spritesheet.json`,
		)

		this.load.atlas(
			`b${this.bossId}v1`,
			`assets/character/enemy/b${this.bossId}v1_spritesheet.png`,
			`assets/character/enemy/b${this.bossId}v1_spritesheet.json`,
		)

		this.load.atlas(
			`b${this.bossId}v2`,
			`assets/character/enemy/b${this.bossId}v2_spritesheet.png`,
			`assets/character/enemy/b${this.bossId}v2_spritesheet.json`,
		)

		// this.load.audio('bossVs', 'sound/boss-vs.mp3')
		// this.load.audio('bossB1', 'sound/boss-b1.mp3')
		// this.load.audio('bossHit1', 'sound/boss-hit1.mp3')
		// this.load.audio('bossHit2', 'sound/boss-hit2.mp3')
		// this.load.audio('bossHit3', 'sound/boss-hit3.mp3')
		// this.load.audio('bossHit4', 'sound/boss-hit4.mp3')
		// this.load.audio('mcHit1', 'sound/mc1-hit1.mp3')
		// this.load.audio('mcHit2', 'sound/mc1-hit2.mp3')
		// this.load.audio('mcHit3', 'sound/mc1-hit3.mp3')
		// this.load.audio('mc1Vs', 'sound/mc1-vs.mp3')
	}

	init(props: BossInterface) {
		this.props = props
		this.bossId = +props.name.substring(props.name.length - 1)
		this.selectedCharacterId = this.registry.get('selectedCharacterId')
	}

	create() {
		const { name, score, playerX, reloadCount } = this.props
		// const tutorialSound = this.sound.addAudioSprite('tutorialWarmupSound')
		// const bossSound = this.sound.addAudioSprite('bossSound')
		// tutorialSound.play('boss-vs')

		// setTimeout(() => bossSound.play('b1-vs'), 500)

		// const soundManager = new SoundManager(this)
		// const bossVs = this.sound.add('bossVs')
		// soundManager.play(bossVs, false)

		// TODO: recieve player from gameScene
		const sceneLayer = this.add.layer()
		const player = new PlayerByName['mc1'](this, sceneLayer)
		player.hide()

		const scoreObj = new Score(this)
		scoreObj.hide()

		this.boss = new BossByName[name ?? 'B1'](
			this,
			player,
			scoreObj,
			reloadCount,
		)
		this.bossVersion = this.boss.getVersion()

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this
		WebFont.load({
			google: {
				families: ['Mali'],
			},
			active: function () {
				self.bossVersion.playVsScene(self, player)
			},
		})

		setTimeout(() => {
			this.scene.stop()
			this.scene.start('bossScene', {
				name: name,
				score: score,
				playerX: playerX,
				reloadCount: reloadCount,
				isRestartedGame: this.scene.scene.registry.get('isRestartedGame'),
			})
		}, 3000)
	}
}
