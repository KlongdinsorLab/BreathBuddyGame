import I18nSingleton from 'i18n/I18nSingleton'
import { Popup } from './Popup'
export class AchievementPopup extends Popup {
	private achievementIdList: number[]
	private achievementIndex = 0
	private isCompleteAchievement = false

	private layer!: Phaser.GameObjects.Layer
	private screenOverlay!: Phaser.GameObjects.Rectangle

	private headText!: Phaser.GameObjects.Text
	private bannerText!: Phaser.GameObjects.Text
	private detailText!: Phaser.GameObjects.Text
	private buttonText!: Phaser.GameObjects.Text

	private achievementIcon!: Phaser.GameObjects.Image
	private popupAuraEffect!: Phaser.GameObjects.Image
	private banner!: Phaser.GameObjects.Image

	private submitButton!: Phaser.GameObjects.NineSlice

	constructor(scene: Phaser.Scene, achievementIdList: number[]) {
		super(scene)
		this.achievementIdList = achievementIdList
	}
	create(): void {
		this.layer = this.scene.add.layer()
		const i18n = I18nSingleton.getInstance()

		if (this.achievementIdList.length === 0) {
			this.destroy()
			this.isCompleteAchievement = true
			return
		}
		this.screenOverlay = this.scene.add
			.rectangle(
				0,
				0,
				this.scene.scale.width,
				this.scene.scale.height,
				0x000000,
			)
			.setOrigin(0)
			.setAlpha(0.9)
		this.layer.add(this.screenOverlay)

		this.headText = i18n
			.createTranslatedText(
				this.scene,
				this.scene.scale.width / 2,
				288,
				'achievement_popup_heading',
			)
			.setFontSize(40)
			.setColor('#FFFFFF')
			.setStroke('#3F088C', 6)
			.setAlign('center')
			.setOrigin(0.5, 0)
		this.layer.add(this.headText)

		this.popupAuraEffect = this.scene.add
			.image(this.scene.scale.width / 2, 430, 'popupAuraEffect')
			.setOrigin(0.5, 0)
		this.layer.add(this.popupAuraEffect)

		this.achievementIcon = this.scene.add
			.image(
				this.scene.scale.width / 2,
				484,
				'achievement',
				'achievement' + this.achievementIdList[this.achievementIndex] + '.png',
				// "achievement10.png"
			)
			.setScale(2, 2)
			.setOrigin(0.5, 0)
		this.layer.add(this.achievementIcon)

		this.banner = this.scene.add
			.image(this.scene.scale.width / 2, 656, 'heading', 'heading_green.png')
			.setOrigin(0.5, 0)
		this.layer.add(this.banner)

		const achievementId = this.achievementIdList[this.achievementIndex]
		const title = `achievement_title_${achievementId}`
		const text = `achievement_description_${achievementId}`

		this.bannerText = i18n
			.createTranslatedText(this.scene, this.scene.scale.width / 2, 675, title)
			.setFontSize(28)
			.setColor('#FFFFFF')
			.setStroke('#327F76', 12)
			.setOrigin(0.5, 0)
		this.layer.add(this.bannerText)

		this.detailText = i18n
			.createTranslatedText(this.scene, this.scene.scale.width / 2, 817, text)
			.setFontSize(32)
			.setColor('#FFFFFF')
			.setStroke('#3F088C', 6)
			.setOrigin(0.5, 0)
		this.layer.add(this.detailText)

		this.submitButton = this.scene.add
			.nineslice(
				this.scene.scale.width / 2,
				907,
				'button',
				'button_red.png',
				376,
				96,
				32,
				32,
				64,
				64,
			)
			.setOrigin(0.5, 0)
		this.submitButton.setInteractive().on('pointerup', () => {
			if (this.achievementIndex === this.achievementIdList.length - 1) {
				this.isCompleteAchievement = true
				this.destroy()
				return
			}
			this.achievementIndex++
			this.destroy()
			this.create()
			this.initFontStyle()
		})
		this.layer.add(this.submitButton)

		this.buttonText = i18n
			.createTranslatedText(
				this.scene,
				this.scene.scale.width / 2,
				932,
				'submit',
			)
			.setOrigin(0.5, 0)
			.setFontSize(32)
			.setColor('#FFFFFF')
			.setStroke('#9E461B', 6)
		this.layer.add(this.buttonText)
	}

	destroy(): void {
		this.layer.destroy()
	}

	initFontStyle() {
		this.headText?.setStyle({
			fontFamily: 'Mali',
			fontStyle: 'bold',
		})
		this.bannerText?.setStyle({
			fontFamily: 'Mali',
			fontStyle: 'bold',
		})
		this.detailText?.setStyle({
			fontFamily: 'Mali',
			fontStyle: 'bold',
		})
		this.buttonText?.setStyle({
			fontFamily: 'Mali',
			fontStyle: 'bold',
		})
	}

	getIsCompleteAchievement(): boolean {
		return this.isCompleteAchievement
	}

	setVisibleOn() {
		this.layer.setVisible(true)
	}

	setVisibleOff() {
		this.layer.setVisible(false)
	}
}
