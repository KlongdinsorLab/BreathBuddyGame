import Phaser from 'phaser'
import I18nSingleton from 'i18n/I18nSingleton'
import WebFont from 'webfontloader'
import { MARGIN } from 'config'
import boosterBar from 'component/booster/boosterBar'
import { BoosterName } from 'component/booster/booster'
import supabaseAPIService from 'services/API/backend/supabaseAPIService'
import { logger } from 'services/logger'
import { GameState } from 'component/GameState'

export let boosters: BoosterName[] = []

export default class RedeemScene extends Phaser.Scene {
	private bgm?: Phaser.Sound.BaseSound
	private headerText!: Phaser.GameObjects.Text
	private missionDescription!: Phaser.GameObjects.Text
	private redeemBoosterText!: Phaser.GameObjects.Text
	private buttonText!: Phaser.GameObjects.Text

	private buttonIcon!: Phaser.GameObjects.Image
	private buttonRed!: Phaser.GameObjects.NineSlice
	private buttonGrey!: Phaser.GameObjects.NineSlice
	private banner!: Phaser.GameObjects.NineSlice
	private boosterBar!: boosterBar

	init({ bgm }: { bgm: any }) {
		this.bgm = bgm
	}

	constructor() {
		super('redeem')
	}
	preload() {
		this.load.script(
			'webfont',
			'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
		)
		this.load.image(
			'landing_page_bg',
			'assets/background/bg/landing page_bg.png',
		)

		//spritesheet
		this.load.atlas(
			'icon',
			'assets/icon/icon_spritesheet.png',
			'assets/icon/icon_spritesheet.json',
		)
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

		//booster
		this.load.image('booster_selectedMark', 'assets/dropItem/selectedMark.png')
		this.load.atlas(
			'dropItem',
			'assets/dropItem/dropitem_spritesheet.png',
			'assets/dropItem/dropitem_spritesheet.json',
		)
	}
	async create() {
		const { width, height } = this.scale
		const self = this

		const apiService = new supabaseAPIService()

		//clear boosters
		boosters.length = 0

		//todo: remove this, load background from other scene
		this.add
			.tileSprite(0, 0, width, height, 'landing_page_bg')
			.setOrigin(0)
			.setScrollFactor(0, 0)
		this.add.rectangle(width / 2, height / 2, width, height, 0x303030, 0.6)

		//popup box
		const box = this.add.graphics()
		box.fillStyle(0xfff6e5)
		box.fillRoundedRect(MARGIN, 208, 624, 936, 20)
		box.lineStyle(6, 0xd35e24)
		box.strokeRoundedRect(MARGIN, 208, 624, 936, 20)

		//line
		const line = this.add.graphics()
		line.fillStyle(0xd35e24)
		line.fillRoundedRect(MARGIN * 2, 426, 527, 6, 3)

		//banner
		this.banner = this.add
			.nineslice(width / 2, 138, 'heading', 'heading_red mission.png', 562, 160)
			.setOrigin(0.5, 0)

		//mission title
		this.headerText = I18nSingleton.getInstance()
			.createTranslatedText(this, width / 2, 138, 'redeem_title')
			.setAlign('center')
			.setOrigin(0.5, 0)

		//mission description
		this.missionDescription = I18nSingleton.getInstance()
			.createTranslatedText(this, width / 2, 298, 'redeem_mission_description')
			.setAlign('center')
			.setOrigin(0.5, 0)

		//redeem booster text
		this.redeemBoosterText = I18nSingleton.getInstance()
			.createTranslatedText(this, width / 2, 460, 'redeem_booster_text')
			.setAlign('center')
			.setOrigin(0.5, 0)

		try {
			//boosters
			const boosterData = await apiService.getBoosterRedeem()
			const boosterJson = boosterData.response
			logger.verbose(
				this.scene.key,
				`Api call success, Booster redeem: ${boosterJson}`,
			)
			this.boosterBar = new boosterBar(this, boosterJson)
		} catch (error) {
			logger.error(this.scene.key, `Api call failed: ${error}`)
		}

		//button
		this.buttonGrey = this.add
			.nineslice(
				MARGIN * 2,
				1016,
				'button',
				'button_grey.png',
				128,
				96,
				20,
				20,
				20,
				30,
			)
			.setOrigin(0, 0)
			.setInteractive()
			.on('pointerup', () => {
				this.destroy()
				this.scene.stop()
				this.scene.start('home', { bgm: this.bgm })
			})

		this.buttonIcon = this.add.image(
			MARGIN * 2 + 64,
			1016 + 44,
			'icon',
			'icon_back.png',
		)

		this.buttonRed = this.add
			.nineslice(
				(MARGIN * 11) / 2,
				1016,
				'button',
				'button_red.png',
				376,
				96,
				20,
				20,
				20,
				30,
			)
			.setOrigin(0, 0)
			.setInteractive()
			.on('pointerup', async () => {
				this.buttonRed.setInteractive().off('pointerup')

				boosters = this.boosterBar.getBooster()

				let boosterId = 0
				if (boosters.length > 0) {
					switch (boosters[0]) {
						case BoosterName.BOOSTER_1:
							boosterId = 1
							break
						case BoosterName.BOOSTER_2:
							boosterId = 2
							break
						case BoosterName.BOOSTER_3:
							boosterId = 3
							break
						case BoosterName.BOOSTER_4:
							boosterId = 4
							break
						case BoosterName.BOOSTER_5:
							boosterId = 5
							break
						case BoosterName.BOOSTER_RARE1:
							boosterId = 6
							break
						case BoosterName.BOOSTER_RARE2:
							boosterId = 7
							break
					}
				}

				try {
					const gameSession = (await apiService.startGameSession(boosterId))
						.response
					logger.info(
						this.scene.key,
						`Api call success, Response: ${JSON.stringify(gameSession)}`,
					)
					this.scene.scene.registry.set(
						'booster_drop_id',
						gameSession.booster_drop_id,
					)
					this.scene.scene.registry.set('boss_id', gameSession.boss_id)
					
					const gameCount = this.registry.get('gamesPlayedThisSession')
					
					this.registry.set('gamesPlayedThisSession', gameCount + 1)
					this.registry.set('gameState', GameState.IN_GAME)
				} catch (error) {
					logger.error(this.scene.key, `Api call failed: ${error}`)
				}

				this.destroy()
				this.scene.stop()

				this.scene.start('life_count', { bgm: this.bgm })
			})

		this.buttonText = I18nSingleton.getInstance()
			.createTranslatedText(
				this,
				(MARGIN * 11) / 2 + 188,
				1016 + 48,
				'redeem_button_text',
			)
			.setAlign('center')
			.setOrigin(0.5, 0.5)

		WebFont.load({
			google: {
				families: ['Mali:500,600,700', 'Jua'],
			},
			active: () => {
				self.boosterBar.initFontStyle()
				self.boosterBar.boosterFontStyle()

				self.headerText
					.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
						color: 'white',
					})
					.setFontSize(64)
					.setStroke('#9E461B', 12)
					.setLineSpacing(16)

				self.missionDescription
					.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
					})
					.setFontSize(32)
					.setColor('#57453B')
					.setLineSpacing(16)

				self.redeemBoosterText
					.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
					})
					.setFontSize(32)
					.setColor('#D35E24')
					.setLineSpacing(16)

				self.buttonText
					.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
						color: 'white',
					})
					.setFontSize(32)
					.setStroke('#9E461B', 6)
					.setLineSpacing(16)
			},
		})
	}
	update() {}

	destroy() {
		this.boosterBar.destroy()
		this.buttonText.destroy()
		this.redeemBoosterText.destroy()
		this.missionDescription.destroy()
		this.buttonGrey.destroy()
		this.buttonRed.destroy()
		this.buttonIcon.destroy()
		this.headerText.destroy()
		this.banner.destroy()
	}
}
