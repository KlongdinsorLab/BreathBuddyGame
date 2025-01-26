/* eslint-disable @typescript-eslint/no-this-alias */
import Phaser from 'phaser'
import I18nSingleton from 'i18n/I18nSingleton'
import { MARGIN, MEDIUM_FONT_SIZE } from 'config'
import WebFont from 'webfontloader'
import TimeService from 'services/timeService'
import RankingButton from 'component/ui/Button/RankingButton'
import HomeTopBar from 'component/ui/home/HomeTopBar'
import Heart from 'component/ui/Heart'
import InstructionButton from 'component/ui/Button/InstructionButton.'
import PlayButton from 'component/ui/Button/PlayButton'
import AchievementButton from 'component/ui/Button/AchievementButton'
import SettingButton from 'component/ui/Button/SettingButton'
import SoundToggle from 'component/ui/home/SoundToggle'
import { PlayerDTO } from 'services/API/definition/responseDTO'
import supabaseAPIService from 'services/API/backend/supabaseAPIService'
import { logger } from 'services/logger'
import { GameState } from 'component/GameState'

const ReminderText = {
	firstRound: 'home_reminder_first_play',
	heartEmpty: 'home_reminder_empty_heart',
	playTomorrow: 'home_reminder_play_tomorrow',
}

export default class HomeScene extends Phaser.Scene {
	private bgm?: Phaser.Sound.BaseSound
	private heart1!: Heart
	private heart2!: Heart
	private playCount!: number
	private reminderCase: keyof typeof ReminderText = 'firstRound'
	private isShowReminder = false
	private playButton!: PlayButton
	private achievementButton!: AchievementButton
	private instructionButton!: InstructionButton
	private rankingButton!: RankingButton
	private settingButton!: SettingButton
	private timeService!: TimeService
	private reminderText!: Phaser.GameObjects.Text
	private playerData!: PlayerDTO
	private apiService!: supabaseAPIService
	private isLoading!: boolean

	constructor() {
		super('home')
	}

	private async handleData() {
		try {
			const response = await this.apiService.getPlayer()
			const data = response.response
			logger.verbose(
				this.scene.key,
				`Api call success, Current player data: ${JSON.stringify(data)}`,
			)

			const playToday = this.handlePlayToday(data.play_today)
			data.play_today = playToday

			this.playerData = data

			this.scene.scene.registry.set('username', this.playerData.username)
			this.scene.scene.registry.set('airflow', this.playerData.airflow)
			this.scene.scene.registry.set('difficulty', this.playerData.difficulty)
			this.scene.scene.registry.set('playCount', this.playerData.play_count)
			this.scene.scene.registry.set('playToday', this.playerData.play_today)
			this.scene.scene.registry.set(
				'playerCharactersId',
				this.playerData.unlocked_characters_id,
			)
			this.scene.scene.registry.set('playerLevel', this.playerData.level)
			this.scene.scene.registry.set(
				'playerProgression',
				this.playerData.progression,
			)
			this.scene.scene.registry.set(
				'selectedCharacterId',
				this.playerData.selected_character_id,
			)
		} catch (error) {
			logger.error(this.scene.key, `Handle player data failed: ${error}`)
		}
	}

	init({ bgm }: { bgm: Phaser.Sound.BaseSound }) {
		this.bgm = bgm
	}

	preload() {
		this.load.atlas(
			'ui',
			'assets/ui/asset_warmup.png',
			'assets/ui/asset_warmup.json',
		)
		this.load.image('landing_page_bg', 'assets/background/landing_page_bg.png')
		this.load.atlas(
			'landing_page',
			'assets/ui/landing_page_spritesheet.png',
			'assets/ui/landing_page_spritesheet.json',
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
			'heart_spritesheet',
			'assets/heart_spritesheet/heart_spritesheet.png',
			'assets/heart_spritesheet/heart_spritesheet.json',
		)
		this.load.svg('mute', 'assets/icon/mute.svg')
		this.load.svg('unmute', 'assets/icon/unmute.svg')
	}

	async create() {
		this.isLoading = true
		//localStorage.setItem("lastPlayTime1", '')
		//localStorage.setItem("lastPlayTime2", '')

		// call API
		this.apiService = new supabaseAPIService()
		await this.handleData()

		const { width, height } = this.scale
		this.timeService = new TimeService(
			this.scene.scene.registry.get('playToday')[0],
			this.scene.scene.registry.get('playToday')[1],
		)

		this.registry.set('gameState', GameState.MENU)

		if(!this.registry.get('gamesPlayedThisSession')) {
			this.registry.set('gamesPlayedThisSession', 0)
		}

		// TODO: call api
		this.playCount = this.scene.scene.registry.get('playCount')

		this.add
			.tileSprite(0, 0, width, height, 'landing_page_bg')
			.setOrigin(0)
			.setScrollFactor(0, 0)

		this.add
			.image(width / 2, 216, 'landing_page', 'logo_breathbuddy.png')
			.setOrigin(0.5, 0)

		this.heart1 = new Heart(this, width / 2 + 1.5 * MARGIN, 464, 1)
		this.heart2 = new Heart(this, width / 2 - 1.5 * MARGIN, 464, 2)
		this.playButton = new PlayButton(this, this.bgm)

		const isFirstPlay = this.timeService.isFirstPlay()
		if (isFirstPlay) {
			localStorage.setItem('playCount', '0')
		}
		if (
			isFirstPlay &&
			this.heart1.getIsRecharged() &&
			this.heart2.getIsRecharged()
		) {
			this.isShowReminder = true
			this.reminderCase = 'firstRound'
		} else if (
			this.playCount < 10 &&
			!this.heart1.getIsRecharged() &&
			!this.heart2.getIsRecharged()
		) {
			this.isShowReminder = true
			this.reminderCase = 'heartEmpty'
		} else if (
			this.playCount >= 10 &&
			!this.heart1.getIsRecharged() &&
			!this.heart2.getIsRecharged()
		) {
			this.isShowReminder = true
			this.reminderCase = 'playTomorrow'
		}

		// Reminder
		this.reminderText = I18nSingleton.getInstance()
			.createTranslatedText(
				this,
				width / 2,
				628,
				ReminderText[this.reminderCase],
			)
			.setAlign('center')
			.setOrigin(0.5, 0)
			.setVisible(this.isShowReminder)

		this.rankingButton = new RankingButton(this)
		this.instructionButton = new InstructionButton(this)
		this.achievementButton = new AchievementButton(this)
		this.settingButton = new SettingButton(this)

		const self = this
		WebFont.load({
			google: {
				families: ['Mali', 'Jua'],
			},
			active: function () {
				self.heart1.initFontStyle()
				self.heart2.initFontStyle()
				self.playButton.initFontStyle()
				self.achievementButton.initFontStyle()
				self.instructionButton.initFontStyle()
				self.settingButton.initFontStyle()
				self.rankingButton.initFontStyle()

				new HomeTopBar(self)
				new SoundToggle(self, MARGIN * 2, height - 3 * MARGIN + 53)

				self.reminderText
					.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
						color: 'white',
					})
					.setFontSize(MEDIUM_FONT_SIZE)
					.setStroke('#57453B', 12)
			},
		})

		this.isLoading = false
	}

	update(_: number, __: number): void {
		if (this.isLoading) return
		const heartEmpty =
			!this.heart1.getIsRecharged() && !this.heart2.getIsRecharged()
		if (this.playCount >= 10 || heartEmpty) {
			this.playButton.disable()
		}

		if (!heartEmpty) {
			this.playButton.activate()
		}

		this.reminderText.setVisible(this.timeService.isFirstPlay() || heartEmpty)
	}

	sortDate(dates: Date[]): Date[] {
		dates.sort((a: Date, b: Date) => {
			return b.getTime() - a.getTime()
		})
		return dates
	}

	handlePlayToday(playTodayString: string[]) {
		const playTodayDate: Date[] = []
		playTodayString.forEach((element) => {
			playTodayDate.push(new Date(element))
		})
		this.sortDate(playTodayDate)
		return playTodayDate
	}
}
