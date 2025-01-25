/* eslint-disable @typescript-eslint/no-this-alias */
import i18next from 'i18next'
import supabaseAPIService from 'services/API/backend/supabaseAPIService'
import { Airflow } from 'services/API/definition/typeProperty'
import { logger } from 'services/logger'

export default class editAirflowPopUp {
	private scene: Phaser.Scene | undefined

	private airflowText: Phaser.GameObjects.Text | undefined

	private editAirflowForm1: Phaser.GameObjects.DOMElement
	private editAirflowForm2: Phaser.GameObjects.DOMElement
	private editAirflowForm3: Phaser.GameObjects.DOMElement
	private editAirflowForm4: Phaser.GameObjects.DOMElement
	private editAirflowForm5: Phaser.GameObjects.DOMElement
	private airflowInput: number | undefined

	private airflow: number | undefined

	private blackWindow: Phaser.GameObjects.Shape | undefined

	constructor(
		scene: Phaser.Scene,
		airflowText: Phaser.GameObjects.Text,
		airflow?: number,
	) {
		const { width, height } = scene.scale

		this.scene = scene

		this.airflowText = airflowText

		const self = this

		this.airflow = airflow === undefined ? 100 : airflow

		// Black Screen When Pop Up
		this.blackWindow = scene.add
			.rectangle(0, 0, width, height, 0, 0.5)
			.setOrigin(0, 0)
			.setVisible(false)

		// Edit Airflow1
		this.editAirflowForm1 = scene.add
			.dom(72, height / 2 - 720 / 2)
			.setOrigin(0, 0)
			.createFromCache('editairflowForm1')

		const warning1 = <Element>this.editAirflowForm1.getChildByID('warning')
		warning1.textContent = i18next.t('warning')

		const editAirflowAdviceTop = <Element>(
			this.editAirflowForm1.getChildByID('edit_airflow_advice_top')
		)
		editAirflowAdviceTop.textContent = i18next.t('edit_airflow1_advice_top')

		const editAirflowAdviceBottom = <Element>(
			this.editAirflowForm1.getChildByID('edit_airflow_advice_bottom')
		)
		editAirflowAdviceBottom.textContent = i18next.t(
			'edit_airflow1_advice_bottom',
		)

		const cancel1 = <Element>this.editAirflowForm1.getChildByID('cancel')
		cancel1.textContent = i18next.t('cancel')

		const submit1 = <Element>this.editAirflowForm1.getChildByID('submit')
		submit1.textContent = i18next.t('submit_edit')

		this.editAirflowForm1.addListener('click')
		this.editAirflowForm1.on('click', function (event: any) {
			if (event.target.name === 'cancel') {
				self.closeEditAirflowPopUp1()
				self.editAirflowForm1?.setVisible(false)
			}
			if (event.target.name === 'submit') {
				self.closeEditAirflowPopUp1()
				self.editAirflowForm1?.setVisible(false)
				self.popUpEditAirflow2()
			}
		})
		this.editAirflowForm1.setVisible(false)

		// Edit Airflow2
		this.editAirflowForm2 = scene.add
			.dom(72, height / 2 - 610 / 2)
			.createFromCache('editairflowForm2')
			.setOrigin(0, 0)

		const warning = <Element>this.editAirflowForm2.getChildByID('warning')
		warning.textContent = i18next.t('warning')

		const doctorInstructed = <Element>(
			this.editAirflowForm2.getChildByID('doctor_instructed_confirm')
		)
		doctorInstructed.textContent = i18next.t(
			'airflow_doctor_instructed_confirm',
		)

		const cancel2 = <Element>this.editAirflowForm2.getChildByID('cancel')
		cancel2.textContent = i18next.t('cancel')

		const submit2 = <Element>this.editAirflowForm2.getChildByID('submit')
		submit2.textContent = i18next.t('submit_edit')

		this.editAirflowForm2.addListener('click')
		this.editAirflowForm2.on('click', function (event: any) {
			const inputCheck = <HTMLInputElement>(
				self.editAirflowForm2.getChildByName('checkbox')
			)
			const inputValue = inputCheck.checked
			if (event.target.name === 'cancel') {
				self.closeEditAirflowPopUp2()
				self.editAirflowForm2?.setVisible(false)
			}
			if (event.target.name === 'submit') {
				if (inputValue) {
					self.closeEditAirflowPopUp2()
					self.editAirflowForm2?.setVisible(false)
					self.popUpEditAirflow3()
				} else {
					logger.warn(scene.scene.key, 'User submit with null input value')
				}
			}
		})
		this.editAirflowForm2.setVisible(false)

		// Edit Airflow3
		this.editAirflowForm3 = scene.add
			.dom(72, height / 2 - 813 / 2)
			.createFromCache('editairflowForm3')
			.setOrigin(0, 0)

		const editAirflow = <Element>(
			this.editAirflowForm3.getChildByID('edit_airflow')
		)
		editAirflow.textContent = i18next.t('edit_airflow')

		const cancel3 = <Element>this.editAirflowForm3.getChildByID('cancel')
		cancel3.textContent = i18next.t('cancel')

		const submit3 = <Element>this.editAirflowForm3.getChildByID('submit')
		submit3.textContent = i18next.t('submit_edit')

		this.editAirflowForm3.addListener('click')
		this.editAirflowForm3.on('click', function (event: any) {
			const airflowInput = <HTMLInputElement>(
				self.editAirflowForm3.getChildByName('select')
			)

			const airflowValue = airflowInput.value
			if (event.target.name === 'cancel') {
				self.closeEditAirflowPopUp3()
				self.editAirflowForm3?.setVisible(false)
			}
			if (event.target.name === 'submit') {
				self.closeEditAirflowPopUp3()
				self.editAirflowForm3?.setVisible(false)
				self.airflowInput = Number(airflowValue)
				self.popUpEditAirflow4()
			}
		})
		this.editAirflowForm3.setVisible(false)

		// Edit Airflow 4
		this.editAirflowForm4 = scene.add
			.dom(72, height / 2 - 598 / 2)
			.createFromCache('editairflowForm4')
			.setOrigin(0, 0)

		const confirmation = <Element>(
			this.editAirflowForm4.getChildByID('confirmation')
		)
		confirmation.textContent = i18next.t('confirmation')

		const changeAirflowConfirm = <Element>(
			this.editAirflowForm4.getChildByID('change_airflow_confirm')
		)
		changeAirflowConfirm.textContent = i18next.t('airflow_confirm')

		const fromText = <Element>this.editAirflowForm4.getChildByID('from')
		fromText.textContent = i18next.t('from')

		const toText = <Element>this.editAirflowForm4.getChildByID('to')
		toText.textContent = i18next.t('to')

		const question = <Element>this.editAirflowForm4.getChildByID('question')
		question.textContent = i18next.t('question')

		const cancel4 = <Element>this.editAirflowForm4.getChildByID('cancel')
		cancel4.textContent = i18next.t('cancel')

		const submit4 = <Element>this.editAirflowForm4.getChildByID('submit')
		submit4.textContent = i18next.t('submit_edit')

		this.editAirflowForm4.addListener('click')
		this.editAirflowForm4.on('click', async function (event: any) {
			if (event.target.name === 'cancel') {
				self.closeEditAirflowPopUp4()
				self.editAirflowForm4?.setVisible(false)
			}
			if (event.target.name === 'submit') {
				self.closeEditAirflowPopUp4()
				self.editAirflowForm4?.setVisible(false)
				await self.updateAirflow(
					self.airflowInput === undefined ? 100 : self.airflowInput,
				)
				self.popUpEditAirflow5()
			}
		})
		this.editAirflowForm4.setVisible(false)

		// Edit Airflow 5
		this.editAirflowForm5 = scene.add
			.dom(72, height / 2 - 1022 / 2)
			.createFromCache('editairflowForm5')
			.setOrigin(0, 0)

		const successfullyEdited = <Element>(
			this.editAirflowForm5.getChildByID('successfully_edited')
		)
		successfullyEdited.textContent = i18next.t('successfully_edited')

		const changedAirflowTo = <Element>(
			this.editAirflowForm5.getChildByID('changed_airflow_to')
		)
		changedAirflowTo.textContent = i18next.t('changed_airflow_to')

		const successfully = <Element>(
			this.editAirflowForm5.getChildByID('successfully')
		)
		successfully.textContent = i18next.t('successfully')

		const editAirflow5AdviceTop = <Element>(
			this.editAirflowForm5.getChildByID('edit_airflow5_advice_top')
		)
		editAirflow5AdviceTop.textContent = i18next.t('edit_airflow5_advice_top')

		const editAirflow5AdviceMiddle = <Element>(
			this.editAirflowForm5.getChildByID('edit_airflow5_advice_middle')
		)
		editAirflow5AdviceMiddle.textContent = i18next.t(
			'edit_airflow5_advice_middle',
		)

		const editAirflow5AdviceBottom = <Element>(
			this.editAirflowForm5.getChildByID('edit_airflow5_advice_bottom')
		)
		editAirflow5AdviceBottom.textContent = i18next.t(
			'edit_airflow5_advice_bottom',
		)

		const submit5 = <Element>this.editAirflowForm5.getChildByID('submit')
		submit5.textContent = i18next.t('submit')

		this.editAirflowForm5.addListener('click')
		this.editAirflowForm5.on('click', function (event: any) {
			if (event.target.name === 'submit') {
				self.closeEditAirflowPopUp5()
				self.editAirflowForm5?.setVisible(false)
			}
		})
		this.editAirflowForm5.setVisible(false)
	}

	popUpEditAirflow1(): void {
		this.scene?.scene.pause()
		this.editAirflowForm1?.setVisible(true)
		this.blackWindow?.setVisible(true)
	}

	closeEditAirflowPopUp1(): void {
		this.blackWindow?.setVisible(false)
		// this.setInteractiveOn()
		this.scene?.scene.resume()
	}

	popUpEditAirflow2(): void {
		this.scene?.scene.pause()
		// this.setInteractiveOff()
		this.editAirflowForm2?.setVisible(true)
		this.blackWindow?.setVisible(true)

		// Set default value
		const checkboxValue = <HTMLInputElement>(
			this.editAirflowForm2?.getChildByName('checkbox')
		)
		checkboxValue.checked = false
	}

	closeEditAirflowPopUp2(): void {
		this.blackWindow?.setVisible(false)
		// this.setInteractiveOn()
		this.scene?.scene.resume()
	}

	popUpEditAirflow3(): void {
		this.scene?.scene.pause()
		// this.setInteractiveOff()
		this.editAirflowForm3?.setVisible(true)
		this.blackWindow?.setVisible(true)

		const defaultInput = <HTMLOptionElement>(
			this.editAirflowForm3.getChildByID(this.airflow?.toString() ?? '100')
		)
		logger.warn(
			this.scene?.scene.key ?? 'Setting',
			'Difficulty is null, using "1" as default value',
		)
		defaultInput.selected = true
	}

	closeEditAirflowPopUp3(): void {
		this.blackWindow?.setVisible(false)
		this.scene?.scene.resume()
	}

	popUpEditAirflow4(): void {
		this.scene?.scene.pause()
		this.editAirflowForm4?.setVisible(true)
		this.blackWindow?.setVisible(true)

		const currentAirflow = <Element>(
			this.editAirflowForm4?.getChildByID('currentAirflow')
		)
		currentAirflow.textContent =
			this.airflow === undefined ? 'xxx' : this.airflow.toString()

		const newAirflow = <Element>(
			this.editAirflowForm4?.getChildByID('newAirflow')
		)
		newAirflow.textContent =
			this.airflowInput === undefined ? 'xxx' : this.airflowInput.toString()
	}

	closeEditAirflowPopUp4(): void {
		this.blackWindow?.setVisible(false)
		// this.setInteractiveOn()
		this.scene?.scene.resume()
	}

	popUpEditAirflow5(): void {
		this.scene?.scene.pause()
		// this.setInteractiveOff()
		this.editAirflowForm5?.setVisible(true)
		this.blackWindow?.setVisible(true)

		const changedAirflow = <Element>(
			this.editAirflowForm5?.getChildByID('changedAirflow')
		)
		changedAirflow.textContent =
			this.airflow === undefined ? 'xxx' : this.airflow.toString()
	}

	closeEditAirflowPopUp5(): void {
		this.blackWindow?.setVisible(false)
		// this.setInteractiveOn()
		this.scene?.scene.resume()
	}

	async updateAirflow(airflow: number): Promise<void> {
		this.airflow = airflow
		const apiService = new supabaseAPIService()
		try {
			const data = await apiService.updateAirflow(airflow as Airflow)
			logger.info(
				this.scene!.scene.key,
				`Api call success, Response: ${JSON.stringify(data)}`,
			)
		} catch (error) {
			logger.error(
				this.scene?.scene.key ?? 'EditAirFlow',
				`Api call failed: ${error}`,
			)
		}

		this.airflowText?.setText(this.airflow.toString())
	}

	getAirflow(): number {
		return this.airflow === undefined ? 100 : this.airflow
	}
}
