/* eslint-disable @typescript-eslint/no-this-alias */
import { Equipment } from '../equipment'
import { BoosterEffect } from 'component/booster/booster'
export default class Shield extends Equipment {
	private scene: Phaser.Scene
	private shield!: Phaser.GameObjects.Image
	private timeEvent!: Phaser.Time.TimerEvent
	private boosterEffect!: BoosterEffect
	private shieldCountDown!: Phaser.GameObjects.Text
	private isActivated = false

	constructor(
		scene: Phaser.Scene,
		player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
	) {
		super('shield')
		this.scene = scene

		this.shield = this.scene.add.image(
			player.x,
			player.y,
			'dropItem',
			'mc_shield.png',
		)
		this.shield.setOrigin(0.5, 0.5)
		this.shield.setVisible(false)
		this.shieldCountDown = this.scene.add
			.text(this.shield.x + 75, this.shield.y - 55, '')
			.setOrigin(0.5, 0.5)
			.setVisible(false)
		this.boosterEffect = scene.registry.get('boosterEffect')
	}
	countDownShield(): void {
		this.activate()
		this.timeEvent = this.scene.time.addEvent({
			delay: 1000,
			callback: () => {
				this.boosterEffect.remainingTime--
				this.shieldCountDown.setText(
					this.boosterEffect.remainingTime.toString(),
				)
				if (this.boosterEffect.remainingTime === 0) {
					this.timeEvent.remove()
					this.deactivate()
				}
			},
			loop: true,
		})
	}

	depleteShield(): void {
		this.shieldCountDown.setText(
			(this.boosterEffect.remainingUses).toString(),
		)

		if(this.boosterEffect.remainingUses === 0) {
			this.deactivate()
		}
	}

	activate(): void {
		this.isActivated = true
		this.shield.setVisible(true)

		this.shieldCountDown.setText(
			(
				this.boosterEffect.remainingTime || this.boosterEffect.remainingUses
			).toString(),
		)
		this.shieldCountDown.setVisible(true)
	}

	deactivate(): void {
		this.isActivated = false
		if (this.timeEvent) {
			this.timeEvent.remove()
		}
		this.shield.setVisible(false)
		this.shieldCountDown.setVisible(false)
	}

	updatePosition(
		player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
	): void {
		this.shield.setPosition(player.x, player.y)
		this.scene.tweens.add({
			targets: this.shieldCountDown,
			x: player.x + 75,
			y: player.y - 55,
			duration: 0,
			repeat: 0,
		})
	}

	destroy(): void {
		this.shield.destroy()
	}

	getIsActivated(): boolean {
		return this.isActivated
	}

	getBody(): Phaser.GameObjects.Image {
		return this.shield
	}

	initFontStyle(): void {
		this.shieldCountDown
			.setStyle({
				fontFamily: 'Jua',
				color: 'white',
			})
			.setFontSize('48px')
			.setStroke('#327F76', 12)
	}
}
