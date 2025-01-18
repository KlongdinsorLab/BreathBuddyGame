/* eslint-disable @typescript-eslint/no-this-alias */
import Phaser from 'phaser'
import I18nSingleton from 'i18n/I18nSingleton'
import WebFont from 'webfontloader'
import { MARGIN } from 'config'
import BoosterBag from 'component/booster/boosterBag'
import AchievementBag from 'component/achievement/achievementBag'
import supabaseAPIService from 'services/API/backend/supabaseAPIService'
import { UnlockedCharacterDTO } from 'services/API/definition/responseDTO'
import BackButton from 'component/ui/Button/BackButton'
import { logger } from 'services/logger'

enum SlotType {
	BOOSTER,
	REWARD,
}

export default class MyBagScene extends Phaser.Scene {
	private key!: string

	private background!: Phaser.GameObjects.TileSprite
	private banner!: Phaser.GameObjects.NineSlice
	private myBagIcon!: Phaser.GameObjects.Image
	private slotBackground!: Phaser.GameObjects.Graphics
	private boosterButtonBackground!: Phaser.GameObjects.Graphics
	private rewardButtonBackground!: Phaser.GameObjects.Graphics
	private disabledBoosterButtonBackground!: Phaser.GameObjects.Graphics
	private disabledRewardButtonBackground!: Phaser.GameObjects.Graphics
	private boosterButtonHitBox!: Phaser.GameObjects.Rectangle
	private rewardButtonHitBox!: Phaser.GameObjects.Rectangle
	private redButtonLeft!: Phaser.GameObjects.NineSlice
	private redButtonRight!: Phaser.GameObjects.NineSlice
	private iconLeft!: Phaser.GameObjects.Image
	private iconRight!: Phaser.GameObjects.Image
	private leftButtonOverlay!: Phaser.GameObjects.NineSlice
	private rightButtonOverlay!: Phaser.GameObjects.NineSlice

	private buttonBack!: Phaser.GameObjects.Image
	private buttonBackHitBox!: Phaser.GameObjects.Rectangle

	private headerText!: Phaser.GameObjects.Text
	private boosterButtonText!: Phaser.GameObjects.Text
	private rewardButtonText!: Phaser.GameObjects.Text
	private disabledBoosterButtonText!: Phaser.GameObjects.Text
	private disabledRewardButtonText!: Phaser.GameObjects.Text
	private descriptionBackground!: Phaser.GameObjects.Graphics

	private alert!: Phaser.GameObjects.Image

	private startIndex = 0
	private slotType: SlotType = SlotType.BOOSTER
	private boosterBag!: BoosterBag
	private achievementBag!: AchievementBag

	//     private boosterJson = [
	//         {boosterId: 1,  expired_at:null }, {boosterId: 1,  expired_at:null }, {boosterId: 1,  expired_at:"2024-08-12T12:00:00.000Z" },{boosterId: 1,  expired_at:"2024-08-12T09:00:00.000Z" },
	//         {boosterId: 2,  expired_at:null }, {boosterId: 2,  expired_at:null }, {boosterId: 2,  expired_at:"2024-08-12T10:00:00.000Z" },
	//         {boosterId: 3,  expired_at:null }, {boosterId: 3,  expired_at:"2024-08-12T11:00:00.000Z" }, {boosterId: 3,  expired_at:"2024-08-13T11:00:00.000Z" },
	//         {boosterId: 4,  expired_at:null }, {boosterId: 4,  expired_at:"2024-08-12T08:00:00.000Z" },
	//         {boosterId: 5,  expired_at:null }, {boosterId: 5,  expired_at:"2024-08-12T06:00:00.000Z" },
	//         {boosterId: 6,  expired_at:null }, {boosterId: 6,  expired_at:"2024-08-12T06:00:00.000Z" },{boosterId: 6,  expired_at:"2024-08-13T08:00:00.000Z" },
	//         {boosterId: 7,  expired_at:null }, {boosterId: 7,  expired_at:"2024-08-10T08:24:00.000Z" },
	//   ]

	constructor() {
		super('mybag')
	}

	init({ key }: { key: string }) {
		this.key = key
	}

	preload() {
		this.load.script(
			'webfont',
			'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
		)
		this.load.image('submenu_bg', 'assets/background/submenu-background.png')
		this.load.atlas(
			'heading',
			'assets/heading/heading_spritesheet.png',
			'assets/heading/heading_spritesheet.json',
		)
		this.load.atlas(
			'button',
			'assets/ui/button_spritesheet.png',
			'assets/ui/button_spritesheet.json',
		)
		this.load.atlas(
			'icon',
			'assets/icon/icon_spritesheet.png',
			'assets/icon/icon_spritesheet.json',
		)
		this.load.atlas(
			'dropItem',
			'assets/dropItem/dropitem_spritesheet.png',
			'assets/dropItem/dropitem_spritesheet.json',
		)
		this.load.atlas(
			'achievement',
			'assets/achievement/achievement_spritesheet.png',
			'assets/achievement/achievement_spritesheet.json',
		)
		this.load.atlas(
			'mcpreview',
			'assets/mcpreview/mcpreview_spritesheet.png',
			'assets/mcpreview/mcpreview_spritesheet.json',
		)
		this.load.atlas(
			'mc2',
			'assets/character/player/mc2_spritesheet.png',
			'assets/character/player/mc2_spritesheet.json',
		)
		this.load.atlas(
			'mc3',
			'assets/character/player/mc3_spritesheet.png',
			'assets/character/player/mc3_spritesheet.json',
		)
		this.load.image('popupAuraEffect', 'assets/effect/popup_aura.png')
	}
	async create() {
		const { width, height } = this.scale
		const self = this

		const apiService = new supabaseAPIService()

		this.slotType = SlotType.BOOSTER

		this.background = this.add
			.tileSprite(width / 2, height / 2, 720, 1280, 'submenu_bg')
			.setOrigin(0.5)
			.setScrollFactor(0, 0)
		this.myBagIcon = this.add
			.image(width / 2, 112, 'icon', 'icon_bag.png')
			.setScale(2.5)
		this.banner = this.add.nineslice(
			width / 2,
			232,
			'heading',
			'heading_red.png',
			528,
			128,
		)
		this.headerText = I18nSingleton.getInstance()
			.createTranslatedText(this, width / 2, 214, 'mybag_heading')
			.setOrigin(0.5)
			.setAlign('center')

		new BackButton(this, this.key)

		const boosterButton = this.createSlotButton(
			{ x: width / 2 - 272, y: 528 },
			264,
			80,
			'mybag_booster_slot_button',
			{ x: width / 2 - 140, y: 568 },
			0x43a99e,
			0x327f76,
			6,
			{ tl: 40, tr: 40 },
		)
		this.boosterButtonBackground = boosterButton.buttonBackground
		this.boosterButtonText = boosterButton.buttonText

		const rewardButton = this.createSlotButton(
			{ x: width / 2 + 8, y: 528 },
			264,
			80,
			'mybag_reward_slot_button',
			{ x: width / 2 + 140, y: 568 },
			0xffaa04,
			0xbf7f03,
			6,
			{ tl: 40, tr: 40 },
		)
		this.rewardButtonBackground = rewardButton.buttonBackground
		this.rewardButtonText = rewardButton.buttonText

		const disabledBoosterButton = this.createSlotButton(
			{ x: width / 2 - 272, y: 528 },
			264,
			80,
			'mybag_booster_slot_button',
			{ x: width / 2 - 140, y: 568 },
			0xc7beaf,
			0x958e83,
			6,
			{ tl: 40, tr: 40 },
		)
		this.disabledBoosterButtonBackground =
			disabledBoosterButton.buttonBackground
		this.disabledBoosterButtonText = disabledBoosterButton.buttonText

		const disabledRewardButton = this.createSlotButton(
			{ x: width / 2 + 8, y: 528 },
			264,
			80,
			'mybag_reward_slot_button',
			{ x: width / 2 + 140, y: 568 },
			0xc7beaf,
			0x958e83,
			6,
			{ tl: 40, tr: 40 },
		)
		this.disabledRewardButtonBackground = disabledRewardButton.buttonBackground
		this.disabledRewardButtonText = disabledRewardButton.buttonText

		this.slotBackground = this.add.graphics()
		this.slotBackground.fillStyle(0xfff6e5)
		this.slotBackground.fillRoundedRect(MARGIN, 602, 624, 550, 40)
		this.slotBackground.lineStyle(6, 0xd35e24)
		this.slotBackground.strokeRoundedRect(MARGIN, 602, 624, 550, 40)

		this.descriptionBackground = this.add.graphics()
		this.descriptionBackground.fillStyle(0xffe7ba)
		this.descriptionBackground.fillRoundedRect(MARGIN, 962, 624, 192, {
			tl: 0,
			tr: 0,
			bl: 40,
			br: 40,
		})

		this.descriptionBackground.lineStyle(6, 0xd35e24)
		this.descriptionBackground.strokeRoundedRect(MARGIN, 962, 624, 192, {
			tl: 0,
			tr: 0,
			bl: 40,
			br: 40,
		})

		try {
			const boosterData = await apiService.getBoosterBag()
			const boosterJson = boosterData.response
			logger.verbose(
				this.scene.key,
				`Api call success, Boosters: ${boosterJson}`,
			)

			this.boosterBag = new BoosterBag(this, boosterJson)
			this.boosterBag.create()
			this.boosterBag.createDefaultText()
		} catch (error) {
			logger.error(this.scene.key, `Api call failed: ${error}`)
		}

		try {
			const data = await apiService.getUnlockedAchievement()
			logger.verbose(
				this.scene.key,
				`Api call success, Unlocked achievement: ${data.response}`,
			)
			const unlockedAchievement = data.response

			const {
				response: unlockedCharacterList,
			}: { response: UnlockedCharacterDTO[] } =
				await apiService.getUnlockedCharacter()
			logger.verbose(
				this.scene.key,
				`Api call success, Unlocked character: ${unlockedCharacterList}`,
			)

			this.achievementBag = new AchievementBag(
				this,
				unlockedAchievement,
				unlockedCharacterList,
			)
			this.achievementBag.setPageIndex(this.achievementBag.getStartIndex())
			this.achievementBag.create()
			this.achievementBag.createDefaultTextDescription()
			this.achievementBag.createDefaultUI()
			this.achievementBag.createProgressBar()
			this.achievementBag.hide()
			const currentUnlockedReward =
				this.achievementBag.getCurrentUnlockedReward()
			if (currentUnlockedReward.length !== 0) {
				this.alert = this.add
					.image(572, 502, 'icon', 'icon_alert.png')
					.setOrigin(0)
			}
		} catch (error) {
			logger.error(this.scene.key, `Api call failed: ${error}`)
		}

		const arrowButtonLeft = this.createArrowButton(
			{ x: width / 2 + 86, y: 1152 },
			96,
			96,
			false,
		)
		this.redButtonLeft = arrowButtonLeft.buttonBackground
		this.iconLeft = arrowButtonLeft.buttonIcon
		this.leftButtonOverlay = arrowButtonLeft.buttonOverlay

		const arrowButtonRight = this.createArrowButton(
			{ x: width / 2 + 216, y: 1152 },
			96,
			96,
			true,
		)
		this.redButtonRight = arrowButtonRight.buttonBackground
		this.iconRight = arrowButtonRight.buttonIcon
		this.rightButtonOverlay = arrowButtonRight.buttonOverlay
		this.setArrowOverlay()

		//set hit box for booster and reward button
		this.boosterButtonHitBox = this.add
			.rectangle(width / 2 - 308, 508, 300, 100)
			.setOrigin(0)
		this.boosterButtonHitBox.setInteractive().on('pointerup', () => {
			this.setBoosterButtonDisabled(false)
			this.setRewardButtonDisabled(true)
			this.destroyAchievementBag()
			this.showBoosterBag()
			this.boosterBag.setStartIndex(this.startIndex)
			this.slotType = SlotType.BOOSTER
			this.setArrowOverlay()
		})
		this.rewardButtonHitBox = this.add
			.rectangle(width / 2 + 8, 508, 300, 100)
			.setOrigin(0)
		this.rewardButtonHitBox.setInteractive().on('pointerup', () => {
			this.setBoosterButtonDisabled(true)
			this.setRewardButtonDisabled(false)
			this.startIndex = this.boosterBag.getStartIndex()
			this.hideBoosterBag()
			this.showAchievementBag()
			this.slotType = SlotType.REWARD
			this.setArrowOverlay()
		})

		this.setBoosterButtonDisabled(false)
		this.setRewardButtonDisabled(true)

		this.redButtonLeft.setInteractive().on('pointerup', () => {
			this.leftArrowInteraction()
			this.setArrowOverlay()
		})
		this.redButtonRight.setInteractive().on('pointerup', () => {
			this.rightArrowInteraction()
			this.setArrowOverlay()
		})

		WebFont.load({
			google: {
				families: ['Mali:500,600,700', 'Jua'],
			},
			active: () => {
				self.boosterBag?.initFontStyle()
				self.headerText
					?.setStyle({
						fontFamily: 'Mali',
						fontWeight: 600,
						color: 'white',
					})
					.setFontSize(42)
					.setStroke('#9E461B', 12)
					.setLineSpacing(16)

				self.boosterButtonText
					?.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
						color: 'white',
					})
					.setFontSize(32)
					.setStroke('#327F76', 6)
					.setLineSpacing(16)

				self.rewardButtonText
					?.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
						color: 'white',
					})
					.setFontSize(32)
					.setStroke('#BF7F03', 6)
					.setLineSpacing(16)

				self.disabledBoosterButtonText
					?.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
						color: 'white',
					})
					.setFontSize(32)
					.setStroke('#958E83', 6)
					.setLineSpacing(16)

				self.disabledRewardButtonText
					?.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
						color: 'white',
					})
					.setFontSize(32)
					.setStroke('#958E83', 6)
					.setLineSpacing(16)
			},
		})
	}
	update(): void {
		if (this.boosterBag?.getTimeOut()) {
			this.startIndex++
			this.boosterBag.handleTimeOut()
			this.setArrowOverlay()
		}
	}
	showBoosterBag(): void {
		this.boosterBag.setPageIndex(this.boosterBag.getStartIndex())
		this.boosterBag.show()
	}
	hideBoosterBag(): void {
		this.boosterBag.hide()
	}
	showAchievementBag(): void {
		if (this.alert) this.alert.destroy()
		this.achievementBag.show()
	}
	destroyAchievementBag(): void {
		this.achievementBag.hide()
	}
	createSlotButton(
		position: { x: number; y: number },
		width: number,
		height: number,
		text: string,
		textPosition: { x: number; y: number },
		backgroundColor: number,
		strokeColor?: number,
		strokeThickness?: number,
		radius?: { tl?: number; tr?: number; bl?: number; br?: number },
	): {
		buttonBackground: Phaser.GameObjects.Graphics
		buttonText: Phaser.GameObjects.Text
	} {
		const button = this.add.graphics()
		button.fillStyle(backgroundColor)
		button.fillRoundedRect(position.x, position.y, width, height, {
			tl: radius?.tl || 0,
			tr: radius?.tr || 0,
			bl: radius?.bl || 0,
			br: radius?.br || 0,
		})
		button.lineStyle(strokeThickness || 0, strokeColor || 0)
		button.strokeRoundedRect(position.x, position.y, width, height, {
			tl: radius?.tl || 0,
			tr: radius?.tr || 0,
			bl: radius?.bl || 0,
			br: radius?.br || 0,
		})

		const buttonText = I18nSingleton.getInstance()
			.createTranslatedText(this, textPosition.x, textPosition.y, text)
			.setOrigin(0.5)
			.setAlign('center')
		return { buttonBackground: button, buttonText: buttonText }
	}
	createArrowButton(
		position: { x: number; y: number },
		width: number,
		height: number,
		isFlipXIcon: boolean,
	): {
		buttonBackground: Phaser.GameObjects.NineSlice
		buttonIcon: Phaser.GameObjects.Image
		buttonOverlay: Phaser.GameObjects.NineSlice
	} {
		const button = this.add
			.nineslice(
				position.x,
				position.y,
				'button',
				'button_red40.png',
				width,
				height,
			)
			.setOrigin(0.5)
			.setDepth(1)
		const buttonIcon = this.add
			.image(position.x, position.y - 5, 'icon', 'icon_white_arrow.png')
			.setOrigin(0.5)
			.setDepth(1)
			.setFlipX(isFlipXIcon)
		const buttonOverlay = this.add
			.nineslice(
				position.x,
				position.y,
				'button',
				'button_red40.png',
				width,
				height,
			)
			.setOrigin(0.5)
			.setAlpha(0.6)
			.setTint(0x000000)
			.setDepth(1)
		return {
			buttonBackground: button,
			buttonIcon: buttonIcon,
			buttonOverlay: buttonOverlay,
		}
	}
	setBoosterButtonDisabled(isActive: boolean) {
		this.disabledBoosterButtonBackground.setVisible(isActive)
		this.disabledBoosterButtonText.setVisible(isActive)
	}
	setRewardButtonDisabled(isActive: boolean) {
		this.disabledRewardButtonBackground.setVisible(isActive)
		this.disabledRewardButtonText.setVisible(isActive)
	}
	setLeftArrowOverlay(isVisible: boolean) {
		this.leftButtonOverlay.setVisible(isVisible)
	}
	setRightArrowOverlay(isVisible: boolean) {
		this.rightButtonOverlay.setVisible(isVisible)
	}
	setArrowOverlay(): void {
		this.setLeftArrowOverlay(false)
		this.setRightArrowOverlay(false)
		if (
			this.slotType === SlotType.BOOSTER &&
			this.boosterBag.getTotalBooster() < this.boosterBag.getMaxBoosterPerPage()
		) {
			this.setLeftArrowOverlay(true)
			this.setRightArrowOverlay(true)
		}
		if (
			this.slotType === SlotType.BOOSTER &&
			this.boosterBag.getPageIndex() - this.boosterBag.getStartIndex() <
				this.boosterBag.getMaxBoosterPerPage()
		) {
			this.setLeftArrowOverlay(true)
		}
		if (
			this.slotType === SlotType.BOOSTER &&
			this.boosterBag.getPageIndex() + this.boosterBag.getMaxBoosterPerPage() >=
				this.boosterBag.getTotalBoosterShown()
		) {
			this.setRightArrowOverlay(true)
		}
		if (
			this.slotType === SlotType.REWARD &&
			this.achievementBag.getTotalAchievement() <
				this.achievementBag.getMaxAchievementPerPage()
		) {
			this.setLeftArrowOverlay(true)
			this.setRightArrowOverlay(true)
		}
		if (
			this.slotType === SlotType.REWARD &&
			this.achievementBag.getPageIndex() === 0
		) {
			this.setLeftArrowOverlay(true)
		}
		if (
			this.slotType === SlotType.REWARD &&
			this.achievementBag.getPageIndex() +
				this.achievementBag.getMaxAchievementPerPage() >=
				this.achievementBag.getTotalAchievement()
		) {
			this.setRightArrowOverlay(true)
		}
	}
	leftArrowInteraction(): void {
		if (this.slotType === SlotType.BOOSTER) {
			this.boosterBag.previousPage()
		}
		if (this.slotType === SlotType.REWARD) {
			this.achievementBag.previousPage()
		}
	}
	rightArrowInteraction(): void {
		if (this.slotType === SlotType.BOOSTER) {
			this.boosterBag.nextPage()
		}
		if (this.slotType === SlotType.REWARD) {
			this.achievementBag.nextPage()
		}
	}
	destroy() {
		this.background?.destroy()
		this.banner?.destroy()
		this.myBagIcon?.destroy()
		this.slotBackground?.destroy()
		this.boosterButtonBackground?.destroy()
		this.rewardButtonBackground?.destroy()
		this.disabledBoosterButtonBackground?.destroy()
		this.disabledRewardButtonBackground?.destroy()
		this.boosterButtonHitBox?.destroy()
		this.rewardButtonHitBox?.destroy()
		this.redButtonLeft?.destroy()
		this.redButtonRight?.destroy()
		this.iconLeft?.destroy()
		this.iconRight?.destroy()
		this.leftButtonOverlay?.destroy()
		this.rightButtonOverlay?.destroy()

		this.buttonBack?.destroy()
		this.buttonBackHitBox?.destroy()

		this.headerText?.destroy()
		this.boosterButtonText?.destroy()
		this.rewardButtonText?.destroy()
		this.disabledBoosterButtonText?.destroy()
		this.disabledRewardButtonText?.destroy()
		this.descriptionBackground?.destroy()

		this.alert?.destroy()
	}
}
