/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PlayerFullNameByName } from 'component/player/playerInterface'
import { ALL_CHARACTER } from 'config'
import I18nSingleton from 'i18n/I18nSingleton'
import supabaseAPIService from 'services/API/backend/supabaseAPIService'
import { logger } from 'services/logger'

export default class characterSelectUi {
	private scene: Phaser.Scene | undefined
	// Characters
	// from database
	private characters!: {
		[characterId: number]: { name: string; unlocked: boolean }
	}
	private charactersCount!: number

	private prevButton: Phaser.GameObjects.Shape | undefined
	private nextButton: Phaser.GameObjects.Shape | undefined

	private showingCharIndex = 1
	// private showingChar= this.characters[this.showingCharIndex]['frame']
	private showingCharImg: Phaser.GameObjects.Image | undefined
	private showingCharText: Phaser.GameObjects.Text | undefined

	private usingCharIndex!: number // from database

	private characterBox: Phaser.GameObjects.Graphics | undefined

	private usingButton: Phaser.GameObjects.Graphics | undefined
	private useButton: Phaser.GameObjects.NineSlice | undefined
	private useText: Phaser.GameObjects.Text | undefined
	private usingText: Phaser.GameObjects.Text | undefined

	constructor(
		scene: Phaser.Scene,
		usingCharIndex?: number,
		showingCharIndex?: number,
	) {
		this.createInstance(scene, usingCharIndex, showingCharIndex)
	}

	private getLogoCharacterById(characterId: number) {
		return `logo_setting_mc${characterId}.png`
	}

	private async handleCharacterData() {
		const apiService = new supabaseAPIService()
		const playerCharactersId: number[] = (
			await apiService.getUnlockedCharacter()
		).response.map((each) => each.character_id)
		const selectedCharacterId = this.scene?.registry.get('selectedCharacterId')

		const allCharacter = ALL_CHARACTER

		const characters: {
			[characterId: number]: { name: string; unlocked: boolean }
		} = {}

		allCharacter.forEach((characterResponse) => {
			const characterResponseId: number = characterResponse.characterId
			const playerCharacterFound = !!playerCharactersId.find(
				(pc) => pc === characterResponseId,
			)

			const character: { name: string; unlocked: boolean } = {
				name: PlayerFullNameByName[
					`mc${characterResponseId}` as keyof typeof PlayerFullNameByName
				],
				unlocked: playerCharacterFound,
			}

			characters[characterResponseId] = character
		})

		this.characters = characters
		this.charactersCount = allCharacter.length
		this.usingCharIndex = selectedCharacterId
	}

	private async handleButtonUseCharacter() {
		const apiService = new supabaseAPIService()
		this.useChar()
		try {
			const data = await apiService.updateSelectedCharacter(this.usingCharIndex)
			logger.info(
				this.scene!.scene.key,
				`Api call success, Response: ${JSON.stringify(data)}`,
			)
		} catch (error) {
			logger.error(this.scene!.scene.key, `Api call failed: ${error}`)
		}
	}

	private async createInstance(
		scene: Phaser.Scene,
		usingCharIndex?: number,
		showingCharIndex?: number,
	) {
		this.scene = scene
		this.usingCharIndex = usingCharIndex === undefined ? 0 : usingCharIndex
		this.showingCharIndex =
			showingCharIndex === undefined ? 1 : showingCharIndex
		const { width } = scene.scale

		const i18n = I18nSingleton.getInstance()

		// call api
		await this.handleCharacterData()

		// Character Select Box
		//this.characterBox = this.scene.add.rectangle( width/2, 504, 336, 120, 0x43A99E ).setOrigin(0.5,0)
		this.characterBox = this.scene.add.graphics()
		this.characterBox.fillStyle(0x43a99e)
		this.characterBox.fillRoundedRect(width / 2 - 168, 504, 336, 120, 14)

		// Arrows
		this.scene.add
			.image(200, 564, 'sheet', 'logo_setting_next.png')
			.setOrigin(0, 0.5)
		this.scene.add
			.image(520, 564, 'sheet', 'logo_setting_next.png')
			.setFlipX(true)
			.setOrigin(1, 0.5)
		this.prevButton = this.scene.add
			.rectangle(192, 564, 50, 120, 0xffffff, 0)
			.setOrigin(0, 0.5)
		this.nextButton = this.scene.add
			.rectangle(528, 564, 50, 120, 0xffffff, 0)
			.setOrigin(1, 0.5)
		this.prevButton.setInteractive().on('pointerup', () => this.charShift(-1)) // Make the functional button larger than arrow sprite
		this.nextButton.setInteractive().on('pointerup', () => this.charShift(1))
		// Showing Character
		this.showingCharImg = this.scene.add
			.image(
				width / 2,
				504,
				'sheet',
				this.getLogoCharacterById(this.showingCharIndex),
			)
			.setOrigin(0.5, 0.5)
		// Character Text (Name)
		this.showingCharText = this.scene.add
			.text(width / 2, 594, this.characters[this.showingCharIndex].name)
			.setColor('#FFFFFF')
			.setStroke('#D35E24', 12)
			.setFontSize(32)
			.setPadding(0, 20, 0, 10)
			.setOrigin(0.5)

		// Using Button
		this.usingButton = this.scene.add.graphics()
		this.usingButton.fillStyle(0xffb996)
		this.usingButton.fillRoundedRect(width / 2 - 168, 640, 336, 80, 14)
		this.usingButton.lineStyle(3, 0xd35e24)
		this.usingButton.strokeRoundedRect(width / 2 - 168, 640, 336, 80, 14)

		// Use Button
		this.useButton = this.scene.add
			.nineslice(width / 2 - 168, 640, 'sheet', 'button_hard.png', 336, 80)
			.setOrigin(0, 0)

		// set Button
		this.useButton
			.setInteractive()
			.on('pointerup', async () => await this.handleButtonUseCharacter())
		this.useText = i18n
			.createTranslatedText(scene, width / 2, 680 - 3, 'use_button')
			.setFontSize(32)
			.setPadding(0, 20, 0, 10)
			.setStroke('#9E461B', 6)
			.setColor('#FFFFFF')
			.setOrigin(0.5, 0.5)

		this.usingText = i18n
			.createTranslatedText(scene, width / 2, 680 - 3, 'using_button')
			.setFontSize(32)
			.setPadding(0, 20, 0, 10)
			.setStroke('#D35E24', 6)
			.setColor('#FFFFFF')
			.setOrigin(0.5, 0.5)
		// Initiate First Character
		this.charShift(0)
	}

	charShift(i: number): void {
		this.showingCharIndex =
			((this.showingCharIndex + i + this.charactersCount - 1) %
				this.charactersCount) +
			1 // prevent negative number
		const { width } = this.scene!.scale

		// Set Showing Character
		if (this.characters[this.showingCharIndex].unlocked) {
			// Unlocked Character
			// Character Text (Name)
			this.showingCharText
				?.setText(this.characters[this.showingCharIndex].name)
				.setStroke('#D35E24', 12)
				.setFontSize(32)

			// Character Img
			this.showingCharImg
				?.setTexture('sheet', this.getLogoCharacterById(this.showingCharIndex))
				.clearTint()
			// Character Box
			this.characterBox?.fillStyle(0x43a99e) // Green Box
			this.characterBox?.fillRoundedRect(width / 2 - 168, 504, 336, 120, 14)

			// Set Use Button
			this.useText?.setVisible(true).on('pointerup', () => this.useChar())
			if (this.showingCharIndex === this.usingCharIndex) {
				// Currently Using Character
				this.usingButton?.setVisible(true)
				this.useButton?.setVisible(false)
				this.useText?.setVisible(false)
				this.usingText?.setVisible(true)
			} else {
				// Other Characters
				this.usingButton?.setVisible(false)
				this.useButton?.setVisible(true)
				this.useText?.setVisible(true)
				this.usingText?.setVisible(false)
			}
		} else {
			// Locked Character
			// Character Text (Name)
			this.showingCharText
				?.setText('ยังไม่ปลดล็อค')
				.setStroke('#58595B', 12)
				.setFontSize(32)
			// Character Img
			this.showingCharImg
				?.setTexture('sheet', this.getLogoCharacterById(this.showingCharIndex))
				.setTintFill(0x000000)
			// Character Box
			this.characterBox?.fillStyle(0xacacac) // Gray Box
			this.characterBox?.fillRoundedRect(width / 2 - 168, 504, 336, 120, 14)

			// Set Use Button
			this.usingButton?.setVisible(false)
			this.useText?.setVisible(false)
			this.usingText?.setVisible(false)
			this.useButton?.setVisible(false)
		}
	}

	useChar(): void {
		this.usingCharIndex = this.showingCharIndex
		this.scene?.registry.set('selectedCharacterId', this.showingCharIndex)
		this.usingButton?.setVisible(true)
		this.useButton?.setVisible(false)
		this.useText?.setVisible(false)
		this.usingText?.setVisible(true)
	}

	getUsingCharIndex(): number {
		return this.usingCharIndex === undefined ? -1 : this.usingCharIndex
	}

	setFont(style: any): void {
		this.showingCharText?.setStyle(style)
		this.useText?.setStyle(style)
		this.usingText?.setStyle(style)
	}
}
