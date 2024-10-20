import { BoosterName } from 'component/booster/booster'
import { BoosterUI } from 'component/booster/boosterUI'
import { MARGIN } from 'config'
import I18nSingleton from 'i18n/I18nSingleton'

export default class RewardDialog {
	private rewardText!: Phaser.GameObjects.Text
	private dialog!: Phaser.GameObjects.Graphics
	private descriptionTitle!: Phaser.GameObjects.Text
	private descriptionText!: Phaser.GameObjects.Text
	private descriptionBoosterUI!: BoosterUI

	constructor(scene: Phaser.Scene) {
		const { width } = scene.scale
		const i18n = I18nSingleton.getInstance()

		this.rewardText = i18n
			.createTranslatedText(scene, width / 2, 556 + 80, 'receive_item')
			.setAlign('center')
			.setOrigin(0.5, 0)

		this.dialog = scene.add
			.graphics()
			.fillStyle(0xffffff, 1)
			.fillRoundedRect(
				96,
				this.rewardText.y + this.rewardText.height + 48,
				528,
				160,
				20,
			)

		const boosterDropId = scene.registry.get('booster_drop_id')

		this.descriptionBoosterUI = new BoosterUI(scene, boosterDropId, {
			x: 96 + MARGIN / 2,
			y: this.rewardText.y + this.rewardText.height + 48 + 32,
		})
		this.descriptionBoosterUI.create()
		this.descriptionBoosterUI.initBooster()

		let title = 'booster_title_' + this.descriptionBoosterUI.getFrame()
		let text = 'booster_description_' + this.descriptionBoosterUI.getFrame()
		if (
			this.descriptionBoosterUI.getName() === BoosterName.BOOSTER_RARE1 ||
			this.descriptionBoosterUI.getName() === BoosterName.BOOSTER_RARE2
		) {
			title = 'booster_title' + this.descriptionBoosterUI.getFrame()
			text = 'booster_description' + this.descriptionBoosterUI.getFrame()
		}

		this.descriptionBoosterUI.create()
		this.descriptionTitle = i18n
			.createTranslatedText(
				scene,
				252,
				this.descriptionBoosterUI.getBody().y,
				title,
			)
			.setOrigin(0)
			.setAlign('left')
			.setSize(334, 96)
			.setFontSize(28)
			.setColor('#57453B')
		this.descriptionText = i18n
			.createTranslatedText(
				scene,
				252,
				this.descriptionBoosterUI.getBody().y + 42,
				text,
			)
			.setOrigin(0)
			.setAlign('left')
			.setSize(334, 96)
			.setFontSize(28)
			.setColor('#57453B')
	}

	initFontStyle() {
		this.descriptionTitle.setStyle({
			fontFamily: 'Mali',
			fontStyle: 'bold',
		})

		this.descriptionText.setStyle({
			fontFamily: 'Mali',
			fontWeight: 500,
		})

		this.rewardText
			.setStyle({
				fontFamily: 'Mali',
				fontStyle: 'bold',
				color: 'white',
			})
			.setFontSize('32px')
			.setStroke('#3F088C', 6)
	}

	hide() {
		this.dialog.setVisible(false)
		this.rewardText.setVisible(false)
		this.descriptionBoosterUI.hide()
		this.descriptionTitle.setVisible(false)
		this.descriptionText.setVisible(false)
	}

	show() {
		this.dialog.setVisible(true)
		this.rewardText.setVisible(true)
		this.descriptionBoosterUI.show()
		this.descriptionTitle.setVisible(true)
		this.descriptionText.setVisible(true)
	}
}
