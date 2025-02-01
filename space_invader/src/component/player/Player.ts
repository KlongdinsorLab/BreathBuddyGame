// import SoundManager from 'component/sound/SoundManager'
import {
	COLLECT_BULLET_COUNT,
	FULLCHARGE_ANIMATION_MS,
	FULLCHARGE_SCALE,
	//LASER_FREQUENCY_MS,
	MARGIN,
	PLAYER_SPEED,
	PLAYER_START_MARGIN,
	BULLET_COUNT,
	BOSS_PHASE1_BULLET_COUNT,
	BOSSV1_PHASE2_BULLET_COUNT,
	BOSSV2_PHASE2_BULLET_COUNT,
} from 'config'
// import I18nSingleton from 'i18n/I18nSingleton'
import Shield from 'component/equipment/defense/shield'
// import WebFont from 'webfontloader'

export enum ShootingPhase {
	NORMAL = BULLET_COUNT,
	BOSS_PHASE_1 = BOSS_PHASE1_BULLET_COUNT,
	BOSSV1_PHASE_2 = BOSSV1_PHASE2_BULLET_COUNT,
	BOSSV2_PHASE_2 = BOSSV2_PHASE2_BULLET_COUNT,
}

export default class Player {
	private scene: Phaser.Scene
	private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
	private playerHitTweens!: any
	private isHit = false
	private isReload = false
	private isReloading = false
	private isAttacking = false
	private bullet: number = 0
	private isBulletFull: boolean = false
	private chargeEmitter!: Phaser.GameObjects.Particles.ParticleEmitter
	private isUsedShield = false
	// private soundManager: SoundManager
	// private playerHitSounds!: (Phaser.Sound.NoAudioSound
	// 	| Phaser.Sound.WebAudioSound
	// 	| Phaser.Sound.HTML5AudioSound)[]
	private playerSound!:
		| Phaser.Sound.NoAudioSound
		| Phaser.Sound.WebAudioSound
		| Phaser.Sound.HTML5AudioSound

	private shield!: Shield
	constructor(scene: Phaser.Scene, gameLayer: Phaser.GameObjects.Layer) {
		this.scene = scene
		// this.soundManager = new SoundManager(scene)
		this.playerSound = scene.sound.addAudioSprite('mcSound')
		const { width, height } = this.scene.scale
		//		this.player = this.scene.physics.add.image(
		//			width / 2,
		//			height - PLAYER_START_MARGIN,
		//			'player',
		//		)

		this.player = this.scene.physics.add.sprite(
			width / 2,
			height - PLAYER_START_MARGIN,
			'player',
		)

		gameLayer.add(this.player)

		this.shield = new Shield(scene, this.player)

		// this.playerHitSounds = [...Array(3)].map((_, i) =>
		// 	this.scene.sound.add(`mcHit${i+1}`),
		// )

		//		this.scene.anims.create({
		//			key: 'run',
		//			frames: this.scene.anims.generateFrameNames('player', {
		//				prefix: '01.2A_MC(N)_', suffix: '.png', start: 0, end: 48, zeroPad: 5
		//			}),
		//			frameRate: 24,
		//			repeat: -1
		//		});
		//
		//		this.scene.anims.create({
		//			key: 'charge',
		//			frames: this.scene.anims.generateFrameNames('player', {
		//				prefix: '01.2B_MC(I)_', suffix: '.png', start: 0, end: 48, zeroPad: 5
		//			}),
		//			frameRate: 48,
		//			repeat: -1
		//		});
		//
		//		this.scene.anims.create({
		//			key: 'attack',
		//			frames: this.scene.anims.generateFrameNames('player', {
		//				prefix: '01.2C_MC(A)_', suffix: '.png', start: 0, end: 23, zeroPad: 5
		//			}),
		//			frameRate: 24,
		//			repeat: -1
		//		});
		this.scene.anims.create({
			key: 'run',
			frames: this.scene.anims.generateFrameNames('player', {
				prefix: 'mc_normal_',
				suffix: '.png',
				start: 1,
				end: 12,
				zeroPad: 5,
			}),
			frameRate: 18,
			repeat: -1,
		})

		this.scene.anims.create({
			key: 'charge',
			frames: this.scene.anims.generateFrameNames('player', {
				prefix: 'mc_inhale_',
				suffix: '.png',
				start: 1,
				end: 12,
				zeroPad: 5,
			}),
			frameRate: 18,
			repeat: -1,
		})

		this.scene.anims.create({
			key: 'attack',
			frames: this.scene.anims.generateFrameNames('player', {
				prefix: 'mc_attack_',
				suffix: '.png',
				start: 1,
				end: 12,
				zeroPad: 5,
			}),
			frameRate: 18,
			repeat: -1,
		})

		this.scene.anims.create({
			key: 'hurt',
			frames: this.scene.anims.generateFrameNames('player', {
				prefix: 'mc_hurt_',
				suffix: '.png',
				start: 1,
				end: 1,
				zeroPad: 5,
			}),
			frameRate: 1,
		})

		this.player.play('run')

		this.playerHitTweens = this.scene.tweens.add({
			targets: this.player,
			scale: FULLCHARGE_SCALE,
			duration: FULLCHARGE_ANIMATION_MS,
			ease: 'sine.inout',
			yoyo: true,
			repeat: -1,
		})
		this.playerHitTweens.pause()
		this.player.setCollideWorldBounds(true)
	}

	addJetEngine() {
		const jetEngine = this.scene.add.particles(0, 0, 'fire', {
			gravityY: 200,
			speed: 100,
			scale: { start: 1, end: 0 },
			blendMode: Phaser.BlendModes.ADD,
		})
		jetEngine.startFollow(this.player, 0, MARGIN)
	}

	addChargeParticle() {
		this.chargeEmitter = this.scene.add.particles(0, 0, 'charge', {
			speed: 64,
			scale: 0.1,
			blendMode: Phaser.BlendModes.ADD,
		})
		this.chargeEmitter.startFollow(this.player)
		this.chargeEmitter.active = false
	}

	moveLeft(delta: number): void {
		this.player.x = this.player.x - (PLAYER_SPEED * delta) / 1000
		this.shield.updatePosition(this.player)
	}

	moveRight(delta: number): void {
		this.player.x = this.player.x + (PLAYER_SPEED * delta) / 1000
		this.shield.updatePosition(this.player)
	}

	updatePosition(x: number): void {
		this.player.x = x
		this.shield.updatePosition(this.player)
	}

	getLaserLocation(): { x: number; y: number } {
		return { x: this.player.x, y: this.player.y - 20 }
	}

	charge(): void {
		this.player.play('charge', true)
		this.isReloading = true
		this.chargeEmitter.active = true
		this.chargeEmitter.start()
	}

	damaged(): void {
		this.playerSound.play(`mc1-hit${Math.floor(Math.random() * 3) + 1}`)
		this.player.play('hurt', true)
		this.playerHitTweens.resume()
		this.player.alpha = 0.8
	}

	recovered(): void {
		const animation = this.isAttacking ? 'attack' : 'run'
		this.player.play(animation)
		this.player.alpha = 1
		this.playerHitTweens.restart()
		this.playerHitTweens.pause()
	}

	getRandomHitSound(
		index: number,
	):
		| Phaser.Sound.NoAudioSound
		| Phaser.Sound.WebAudioSound
		| Phaser.Sound.HTML5AudioSound {
		const randomIndex = Math.floor(Math.random() * index)
		const hitSounds = [...Array(index)].map((_, i) =>
			this.scene.sound.add(`mcHit${i + 1}`),
		)
		return hitSounds[randomIndex]
	}

	isLeftOf(x: number): boolean {
		return this.player.x > x
	}

	isRightOf(x: number): boolean {
		return this.player.x < x
	}

	getBody(): Phaser.Types.Physics.Arcade.ImageWithDynamicBody {
		return this.player
	}

	getIsHit(): boolean {
		return this.isHit
	}

	setIsHit(isHit: boolean): void {
		this.isHit = isHit
	}

	startReload(): void {
		this.isReload = true
		this.isReloading = false
		if (this.chargeEmitter) this.chargeEmitter.active = true
	}

	reloadSet(bulletCount: number, laserFrequency: number): void {
		this.player.play('attack', true)
		this.isAttacking = true
		this.isReload = false
		this.chargeEmitter.stop()
		setTimeout(() => {
			this.isAttacking = false
			this.player.play('run', true)
		}, laserFrequency * bulletCount)
	}

	attack(): void {
		this.player.play('attack', true)
	}

	reloadResetting(): void {
		this.player.play('run', true)
		this.isAttacking = false
		this.isReloading = false
		this.chargeEmitter.stop()
	}

	getIsReload(): boolean {
		return this.isReload
	}

	getIsReloading(): boolean {
		return this.isReloading
	}

	getIsAttacking(): boolean {
		return this.isAttacking
	}

	activateShield(remainingTime?: number): void {
		if (!this.isUsedShield) {
			this.shield.activate()

			if (remainingTime) {
				this.shield.countDownShield()
			}

			this.isUsedShield = true
			return
		}

		if (remainingTime) {
			this.shield.countDownShield()
		} else {
			this.shield.depleteShield()
		}
	}

	getShield(): Shield {
		return this.shield
	}

	deactivateShield(): void {
		this.shield.deactivate()
	}
	getIsUsedShield(): boolean {
		return this.isUsedShield
	}

	hide(): void {
		this.player.setVisible(false)
	}

	show(): void {
		this.player.setVisible(true)
	}

	addBullet(): void {
		if (this.isBulletFull) return

		this.bullet++
		if (this.bullet >= COLLECT_BULLET_COUNT) {
			this.isBulletFull = true
		}
	}

	reduceBullet(): void {
		if (this.isBulletFull) return

		if (this.bullet <= 0) return

		this.bullet--
	}

	resetBullet(): void {
		this.bullet = 0
		this.isBulletFull = false
	}

	getIsBulletFull(): boolean {
		return this.isBulletFull
	}

	getBulletCount(): number {
		return this.bullet
	}

	playVsScene(scene: Phaser.Scene): void {
		setTimeout(() => {
			this.playerSound.play('mc1-vs')
		}, 2000)

		const playerImage = scene.add
			.image(850, 1200, 'player', 'mc_attack_00001.png')
			.setOrigin(0.5, 1)
			.setScale(2.5)
		// const playerName = I18nSingleton.getInstance()
		// 	.createTranslatedText(scene, 800, 950, 'player_name')
		// 	.setOrigin(0.5, 1)

		// playerName
		// 	.setStyle({
		// 		fontFamily: 'Mali',
		// 		color: 'white',
		// 		fontWeight: 800,
		// 	})
		// 	.setFontSize('7em')
		// 	.setStroke('#FB511C', 18)

		scene.tweens.add({
			targets: playerImage,
			x: 500,
			duration: 1000,
			repeat: 0,
			ease: 'bounce.out',
		})
		// scene.tweens.add({
		// 	targets: playerName,
		// 	x: 220,
		// 	duration: 1000,
		// 	repeat: 0,
		// 	ease: 'bounce.out',
		// })
	}

	playRandomBossScene(scene: Phaser.Scene): void {
		const { width, height } = scene.scale

		const bossId = this.scene.registry.get('boss_id')

		const bg = scene.add
			.tileSprite(width / 2, 0, width, height, `background_b${bossId}_normal`)
			.setOrigin(0.5, 0.5)
			.setScrollFactor(0, 0)
			.setScale(1.15)

		const playerImage = scene.add
			.image(-100, 100, 'player', 'mc_attack_00001.png')
			.setOrigin(0.5, 0)
			.setScale(2.5)

		const polygon = scene.add
			.polygon(-400, 0, [48, 80, 668, 80, 668, 437, 48, 576], 0xffffff, 0)
			.setStrokeStyle(5, 0x000000, 1)
			.setOrigin(0, 0)

		const mask = polygon.createGeometryMask()

		bg.setMask(mask)
		playerImage.setMask(mask)

		scene.tweens.add({
			targets: polygon,
			x: 0,
			duration: 500,
			repeat: 0,
			ease: 'sine.out',
		})

		scene.tweens.add({
			targets: playerImage,
			x: width / 2,
			duration: 500,
			repeat: 0,
			ease: 'sine.out',
		})
	}
}
