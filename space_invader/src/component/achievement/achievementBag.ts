import { AchievementUI } from './achievementUI'
import { RewardPopup } from 'component/popup/RewardPopup'
import I18nSingleton from 'i18n/I18nSingleton'
import { TOTAL_MC } from 'config'
import {
	AchievementDetailDTO,
	UnlockedCharacterDTO,
} from 'services/API/definition/responseDTO'
import supabaseAPIService from 'services/API/backend/supabaseAPIService'
import { logger } from 'services/logger'
export default class AchievementBag {
	private scene: Phaser.Scene
	private achievementUI: AchievementUI[]
	private rewardPopup!: RewardPopup

	private maxAchievementPerLine = 4
	private maxLines = 2
	private startIndex = 0
	private pageIndex = 0
	private index = 0

	private startPosition = { x: 128, y: 650 }
	private gapSize = { width: 28, height: 44 }
	private achievementSize = { width: 96, height: 96 }
	private rewardPosition = [
		{ x: 282, y: 498 },
		{ x: 474, y: 498 },
		{ x: 586, y: 498 },
	]
	private achievementPerReward = 4
	private progressBarPixels = 48
	private maxProgressAchievement = 9
	private maxRewardIcon = 3

	private currentProgress = 0
	private totalUnlockedAchievement = 0
	private totalAchievement = 0
	private totalUnlockedReward = 0
	private isShownPopup: boolean[] = []
	private currentUnlockedReward: number[] = []
	private currentUnlockedRewardIndex = 0
	private currentUnlockedPointer = 0
	private isShownUnlocked = false
	private isMaxCompleted = false

	private descriptionText!: Phaser.GameObjects.Text
	private descriptionTitle!: Phaser.GameObjects.Text
	private descriptionLockText!: Phaser.GameObjects.Text
	private descriptionDefaultText!: Phaser.GameObjects.Text
	private descriptionAchievementUI!: AchievementUI

	private achievementGraphics: Map<number, Phaser.GameObjects.Graphics> =
		new Map()
	private selectedCircle!: Phaser.GameObjects.Graphics
	private selectedAchievement!: AchievementUI | undefined

	//for UI bar
	private iconUnlocked!: Phaser.GameObjects.Image
	private textUnlocked!: Phaser.GameObjects.Text
	private textNumberUnlocked!: Phaser.GameObjects.Text
	private progressBar!: Phaser.GameObjects.Graphics
	private progressBarBackground!: Phaser.GameObjects.Graphics
	private progressBarLine!: Phaser.GameObjects.Graphics
	private rewardIcon: Phaser.GameObjects.Image[] = []
	private rewardText: Phaser.GameObjects.Text[] = []
	private rewardHitBox: Phaser.GameObjects.Rectangle[] = []
	private rewardAlert: Phaser.GameObjects.Image[] = []

	private rewardLockColor = '#7A7367'
	private rewardUnlockColor = '#327F76'

	private sortedAchievementJson!: { id: number }[]
	private allAchievementJson = [
		{ id: 1 },
		{ id: 2 },
		{ id: 3 },
		{ id: 4 },
		{ id: 5 },
		{ id: 6 },
		{ id: 7 },
		{ id: 8 },
		{ id: 9 },
		{ id: 10 },
		{ id: 11 },
		{ id: 12 },
		{ id: 13 },
		{ id: 14 },
		{ id: 15 },
		{ id: 16 },
		{ id: 17 },
	]
	private unlockedAchievementJson: AchievementDetailDTO[]

	constructor(
		scene: Phaser.Scene,
		unlockedAchievementJson: AchievementDetailDTO[],
		unlockedCharacter: UnlockedCharacterDTO[],
	) {
		this.scene = scene
		this.achievementUI = []
		this.sortedAchievementJson = []
		this.unlockedAchievementJson = unlockedAchievementJson
		this.totalUnlockedAchievement = this.unlockedAchievementJson.length
		this.totalAchievement = this.allAchievementJson.length
		this.totalUnlockedReward = unlockedCharacter.length - 1
		this.sortedAchievement()
		this.calculateProgressBar()
	}
	create(): void {
		this.index = this.pageIndex
		for (let i = 0; i < this.maxLines; i++) {
			for (let j = 0; j < this.maxAchievementPerLine; j++) {
				if (this.index >= this.sortedAchievementJson.length) return
				const position = {
					x:
						this.startPosition.x +
						(this.achievementSize.width + this.gapSize.width) * j,
					y:
						this.startPosition.y +
						(this.achievementSize.height + this.gapSize.height) * i,
				}
				this.achievementUI[this.index] = new AchievementUI(
					this.scene,
					this.sortedAchievementJson[this.index].id,
					{
						x: position.x,
						y: position.y,
						isLocked: !this.unlockedAchievementJson.find(
							(achievement) =>
								achievement.id === this.sortedAchievementJson[this.index].id,
						)
							? true
							: false,
					},
				)
				this.achievementUI[this.index].create()
				;((index) => {
					this.achievementUI[index]
						.getBody()
						.setInteractive()
						.on('pointerup', () => {
							this.handleSelectAchievement(this.achievementUI[index])
						})
				})(this.index)
				this.index++
			}
		}
	}
	createDefaultTextDescription(): void {
		this.descriptionDefaultText = I18nSingleton.getInstance()
			.createTranslatedText(
				this.scene,
				360,
				1050,
				'mybag_achievement_default_text',
			)
			.setOrigin(0.5)
		this.defaultTextFontStyle()
	}
	createDefaultUI(): void {
		this.iconUnlocked = this.scene.add
			.image(248, 298, 'icon', 'icon_achievement_unlocked.png')
			.setOrigin(0)

		this.textUnlocked = I18nSingleton.getInstance()
			.createTranslatedText(
				this.scene,
				334,
				298,
				'mybag_achievement_unlocked_text',
			)
			.setOrigin(0)

		this.textNumberUnlocked = this.scene.add
			.text(
				344,
				350,
				this.totalUnlockedAchievement + '/ ' + this.totalAchievement,
			)
			.setOrigin(0)
		this.initFontStyle()
	}
	createProgressBar(): void {
		this.progressBarBackground = this.scene.add.graphics()
		this.progressBarBackground.fillStyle(0xffffff)
		this.progressBarBackground.fillRoundedRect(96, 458, 520, 24, 12)

		this.progressBar = this.scene.add.graphics()
		this.progressBar.fillStyle(0xd35e24)
		this.progressBar.fillRoundedRect(96, 458, this.currentProgress, 24, 12)

		this.progressBarLine = this.scene.add.graphics()
		this.progressBarLine.lineStyle(6, 0x7a7367)
		this.progressBarLine.strokeRoundedRect(100, 458, 480, 24, 50)

		this.currentUnlockedRewardIndex = 0
		this.isShownUnlocked = false

		for (let i = 0; i < this.maxRewardIcon; i++) {
			this.createRewardIcon(i)
		}
	}
	createRewardIcon(index: number): void {
		this.isShownPopup[index] = false
		const position = this.rewardPosition[index]
		let characterId = 0
		let text = '?'
		let textColor = this.rewardLockColor
		let isLocked = true
		let warning = false

		const isLastIcon = index + 1 === this.maxRewardIcon
		const isUnlockedReward = this.totalUnlockedReward > 0

		if (!isLastIcon) {
			characterId = this.achievementPerReward * (index + 1)
			if (isUnlockedReward) {
				this.isShownPopup[index] = true
				characterId =
					(this.totalUnlockedReward * index + 1) * this.achievementPerReward
			}
			text = characterId.toString()
		}

		if (!this.isShownUnlocked && isUnlockedReward) {
			this.isShownPopup[index] = true
			isLocked = false
			this.isShownUnlocked = true
			textColor = this.rewardUnlockColor
			characterId = this.totalUnlockedReward * this.achievementPerReward
			text = characterId.toString()
		} else if (
			this.currentUnlockedReward[this.currentUnlockedRewardIndex] !== undefined
		) {
			this.isShownPopup[index] = false
			isLocked = true
			warning = true
			characterId = this.currentUnlockedReward[this.currentUnlockedRewardIndex]
			text = characterId.toString()
			textColor = this.rewardUnlockColor
			this.currentUnlockedRewardIndex++
		}

		if (this.isMaxCompleted) {
			this.isShownPopup[index] = true
			isLocked = false
			textColor = this.rewardUnlockColor
			characterId =
				(this.totalUnlockedReward - 1 + index) * this.achievementPerReward
			text = characterId.toString()
		}

		if (isLastIcon) {
			this.createLockedRewardIcon(index, position, text, textColor)
		} else {
			this.createUnlockedRewardIcon(
				index,
				position,
				characterId,
				text,
				textColor,
				isLocked,
			)
		}
		if (warning) {
			this.rewardAlert[index] = this.scene.add
				.image(position.x + 56, position.y - 56, 'icon', 'icon_alert.png')
				.setOrigin(1, 1)
		}
	}
	createLockedRewardIcon(
		index: number,
		position: { x: number; y: number },
		text: string,
		textColor: string,
	): void {
		this.rewardIcon[index] = this.scene.add
			.image(position.x, position.y - 6, 'icon', 'icon_lock.png')
			.setOrigin(0.5, 1)
		this.createRewardText(index, position, text, textColor)
		this.createRewardHitBox(index, position, text)
	}
	createUnlockedRewardIcon(
		index: number,
		position: { x: number; y: number },
		characterId: number,
		text: string,
		textColor: string,
		isLocked: boolean,
	): void {
		this.rewardIcon[index] = this.scene.add
			.image(
				position.x,
				position.y - 40,
				'mcpreview',
				`mcpreview_mc${characterId / 4 + 1}.png`,
			)
			.setScale(0.35)
			.setOrigin(0.5, 1)
		this.createRewardText(index, position, text, textColor)
		this.createRewardHitBox(index, position, text)
		if (isLocked) {
			this.rewardIcon[index].setTint(0x000000)
		}
	}
	createRewardText(
		index: number,
		position: { x: number; y: number },
		text: string,
		textColor: string,
	): void {
		this.rewardText[index] = this.scene.add
			.text(position.x, position.y, text)
			.setOrigin(0.5, 1)
			.setFontSize(56)
			.setColor('#FFFFFF')
			.setStroke(textColor, 6)
	}
	createRewardHitBox(
		index: number,
		position: { x: number; y: number },
		text: string,
	): void {
		this.rewardHitBox[index] = this.scene.add.rectangle(
			position.x,
			position.y - 46,
			100,
			100,
		)
		this.rewardHitBox[index].setInteractive().on('pointerup', () => {
			this.handleClickedReward(text, index)
		})
	}
	calculateProgressBar(): void {
		let reward =
			this.totalUnlockedAchievement -
			this.totalUnlockedReward * this.achievementPerReward
		let totalReward = this.totalUnlockedReward
		totalReward++
		while (reward >= this.achievementPerReward) {
			reward -= this.achievementPerReward
			if (reward >= 0 && totalReward <= TOTAL_MC) {
				this.currentUnlockedReward.push(
					totalReward++ * this.achievementPerReward,
				)
			}
		}
		if (this.totalUnlockedReward === TOTAL_MC) {
			this.isMaxCompleted = true
		}

		if (
			this.totalUnlockedAchievement / this.achievementPerReward >=
				this.totalAchievement / this.achievementPerReward &&
			this.totalUnlockedReward ===
				Math.floor(this.totalUnlockedAchievement / this.achievementPerReward)
		) {
			this.isMaxCompleted = true
		}

		this.currentProgress = this.totalUnlockedAchievement
		if (this.totalUnlockedReward >= 1) {
			this.currentProgress -=
				(this.totalUnlockedReward - 1) * this.achievementPerReward
		}
		if (this.currentProgress >= this.maxProgressAchievement) {
			this.currentProgress = this.maxProgressAchievement
		}
		if (this.isMaxCompleted) {
			this.currentProgress = this.maxProgressAchievement
		}

		this.currentProgress = this.currentProgress * this.progressBarPixels
	}
	handleClickedReward(text: string, index: number): void {
		if (text === '?') return

		const achievement = parseInt(text)
		if (
			this.currentUnlockedReward.includes(achievement) &&
			!this.isShownPopup[index] &&
			this.currentUnlockedReward[this.currentUnlockedPointer] === achievement
		) {
			this.isShownPopup[index] = true
			this.rewardIcon[index].setTint()
			this.rewardText[index].setColor(this.rewardUnlockColor)
			this.rewardAlert[index].destroy()
			this.currentUnlockedPointer++
			this.unlockReward(achievement)
		}
	}
	async unlockReward(achievement: number) {
		try {
			const characterId = achievement / 4 + 1
			const apiService = new supabaseAPIService()
			const data = await apiService.unlockCharacter({
				character_id: characterId,
			})
			logger.info(
				this.scene.scene.key,
				`Api call success, Response: ${JSON.stringify(data.response)}`,
			)

			this.rewardPopup = new RewardPopup(this.scene, characterId)
			this.rewardPopup.create()
			this.initFontStyle()
		} catch (error) {
			logger.error(this.scene.scene.key, `Api call failed ${error}`)
		}
	}
	handleSelectAchievement(achievementUI: AchievementUI): void {
		if (this.selectedAchievement !== undefined) {
			if (
				this.selectedAchievement.getPosition() === achievementUI.getPosition()
			) {
				this.setDeselected()
				return
			} else {
				this.setDeselected()
			}
		}
		this.descriptionDefaultText.setVisible(false)
		this.setSelected(achievementUI)
		this.setDescription(achievementUI)
	}
	setSelected(achievementUI: AchievementUI): void {
		const position = achievementUI.getPosition()
		this.selectedCircle = this.scene.add.graphics()
		this.selectedCircle.lineStyle(4, 0xffa800)
		this.selectedCircle.strokeRoundedRect(position.x, position.y, 96, 96, 100)
		this.achievementGraphics.set(achievementUI.getId(), this.selectedCircle)

		this.selectedAchievement = achievementUI
	}
	setDeselected(): void {
		if (this.selectedAchievement !== undefined) {
			this.achievementGraphics.get(this.selectedAchievement.getId())?.destroy()
			this.achievementGraphics.delete(this.selectedAchievement.getId())
			this.descriptionAchievementUI.destroy()
			this.descriptionText.destroy()
			this.descriptionTitle.destroy()
			this.descriptionLockText?.destroy()
			this.descriptionDefaultText?.setVisible(true)
			this.selectedAchievement = undefined
		}
	}
	setDescription(achievementUI: AchievementUI): void {
		const text = `achievement_description_${achievementUI.getId()}`
		const title = `achievement_title_${achievementUI.getId()}`
		this.descriptionAchievementUI = new AchievementUI(
			this.scene,
			achievementUI.getId(),
			{ x: 96, y: 986 },
		)
		this.descriptionAchievementUI.create()
		this.descriptionTitle = I18nSingleton.getInstance()
			.createTranslatedText(this.scene, 216 + 5, 984 - 10, title)
			.setOrigin(0)
			.setAlign('left')
			.setPadding(0, 20, 0, 10)

		this.descriptionText = I18nSingleton.getInstance()
			.createTranslatedText(this.scene, 216 + 5, 1022 - 10, text)
			.setOrigin(0)
			.setAlign('left')
			.setPadding(0, 20, 0, 10)

		if (
			this.unlockedAchievementJson.find(
				(achievement) => achievement.id === achievementUI.getId(),
			) === undefined
		) {
			this.descriptionLockText = I18nSingleton.getInstance()
				.createTranslatedText(this.scene, 216 + 5, 1064 - 10, 'mybag_achievement_locked')
				.setOrigin(0)
				.setAlign('left')
				.setPadding(0, 20, 0, 10)
		}

		this.updateFont()
	}
	sortedAchievement(): void {
		this.unlockedAchievementJson.forEach((achievement) => {
			if (
				!this.sortedAchievementJson.find(
					(sortedAchievement) => sortedAchievement.id === achievement.id,
				)
			) {
				this.sortedAchievementJson.push(achievement)
			}
		})
		this.allAchievementJson.forEach((achievement) => {
			if (
				!this.sortedAchievementJson.find(
					(sortedAchievement) => sortedAchievement.id === achievement.id,
				)
			) {
				this.sortedAchievementJson.push(achievement)
			}
		})
	}
	nextPage(): void {
		if (
			this.getTotalAchievement() - this.startIndex <
			this.maxAchievementPerLine * this.maxLines
		)
			return
		if (
			this.pageIndex + this.maxAchievementPerLine * this.maxLines >=
			this.sortedAchievementJson.length
		)
			return
		this.pageIndex += this.maxAchievementPerLine * this.maxLines
		this.achievementBarDestroy()
		this.create()
		this.createDefaultTextDescription()
		this.initFontStyle()
	}
	previousPage(): void {
		if (
			this.getTotalAchievement() - this.startIndex <
			this.maxAchievementPerLine * this.maxLines
		)
			return
		if (this.pageIndex < this.maxAchievementPerLine * this.maxLines) return
		this.pageIndex -= this.maxAchievementPerLine * this.maxLines
		this.achievementBarDestroy()
		this.create()
		this.createDefaultTextDescription()
		this.initFontStyle()
	}
	setPageIndex(index: number): void {
		this.pageIndex = index
	}
	getStartIndex(): number {
		return this.startIndex
	}
	getPageIndex(): number {
		return this.pageIndex
	}
	getTotalAchievement(): number {
		return this.allAchievementJson.length
	}
	getMaxAchievementPerPage(): number {
		return this.maxAchievementPerLine * this.maxLines
	}
	getCurrentUnlockedReward(): number[] {
		return this.currentUnlockedReward
	}
	updateFont(): void {
		if (this.descriptionTitle) {
			this.descriptionTitle
				?.setStyle({
					fontFamily: 'Mali',
					fontStyle: 'bold',
				})
				.setFontSize(28)
				.setColor('#57453B')
		}
		if (this.descriptionText) {
			this.descriptionText
				?.setStyle({
					fontFamily: 'Mali',
					fontWeight: '500',
				})
				.setFontSize(28)
				.setColor('#57453B')
		}

		if (this.descriptionLockText && this.descriptionLockText.active) {
			this.descriptionLockText
				?.setStyle({
					fontFamily: 'Mali',
					fontWeight: '500',
				})
				.setSize(334, 96)
				.setFontSize(28)
				.setColor('#D35E24')
		}
	}
	defaultTextFontStyle(): void {
		this.descriptionDefaultText
			?.setStyle({
				fontFamily: 'Mali',
				fontWeight: '500',
			})
			.setSize(334, 96)
			.setFontSize(24)
			.setColor('#57453B')
	}
	initFontStyle(): void {
		if (this.textUnlocked) {
			this.textUnlocked
				?.setStyle({
					fontFamily: 'Mali',
					fontStyle: 'bold',
				})
				.setFontSize(32)
				.setColor('#57453B')
		}

		if (this.textNumberUnlocked) {
			this.textNumberUnlocked
				?.setStyle({
					fontFamily: 'Mali',
					fontStyle: 'bold',
				})
				.setFontSize(32)
				.setColor('#57453B')
		}
		if (this.rewardText) {
			this.rewardText?.forEach((text) => {
				text
					.setStyle({
						fontFamily: 'Jua',
						fontWeight: 400,
					})
					.setFontSize(56)
					.setColor('#FFFFFF')
			})
		}
		if (this.rewardPopup) {
			this.rewardPopup.initFontStyle()
		}
	}
	achievementBarDestroy(): void {
		this.descriptionText?.destroy()
		this.descriptionLockText?.destroy()
		this.descriptionTitle?.destroy()
		this.descriptionDefaultText?.destroy()
		this.descriptionAchievementUI?.destroy()
		this.selectedCircle?.destroy()
		this.selectedAchievement?.destroy()
		this.achievementUI.forEach((achievement) => {
			achievement.destroy()
		})
		this.achievementUI.length = 0
	}
	show(): void {
		this.achievementUI.forEach((achievement) => {
			achievement.show()
		})
		this.progressBar?.setVisible(true)
		this.progressBarBackground?.setVisible(true)
		this.progressBarLine?.setVisible(true)
		this.iconUnlocked?.setVisible(true)
		this.textUnlocked?.setVisible(true)
		this.textNumberUnlocked?.setVisible(true)
		this.descriptionDefaultText?.setVisible(true)
		this.rewardIcon.forEach((icon) => {
			icon.setVisible(true)
		})
		this.rewardText.forEach((text) => {
			text.setVisible(true)
		})
		this.rewardHitBox.forEach((hitbox) => {
			hitbox.setVisible(true)
		})
		this.rewardAlert.forEach((alert) => {
			alert.setVisible(true)
		})
	}
	hide(): void {
		this.setDeselected()
		this.achievementUI.forEach((achievement) => {
			achievement.hide()
		})
		this.progressBar?.setVisible(false)
		this.progressBarBackground?.setVisible(false)
		this.progressBarLine?.setVisible(false)
		this.iconUnlocked?.setVisible(false)
		this.textUnlocked?.setVisible(false)
		this.textNumberUnlocked?.setVisible(false)
		this.descriptionDefaultText?.setVisible(false)
		this.rewardIcon.forEach((icon) => {
			icon.setVisible(false)
		})
		this.rewardText.forEach((text) => {
			text.setVisible(false)
		})
		this.rewardHitBox.forEach((hitbox) => {
			hitbox.setVisible(false)
		})
		this.rewardAlert.forEach((alert) => {
			alert.setVisible(false)
		})
	}
	destroyProgressBar(): void {
		this.progressBar?.destroy()
		this.progressBarBackground?.destroy()
		this.progressBarLine?.destroy()
		this.rewardPopup?.destroy()
		this.rewardIcon.forEach((icon) => {
			icon.destroy()
		})
		this.rewardText.forEach((text) => {
			text.destroy()
		})
		this.rewardHitBox.forEach((hitbox) => {
			hitbox.destroy()
		})
		this.rewardAlert.forEach((alert) => {
			alert.destroy()
		})
	}
	destroy(): void {
		this.achievementBarDestroy()
		this.achievementUI.length = 0
		this.iconUnlocked?.destroy()
		this.textUnlocked?.destroy()
		this.textNumberUnlocked?.destroy()
		this.progressBar?.destroy()
		this.progressBarBackground?.destroy()
		this.progressBarLine?.destroy()
		this.rewardPopup?.destroy()
		this.descriptionDefaultText?.destroy()
		this.rewardIcon.forEach((icon) => {
			icon.destroy()
		})
		this.rewardText.forEach((text) => {
			text.destroy()
		})
		this.rewardHitBox.forEach((hitbox) => {
			hitbox.destroy()
		})
		this.rewardAlert.forEach((alert) => {
			alert.destroy()
		})
		this.achievementUI.forEach((achievement) => {
			achievement.destroy()
		})
		this.achievementUI.length = 0
	}
}
