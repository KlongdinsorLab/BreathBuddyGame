import I18nSingleton from 'i18n/I18nSingleton'
import WebFont from 'webfontloader'
import { PlayerSlotStack } from 'component/ranking/playerSlotStack'
import { MARGIN } from 'config'
import supabaseAPIService from 'services/API/backend/supabaseAPIService'
import BackButton from 'component/ui/Button/BackButton'
import { logger } from 'services/logger'

export enum AccumulationType {
	ACCUMULATION_SCORE,
	ACCUMULATION_HEART,
}

export default class RankingScene extends Phaser.Scene {
	private key!: string
	private background!: Phaser.GameObjects.TileSprite
	private banner!: Phaser.GameObjects.NineSlice
	private redButtonLeft!: Phaser.GameObjects.NineSlice
	private redButtonRight!: Phaser.GameObjects.NineSlice
	private iconRanking!: Phaser.GameObjects.Image
	private iconLeft!: Phaser.GameObjects.Image
	private iconRight!: Phaser.GameObjects.Image
	private buttonBack!: Phaser.GameObjects.Image
	private buttonBackHitBox!: Phaser.GameObjects.Rectangle
	private scoreButton!: Phaser.GameObjects.Graphics
	private scoreButtonDisabled!: Phaser.GameObjects.Graphics
	private playedButton!: Phaser.GameObjects.Graphics
	private playedButtonDisabled!: Phaser.GameObjects.Graphics
	private OverlayLeftButton!: Phaser.GameObjects.NineSlice
	private OverlayRightButton!: Phaser.GameObjects.NineSlice
	private rankingBox!: Phaser.GameObjects.Graphics

	private headerText!: Phaser.GameObjects.Text
	private scoreButtonText!: Phaser.GameObjects.Text
	private scoreButtonTextDisabled!: Phaser.GameObjects.Text
	private playedButtonText!: Phaser.GameObjects.Text
	private playedButtonTextDisabled!: Phaser.GameObjects.Text

	private playerSlotStack!: PlayerSlotStack
	private accumulationType!: AccumulationType
	private maxPlayerSlot: number = 5
	private rankingIndex!: number

	//mockup data for test
	private currentPlayerScoreRank: number = 23
	private currentPlayerHeartRank: number = 2
	private totalPlayer: number = 20
	private currentPlayer: {
		id: string
		username: string
		total_score: number
		total_game: number
	} = {
		id: '2',
		username: 'สู้เขาสิน้องหญิง',
		total_score: 256000000,
		total_game: 90,
	}
	private currentPlayerJson!: {
		id: string
		username: string
		total_score: number
		total_game: number
	}[]
	private sortPlayerScoreJson1: {
		id: string
		username: string
		total_score: number
		total_game: number
	}[] = [
		{
			id: '1',
			username: 'น้องลาคูนี่จังงงงงงงงงงงงงงง',
			total_score: 512000000,
			total_game: 100,
		},
		{
			id: '2',
			username: 'สู้เขาสิน้องหญิง',
			total_score: 256000000,
			total_game: 90,
		},
		{
			id: '3',
			username: 'ญญญญญญญญญญญ',
			total_score: 128000000,
			total_game: 999,
		},
		{ id: '4', username: 'user4', total_score: 103, total_game: 70 },
		{ id: '5', username: 'user5', total_score: 102, total_game: 60 },
		{ id: '6', username: 'user6', total_score: 101, total_game: 77 },
		{ id: '7', username: 'user7', total_score: 100, total_game: 40 },
		{ id: '8', username: 'user8', total_score: 99, total_game: 35 },
		{ id: '9', username: 'user9', total_score: 99, total_game: 20 },
		{ id: '10', username: 'user10', total_score: 99, total_game: 10 },
		{ id: '11', username: 'user11', total_score: 98, total_game: 9 },
		{ id: '12', username: 'user12', total_score: 97, total_game: 6 },
		{ id: '13', username: 'user13', total_score: 96, total_game: 6 },
		{ id: '14', username: 'user14', total_score: 95, total_game: 6 },
		{ id: '15', username: 'user15', total_score: 94, total_game: 6 },
		{ id: '16', username: 'user16', total_score: 93, total_game: 6 },
		{ id: '17', username: 'user17', total_score: 92, total_game: 6 },
		{ id: '18', username: 'user18', total_score: 91, total_game: 6 },
		{ id: '19', username: 'user19', total_score: 90, total_game: 6 },
		{ id: '20', username: 'user20', total_score: 89, total_game: 6 },
	]
	private sortPlayerScoreJson2: {
		id: string
		username: string
		total_score: number
		total_game: number
	}[] = [
		{ id: '21', username: 'user21', total_score: 88, total_game: 100 },
		{ id: '22', username: 'user22', total_score: 87, total_game: 90 },
		{ id: '23', username: 'user23', total_score: 86, total_game: 999 },
		{ id: '24', username: 'user24', total_score: 85, total_game: 70 },
		{ id: '25', username: 'user25', total_score: 84, total_game: 60 },
		{ id: '26', username: 'user26', total_score: 83, total_game: 77 },
		{ id: '27', username: 'user27', total_score: 82, total_game: 40 },
		{ id: '28', username: 'user28', total_score: 81, total_game: 35 },
		{ id: '29', username: 'user29', total_score: 80, total_game: 20 },
		{ id: '30', username: 'user30', total_score: 79, total_game: 10 },
		{ id: '31', username: 'user31', total_score: 78, total_game: 9 },
		{ id: '32', username: 'user32', total_score: 77, total_game: 6 },
		{ id: '33', username: 'user33', total_score: 76, total_game: 6 },
		{ id: '34', username: 'user34', total_score: 75, total_game: 6 },
		{ id: '35', username: 'user35', total_score: 74, total_game: 6 },
		{ id: '36', username: 'user36', total_score: 73, total_game: 6 },
		{ id: '37', username: 'user37', total_score: 72, total_game: 6 },
		{ id: '38', username: 'user38', total_score: 71, total_game: 6 },
		{ id: '39', username: 'user39', total_score: 70, total_game: 6 },
		{ id: '40', username: 'user40', total_score: 69, total_game: 6 },
	]
	private sortPlayerHeartJson1: {
		id: string
		username: string
		total_score: number
		total_game: number
	}[] = [
		{ id: '3', username: 'user3', total_score: 104, total_game: 9999 },
		{ id: '23', username: 'user23', total_score: 86, total_game: 999 },
		{ id: '1', username: 'น้องลาคูนี่จัง', total_score: 111, total_game: 123 },
		{ id: '21', username: 'user21', total_score: 88, total_game: 111 },
		{ id: '2', username: 'สู้เขาสิน้องหญิง', total_score: 105, total_game: 90 },
		{ id: '22', username: 'user22', total_score: 87, total_game: 89 },
		{ id: '4', username: 'user4', total_score: 103, total_game: 88 },
		{ id: '24', username: 'user24', total_score: 85, total_game: 86 },
		{ id: '5', username: 'user5', total_score: 102, total_game: 84 },
		{ id: '25', username: 'user25', total_score: 84, total_game: 82 },
		{ id: '6', username: 'user6', total_score: 101, total_game: 79 },
		{ id: '26', username: 'user26', total_score: 83, total_game: 77 },
		{ id: '7', username: 'user7', total_score: 100, total_game: 44 },
		{ id: '27', username: 'user27', total_score: 82, total_game: 40 },
		{ id: '8', username: 'user8', total_score: 99, total_game: 39 },
		{ id: '28', username: 'user28', total_score: 81, total_game: 37 },
		{ id: '9', username: 'user9', total_score: 99, total_game: 24 },
		{ id: '29', username: 'user29', total_score: 80, total_game: 23 },
		{ id: '10', username: 'user10', total_score: 99, total_game: 22 },
		{ id: '30', username: 'user30', total_score: 79, total_game: 21 },
	]
	private sortPlayerHeartJson2: {
		id: string
		username: string
		total_score: number
		total_game: number
	}[] = [
		{ id: '11', username: 'user11', total_score: 98, total_game: 20 },
		{ id: '31', username: 'user31', total_score: 78, total_game: 19 },
		{ id: '12', username: 'user12', total_score: 97, total_game: 18 },
		{ id: '13', username: 'user13', total_score: 96, total_game: 17 },
		{ id: '14', username: 'user14', total_score: 95, total_game: 16 },
		{ id: '15', username: 'user15', total_score: 94, total_game: 15 },
		{ id: '16', username: 'user16', total_score: 93, total_game: 14 },
		{ id: '17', username: 'user17', total_score: 92, total_game: 13 },
		{ id: '18', username: 'user18', total_score: 91, total_game: 12 },
		{ id: '19', username: 'user19', total_score: 90, total_game: 11 },
		{ id: '20', username: 'user20', total_score: 89, total_game: 10 },
		{ id: '32', username: 'user32', total_score: 77, total_game: 9 },
		{ id: '33', username: 'user33', total_score: 76, total_game: 8 },
		{ id: '34', username: 'user34', total_score: 75, total_game: 7 },
		{ id: '35', username: 'user35', total_score: 74, total_game: 6 },
		{ id: '36', username: 'user36', total_score: 73, total_game: 5 },
		{ id: '37', username: 'user37', total_score: 72, total_game: 4 },
		{ id: '38', username: 'user38', total_score: 71, total_game: 3 },
		{ id: '39', username: 'user39', total_score: 70, total_game: 2 },
		{ id: '40', username: 'user40', total_score: 69, total_game: 1 },
	]

	private apiService!: supabaseAPIService

	constructor() {
		super('ranking')
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
	}
	async create() {
		this.apiService = new supabaseAPIService()

		await this.handleData()

		const { width, height } = this.scale
		const self = this
		this.rankingIndex = 0
		this.accumulationType = AccumulationType.ACCUMULATION_SCORE
		this.currentPlayerJson = this.sortPlayerScoreJson1

		this.background = this.add
			.tileSprite(0, 0, width, height, 'submenu_bg')
			.setOrigin(0)
			.setScrollFactor(0, 0)

		new BackButton(this, this.key)

		this.iconRanking = this.add
			.image(width / 2, 110, 'icon', 'icon_ranking.png')
			.setOrigin(0.5, 0.5)
			.setScale(2.5)

		this.banner = this.add
			.nineslice(width / 2, 228, 'heading', 'heading_red.png', 528, 128)
			.setOrigin(0.5, 0.5)

		this.headerText = I18nSingleton.getInstance()
			.createTranslatedText(this, width / 2, 212, 'ranking_title')
			.setAlign('center')
			.setOrigin(0.5, 0.5)

		this.createScoreButton()
		this.createPlayedButton()
		this.createScoreDisabledButton()
		this.createPlayedDisabledButton()
		this.setScoreButtonDisabled(false)
		this.setPlayedButtonDisabled(true)

		//ranking box (background of the ranking list)
		this.rankingBox = this.add.graphics()
		this.rankingBox.fillStyle(0xfff6e5)
		this.rankingBox.fillRoundedRect(MARGIN, 459, 624, 696, 40)
		this.rankingBox.lineStyle(6, 0xd35e24)
		this.rankingBox.strokeRoundedRect(MARGIN, 459, 624, 696, 40)

		this.playerSlotStack = new PlayerSlotStack(
			this,
			this.sortPlayerScoreJson1,
			this.currentPlayer,
			this.accumulationType,
			{ x: MARGIN, y: 459 },
			this.rankingIndex,
			this.maxPlayerSlot,
			this.currentPlayerScoreRank,
			this.currentPlayerHeartRank,
		)
		this.playerSlotStack.createPlayerSlot()
		this.playerSlotStack.createCurrentPlayerSlot()

		this.redButtonLeft = this.add
			.nineslice(width / 2 + 86, 1160, 'button', 'button_red40.png', 96, 96)
			.setOrigin(0.5, 0.5)
			.setInteractive()
			.on('pointerup', () => {
				this.decreaseRankingIndex()
				this.updateFont()
			})
			.setDepth(1)

		this.iconLeft = this.add
			.image(width / 2 + 86, 1155, 'icon', 'icon_white_arrow.png')
			.setOrigin(0.5, 0.5)
			.setDepth(1)

		this.redButtonRight = this.add
			.nineslice(width / 2 + 214, 1160, 'button', 'button_red40.png', 96, 96)
			.setOrigin(0.5, 0.5)
			.setInteractive()
			.on('pointerup', () => {
				this.increaseRankingIndex()
				this.updateFont()
			})
			.setDepth(1)

		this.iconRight = this.add
			.image(width / 2 + 214, 1155, 'icon', 'icon_white_arrow.png')
			.setOrigin(0.5, 0.5)
			.setFlipX(true)
			.setDepth(1)

		this.createOverlayOnButtonLeft()
		this.createOverlayOnButtonRight()

		WebFont.load({
			google: {
				families: ['Mali:500,600,700', 'Jua'],
			},
			active: () => {
				self.playerSlotStack.initFontStyle()
				self.headerText
					.setStyle({
						fontFamily: 'Mali',
						fontWeight: 600,
						color: 'white',
					})
					.setFontSize(42)
					.setStroke('#9E461B', 12)
					.setLineSpacing(16)

				self.scoreButtonText
					.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
						color: 'white',
					})
					.setFontSize(32)
					.setStroke('#327F76', 5)

				self.playedButtonText
					.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
						color: 'white',
					})
					.setFontSize(32)
					.setStroke('#BF7F03', 5)

				self.scoreButtonTextDisabled
					.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
						color: 'white',
					})
					.setFontSize(32)
					.setStroke('#958E83', 5)

				self.playedButtonTextDisabled
					.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
						color: 'white',
					})
					.setFontSize(32)
					.setStroke('#958E83', 5)
			},
		})
	}
	update(): void {}

	private async handleData() {
		try {
			const response = await this.apiService.getRanking()
			const data = response.response
			logger.verbose(
				this.scene.key,
				`Api call success, Ranking: ${JSON.stringify(data)}`,
			)

			this.sortPlayerScoreJson1 = data.ranking_by_score.slice(0, 20)
			this.sortPlayerScoreJson2 = []

			this.sortPlayerHeartJson1 = data.ranking_by_play.slice(0, 20)
			this.sortPlayerHeartJson2 = []

			this.totalPlayer = data.ranking_by_score.length

			this.currentPlayer = data.ranking_by_score.find(
				(element: {
					id: string
					username: string
					total_score: number
					total_game: number
				}) => element.username === this.scene.scene.registry.get('username'),
			)
		} catch (error) {
			logger.error(this.scene.key, `Api call failed: ${error}`)
		}

		this.currentPlayerHeartRank =
			this.sortPlayerHeartJson1
				.map(function (e) {
					return e.id
				})
				.indexOf(this.currentPlayer.id) + 1
		this.currentPlayerScoreRank =
			this.sortPlayerScoreJson1
				.map(function (e) {
					return e.id
				})
				.indexOf(this.currentPlayer.id) + 1

		if (this.currentPlayerHeartRank === 0)
			this.currentPlayerHeartRank =
				this.sortPlayerHeartJson2.indexOf(this.currentPlayer) + 1
		if (this.currentPlayerScoreRank === 0)
			this.currentPlayerScoreRank =
				this.sortPlayerScoreJson2.indexOf(this.currentPlayer) + 1
	}

	private createScoreButton(): void {
		this.scoreButton = this.add.graphics()
		this.scoreButton.fillStyle(0x43a99e)
		this.scoreButton.fillRoundedRect(this.scale.width / 2 - 272, 384, 264, 80, {
			tl: 40,
			tr: 40,
			bl: 0,
			br: 0,
		})
		this.scoreButton.lineStyle(6, 0x327f76)
		this.scoreButton.strokeRoundedRect(
			this.scale.width / 2 - 272,
			384,
			264,
			80,
			{ tl: 40, tr: 40, bl: 0, br: 0 },
		)

		this.scoreButtonText = I18nSingleton.getInstance()
			.createTranslatedText(
				this,
				this.scale.width / 2 - 140,
				424,
				'accumulate_score',
			)
			.setAlign('center')
			.setOrigin(0.5, 0.5)
	}

	private createPlayedButton(): void {
		this.playedButton = this.add.graphics()
		this.playedButton.fillStyle(0xffaa04)
		this.playedButton.fillRoundedRect(this.scale.width / 2 + 8, 384, 264, 80, {
			tl: 40,
			tr: 40,
			bl: 0,
			br: 0,
		})
		this.playedButton.lineStyle(6, 0xbf7f03)
		this.playedButton.strokeRoundedRect(
			this.scale.width / 2 + 8,
			384,
			264,
			80,
			{ tl: 40, tr: 40, bl: 0, br: 0 },
		)

		this.playedButtonText = I18nSingleton.getInstance()
			.createTranslatedText(
				this,
				this.scale.width / 2 + 140,
				424,
				'accumulate_play',
			)
			.setAlign('center')
			.setOrigin(0.5, 0.5)
	}

	private createScoreDisabledButton(): void {
		this.scoreButtonDisabled = this.add.graphics()
		this.scoreButtonDisabled.fillStyle(0xc7beaf)
		this.scoreButtonDisabled.fillRoundedRect(
			this.scale.width / 2 - 272,
			384,
			264,
			80,
			{ tl: 40, tr: 40, bl: 0, br: 0 },
		)
		this.scoreButtonDisabled.lineStyle(6, 0x958e83)
		this.scoreButtonDisabled.strokeRoundedRect(
			this.scale.width / 2 - 272,
			384,
			264,
			80,
			{ tl: 40, tr: 40, bl: 0, br: 0 },
		)

		this.scoreButtonTextDisabled = I18nSingleton.getInstance()
			.createTranslatedText(
				this,
				this.scale.width / 2 - 140,
				424,
				'accumulate_score',
			)
			.setAlign('center')
			.setOrigin(0.5, 0.5)
		this.scoreButtonTextDisabled.setInteractive().on('pointerup', () => {
			this.setPlayedButtonDisabled(true)
			this.setScoreButtonDisabled(false)
			this.setButtonOverlayLeft(true)
			if (this.totalPlayer <= 5) this.setButtonOverlayRight(true)
			else this.setButtonOverlayRight(false)
			this.rankingIndex = 0
			this.accumulationType = AccumulationType.ACCUMULATION_SCORE
			this.currentPlayerJson = this.setCurrentPlayerData()
			this.playerSlotStack.setPlayerData(this.currentPlayerJson)
			this.playerSlotStack.setAccumulationType(this.accumulationType)
			this.playerSlotStack.clearSlot()
			this.playerSlotStack.createPlayerSlot()
			this.playerSlotStack.createCurrentPlayerSlot()
			this.updateFont()
		})
	}

	private createPlayedDisabledButton(): void {
		this.playedButtonDisabled = this.add.graphics()
		this.playedButtonDisabled.fillStyle(0xc7beaf)
		this.playedButtonDisabled.fillRoundedRect(
			this.scale.width / 2 + 8,
			384,
			264,
			80,
			{ tl: 40, tr: 40, bl: 0, br: 0 },
		)
		this.playedButtonDisabled.lineStyle(6, 0x958e83)
		this.playedButtonDisabled.strokeRoundedRect(
			this.scale.width / 2 + 8,
			384,
			264,
			80,
			{ tl: 40, tr: 40, bl: 0, br: 0 },
		)

		this.playedButtonTextDisabled = I18nSingleton.getInstance()
			.createTranslatedText(
				this,
				this.scale.width / 2 + 140,
				424,
				'accumulate_play',
			)
			.setAlign('center')
			.setOrigin(0.5, 0.5)
		this.playedButtonTextDisabled.setInteractive().on('pointerup', () => {
			this.setScoreButtonDisabled(true)
			this.setPlayedButtonDisabled(false)
			this.setButtonOverlayLeft(true)
			if (this.totalPlayer <= 5) this.setButtonOverlayRight(true)
			else this.setButtonOverlayRight(false)
			this.rankingIndex = 0
			this.accumulationType = AccumulationType.ACCUMULATION_HEART
			this.currentPlayerJson = this.setCurrentPlayerData()
			this.playerSlotStack.setPlayerData(this.currentPlayerJson)
			this.playerSlotStack.setAccumulationType(this.accumulationType)
			this.playerSlotStack.clearSlot()
			this.playerSlotStack.createPlayerSlot()
			this.playerSlotStack.createCurrentPlayerSlot()
			this.updateFont()
		})
	}

	private createOverlayOnButtonLeft(): void {
		this.OverlayLeftButton = this.add
			.nineslice(720 / 2 + 86, 1160, 'button', 'button_red40.png', 96, 96)
			.setOrigin(0.5, 0.5)
			.setAlpha(0.6)
			.setTint(0x000000)
			.setActive(true)
			.setVisible(true)
			.setDepth(1)
	}

	private createOverlayOnButtonRight(): void {
		this.OverlayRightButton = this.add
			.nineslice(720 / 2 + 214, 1160, 'button', 'button_red40.png', 96, 96)
			.setOrigin(0.5, 0.5)
			.setAlpha(0.6)
			.setTint(0x000000)
			.setActive(false)
			.setVisible(false)
			.setDepth(1)

		if (this.totalPlayer <= 5) {
			this.OverlayRightButton.setVisible(true)
		}
	}

	private setButtonOverlayLeft(isActive: boolean): void {
		this.OverlayLeftButton.setVisible(isActive)
		this.OverlayLeftButton.setActive(isActive)
	}

	private setButtonOverlayRight(isActive: boolean): void {
		this.OverlayRightButton.setVisible(isActive)
		this.OverlayRightButton.setActive(isActive)
	}

	private setScoreButtonDisabled(isActive: boolean): void {
		this.scoreButtonDisabled.setVisible(isActive)
		this.scoreButtonTextDisabled.setVisible(isActive)
		this.scoreButtonDisabled.setActive(isActive)
		this.scoreButtonTextDisabled.setActive(isActive)
	}

	private setPlayedButtonDisabled(isActive: boolean): void {
		this.playedButtonDisabled.setVisible(isActive)
		this.playedButtonTextDisabled.setVisible(isActive)
		this.playedButtonDisabled.setActive(isActive)
		this.playedButtonTextDisabled.setVisible(isActive)
	}

	//todo: fetch data from backend
	private setCurrentPlayerData(): {
		id: string
		username: string
		total_score: number
		total_game: number
	}[] {
		if (this.accumulationType === AccumulationType.ACCUMULATION_SCORE) {
			const fileNumber = Math.floor(this.rankingIndex / 20)
			if (fileNumber === 0) {
				return this.sortPlayerScoreJson1
			} else {
				return this.sortPlayerScoreJson2
			}
		} else {
			const fileNumber = Math.floor(this.rankingIndex / 20)
			if (fileNumber === 0) {
				return this.sortPlayerHeartJson1
			} else {
				return this.sortPlayerHeartJson2
			}
		}
	}

	private increaseRankingIndex(): void {
		if (this.rankingIndex + this.maxPlayerSlot >= this.totalPlayer) {
			this.setButtonOverlayRight(true)
			return
		}
		this.setButtonOverlayLeft(false)
		this.setButtonOverlayRight(false)
		this.rankingIndex += this.maxPlayerSlot
		if (this.rankingIndex + this.maxPlayerSlot >= this.totalPlayer) {
			this.setButtonOverlayRight(true)
		}
		// if (this.rankingIndex % 20 === 0) {
		// 	this.currentPlayerJson = this.setCurrentPlayerData()
		// 	this.playerSlotStack.setPlayerData(this.currentPlayerJson)
		// 	return
		// }
		this.playerSlotStack.nextPage()
	}

	private decreaseRankingIndex(): void {
		if (this.rankingIndex <= 0) {
			this.setButtonOverlayLeft(true)
			return
		}
		this.setButtonOverlayLeft(false)
		this.setButtonOverlayRight(false)
		if (this.rankingIndex % 20 <= 0) {
			this.rankingIndex -= this.maxPlayerSlot
			this.currentPlayerJson = this.setCurrentPlayerData()
			this.playerSlotStack.setRank(this.rankingIndex)
			this.playerSlotStack.setPlayerData(this.currentPlayerJson)
			return
		}
		this.rankingIndex -= this.maxPlayerSlot
		if (this.rankingIndex <= 0) {
			this.setButtonOverlayLeft(true)
		}
		this.playerSlotStack.previousPage()
	}

	private updateFont(): void {
		const self = this
		WebFont.load({
			google: {
				families: ['Mali:500,600,700', 'Jua'],
			},
			active: () => {
				self.playerSlotStack?.initFontStyle()
			},
		})
	}

	destroy(): void {
		this.background.destroy()
		this.banner.destroy()
		this.redButtonLeft.destroy()
		this.redButtonRight.destroy()
		this.iconRanking.destroy()
		this.iconLeft.destroy()
		this.iconRight.destroy()
		this.buttonBack.destroy()
		this.buttonBackHitBox.destroy()
		this.scoreButton.destroy()
		this.scoreButtonDisabled.destroy()
		this.playedButton.destroy()
		this.playedButtonDisabled.destroy()
		this.OverlayLeftButton.destroy()
		this.OverlayRightButton.destroy()
		this.rankingBox.destroy()

		this.headerText.destroy()
		this.scoreButtonText.destroy()
		this.scoreButtonTextDisabled.destroy()
		this.playedButtonText.destroy()
		this.playedButtonTextDisabled.destroy()

		this.playerSlotStack.destroy()
	}
}
