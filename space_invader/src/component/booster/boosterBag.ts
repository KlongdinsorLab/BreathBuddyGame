import { BoosterUI } from './boosterUI'
import { BoosterName } from './booster'
import { MARGIN } from 'config'
import I18nSingleton from 'i18n/I18nSingleton'
import i18next from 'i18next'

export default class BoosterBag {
	private scene: Phaser.Scene
	private boosterUI: BoosterUI[] = []
	private boosterJson: { booster_id: number; expired_at: string | null }[]

	private maxBoostersPerLine = 4
	private maxLines = 2
	private startIndex: number = 0
	private pageIndex: number = 0
	private index: number = 0

	private startPosition = { x: 128, y: 650 }
	private gapSize = { width: 16, height: 32 }
	private boosterSize = { width: 108, height: 108 }

	private totalBooster: number = 0
	private boosterAmount: number[] = [0, 0, 0, 0, 0, 0, 0]
	private boosterLimitedTime: {
		booster_id: number
		expired_at: string | null
	}[] = []
	private sortedBooster: {
		booster_id: number
		expired_at?: string | null
		amount?: number
	}[] = []

	private descriptionBackground!: Phaser.GameObjects.Graphics
	private descriptionTitle!: Phaser.GameObjects.Text
	private descriptionText!: Phaser.GameObjects.Text
	private descriptionAmount!: Phaser.GameObjects.Text
	private descriptionDefaultText!: Phaser.GameObjects.Text
	private descriptionBoosterUI!: BoosterUI

	private boosterGraphics: Map<BoosterName, Phaser.GameObjects.Graphics> =
		new Map()
	private selectedCircle!: Phaser.GameObjects.Graphics
	private selectedBooster!: BoosterUI | undefined
	private totalBoosterText!: Phaser.GameObjects.Text

	private timeEvent!: Phaser.Time.TimerEvent

	private isHide: boolean = false

	constructor(
		scene: Phaser.Scene,
		boosterJson: { booster_id: number; expired_at: string | null }[],
	) {
		this.scene = scene
		this.boosterJson = boosterJson
		this.countBooster()
		this.sortBoosterByTime(this.boosterLimitedTime)
		this.sortBooster()

		this.boosterUI.forEach((booster) => {
			booster.onSetUnavailable(() => {
				this.setDeselected()
				this.startIndex++
				this.pageIndex++
				this.create()
			})
		})
	}
	create() {
		this.index = this.pageIndex
		for (let i = 0; i < this.maxLines; i++) {
			for (let j = 0; j < this.maxBoostersPerLine; j++) {
				if (this.index >= this.sortedBooster.length) return
				let position = {
					x:
						this.startPosition.x +
						(this.boosterSize.width + this.gapSize.width) * j,
					y:
						this.startPosition.y +
						(this.boosterSize.height + this.gapSize.height) * i,
				}
				const boosterName = this.getBoosterName(
					this.sortedBooster[this.index].booster_id,
				)
				this.boosterUI[this.index] = new BoosterUI(this.scene, boosterName, {
					x: position.x,
					y: position.y,
					expired_at: this.sortedBooster[this.index].expired_at ?? undefined,
					amount: this.sortedBooster[this.index].amount ?? undefined,
					isBoosterBag: true,
				})
				this.boosterUI[this.index].create()
				this.boosterUI[this.index].initBooster()
				;((index) => {
					this.boosterUI[index]
						.getBody()
						.setInteractive()
						.on('pointerup', () => {
							this.handleSelectBooster(this.boosterUI[index])
						})
				})(this.index)
				this.index++
			}
		}
	}
	createDefaultText(): void {
		this.totalBoosterText = I18nSingleton.getInstance()
			.createTranslatedText(
				this.scene,
				this.scene.scale.width / 2,
				434,
				'mybag_booster_total_text',
				{ total: this.totalBooster },
			)
			.setOrigin(0.5)
			.setAlign('center')
			.setPadding(0, 20, 0, 10)
		this.descriptionDefaultText = I18nSingleton.getInstance()
			.createTranslatedText(this.scene, 360, 1050, 'mybag_booster_default_text')
			.setOrigin(0.5)
		this.initFontStyle()
	}
	handleSelectBooster(boosterUI: BoosterUI): void {
		if (!boosterUI.getIsCompleteInit()) {
			return
		}
		if (this.selectedBooster !== undefined) {
			if (this.selectedBooster.getPosition() === boosterUI.getPosition()) {
				this.setDeselected()
				return
			} else {
				this.setDeselected()
			}
		}
		this.descriptionDefaultText.setVisible(false)
		this.setSelected(boosterUI)
		this.setDescription(boosterUI)
	}
	setSelected(boosterUI: BoosterUI): void {
		let position = boosterUI.getPosition()
		this.selectedCircle = this.scene.add.graphics()
		this.selectedCircle.lineStyle(4, 0x327f76)
		this.selectedCircle.strokeRoundedRect(position.x, position.y, 96, 96, 100)
		this.boosterGraphics.set(boosterUI.getName(), this.selectedCircle)
		this.timeEvent?.remove()
		this.selectedBooster = boosterUI
	}
	setDeselected(): void {
		if (this.selectedBooster !== undefined) {
			this.boosterGraphics.get(this.selectedBooster.getName())?.destroy()
			this.boosterGraphics.delete(this.selectedBooster.getName())
			this.descriptionBackground?.destroy()
			this.descriptionBoosterUI.destroy()
			this.descriptionTitle.destroy()
			this.descriptionText.destroy()
			this.descriptionAmount?.destroy()
			this.descriptionDefaultText?.setVisible(true)
			this.selectedBooster = undefined
		}
	}
	setDescriptionTimeout(boosterUI: BoosterUI): void {
		this.timeEvent = this.scene.time.addEvent({
			delay: 3000,
			callback: () => {
				this.setDeselected()
			},
			repeat: -1,
		})
		this.descriptionBackground = this.scene.add.graphics()
		this.descriptionBackground.fillStyle(0xff0000)
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
		if (this.selectedBooster !== undefined) {
			this.boosterGraphics.get(this.selectedBooster.getName())?.destroy()
			this.boosterGraphics.delete(this.selectedBooster.getName())
			this.descriptionBoosterUI.destroy()
			this.descriptionTitle.destroy()
			this.descriptionText.destroy()
		}
		this.descriptionBoosterUI = new BoosterUI(this.scene, boosterUI.getName(), {
			x: 128,
			y: 986,
		})
		this.descriptionBoosterUI.create()
		this.descriptionText = I18nSingleton.getInstance()
			.createTranslatedText(this.scene, 252, 998 - 10, 'booster_timeout')
			.setOrigin(0)
			.setAlign('left')
			.setSize(334, 96)
			.setFontSize(24)
			.setColor('#FFFFFF')
			.setPadding(0, 20, 0, 10)
		this.updateFont()
	}
	setDescription(boosterUI: BoosterUI): void {
		let title = 'booster_title_' + boosterUI.getFrame()
		let text = 'booster_description_' + boosterUI.getFrame()
		if (
			boosterUI.getName() === BoosterName.BOOSTER_RARE1 ||
			boosterUI.getName() === BoosterName.BOOSTER_RARE2
		) {
			title = 'booster_title' + boosterUI.getFrame()
			text = 'booster_description' + boosterUI.getFrame()
		}
		this.descriptionBoosterUI = new BoosterUI(this.scene, boosterUI.getName(), {
			x: 128,
			y: 986,
		})
		this.descriptionBoosterUI.create()
		this.descriptionTitle = I18nSingleton.getInstance()
			.createTranslatedText(this.scene, 252 + 5, 986 - 10, title)
			.setOrigin(0)
			.setAlign('left')
			.setSize(334, 96)
			.setFontSize(28)
			.setColor('#57453B')
			.setPadding(0, 20, 0, 10)
		this.descriptionText = I18nSingleton.getInstance()
			.createTranslatedText(this.scene, 252 + 5, 1028 - 10, text)
			.setOrigin(0)
			.setAlign('left')
			.setSize(334, 96)
			.setFontSize(28)
			.setColor('#57453B')
			.setPadding(0, 20, 0, 10)
		let amountText
		if (boosterUI.getAmount() === 0) {
			const [hours, minutes, seconds] = boosterUI
				.getTimeText()
				.split(':')
				.map(Number)
			if (hours == 0 && minutes == 0 && seconds > 0) {
				amountText = i18next.t('booster_description_expire_seconds')
			} else if (hours == 0 && minutes > 0) {
				amountText = i18next.t('booster_description_expire_minute', { minutes })
			} else {
				amountText = i18next.t('booster_description_expire', { hours, minutes })
			}
		} else {
			const amount = boosterUI.getAmount()
			amountText = i18next.t('booster_description_amount', { amount })
		}
		this.descriptionAmount = I18nSingleton.getInstance()
			.createTranslatedText(this.scene, 252 + 5, 1064 - 10, amountText)
			.setOrigin(0)
			.setAlign('left')
			.setSize(334, 96)
			.setFontSize(28)
			.setColor('#D35E24')
			.setPadding(0, 20, 0, 10)
		this.updateFont()
	}
	nextPage(): void {
		if (
			this.getTotalBoosterShown() - this.startIndex <
			this.maxBoostersPerLine * this.maxLines
		)
			return
		if (
			this.pageIndex + this.maxBoostersPerLine * this.maxLines >=
			this.sortedBooster.length
		)
			return
		this.pageIndex += this.maxBoostersPerLine * this.maxLines
		this.destroy()
		this.setDeselected()
		this.create()
		this.createDefaultText()
	}
	previousPage(): void {
		if (
			this.getTotalBoosterShown() - this.startIndex <
			this.maxBoostersPerLine * this.maxLines
		)
			return
		if (this.pageIndex < this.maxBoostersPerLine * this.maxLines) return
		this.pageIndex -= this.maxBoostersPerLine * this.maxLines
		this.destroy()
		this.setDeselected()
		this.create()
		this.createDefaultText()
	}
	countBooster(): void {
		this.boosterJson.forEach((booster) => {
			this.totalBooster++
			if (booster.expired_at === null) {
				this.boosterAmount[booster.booster_id - 1]++
			} else {
				this.boosterLimitedTime.push(booster)
			}
		})
	}
	sortBooster(): void {
		this.sortedBooster = this.boosterLimitedTime.concat()
		this.boosterAmount.forEach((amount, index) => {
			if (amount > 0) {
				this.sortedBooster.push({ booster_id: index + 1, amount: amount })
			}
		})
	}
	sortBoosterByTime(
		boosters: { booster_id: number; expired_at: string | null }[],
	): { booster_id: number; expired_at: string | null }[] {
		return boosters.sort((a, b) => {
			if (a.expired_at === null) return 1
			if (b.expired_at === null) return -1
			const dateA = new Date(a.expired_at).getTime()
			const dateB = new Date(b.expired_at).getTime()
			return dateA - dateB
		})
	}
	setStartIndex(index: number): void {
		this.startIndex = index
	}
	setPageIndex(index: number): void {
		this.pageIndex = index
	}
	getBoosterName(booster_id: number): BoosterName {
		switch (booster_id) {
			case 1:
				return BoosterName.BOOSTER_1
			case 2:
				return BoosterName.BOOSTER_2
			case 3:
				return BoosterName.BOOSTER_3
			case 4:
				return BoosterName.BOOSTER_4
			case 5:
				return BoosterName.BOOSTER_5
			case 6:
				return BoosterName.BOOSTER_RARE1
			case 7:
				return BoosterName.BOOSTER_RARE2
			default:
				return BoosterName.BOOSTER_1
		}
	}
	getMaxBoosterPerPage(): number {
		return this.maxBoostersPerLine * this.maxLines
	}
	getTotalBooster(): number {
		return this.totalBooster
	}
	getTotalBoosterShown(): number {
		return this.sortedBooster.length
	}
	getStartIndex(): number {
		return this.startIndex
	}
	getPageIndex(): number {
		return this.pageIndex
	}
	getIndex(): number {
		return this.index
	}
	getBoosterUI(): BoosterUI[] {
		return this.boosterUI
	}
	handleTimeOut(): void {
		if (this.selectedBooster !== undefined) {
			this.setDescriptionTimeout(this.selectedBooster)
		} else {
			this.setDeselected()
		}
		this.boosterDestroy()
		this.startIndex++
		this.pageIndex++
		this.totalBoosterText.setText(
			i18next.t('mybag_booster_total_text', {
				total: this.totalBooster - this.startIndex,
			}),
		)
		if (!this.isHide) {
			this.create()
			this.boosterFontStyle()
		}
	}
	getTimeOut(): boolean {
		let isTimeout = false
		this.boosterUI.forEach((booster) => {
			if (booster.getIsTimeout()) {
				isTimeout = true
			}
		})
		return isTimeout
	}
	boosterFontStyle(): void {
		this.boosterUI.forEach((booster) => {
			booster?.initFontStyle()
		})
	}
	initFontStyle(): void {
		this.boosterFontStyle()
		this.descriptionDefaultText
			?.setStyle({
				fontFamily: 'Mali',
				fontWeight: '500',
			})
			.setFontSize(24)
			.setColor('#57453B')
			.setSize(334, 96)

		this.totalBoosterText
			?.setStyle({
				fontFamily: 'Mali',
				fontStyle: 'bold',
			})
			.setFontSize(32)
			.setColor('#57453B')
	}
	updateFont(): void {
		if (this.descriptionTitle) {
			this.descriptionTitle?.setStyle({
				fontFamily: 'Mali',
				fontStyle: 'bold',
			})
		}
		if (this.descriptionText) {
			this.descriptionText?.setStyle({
				fontFamily: 'Mali',
				fontWeight: 500,
			})
		}
		if (this.descriptionAmount) {
			this.descriptionAmount?.setStyle({
				fontFamily: 'Mali',
				fontStyle: 'bold',
			})
		}
	}
	hide(): void {
		this.boosterUI?.forEach((booster) => {
			booster?.hide()
		})
		this.setDeselected()
		this.totalBoosterText.setVisible(false)
		this.descriptionTitle?.setVisible(false)
		this.descriptionText?.setVisible(false)
		this.descriptionAmount?.setVisible(false)
		this.descriptionDefaultText?.setVisible(false)
		this.descriptionBoosterUI?.hide()
		this.selectedCircle?.setVisible(false)
		this.selectedBooster?.hide()
		this.isHide = true
	}
	show(): void {
		this.pageIndex = this.startIndex
		if (this.isHide) {
			this.create()
			this.boosterFontStyle()
		}
		this.boosterUI?.forEach((booster) => {
			booster?.show()
		})
		this.totalBoosterText.setVisible(true)
		this.descriptionTitle?.setVisible(true)
		this.descriptionText?.setVisible(true)
		this.descriptionAmount?.setVisible(true)
		this.descriptionDefaultText?.setVisible(true)
		this.descriptionBoosterUI?.show()
		this.selectedCircle?.setVisible(true)
		this.selectedBooster?.show()
		this.isHide = false
	}
	boosterDestroy(): void {
		this.boosterUI.forEach((booster) => {
			booster?.destroy()
		})
		this.boosterUI.length = 0
	}
	destroy(): void {
		this.boosterUI?.forEach((booster) => {
			booster?.destroy()
		})
		this.boosterUI.length = 0

		this.totalBoosterText.destroy()
		this.descriptionTitle?.destroy()
		this.descriptionText?.destroy()
		this.descriptionAmount?.destroy()
		this.descriptionDefaultText?.destroy()
		this.descriptionBoosterUI?.destroy()
		this.selectedCircle?.destroy()
		this.selectedBooster?.destroy()
	}
}
