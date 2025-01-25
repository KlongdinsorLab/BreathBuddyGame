import Phaser from 'phaser'
import I18nSingleton from 'i18n/I18nSingleton'
import i18next from 'i18next'
import { getAuth, updateProfile } from 'firebase/auth'
import WebFont from 'webfontloader'
import { logger } from 'services/logger'

interface DOMEvent<T extends EventTarget> extends Event {
	readonly target: T
}
export default class RegisterScene extends Phaser.Scene {
	private selectedData:
		| {
				age: string
				gender: string
				airflow: string
				difficulty: string
				edit: boolean
		  }
		| undefined
	private isEdit: boolean = false
	private phoneNumber!: string
	private bgm?: Phaser.Sound.BaseSound

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
		this.isEdit = data.edit
		this.phoneNumber = data.phoneNumber
		this.bgm = data.bgm
		logger.debug(this.scene.key, `register init: ${JSON.stringify(data)}`)
		logger.debug(this.scene.key, `register isEdit: ${this.isEdit}`)
	}

	constructor() {
		super('register')
	}

	preload() {
		this.load.script(
			'webfont',
			'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
		)
		this.load.html('registerForm', 'html/auth/register.html')
	}

	create() {
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

		const element = this.add
			.dom(0, 0)
			.createFromCache('registerForm')
			.setOrigin(0, 0)

		if (this.isEdit) {
			logger.debug(this.scene.key, `age isEdit: ${this.selectedData!.age}`)
			const ageInput = element.getChildByID('age')! as HTMLSelectElement
			ageInput.value = this.selectedData!.age

			logger.debug(
				this.scene.key,
				`gender isEdit: ${this.selectedData!.gender}`,
			)
			const genderInput = element.getChildByID('gender')! as HTMLSelectElement
			genderInput.value = this.selectedData!.gender

			logger.debug(
				this.scene.key,
				`airflow isEdit: ${this.selectedData!.airflow}`,
			)
			const airflowInput = element.getChildByID('airflow')! as HTMLSelectElement
			airflowInput.value = this.selectedData!.airflow

			logger.debug(
				this.scene.key,
				`difficulty isEdit: ${this.selectedData?.difficulty}`,
			)
			const difficultyInput = element.getChildByID(
				'difficulty',
			)! as HTMLSelectElement
			difficultyInput.value = this.selectedData!.difficulty

			this.isEdit = false
		}

		const labelIds = [
			'default-value1',
			'default-value2',
			'default-value3',
			'default-value4',
			'head-text',
			'age-label',
			'gender-label',
			'airflow-label',
			'difficulty-label',
			'warning-text',
			'button',
		]

		const labelKeys = [
			'register_option_default',
			'register_option_default',
			'register_option_default',
			'register_option_default',
			'register_title',
			'register_age_title',
			'register_gender_title',
			'register_airflow_title',
			'register_difficulty_title',
			'register_warning',
			'register_button',
		]

		const optionIds = [
			'option-male',
			'option-female',
			'option-other',
			'option-easy',
			'option-medium',
			'option-hard',
		]

		const optionKeys = [
			'register_option_male',
			'register_option_female',
			'register_option_other',
			'register_option_easy',
			'register_option_medium',
			'register_option_hard',
		]

		labelIds.forEach((id, index) => {
			const labelElement = <Element>element.getChildByID(id)
			labelElement.textContent = i18next.t(labelKeys[index])
		})

		optionIds.forEach((id, index) => {
			const optionElement = <Element>element.getChildByID(id)
			optionElement.textContent = i18next.t(optionKeys[index])
		})

		element.addListener('submit')
		element.on('submit', (event: DOMEvent<HTMLInputElement>) => {
			event.preventDefault()
			const ageSelect = document.getElementById('age')! as HTMLSelectElement
			const genderSelect = document.getElementById(
				'gender',
			)! as HTMLSelectElement
			const airflowSelect = document.getElementById(
				'airflow',
			)! as HTMLSelectElement
			const difficultySelect = document.getElementById(
				'difficulty',
			)! as HTMLSelectElement
			if (event?.target?.id === 'submit-form') {
				// todo: send data to database
				//const selectedAge = ageSelect.options[ageSelect.selectedIndex].value;
				//const selectedGender = genderSelect.options[genderSelect.selectedIndex].value;
				//const selectedAirflow = airflowSelect.options[airflowSelect.selectedIndex].value;
				//const selectedDifficulty = difficultySelect.options[difficultySelect.selectedIndex].value;
			}

			this.updateProfile(
				ageSelect.value,
				genderSelect.value,
				airflowSelect.value,
				difficultySelect.value,
			)
		})
	}

	update() {}

	async updateProfile(
		age: string,
		gender: string,
		airflow: string,
		difficulty: string,
	) {
		// 		TODO add database
		const auth = getAuth()
		const user = auth.currentUser
		await updateProfile(user!, {
			displayName: 'Test User',
		})
		if (
			age !== 'ยังไม่ระบุ' &&
			gender !== 'ยังไม่ระบุ' &&
			airflow !== 'ยังไม่ระบุ' &&
			difficulty !== 'ยังไม่ระบุ'
		) {
			this.scene.stop()
			this.scene.launch('confirm', {
				phoneNumber: this.phoneNumber,
				age: age,
				gender: gender,
				airflow: airflow,
				difficulty: difficulty,
				bgm: this.bgm,
			})
		} else {
			logger.error(this.scene.key, 'Update user profile failed')
		}
	}
}
