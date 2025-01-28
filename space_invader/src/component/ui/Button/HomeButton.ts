import I18nSingleton from 'i18n/I18nSingleton'
import { Button } from './Button'
import { MARGIN } from 'config'

export default class HomeButton extends Button {
	constructor(scene: Phaser.Scene) {
		super(scene)
		const { width, height } = scene.scale
		const i18n = I18nSingleton.getInstance()

		this.button = this.scene.add
			.nineslice(
				width / 2,
				1018,
				'end_game_scene',
				'button_gray.png',
				528,
				96,
				24,
				24,
			)
			.setOrigin(0.5, 0)
		this.button.setInteractive()
		this.button.on('pointerup', () => {
			this.resetRegistry()
			scene.scene.stop()
			i18n.destroyEmitter()
			scene.scene.start('home')
		})

		this.buttonText = i18n
			.createTranslatedText(
				scene,
				width / 2 + MARGIN / 2,
				height - 128 - MARGIN - 40,
				'home',
			)
			.setAlign('center')
			.setOrigin(0.5, 0.5)

		this.buttonLogo = scene.add
			.image(
				width / 2 - 2 * MARGIN - 20,
				height - 128 - MARGIN - 44,
				'end_game_scene',
				'logo_button_back to home.png',
			)
			.setOrigin(1, 0.5)
	}

	initFontStyle() {
		this.buttonText
			.setStyle({
				fontFamily: 'Mali',
				fontStyle: 'bold',
				color: 'white',
			})
			.setFontSize('32px')
			.setStroke('#7A7367', 6)
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

	show(): void {
		this.button.setVisible(true)
		this.buttonLogo.setVisible(true)
		this.buttonText.setVisible(true)
		this.isActive = true
	}

	resetRegistry(): void {
		this.scene.registry.set('isBoosterReceived', false)
		this.scene.registry.set('boosterEffect', null)
		this.scene.registry.set('score', 0)
		this.scene.registry.set('lap', 0)
	}
}
