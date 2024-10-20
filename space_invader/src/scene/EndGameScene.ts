/* eslint-disable @typescript-eslint/no-this-alias */
import Phaser from 'phaser'
import { MARGIN, VAS_COUNT, MAX_PLAYED } from 'config'
import I18nSingleton from 'i18n/I18nSingleton'
import WebFont from 'webfontloader'
import Heart from 'component/ui/Heart'
import RewardDialog from 'component/ui/RewardDialog'
import RestartButton from 'component/ui/Button/RestartButton'
import HomeButton from 'component/ui/Button/HomeButton'
import vas from 'component/ui/Vas'
import { BoosterEffect } from 'component/booster/booster'
import { AchievementPopup } from 'component/popup/AchievementPopup'
import { AchievementDetailDTO } from 'services/API/definition/responseDTO'
import { LevelUpPopup } from 'component/popup/LevelUpPopup'
import supabaseAPIService from 'services/API/backend/supabaseAPIService'
import { FinishGameResponse } from 'services/API/definition/responseDTO'

export default class EndGameScene extends Phaser.Scene {
	private score!: number
	private isHighScore = true
	private heart1!: Heart
	private heart2!: Heart
	private isHeartEmpty!: boolean
	private rewardDialog!: RewardDialog
	private restartButton!: RestartButton
	private homeButton!: HomeButton
	private victoryText!: Phaser.GameObjects.Text
	private highScoreText!: Phaser.GameObjects.Text
	private scoreText!: Phaser.GameObjects.Text
	private completeText!: Phaser.GameObjects.Text

	private boosterEffect!: BoosterEffect
	private vas!: vas
	private achievementPopup!: AchievementPopup
	private levelUpPopup!: LevelUpPopup
	private finishGameResponse!: FinishGameResponse

	private playerJson = { totalPlayed: 15, todayPlayed: 5 }

	private isLoading!: boolean

	constructor() {
		super('end game')
	}

	init({ score }: { score: number }) {
		this.score = score
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

		this.load.image(
			'end_game_scene_bg',
			'assets/background/end_game_scene_bg.png',
		)
		this.load.atlas(
			'end_game_scene',
			'assets/ui/end_game_scene_spritesheet.png',
			'assets/ui/end_game_scene_spritesheet.json',
		)

		this.load.atlas(
			'bossAsset',
			'assets/sprites/boss/asset_boss.png',
			'assets/sprites/boss/asset_boss.json',
		)

		this.load.atlas(
			'heart_spritesheet',
			'assets/heart_spritesheet/heart_spritesheet.png',
			'assets/heart_spritesheet/heart_spritesheet.json',
		)

		this.load.atlas(
			'vas',
			'assets/vas/vas_spritesheet.png',
			'assets/vas/vas_spritesheet.json',
		)

		this.load.atlas(
			'button',
			'assets/button/button_spritesheet.png',
			'assets/button/button_spritesheet.json',
		)

		this.load.atlas(
			'heading',
			'assets/heading/heading_spritesheet.png',
			'assets/heading/heading_spritesheet.json',
		)

		this.load.atlas(
			'achievement',
			'assets/achievement/achievement_spritesheet.png',
			'assets/achievement/achievement_spritesheet.json',
		)

		this.load.atlas(
			'achievement',
			'assets/achievement/achievement_spritesheet.png',
			'assets/achievement/achievement_spritesheet.json',
		)

		this.load.atlas(
			'b2v1',
			'assets/character/enemy/b2v1_spritesheet.png',
			'assets/character/enemy/b2v1_spritesheet.json',
		)

		this.load.atlas(
			'b3v1',
			'assets/character/enemy/b3v1_spritesheet.png',
			'assets/character/enemy/b3v1_spritesheet.json',
		)

		this.load.atlas(
			'b4v1',
			'assets/character/enemy/b4v1_spritesheet.png',
			'assets/character/enemy/b4v1_spritesheet.json',
		)

		this.load.atlas(
			'icon',
			'assets/icon/icon_spritesheet.png',
			'assets/icon/icon_spritesheet.json',
		)

		//booster
		this.load.image('booster_selectedMark', 'assets/dropItem/selectedMark.png')
		this.load.atlas(
			'dropItem',
			'assets/dropItem/dropitem_spritesheet.png',
			'assets/dropItem/dropitem_spritesheet.json',
		)

		this.load.image('popupAuraEffect', 'assets/effect/popup_aura.png')
	}

	async create() {
		this.isLoading = true

		const { width, height } = this.scale
		const i18n = I18nSingleton.getInstance()
		const apiService = new supabaseAPIService()

		this.boosterEffect = this.scene.scene.registry.get('boosterEffect')
		if (this.boosterEffect && this.boosterEffect.score) {
			this.score = this.score * this.boosterEffect.score
		}

		const finishGame = async () => {
			try {
				this.finishGameResponse = await apiService.finishGameSession({
					score: this.score,
					lap: this.scene.scene.registry.get('lap'),
					is_booster_received: this.registry.get('isBoosterReceived'),
				})
			} catch (error) {
				console.error(error)
			}
		}
		finishGame()

		this.add
			.tileSprite(0, 0, width, height, 'end_game_scene_bg')
			.setOrigin(0)
			.setScrollFactor(0, 0)

		this.add
			.image(width / 2, 96, 'end_game_scene', 'heading_victory.png')
			.setOrigin(0.5, 0)

		this.victoryText = i18n
			.createTranslatedText(this, width / 2, 148, 'victory')
			.setAlign('center')
			.setOrigin(0.5, 0.5)

		this.highScoreText = i18n
			.createTranslatedText(this, width / 2, 248, 'high_score')
			.setAlign('center')
			.setOrigin(0.5, 0)
			.setVisible(this.isHighScore)

		this.scoreText = i18n
			.createTranslatedText(this, width / 2, 296, 'score', {
				score: this.score,
			})
			.setAlign('center')
			.setOrigin(0.5, 0)

		this.completeText = i18n
			.createTranslatedText(this, width / 2, 608, 'endgame_complete')
			.setAlign('center')
			.setOrigin(0.5, 0)
			.setVisible(false)

		this.heart1 = new Heart(this, width / 2 + 1.5 * MARGIN, 464, 1)
		this.heart2 = new Heart(this, width / 2 - 1.5 * MARGIN, 464, 2)
		this.isHeartEmpty =
			!this.heart1.getIsRecharged() && !this.heart2.getIsRecharged()

		if (this.registry.get('isBoosterReceived')) {
			this.rewardDialog = new RewardDialog(this)
		}

		this.restartButton = new RestartButton(this)
		this.homeButton = new HomeButton(this)
		this.vas = new vas(this)

		if (this.playerJson.totalPlayed % VAS_COUNT == 0) {
			this.homeButton.disable()
			this.homeButton.hide()
			this.restartButton.disable()
			this.restartButton.hide()
			this.rewardDialog?.hide()
			this.completeText.setVisible(false)

			this.heart1.getBody().setVisible(false)
			this.heart2.getBody().setVisible(false)

			this.vas.create()
		}

		if (this.isHeartEmpty) {
			this.restartButton.hide()
		}

		const achievementList: AchievementDetailDTO[] =
			this.finishGameResponse?.new_achievements
		if (achievementList && achievementList.length !== 0) {
			const achievementIdList = achievementList?.map(
				(achievement) => achievement.id,
			)

			this.achievementPopup = new AchievementPopup(this, achievementIdList)
			this.achievementPopup.create()
			this.achievementPopup.setVisibleOff()
		}

		if (this.finishGameResponse?.level_up) {
			this.levelUpPopup = new LevelUpPopup(this, this.finishGameResponse.level)
			this.levelUpPopup.create()
			this.levelUpPopup.setVisibleOff()

			this.homeButton.disable()
			this.homeButton.hide()
			this.restartButton.disable()
			this.restartButton.hide()
			this.rewardDialog?.hide()
			this.completeText.setVisible(false)

			this.heart1.getBody().setVisible(false)
			this.heart2.getBody().setVisible(false)
		}

		const self = this
		WebFont.load({
			google: {
				families: ['Mali', 'Jua'],
			},
			active: function () {
				const maliFontStyle = {
					fontFamily: 'Mali',
					fontStyle: 'bold',
				}

				const juaFontStyle = {
					fontFamily: 'Jua',
				}

				self.vas?.initFontStyle()
				self.rewardDialog?.initFontStyle()
				self.heart1.initFontStyle()
				self.heart2.initFontStyle()
				self.restartButton.initFontStyle()
				self.homeButton.initFontStyle()
				self.achievementPopup?.initFontStyle()

				self.victoryText
					.setStyle({
						...maliFontStyle,
						color: 'white',
					})
					.setFontSize('64px')
					.setStroke('#3F088C', 6)

				self.highScoreText
					.setStyle({
						...maliFontStyle,
						color: 'white',
					})
					.setFontSize('32px')
					.setStroke('#3F088C', 6)

				self.scoreText
					.setStyle({
						...juaFontStyle,
						color: 'white',
					})
					.setFontSize('110px')
					.setStroke('#3F088C', 12)

				self.completeText
					.setStyle({
						...maliFontStyle,
						color: '#DD2D04',
					})
					.setFontSize('30px')
					.setStroke('white', 6)
			},
		})

		this.isLoading = false
	}

	update(_: number, __: number): void {
		if (this.isLoading) return

		this.isHeartEmpty =
			!this.heart1.getIsRecharged() && !this.heart2.getIsRecharged()
		if (!this.isHeartEmpty) {
			this.restartButton.show()
		}

		if (
			this.finishGameResponse?.level_up &&
			!this.levelUpPopup.getIsConfirmLevelUp()
		) {
			this.levelUpPopup.setVisibleOn()
			const self = this
			WebFont.load({
				google: {
					families: ['Mali', 'Jua'],
				},
				active: function () {
					self.levelUpPopup.initFontStyle()
				},
			})
			return
		}

		if (
			this.achievementPopup &&
			!this.achievementPopup.getIsCompleteAchievement()
		) {
			this.achievementPopup?.setVisibleOn()
			return
		}

		if (this.vas?.getIsCompleteVas()) {
			this.vas.clearPopup()
			this.ShowUI()
			return
		}

		if (this.playerJson.totalPlayed % VAS_COUNT != 0) {
			this.ShowUI()
		}
	}

	ShowUI(): void {
		this.isHeartEmpty =
			!this.heart1.getIsRecharged() && !this.heart2.getIsRecharged()
		if (!this.isHeartEmpty && this.playerJson.todayPlayed < MAX_PLAYED) {
			if (this.vas && this.vas.getScore() >= 7) {
				this.restartButton.hide()
				return
			}

			this.restartButton.show()
			this.restartButton.activate()
		} else {
			this.restartButton.hide()
		}

		if (this.playerJson.todayPlayed == 10) {
			this.completeText.setVisible(true)
			this.rewardDialog?.hide()
		} else {
			this.rewardDialog?.show()
		}
		this.homeButton.show()
		this.homeButton.activate()

		this.heart1.getBody().setVisible(true)
		this.heart2.getBody().setVisible(true)
	}
}
