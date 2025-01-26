import Phaser from 'phaser'
import I18nSingleton from 'i18n/I18nSingleton'

export default class vas {
	private scene: Phaser.Scene
	private score: number = 0
	private isConfirm: boolean = false
	private isCompleteVas: boolean = false

	private boxText!: Phaser.GameObjects.Text
	private imageText!: Phaser.GameObjects.Text
	private confirmText!: Phaser.GameObjects.Text
	private RestText!: Phaser.GameObjects.Text

	private boxBg!: Phaser.GameObjects.Graphics
	private buttonImage!: Phaser.GameObjects.NineSlice

	private emoImage!: Phaser.GameObjects.Image

	private buttonText: Phaser.GameObjects.Text[] = []
	private button: Phaser.GameObjects.Arc[] = []
	private buttonBg: Map<string, Phaser.GameObjects.Arc> = new Map()

	private isCreated: boolean = false

	private position = { x: 96, y: 480 }
	private boxSize = { width: 528, height: 528 }
	private gapSize = { width: 80, height: 80 }

	constructor(scene: Phaser.Scene) {
		this.scene = scene
	}

	create(): void {
		//const {width, height} = scene.scale;
		const box = this.scene.add.graphics()
		box.fillStyle(0xfff6e5)
		box.fillRoundedRect(this.position.x, this.position.y, 528, 528, 30)
		box.lineStyle(10, 0x5011aa)
		box.strokeRoundedRect(this.position.x, this.position.y, 528, 528, 30)
		this.boxBg = box
		this.boxText = I18nSingleton.getInstance()
			.createTranslatedText(
				this.scene,
				this.position.x + this.boxSize.width / 2,
				this.position.y + 40,
				'vas_box_text',
			)
			.setAlign('center')
			.setOrigin(0.5, 0)
			.setColor('black')

		this.setImageResponse()

		this.setButton(this.position.x + 64, this.position.y + 336, 1)
		this.setButton(
			this.position.x + 64 + this.gapSize.width * 1,
			this.position.y + 336,
			2,
		)
		this.setButton(
			this.position.x + 64 + this.gapSize.width * 2,
			this.position.y + 336,
			3,
		)
		this.setButton(
			this.position.x + 64 + this.gapSize.width * 3,
			this.position.y + 336,
			4,
		)
		this.setButton(
			this.position.x + 64 + this.gapSize.width * 4,
			this.position.y + 336,
			5,
		)

		this.setButton(
			this.position.x + 64,
			this.position.y + 336 + this.gapSize.height,
			6,
		)
		this.setButton(
			this.position.x + 64 + this.gapSize.width * 1,
			this.position.y + 336 + this.gapSize.height,
			7,
		)
		this.setButton(
			this.position.x + 64 + this.gapSize.width * 2,
			this.position.y + 336 + this.gapSize.height,
			8,
		)
		this.setButton(
			this.position.x + 64 + this.gapSize.width * 3,
			this.position.y + 336 + this.gapSize.height,
			9,
		)
		this.setButton(
			this.position.x + 64 + this.gapSize.width * 4,
			this.position.y + 336 + this.gapSize.height,
			10,
		)

		this.buttonImage = this.scene.add
			.nineslice(
				this.position.x,
				this.position.y + 576,
				'button',
				'button_purple.png',
				528,
				96,
				20,
				20,
				20,
				30,
			)
			.setOrigin(0, 0)
			.setInteractive()
			.on('pointerup', () => {
				if (this.score == 0) {
					return
				}
				if (this.score >= 7 && !this.isConfirm) {
					this.isConfirm = true
					this.buttonText.forEach((text) => {
						text.destroy()
					})
					this.button.forEach((element) => {
						element.destroy()
					})
					//show text
					this.setImageResponse(7)
					this.RestText = I18nSingleton.getInstance()
						.createTranslatedText(
							this.scene,
							this.position.x + this.boxSize.width / 2,
							this.position.y + 360,
							'vas_box_rest',
						)
						.setAlign('center')
						.setOrigin(0.5, 0)
						.setColor('black')
					this.initFontStyle()
				} else {
					this.clearPopup()
					this.isCompleteVas = true
				}
			})

		this.confirmText = I18nSingleton.getInstance()
			.createTranslatedText(
				this.scene,
				this.position.x + this.boxSize.width / 2,
				this.position.y + 596,
				'vas_box_confirm',
			)
			.setAlign('center')
			.setOrigin(0.5, 0)
			.setColor('black')

		this.isCreated = true
		this.initFontStyle()
	}

	setImageResponse(index?: number): void {
		if (this.emoImage) {
			this.emoImage.destroy()
		}
		if (this.imageText) {
			this.imageText.destroy()
		}
		if (index) {
			this.score = index
		}
		const imageName = 'emo' + this.score + '.png'
		this.emoImage = this.scene.add
			.image(
				this.position.x + this.boxSize.width / 2,
				this.position.y + 112,
				'vas',
				imageName,
			)
			.setOrigin(0.5, 0)

		if (this.score !== 0) {
			this.imageText = I18nSingleton.getInstance()
				.createTranslatedText(
					this.scene,
					this.position.x + this.boxSize.width / 2,
					this.position.y + 272,
					'vas_box_text' + Math.ceil(this.score / 2),
				)
				.setAlign('center')
				.setOrigin(0.5, 0)
				.setColor('black')
			this.initFontStyle()
		}
	}

	setButton(x: number, y: number, index: number): void {
		const defaultColor = 0xcecece
		const activeColor = 0x51ecb3 // Change this to the color you want when the button is clicked

		const bg = this.scene.add
			.circle(x, y, 32, defaultColor)
			.setOrigin(0, 0)
			.setInteractive()
			.on('pointerup', () => {
				if (this.score !== index) {
					// Deselect previous button
					if (this.button[this.score]) {
						this.button[this.score].setFillStyle(defaultColor)
					}

					// Select current button
					this.score = index
					this.setImageResponse()
					bg.setFillStyle(activeColor)
				} else {
					// Deselect current button
					this.score = 0
					this.setImageResponse()
					bg.setFillStyle(defaultColor)
				}
			})

		const text = this.scene.add
			.text(x + 32, y + 32, index.toString())
			.setOrigin(0.5, 0.5)
			.setInteractive()
			.on('pointerup', () => {
				if (this.score !== index) {
					// Deselect previous button
					if (this.button[this.score]) {
						this.button[this.score].setFillStyle(defaultColor)
					}

					// Select current button
					this.score = index
					this.setImageResponse()
					bg.setFillStyle(activeColor)
				} else {
					// Deselect current button
					this.score = 0
					this.setImageResponse()
					bg.setFillStyle(defaultColor)
				}
			})

		this.buttonBg.set(index.toString(), bg)
		this.button[index] = bg
		this.buttonText[index] = text
	}

	getScore(): number {
		return this.score
	}

	getIsCompleteVas(): boolean {
		return this.isCompleteVas
	}

	initFontStyle() {
		if (this.isCreated) {
			this.boxText
				.setStyle({
					fontFamily: 'Mali',
					fontSize: '32px',
					color: '#ffffff',
				})
				.setStroke('#3f088c', 6)
				.setFontStyle('bold')

			if (this.imageText) {
				this.imageText
					.setStyle({
						fontFamily: 'Mali',
						fontSize: '32px',
						color: '#3f088c',
					})
					.setFontStyle('bold')
			}

			this.confirmText
				.setStyle({
					fontFamily: 'Mali',
					fontSize: '32px',
					color: '#ffffff',
				})
				.setStroke('#3f088c', 6)
				.setFontStyle('bold')

			if (this.RestText) {
				this.RestText.setStyle({
					fontFamily: 'Mali',
					fontSize: '40px',
					color: '#dd2d04',
				})
					.setStroke('#ffffff', 6)
					.setFontStyle('bold')
			}

			this.buttonText.forEach((text) => {
				if (text.active) {
					text.setStyle({
						fontFamily: 'Jua',
						fontSize: '32px',
						color: '#3f088c',
					})
				}
			})
		}
	}
	clearPopup(): void {
		this.buttonText.forEach((text) => {
			text.destroy()
		})
		this.button.forEach((element) => {
			element.destroy()
		})
		this.boxText.destroy()
		this.imageText.destroy()
		this.confirmText.destroy()
		this.boxBg.destroy()
		this.emoImage.destroy()
		this.buttonImage.destroy()

		if (this.RestText) {
			this.RestText.destroy()
		}
	}
}
