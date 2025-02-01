import { MARGIN } from 'config'
import I18nSingleton from 'i18n/I18nSingleton'
import { Button } from './Button'

export default class InstructionButton extends Button {
	constructor(scene: Phaser.Scene) {
		super(scene)
		const { width, height } = scene.scale

		this.button = scene.add
			.nineslice(
				width - MARGIN - 160,
				height - 3 * MARGIN,
				'landing_page',
				'button_red.png',
				160,
				106,
				32,
				32,
				64,
				64,
			)
			.setOrigin(0, 0)

		this.scene.add
			.image(
				width - MARGIN - 160 + 20,
				height - 3 * MARGIN + 24,
				'landing_page',
				'logo_button_instruction.png',
			)
			.setOrigin(0, 0)
		this.buttonText = I18nSingleton.getInstance()
			.createTranslatedText(
				scene,
				width - 160 + MARGIN + 8,
				height - 2 * MARGIN - 5,
				'home_instruction',
			)
			.setAlign('center')
			.setOrigin(0.5, 0.5)
			.setPadding(0, 20, 0, 10)

		this.button.setInteractive()
		this.button.on('pointerup', () => {
			scene.scene.stop()
			scene.scene.start('instruction', { key: this.scene.scene.key })
		})
	}

	initFontStyle(): void {
		this.buttonText
			.setStyle({
				fontFamily: 'Mali',
				fontStyle: 'bold',
				color: 'white',
			})
			.setFontSize('30px')
			.setStroke('#9E461B', 3)
	}

	activate() {
		this.button.setInteractive()
		this.button.setAlpha(1)
		this.buttonLogo.setAlpha(1)
		this.buttonText.setAlpha(1)
		this.isActive = true
	}

	disable() {
		this.button.removeInteractive()
		this.button.setAlpha(0.5)
		this.buttonLogo.setAlpha(0.5)
		this.buttonText.setAlpha(0.5)
		this.isActive = false
	}

	getIsActive(): boolean {
		return this.isActive
	}

	getBody(): Phaser.GameObjects.NineSlice | Phaser.GameObjects.Image {
		return this.button
	}

	hide(): void {
		this.button.setVisible(false)
		this.buttonLogo.setVisible(false)
		this.buttonText.setVisible(false)
		this.isActive = false
	}
}
