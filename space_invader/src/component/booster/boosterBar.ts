import { MARGIN, SCREEN_HEIGHT, MAX_SELECTED_BOOSTER } from 'config'
import { BoosterUI, States } from './boosterUI'
import { BoosterName } from './booster'
import I18nSingleton from 'i18n/I18nSingleton'
import i18next from 'i18next'

export default class boosterBar {
	private scene: Phaser.Scene
	private selectedBooster: BoosterName[] = []

	private position = { x: MARGIN * 2, y: SCREEN_HEIGHT / 2 - MARGIN * 2 }
	private boosterSize = { width: 96, height: 96 }
	private gapSize = { width: 120, height: 140 }

	private boosterGraphics: Map<BoosterName, Phaser.GameObjects.Graphics> =
		new Map()
	private boosterMark: Map<BoosterName, Phaser.GameObjects.Image> = new Map()

	private descriptionImage!: Phaser.GameObjects.Image
	private descriptionBg!: Phaser.GameObjects.Graphics
	private descriptionTitle!: Phaser.GameObjects.Text | undefined
	private descriptionText: Phaser.GameObjects.Text | undefined
	private descriptionAmount: Phaser.GameObjects.Text | undefined

	private timeoutEvent: Phaser.Time.TimerEvent | undefined

	private boosters: BoosterUI[] = []

	private boosterJson: boosterRedeem[] //= [
	//         {boosterId: 1,      expireDate: [], amount : 1 },
	//         {boosterId: 2 ,     expireDate: [], amount : 2 },
	//         {boosterId: 3 ,     expireDate: [], amount : 30},
	//         {boosterId: 4 ,     expireDate: [], amount : 1},
	//         {boosterId: 5 ,     expireDate: [], amount : 1},
	//         {boosterId: 6 ,     expireDate: [], amount : 1},
	//         {boosterId: 7 ,     expireDate: [], amount : 2},
	//   ]

	constructor(scene: Phaser.Scene, boosterJson: boosterRedeem[]) {
		this.selectedBooster.length = 0
		this.scene = scene
		this.boosterJson = boosterJson
		this.boosters[0] = new BoosterUI(this.scene, BoosterName.BOOSTER_1, {
			x: this.position.x + (MARGIN * 2) / 3,
			y: this.position.y,
			amount: this.boosterJson[0].amount,
			expireArray: this.boosterJson[0].expireDate,
		})
		this.boosters[0].create()
		this.boosters[0]
			.getBody()
			.setInteractive()
			.on('pointerup', () => this.isSelected(0))

		this.boosters[1] = new BoosterUI(this.scene, BoosterName.BOOSTER_2, {
			x: this.position.x + (MARGIN * 2) / 3 + this.gapSize.width * 1,
			y: this.position.y,
			amount: this.boosterJson[1].amount,
			expireArray: this.boosterJson[1].expireDate,
		})
		this.boosters[1].create()
		this.boosters[1]
			.getBody()
			.setInteractive()
			.on('pointerup', () => this.isSelected(1))

		this.boosters[2] = new BoosterUI(this.scene, BoosterName.BOOSTER_3, {
			x: this.position.x + (MARGIN * 2) / 3 + this.gapSize.width * 2,
			y: this.position.y,
			amount: this.boosterJson[2].amount,
			expireArray: this.boosterJson[2].expireDate,
		})
		this.boosters[2].create()
		this.boosters[2]
			.getBody()
			.setInteractive()
			.on('pointerup', () => this.isSelected(2))

		this.boosters[3] = new BoosterUI(this.scene, BoosterName.BOOSTER_4, {
			x: this.position.x + (MARGIN * 2) / 3 + this.gapSize.width * 3,
			y: this.position.y,
			amount: this.boosterJson[3].amount,
			expireArray: this.boosterJson[3].expireDate,
		})
		this.boosters[3].create()
		this.boosters[3]
			.getBody()
			.setInteractive()
			.on('pointerup', () => this.isSelected(3))

		this.boosters[4] = new BoosterUI(this.scene, BoosterName.BOOSTER_5, {
			x: this.position.x + MARGIN * 2,
			y: this.position.y + this.gapSize.height,
			amount: this.boosterJson[4].amount,
			expireArray: this.boosterJson[4].expireDate,
		})
		this.boosters[4].create()
		this.boosters[4]
			.getBody()
			.setInteractive()
			.on('pointerup', () => this.isSelected(4))

		this.boosters[5] = new BoosterUI(this.scene, BoosterName.BOOSTER_RARE1, {
			x: this.position.x + MARGIN * 2 + this.gapSize.width,
			y: this.position.y + this.gapSize.height,
			amount: this.boosterJson[5].amount,
			expireArray: this.boosterJson[5].expireDate,
		})
		this.boosters[5].create()
		this.boosters[5]
			.getBody()
			.setInteractive()
			.on('pointerup', () => this.isSelected(5))

		this.boosters[6] = new BoosterUI(this.scene, BoosterName.BOOSTER_RARE2, {
			x: this.position.x + MARGIN * 2 + this.gapSize.width * 2,
			y: this.position.y + this.gapSize.height,
			amount: this.boosterJson[6].amount,
			expireArray: this.boosterJson[6].expireDate,
		})
		this.boosters[6].create()
		this.boosters[6]
			.getBody()
			.setInteractive()
			.on('pointerup', () => this.isSelected(6))

		this.boosters.forEach((booster) => {
			booster.initBooster()
		})

		this.setDescriptionBox()

		this.boosters.forEach((booster, index) => {
			booster.onSetUnavailable(() => {
				if (this.selectedBooster.includes(index)) {
					this.setDescriptionBox(index, 0xff0000)
				}
				this.setDeselected(index)
			})
		})
	}

	isSelected(index: number): void {
		if (!this.boosters[index].getIsCompleteInit()) {
			return
		}
		if (this.selectedBooster.includes(this.boosters[index].getName())) {
			this.setDeselected(index)
			return
		}

		if (this.selectedBooster.length >= MAX_SELECTED_BOOSTER) {
			return
		}
		if (this.boosters[index].getState() === States.UNAVAILABLE) {
			return
		}
		this.setSelected(index)
	}

	setSelected(index: number): void {
		const position = this.boosters[index].getPosition()
		const selectedMark = this.scene.add.graphics()
		selectedMark.lineStyle(6, 0x327f76)
		selectedMark.strokeRoundedRect(position.x, position.y, 96, 96, 100)
		this.boosterGraphics.set(this.boosters[index].getName(), selectedMark)

		const newBoosterMark = this.scene.add
			.image(position.x + 104, position.y, 'booster_selectedMark')
			.setOrigin(1, 0)
		newBoosterMark.setDepth(1)
		this.boosterMark.set(this.boosters[index].getName(), newBoosterMark)

		this.selectedBooster.push(this.boosters[index].getName())
		this.setDescriptionBox(index)
	}

	setDeselected(index: number): void {
		const name = this.boosters[index].getName()
		const selectedMark = this.boosterGraphics.get(name)
		if (selectedMark) {
			selectedMark.destroy()
			this.boosterGraphics.delete(name)
		}

		const boosterMark = this.boosterMark.get(name)
		if (boosterMark) {
			boosterMark.destroy()
			this.boosterMark.delete(name)
		}

		this.selectedBooster = this.selectedBooster.filter(
			(selected) => selected !== name,
		)
		if (this.descriptionText) {
			if (this.descriptionText!.name === (index + 1).toString()) {
				this.setDescriptionBox()
			} else if (index === 5 && this.descriptionText!.name === '_rare1') {
				this.setDescriptionBox()
			} else if (index === 6 && this.descriptionText!.name === '_rare2') {
				this.setDescriptionBox()
			}
		}
	}

	setDescriptionBox(index?: number, color?: number) {
		if (!this.scene) return

		if (this.descriptionBg) {
			this.descriptionBg.destroy()
		}

		const descriptionBox = this.scene.add.graphics()
		descriptionBox.fillStyle(color ?? 0xffe7ba)
		descriptionBox.fillRoundedRect(
			this.position.x,
			this.position.y + this.gapSize.height * 2,
			this.position.x * 5.6,
			160,
			18,
		)
		this.descriptionBg = descriptionBox

		if (index !== undefined) {
			const name = this.boosters[index].getFrame()
			let frame = 'booster' + name + '.png'

			if (this.descriptionImage) {
				this.descriptionImage.destroy()
			}

			this.descriptionImage = this.scene.add
				.image(
					this.position.x + (MARGIN * 2) / 3,
					this.position.y + this.gapSize.height * 2 + MARGIN / 2,
					'dropItem',
					frame,
				)
				.setOrigin(0, 0)
				.setSize(this.boosterSize.width, this.boosterSize.height)
			let title = 'booster_title_' + name
			let text = 'booster_description_' + name
			if (index === 5 || index === 6) {
				title = 'booster_title' + name
				text = 'booster_description' + name
			}
			if (color === 0xff0000) {
				text = 'booster_timeout'
				this.descriptionText = I18nSingleton.getInstance()
					.createTranslatedText(
						this.scene,
						this.position.x + (MARGIN * 2) / 3 + 128,
						this.position.y + this.gapSize.height * 2 + MARGIN / 2.5 + 6 - 10,
						text,
					)
					.setAlign('start')
					.setOrigin(0, 0)
					.setColor('#FFFFFF')
					.setPadding(0, 20, 0, 10)
				this.descriptionText.name = this.boosters[index].getFrame()
				this.timeoutEvent = this.scene.time.addEvent({
					delay: 3000,
					callback: () => {
						this.setDescriptionBox()
						this.timeoutEvent?.remove()
					},
					loop: false,
				})
				this.initFontStyle()
				return
			}
			this.descriptionTitle = I18nSingleton.getInstance()
				.createTranslatedText(
					this.scene,
					this.position.x + (MARGIN * 2) / 3 + 128 + 5,
					this.position.y + this.gapSize.height * 2 + MARGIN / 2.5 - 15,
					title,
				)
				.setAlign('start')
				.setOrigin(0, 0)
				.setPadding(0, 20, 0, 10)
			this.descriptionText = I18nSingleton.getInstance()
				.createTranslatedText(
					this.scene,
					this.position.x + (MARGIN * 2) / 3 + 128 + 5,
					this.position.y + this.gapSize.height * 2 + MARGIN / 2.5 + 36 - 10,
					text,
				)
				.setAlign('start')
				.setOrigin(0, 0)
				.setColor('#57453B')
				.setPadding(0, 20, 0, 10)
			this.descriptionTitle.name = this.boosters[index].getFrame()
			this.descriptionText.name = this.boosters[index].getFrame()
			this.setDescriptionAmount(index)
		} else {
			this.descriptionAmount = I18nSingleton.getInstance()
				.createTranslatedText(
					this.scene,
					(this.position.x * 5.6) / 2 - 88,
					this.position.y + this.gapSize.height * 2 + MARGIN + 8 - 10,
					'booster_description_default',
				)
				.setAlign('center')
				.setOrigin(0, 0)
				.setPadding(0, 20, 0, 10)
		}
		this.initFontStyle()
	}

	setDescriptionAmount(index: number): void {
		let text: string
		if (this.boosters[index].getState() === States.LIMITED_TIME) {
			const [hours, minutes, seconds] = this.boosters[index]
				.getTimeText()
				.split(':')
				.map(Number)
			if (hours == 0 && minutes == 0 && seconds > 0) {
				text = i18next.t('booster_description_expire_seconds')
			} else if (hours == 0 && minutes > 0) {
				text = i18next.t('booster_description_expire_minute', { minutes })
			} else {
				text = i18next.t('booster_description_expire', { hours, minutes })
			}
		} else {
			const amount = this.boosters[index].getAmount()
			text = i18next.t('booster_description_amount', { amount })
		}

		this.descriptionAmount = I18nSingleton.getInstance()
			.createTranslatedText(
				this.scene,
				this.position.x + (MARGIN * 2) / 3 + 128 + 5,
				this.position.y + this.gapSize.height * 2 + MARGIN * 2 - 6 - 10,
				text,
			)
			.setAlign('start')
			.setOrigin(0, 0)
			.setPadding(0, 20, 0, 10)
	}

	boosterFontStyle() {
		this.boosters.forEach((booster) => {
			booster.initFontStyle()
		})
	}

	getBooster(): BoosterName[] {
		return this.selectedBooster
	}

	initFontStyle() {
		if (this.descriptionTitle) {
			this.descriptionTitle.setStyle({
				fontFamily: 'Mali',
				fontStyle: 'bold',
				fontSize: '28px',
				color: '#57453B',
			})
		}
		if (this.descriptionText) {
			this.descriptionText.setStyle({
				fontFamily: 'Mali',
				fontStyle: 500,
				fontSize: '28px',
			})
		}

		if (this.descriptionAmount) {
			this.descriptionAmount.setStyle({
				fontFamily: 'Mali',
				fontWeight: 500,
				fontSize: '28px',
				color: '#D35E24',
			})
		}
	}

	destroy() {
		this.boosters.forEach((booster) => {
			booster.destroy()
		})

		this.descriptionBg.destroy()
		this.descriptionImage?.destroy()
		this.descriptionText?.destroy()
		this.descriptionAmount?.destroy()
	}
}

interface boosterRedeem {
	boosterId: number
	expireDate: string[]
	amount: number
}
