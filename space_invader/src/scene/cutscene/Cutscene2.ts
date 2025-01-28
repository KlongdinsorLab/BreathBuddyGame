import { PlayerByName } from 'component/player/playerInterface'
import { ALL_CHARACTER, MARGIN } from 'config'
import I18nSingleton from 'i18n/I18nSingleton'
import Phaser from 'phaser'
import { logger } from 'services/logger'
import WebFont from 'webfontloader'

export default class Cutscene1 extends Phaser.Scene {
	private mcName!: keyof typeof PlayerByName
	private bgm?: Phaser.Sound.BaseSound
	constructor() {
		super('cutscene2')
	}

	init({ bgm }: { bgm: Phaser.Sound.BaseSound }) {
		this.bgm = bgm
	}

	preload() {
		this.load.script(
			'webfont',
			'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
		)

		this.load.atlas(
			'mc_cutscene',
			'assets/sprites/cutscene/cutscene2_spritesheet.png',
			'assets/sprites/cutscene/cutscene2_spritesheet.json',
		)
	}

	create() {
		const { width, height } = this.scale
		this.add
			.tileSprite(0, 0, width, height, 'cutscene_bg')
			.setOrigin(0)
			.setScrollFactor(0, 0)

		const i18n = I18nSingleton.getInstance()

		const textBox = this.add.graphics()
		textBox.fillStyle(0xfff6e5)
		textBox.fillRoundedRect(48, 958, 624, 240, 40)

		const textBoxBorder = this.add.graphics()
		textBoxBorder.lineStyle(5, 0xd35e24, 1)
		textBoxBorder.strokeRoundedRect(48, 958, 624, 240, 40)

		const cutsceneText = i18n
			.createTranslatedText(this, width / 2, 1019 - 10, 'cutscene2_dialog', {
				username: this.registry.get('username'),
			})
			.setOrigin(0.5, 0)
			.setAlpha(1)
			.setAlign('center')
			.setPadding(0, 20, 0, 10)

		const continueText = i18n
			.createTranslatedText(this, width / 2, 1155 - 10, 'tutorial_continue')
			.setOrigin(0.5, 0)
			.setAlpha(0)
			.setPadding(0, 20, 0, 10)

		const selectedCharacterId = this.registry.get('selectedCharacterId') ?? 1
		if (!this.registry.get('selectedCharacterId')) {
			logger.warn(
				this.scene.key,
				'No selected character id, using "1" as default value',
			)
		}
		const selectedCharacter = ALL_CHARACTER[selectedCharacterId - 1].mcName
		this.mcName = selectedCharacter

		const playerImage = this.add.image(
			width / 2,
			height / 2 - MARGIN,
			'mc_cutscene',
			`cutscene2_${this.mcName}.png`,
		)
		const petImage = this.add
			.image(width / 2, height / 2 - MARGIN, 'mc_cutscene', 'cutscene2_pet.png')
			.setAlpha(0)
			.setScale(1.5)

		this.tweens.add({
			targets: playerImage,
			scaleX: 1.5,
			scaleY: 1.5,
			duration: 500,
			onComplete: () => {
				this.tweens.add({
					targets: petImage,
					alpha: 1,
					duration: 400,
					repeat: -1,
				})
			},
		})

		this.tweens.add({
			targets: continueText,
			alpha: 1,
			duration: 2000,
			repeat: 0,
			ease: 'sine.in',
			onComplete: () => {
				this.input.once(
					'pointerdown',
					() => {
						this.scene.stop()
						this.scene.launch('cutscene_randomboss', {
							mcName: this.mcName,
							bgm: this.bgm,
						})
						// i18n.removeAllListeners(this)
					},
					this,
				)
			},
		})

		WebFont.load({
			google: {
				families: ['Mali'],
			},
			active: function () {
				cutsceneText
					.setStyle({
						fontFamily: 'Mali',
					})
					.setColor('#57453B')
					.setFontSize('36px')

				continueText
					.setStyle({
						fontFamily: 'Mali',
						fontStyle: 'bold',
					})
					.setFontSize('36px')
					.setStroke('#D35E24', 12)
			},
		})
	}

	// Mock only delete after create mc input handler
	randomMC(): keyof typeof PlayerByName {
		// TODO: weighted random
		const playerPool = Object.keys(PlayerByName)
		const randomIndex = Math.round(Math.random() * (playerPool.length - 1))
		return playerPool[randomIndex] as keyof typeof PlayerByName
	}
}
