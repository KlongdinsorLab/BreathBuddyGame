import I18nSingleton from 'i18n/I18nSingleton'
import supabaseAPIService from 'services/API/backend/supabaseAPIService'
import { logger } from 'services/logger'

export default class difficultySelectUi {
	private scene!: Phaser.Scene
	//Difficulty
	private difficulty: number | undefined // from database

	/*private easyButton : Phaser.GameObjects.NineSlice | undefined
    private mediumButton : Phaser.GameObjects.NineSlice | undefined
    private hardButton : Phaser.GameObjects.NineSlice | undefined*/

	private disableEasyButton: Phaser.GameObjects.Graphics | undefined
	private disableMediumButton: Phaser.GameObjects.Graphics | undefined
	private disableHardButton: Phaser.GameObjects.Graphics | undefined

	private easyText: Phaser.GameObjects.Text | undefined
	private mediumText: Phaser.GameObjects.Text | undefined
	private hardText: Phaser.GameObjects.Text | undefined

	constructor(scene: Phaser.Scene, difficulty?: number) {
		this.scene = scene
		const i18n = I18nSingleton.getInstance()

		this.difficulty = difficulty === undefined ? 0 : difficulty
		const { width } = scene.scale

		// Difficulty Boxes
		scene.add
			.nineslice(width / 2 - 96, 1088, 'sheet', 'button_medium.png', 144, 80)
			.setOrigin(1, 0)
		scene.add
			.nineslice(width / 2, 1088, 'sheet', 'button_medium.png', 144, 80)
			.setOrigin(0.5, 0)
		scene.add
			.nineslice(width / 2 + 96, 1088, 'sheet', 'button_medium.png', 144, 80)
			.setOrigin(0, 0)

		// Gray boxes
		// Easy
		this.disableEasyButton = scene.add.graphics()
		this.disableEasyButton.fillStyle(0xc7beb0)
		this.disableEasyButton.fillRoundedRect(120, 1088, 144, 80, 14)

		// Medium
		this.disableMediumButton = scene.add.graphics()
		this.disableMediumButton.fillStyle(0xc7beb0)
		this.disableMediumButton.fillRoundedRect(288, 1088, 144, 80, 14)

		// Hard
		this.disableHardButton = scene.add.graphics()
		this.disableHardButton.fillStyle(0xc7beb0)
		this.disableHardButton.fillRoundedRect(456, 1088, 144, 80, 14)

		// Set button in these gray boxes
		this.disableEasyButton
			.setInteractive(
				new Phaser.Geom.Rectangle(120, 1088, 144, 80),
				Phaser.Geom.Rectangle.Contains,
			)
			.on('pointerup', async () => this.handleChangeDifficulty(1))
		this.disableMediumButton
			.setInteractive(
				new Phaser.Geom.Rectangle(288, 1088, 144, 80),
				Phaser.Geom.Rectangle.Contains,
			)
			.on('pointerup', async () => this.handleChangeDifficulty(2))
		this.disableHardButton
			.setInteractive(
				new Phaser.Geom.Rectangle(456, 1088, 144, 80),
				Phaser.Geom.Rectangle.Contains,
			)
			.on('pointerup', async () => this.handleChangeDifficulty(3))

		// Difficulty Texts
		this.easyText = i18n
			.createTranslatedText(
				scene,
				width / 2 - 168,
				1088 + 40,
				'difficulty_easy',
			)
			.setFontSize(28)
			.setOrigin(0.5, 0.5)
		this.mediumText = i18n
			.createTranslatedText(scene, width / 2, 1088 + 40, 'difficulty_medium')
			.setFontSize(28)
			.setOrigin(0.5, 0.5)
		this.hardText = i18n
			.createTranslatedText(
				scene,
				width / 2 + 168,
				1088 + 40,
				'difficulty_hard',
			)
			.setFontSize(28)
			.setOrigin(0.5, 0.5)

		// Initiate Difficulty
		this.changeDifficulty(this.difficulty)
	}

	private async handleChangeDifficulty(difficulty: number) {
		const apiService = new supabaseAPIService()
		try {
			const data = await apiService.updateCurrentDifficulty(difficulty)
			logger.info(
				this.scene.scene.key,
				`Api call success, Response: ${JSON.stringify(data)}`,
			)
		} catch (error) {
			logger.error(this.scene.scene.key, `Api call failed: ${error}`)
		}
		// change ui
		this.changeDifficulty(difficulty)
	}

	changeDifficulty(difficulty: number): void {
		this.difficulty = difficulty
		// Set Difficulty
		if (this.difficulty === 1) {
			// Easy
			// Set Button
			this.disableEasyButton?.setVisible(false)
			this.disableMediumButton?.setVisible(true)
			this.disableHardButton?.setVisible(true)

			// Set Text
			this.easyText?.setStroke('#327F76', 6)
			this.mediumText?.setStroke('#BF7F03', 0)
			this.hardText?.setStroke('#9E461B', 0)
		}
		if (this.difficulty === 2) {
			// Medium
			this.disableEasyButton?.setVisible(true)
			this.disableMediumButton?.setVisible(false)
			this.disableHardButton?.setVisible(true)

			// Set Text
			this.easyText?.setStroke('#327F76', 0)
			this.mediumText?.setStroke('#BF7F03', 6)
			this.hardText?.setStroke('#9E461B', 0)
		}
		if (this.difficulty === 3) {
			// Hard
			this.disableEasyButton?.setVisible(true)
			this.disableMediumButton?.setVisible(true)
			this.disableHardButton?.setVisible(false)

			// Set Text
			this.easyText?.setStroke('#327F76', 0)
			this.mediumText?.setStroke('#BF7F03', 0)
			this.hardText?.setStroke('#9E461B', 6)
		}
	}

	getDifficulty(): number {
		return this.difficulty === undefined ? -1 : this.difficulty
	}

	setFont(style: any): void {
		this.easyText?.setStyle(style)
		this.mediumText?.setStyle(style)
		this.hardText?.setStyle(style)
	}
}
