/* eslint-disable @typescript-eslint/no-empty-function */
import Player from 'component/player/Player'
import { Boss } from '../Boss'
import { BossSkill } from '../BossSkill'
import { B3Bullet } from './B3Bullet'
import Score from 'component/ui/Score'

export class B3BossSkill extends BossSkill {
	private path!: Phaser.Curves.Path
	private score!: Score
	private bossVersionNumber!: number

	constructor(
		scene: Phaser.Scene,
		boss: Boss,
		player: Player,
		score: Score,
		bossVersion: number,
	) {
		super(scene, boss, player)
		this.skill = this.scene.physics.add
			.image(0, 0, 'b3v1', 'b3_skill1.png')
			.setOrigin(0.5, 0.5)
			.setVisible(false)
		this.score = score
		this.bossVersionNumber = bossVersion
	}

	startSkill(): void {}

	stopSkill(): void {
		this.skill.destroy()
	}

	attack(): void {
		new B3Bullet(
			this.scene,
			this.player,
			this.score,
			this.skill.x,
			this.skill.y,
			this.bossVersionNumber,
		)
	}

	applySkill(_laser: Phaser.Types.Physics.Arcade.ImageWithDynamicBody): void {}

	move() {
		const follower = { t: 0, vec: new Phaser.Math.Vector2() }

		this.scene.tweens.add({
			targets: follower,
			t: 1,
			duration: 7000,
			repeat: -1,
			yoyo: true,
			onUpdate: () => {
				this.path.getPoint(follower.t, follower.vec)
				this.skill.setPosition(follower.vec.x, follower.vec.y)
			},
		})
	}

	setMovePath(path: Phaser.Curves.Path): void {
		this.path = path
	}

	setActive(_isActive: boolean): void {}

	getIsActive(): boolean {
		return false
	}

	getBody() {}

	getPath() {
		return this.path
	}
}
