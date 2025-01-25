import Phaser from 'phaser'
import WebFont from 'webfontloader'
import I18nSingleton from 'i18n/I18nSingleton'
import supabaseAPIService from 'services/API/backend/supabaseAPIService'
import { logger } from 'services/logger'

export default class DisplayNameScene extends Phaser.Scene {
	private texts: Phaser.GameObjects.Text[] = []
	private inputHTML: HTMLElement | null = null

	constructor() {
		super('display name')
	}

	private loadingFont(texts: Phaser.GameObjects.Text[]): void {
		WebFont.load({
			google: {
				families: ['Mali:Bold 700', 'Sarabun:Regular 400'],
			},
			active: () => {
				const menuUiStyle = {
					fontFamily: 'Mali',
					fontStyle: 'Bold',
					fontWeight: 700,
				}

				texts.forEach((text) => {
					text.setStyle(menuUiStyle)
					text.setPadding(0, 20, 0, 10)
				})

				// input
				if (this.inputHTML) {
					this.inputHTML.style.fontFamily = 'Mali'
					this.inputHTML.style.fontStyle = 'Bold'
					this.inputHTML.style.fontWeight = '700'
				}
			},
		})
	}

	private async handleSubmit(): Promise<void> {
		// set username
		if (this.inputHTML) {
			const apiService = new supabaseAPIService()
			const inputElement = <HTMLInputElement>this.inputHTML
			const username: string = inputElement.value
			if (username !== '') {
				try {
					const data = await apiService.updateUsername(username)
					logger.info(
						this.scene.key,
						`Api call success, Response: ${JSON.stringify(data.response)}`,
					)
					this.scene.start('redeem')
					this.registry.set('username', username)
					return
				} catch (error) {
					logger.error(this.scene.key, `Api call failed: ${error}`)
				}
			}
		}
	}

	init() {
		this.texts = []
		this.inputHTML = null
	}

	preload() {
		this.load.script(
			'webfont',
			'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
		)
		this.load.image('bg', 'assets/background/bg/landing page_bg.png')
		this.load.atlas(
			'button',
			'assets/ui/button_spritesheet.png',
			'assets/ui/button_spritesheet.json',
		)
		this.load.html('usernameBox', 'html/inputUsername.html')
	}

	create() {
		const { width, height } = this.scale
		const i18n = I18nSingleton.getInstance()

		this.add
			.tileSprite(0, 0, width, height, 'bg')
			.setOrigin(0)
			.setScrollFactor(0, 0) // BG image
		this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0, 0) // Black Window

		const headingText = i18n
			.createTranslatedText(this, 231, 364, `display_name_heading`)
			.setColor('#FFFFFF')
			.setStroke('#D35E24', 12)
			.setFontSize(40)
			.setPadding(0, 20, 0, 10)
			.setOrigin(0, 0)
		this.texts.push(headingText)

		// input
		const element = this.add
			.dom(96, 480)
			.setOrigin(0)
			.createFromCache('usernameBox')
		this.inputHTML = element.getChildByName(
			'display-name-username',
		) as HTMLElement

		// submit
		// button
		this.add
			.nineslice(172, 768, 'button', 'button_red.png', 376, 96, 20, 20, 20, 30)
			.setOrigin(0, 0)
			.setInteractive()
			.on('pointerup', async () => {
				await this.handleSubmit()
			})
		// text
		const submitText = i18n
			.createTranslatedText(this, 313, 774, `submit`)
			.setColor('#FFFFFF')
			.setStroke('#9E471B', 6)
			.setFontSize(32)
			.setPadding(0, 20, 0, 10)
			.setOrigin(0, 0)
		this.texts.push(submitText)

		// load font
		this.loadingFont(this.texts)
	}
}
