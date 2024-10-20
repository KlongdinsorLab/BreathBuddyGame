import Player from 'component/player/Player'
import Score from 'component/ui/Score'

import {
	BOSS2_SKILL_SCORE_REDUCTION,
	BOSS3_PHASE1_SKILL_ANGLE,
	BOSS3_PHASE2_SKILL_ANGLE,
	BOSS3_SKILL_GAP,
	BOSS3_SKILL_SPEED,
	MARGIN,
	PLAYER_HIT_DELAY_MS,
	TRIPLE_LASER_X_SPEED,
} from 'config'

export class B3Bullet {
	protected enemies!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] | any[]
	protected scene: Phaser.Scene
	protected player: Player
	protected score: Score
	protected isSecondPhase = false

	constructor(
		scene: Phaser.Scene,
		player: Player,
		score: Score,
		x: number,
		y: number,
		bossVersion: number,
	) {
		this.scene = scene
		this.player = player
		this.score = score
		this.isSecondPhase = bossVersion === 2
		this.create(x, y)

		this.move()
	}

	create(x: number, y: number) {
		const leftLaserX = this.isSecondPhase ? x - BOSS3_SKILL_GAP : x
		const rightLaserX = this.isSecondPhase ? x + BOSS3_SKILL_GAP : x
		const laserAngle = this.isSecondPhase
			? BOSS3_PHASE2_SKILL_ANGLE
			: BOSS3_PHASE1_SKILL_ANGLE

		const laserMiddle1 = this.scene.physics.add
			.image(x, y, 'b3v1', 'b3_skill1.png')
			.setOrigin(0.5, 0.5)
		const laserMiddle2 = this.scene.physics.add
			.image(x, y + 3 * MARGIN, 'b3v1', 'b3_skill1.png')
			.setOrigin(0.5, 0.5)

		const laserRight1 = this.scene.physics.add
			.image(rightLaserX, y, 'b3v1', 'b3_skill1.png')
			.setOrigin(0.5, 0.5)
			.setAngle(-laserAngle)
			.setName('right')
		const laserRight2 = this.scene.physics.add
			.image(rightLaserX, y + 3 * MARGIN, 'b3v1', 'b3_skill1.png')
			.setOrigin(0.5, 0.5)
			.setAngle(-laserAngle)
			.setName('right')

		const laserLeft1 = this.scene.physics.add
			.image(leftLaserX, y, 'b3v1', 'b3_skill1.png')
			.setOrigin(0.5, 0.5)
			.setAngle(laserAngle)
			.setName('left')
		const laserLeft2 = this.scene.physics.add
			.image(leftLaserX, y + 3 * MARGIN, 'b3v1', 'b3_skill1.png')
			.setOrigin(0.5, 0.5)
			.setAngle(laserAngle)
			.setName('left')

		this.enemies = [
			laserMiddle1,
			laserRight1,
			laserLeft1,
			laserMiddle2,
			laserRight2,
			laserLeft2,
		]
		this.enemies.forEach((enemy) => (enemy.depth = 1))

		this.scene.physics.add.overlap(this.player.getBody(), this.enemies, () => {
			if (this.player.getIsHit()) return
			this.player.setIsHit(true)
			this.player.damaged()
			this.score.add(BOSS2_SKILL_SCORE_REDUCTION)
			this.scene.time.delayedCall(PLAYER_HIT_DELAY_MS, () => {
				this.player.setIsHit(false)
				this.player.recovered()
			})
		})
		this.scene.time.delayedCall(5000, () => {
			this.enemies.forEach((enemy) => enemy.destroy())
		})
	}

	move(): void {
		this.enemies.forEach((enemy) => {
			enemy.setVelocityY(BOSS3_SKILL_SPEED)
			if (enemy.name === 'right') {
				enemy.setVelocityX(TRIPLE_LASER_X_SPEED)
			} else if (enemy.name === 'left') {
				enemy.setVelocityX(-TRIPLE_LASER_X_SPEED)
			}
		})
	}

	getBody(): Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] {
		return this.enemies
	}

	isActive(): boolean {
		return this.enemies.every((enemy) => enemy.active)
	}
}
