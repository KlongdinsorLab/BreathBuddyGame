import Phaser from 'phaser'
import i18next from 'i18next'
import I18nSingleton from 'i18n/I18nSingleton'
import WebFont from 'webfontloader'
import supabaseAPIService from 'services/API/backend/supabaseAPIService'
import { logger } from 'services/logger'

interface DOMEvent<T extends EventTarget> extends Event {
	readonly target: T
}

export default class ConfirmScene extends Phaser.Scene {
	private selectedData:
		| { age: string; gender: string; airflow: string; difficulty: string }
		| undefined
	private apiService!: supabaseAPIService
	private phoneNumber!: string
	private bgm?: Phaser.Sound.BaseSound
	private element!: Phaser.GameObjects.DOMElement

	constructor() {
		super('confirm')
	}

	init(data: {
		phoneNumber: string
		age: string
		gender: string
		airflow: string
		difficulty: string
		edit: boolean
		bgm: Phaser.Sound.BaseSound
	}) {
		this.selectedData = data
		this.phoneNumber = data.phoneNumber
		this.bgm = data.bgm
	}

	preload() {
		this.load.script(
			'webfont',
			'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
		)
		this.load.html('confirmForm', 'html/auth/confirm.html')
	}

	create() {
		this.apiService = new supabaseAPIService()

		const i18n = I18nSingleton.getInstance()
		i18n
			.createTranslatedText(this, 100, 680 - 3, 'use_button')
			.setFontSize(32)
			.setPadding(0, 20, 0, 10)
			.setStroke('#9E461B', 6)
			.setColor('#FFFFFF')
			.setOrigin(0.5, 0.5)
			.setVisible(false)

		WebFont.load({
			google: {
				families: ['Sarabun:300,400,500'],
			},
			active: () => {
				applyFontStyles()
			},
		})

		function applyFontStyles(): void {
			const lightElements = document.querySelectorAll('.sarabun-light')
			lightElements.forEach((element) => {
				;(element as HTMLElement).style.fontFamily = 'Sarabun, sans-serif'
				;(element as HTMLElement).style.fontWeight = '300'
			})

			const mediumElements = document.querySelectorAll('.sarabun-medium')
			mediumElements.forEach((element) => {
				;(element as HTMLElement).style.fontFamily = 'Sarabun, sans-serif'
				;(element as HTMLElement).style.fontWeight = '400'
			})

			const regularElements = document.querySelectorAll('.sarabun-regular')
			regularElements.forEach((element) => {
				;(element as HTMLElement).style.fontFamily = 'Sarabun, sans-serif'
				;(element as HTMLElement).style.fontWeight = '500'
			})
		}

		//const { width, height } = this.scale;
		if (!this.selectedData) {
			logger.error(this.scene.key, 'No data received in ConfirmScene')
		}
		// Set up the scene elements and logic
		const element = this.add
			.dom(0, 0)
			.createFromCache('confirmForm')
			.setOrigin(0, 0)

		this.element = element

		//change language
		const headText = <Element>element.getChildByID('head-text')
		headText.textContent = i18next.t('confirm_title')

		const ageLabel = <Element>element.getChildByID('age-label')
		ageLabel.textContent = i18next.t('register_age_title')

		const genderLabel = <Element>element.getChildByID('gender-label')
		genderLabel.textContent = i18next.t('register_gender_title')

		const airflowLabel = <Element>element.getChildByID('airflow-label')
		airflowLabel.textContent = i18next.t('register_airflow_title')

		const difficultyLabel = <Element>element.getChildByID('difficulty-label')
		difficultyLabel.textContent = i18next.t('register_difficulty_title')

		const warningText = <Element>element.getChildByID('warning-text')
		warningText.textContent = i18next.t('register_warning')

		const confirmButton = <Element>element.getChildByID('confirm-button')
		confirmButton.textContent = i18next.t('confirm_confirm_button')

		const editButton = <Element>element.getChildByID('edit-button')
		editButton.textContent = i18next.t('confirm_edit_button')

		// Set the data to the form

		const ageInput = element.getChildByID('age') as HTMLInputElement
		ageInput.textContent = this.selectedData!.age

		const genderInput = element.getChildByID('gender') as HTMLInputElement
		if (this.selectedData!.gender === 'male') {
			genderInput.textContent = i18next.t('register_option_male')
		} else if (this.selectedData!.gender === 'female') {
			genderInput.textContent = i18next.t('register_option_female')
		} else if (this.selectedData!.gender === 'other') {
			genderInput.textContent = i18next.t('register_option_other')
		}

		const airflowInput = element.getChildByID('airflow') as HTMLInputElement
		airflowInput.textContent = this.selectedData!.airflow

		const difficultyInput = element.getChildByID(
			'difficulty',
		) as HTMLInputElement
		if (this.selectedData!.difficulty.trim() === '1') {
			difficultyInput.textContent = i18next.t('register_option_easy')
		} else if (this.selectedData!.difficulty.trim() === '2') {
			difficultyInput.textContent = i18next.t('register_option_medium')
		} else if (this.selectedData!.difficulty.trim() === '3') {
			difficultyInput.textContent = i18next.t('register_option_hard')
		}

		element.addListener('click')
		element.on('click', async (event: DOMEvent<HTMLInputElement>) => {
			event.preventDefault()
			if (event?.target?.id === 'edit-button') {
				logger.debug(this.scene.key, 'Edit button submitted')
				logger.debug(
					this.scene.key,
					`Gender from textContent: ${genderInput.textContent}`,
				)
				this.scene.stop()
				this.scene.launch('register', {
					phoneNumber: this.phoneNumber,
					age: ageInput.textContent,
					gender: this.selectedData?.gender,
					airflow: airflowInput.textContent,
					difficulty: this.selectedData?.difficulty,
					edit: true,
					bgm: this.bgm,
				})
			} else if (event?.target?.id === 'confirm-button') {
				// alert('ลงทะเบียนเสร็จสิ้น');
				element.destroy()
				logger.debug(
					this.scene.key,
					`Input data: ${{
						age: ageInput.textContent,
						gender: this.selectedData?.gender,
						airflow: airflowInput.textContent,
						difficulty: this.selectedData?.difficulty,
						edit: true,
					}}`,
				)

				try {
					const data = await this.apiService.register(
						this.phoneNumber,
						parseInt(
							ageInput.textContent === null ? '1' : ageInput.textContent,
						),
						this.selectedData?.gender === 'male' ? 'M' : 'F',
						parseInt(
							airflowInput.textContent === null
								? '100'
								: airflowInput.textContent,
						),
						parseInt(this.selectedData?.difficulty ?? '1'),
					)
					if (ageInput.textContent === null) {
						logger.warn(
							this.scene.key,
							'Age input is null, using "1" as default value',
						)
					}
					if (airflowInput.textContent === null) {
						logger.warn(
							this.scene.key,
							'Airflow input is null, using "100" as default value',
						)
					}
					if (!this.selectedData?.difficulty) {
						logger.warn(
							this.scene.key,
							'Difficulty input is null, using "1" as default value',
						)
					}
					logger.info(
						this.scene.key,
						`Api call success, Response: ${JSON.stringify(data.response)}`,
					)
					this.scene.stop()
					this.scene.launch('home', { bgm: this.bgm })
				} catch (error) {
					logger.error(
						this.scene.key,
						`Confirm button clicked failed: ${error}`,
					)

					const toast = <Element>this.element.getChildByID('toast')
					toast.innerHTML +=
						'<div class="bg-red-500 rounded-lg p-4 w-[680px] h-[75px] flex justify-center"><span class="text-3xl">เกิดข้อผิดพลาด</span></div>'
					setTimeout(() => {
						toast.innerHTML = ''
					}, 5000)
				}
			}
		})
	}
	update() {
		// Update the scene state every frame
	}
}
