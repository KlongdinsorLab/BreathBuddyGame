import I18nSingleton from 'i18n/I18nSingleton'
import Phaser from 'phaser'
import WebFont from 'webfontloader'

export default class Cutscene1 extends Phaser.Scene {
	private bgm?: Phaser.Sound.BaseSound
	constructor() {
		super('cutscene1')
	}

	init({ bgm }: { bgm: Phaser.Sound.BaseSound }) {
		this.bgm = bgm
	}

	preload() {
		this.load.script(
			'webfont',
			'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
		)
		this.load.atlas(
			'ui',
			'assets/ui/asset_warmup.png',
			'assets/ui/asset_warmup.json',
		)
		this.load.image('cutscene_bg', 'assets/background/bg_cutscene.png')
	}

	create() {
		const { width, height } = this.scale
		this.add
			.tileSprite(0, 0, width, height, 'cutscene_bg')
			.setOrigin(0)
			.setScrollFactor(0, 0)

		const i18n = I18nSingleton.getInstance()

		const textBox = this.add.graphics()
		textBox.fillStyle(0xfff6e5)
		textBox.fillRoundedRect(48, 958, 624, 240, 40)

		const textBoxBorder = this.add.graphics()
		textBoxBorder.lineStyle(5, 0xd35e24, 1)
		textBoxBorder.strokeRoundedRect(48, 958, 624, 240, 40)

		const cutsceneText = i18n
			.createTranslatedText(this, width / 2, 1050 - 10, 'cutscene1_dialog')
			.setOrigin(0.5, 0)
			.setAlpha(1)
			.setPadding(0, 20, 0, 10)

		const continueText = i18n
			.createTranslatedText(this, width / 2, 1155 - 10, 'tutorial_continue')
			.setOrigin(0.5, 0)
			.setAlpha(0)
			.setPadding(0, 20, 0, 10)

		this.tweens.add({
			targets: continueText,
			alpha: 1,
			duration: 2000,
			repeat: 0,
			ease: 'sine.in',
			onComplete: () => {
				this.input.once(
					'pointerdown',
					() => {
						this.scene.stop()
						this.scene.start('cutscene2', { bgm: this.bgm })
						// i18n.removeAllListeners(this)
					},
					this,
				)
			},
		})

		WebFont.load({
			google: {
				families: ['Mali'],
			},
			active: function () {
				cutsceneText
					.setStyle({
						fontFamily: 'Mali',
					})
					.setColor('#57453B')
					.setFontSize('36px')

				continueText
					.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
					})
					.setFontSize('36px')
					.setStroke('#D35E24', 12)
			},
		})
	}
}
