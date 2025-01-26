import { Boss, BossCutScene } from 'component/enemy/boss/Boss'
// import SoundManager from 'component/sound/SoundManager'
import { RELOAD_COUNT } from 'config'

export default class BossEscape2 extends Phaser.Scene {
	private score = 0
	private reloadCount = RELOAD_COUNT
	private boss!: Boss

	constructor() {
		super({ key: BossCutScene.ESCAPE2 })
	}

	init({
		score,
		reloadCount,
		boss,
	}: {
		score: number
		reloadCount: number
		boss: Boss
	}) {
		this.score = score
		this.reloadCount = reloadCount
		this.boss = boss
	}

	preload() {
		this.load.script(
			'webfont',
			'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
		)
		this.load.image('smoke', 'assets/background/smoke-transition_01.png')
		// this.load.audio('bossEscape', 'sound/boss-escape.mp3')
		// this.load.audio('bossEscapeVoice', 'sound/boss-escape-voice.mp3')
	}

	create() {
		const { height } = this.scale

		// const soundManager = new SoundManager(this)
		// const bossEscape = this.sound.add('bossEscape')
		// const bossEscapeVoice = this.sound.add('bossEscapeVoice')
		// soundManager.play(bossEscape, false)
		const tutorialSound = this.sound.addAudioSprite('tutorialWarmupSound')
		tutorialSound.play('boss-escape')

		this.boss.getVersion().playEscapePhase2(this)
		const smoke = this.add.image(0, height / 2, 'smoke').setOrigin(1, 0.5)

		setTimeout(() => {
			this.tweens.add({
				targets: smoke,
				x: smoke.width - 200,
				duration: 3500,
				repeat: 0,
				ease: 'sine.out',
				onComplete: () => {
					this.scene.stop('bossScene')
					const updatedCount = this.reloadCount - 1
					if (updatedCount === 0) {
						this.scene.launch('end game', { score: this.score, isTimeout: false })
						this.scene.stop()
						return
					}

					this.scene.launch('game', {
						score: this.score,
						reloadCount: updatedCount,
						isCompleteBoss: true,
						bossName: this.boss.getName(),
					})
					this.tweens.add({
						targets: smoke,
						x: 2 * smoke.width,
						duration: 3500,
						repeat: 0,
						ease: 'sine.out',
						onComplete: () => {
							this.scene.stop()
						},
					})
				},
			})
		}, 1000)
	}
}
