import Phaser from 'phaser'
import I18nSingleton from 'i18n/I18nSingleton'
import { LARGE_FONT_SIZE, MARGIN, MEDIUM_FONT_SIZE } from 'config'
import i18next from 'i18next'
import { getCookie, setCookie } from 'typescript-cookie'
import WebFont from 'webfontloader'

import {
	getAuth,
	signInWithPhoneNumber,
	RecaptchaVerifier,
	ConfirmationResult,
	browserLocalPersistence,
	setPersistence,
	browserSessionPersistence,
} from 'firebase/auth'


interface DOMEvent<T extends EventTarget> extends Event {
	readonly target: T
}
export default class LoginScene extends Phaser.Scene {


	constructor() {
		super('login')
	}

	preload() {
		this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
		this.load.html('loginForm', 'html/auth/login.html')
	}

	create() {
		if (getCookie('phone')) {
			// Phone number cookie exists, proceed to the register scene
			const phoneNumberCookie = getCookie('name');
			console.log('Phone number cookie exists, proceed to the register scene')
			console.log('Phone:', phoneNumberCookie);
			//this.scene.stop();
			//this.scene.launch('register');
		}
		if(getCookie('lastScene') === 'otpScene') {
			// OTP scene was the last scene, proceed to the confirm scene
			console.log('OTP scene was the last scene, proceed to the register scene')
			console.log(getCookie('lastScene'));
			//this.scene.stop();
			//this.scene.launch('register');
		}else if(getCookie('lastScene') === 'confirmScene') {
			// Confirm scene was the last scene, proceed to the register scene
			console.log('User already completed registration, proceed to the title scene')
			//this.scene.stop();
			//this.scene.launch('title');
		}
		WebFont.load({
			google: {
				families: ['Sarabun:300,400,500']
			},
			active: () => {
				applyFontStyles();
			}
		});
		
		function applyFontStyles(): void {
			const lightElements = document.querySelectorAll('.sarabun-light');
			lightElements.forEach(element => {
				(element as HTMLElement).style.fontFamily = 'Sarabun, sans-serif';
				(element as HTMLElement).style.fontWeight = '300';
			});
		
			const mediumElements = document.querySelectorAll('.sarabun-medium');
			mediumElements.forEach(element => {
				(element as HTMLElement).style.fontFamily = 'Sarabun, sans-serif';
				(element as HTMLElement).style.fontWeight = '400';
			});
		
			const regularElements = document.querySelectorAll('.sarabun-regular');
			regularElements.forEach(element => {
				(element as HTMLElement).style.fontFamily = 'Sarabun, sans-serif';
				(element as HTMLElement).style.fontWeight = '500';
			});
		}

		//const { width, height } = this.scale

		const i18n = I18nSingleton.getInstance()

		const element = this.add
			.dom(110, 200)
			.createFromCache('loginForm')
			.setScale(1)
		console.log("element added")

		element.addListener('submit')

		element.on('submit', async (event: DOMEvent<HTMLInputElement>) => {
			event.preventDefault()
			if (event?.target?.id === 'submit-form') {
				const phoneInput = <HTMLInputElement>element.getChildByID('phoneNumber-input')
				const phoneNumber = this.getPhoneNumber(phoneInput.value.trim())
				this.signIn(phoneNumber)
			}
		})
		const textElementIds = [
			'head-text', 'login_description', 'phoneNumber-text', 'button'
		];
		
		const textElementKeys = [
			'login_title', 'login_description', 'login_input', 'login_button'
		];
		
		textElementIds.forEach((id, index) => {
			const textElement = <Element>element.getChildByID(id);
			textElement.textContent = i18next.t(textElementKeys[index]);
		});
		

	}

	update() {}

	getPhoneNumber(phoneNumber: string): string {
		if(!phoneNumber.startsWith('0')) return `+66${phoneNumber}`
		return `+66${phoneNumber.substring(1,phoneNumber.length)}`
	}

	async signIn(phoneNumber: string): Promise<void> {
		const auth = getAuth();
		auth.useDeviceLanguage();
		const recaptchaVerifier = new RecaptchaVerifier(auth, 'button', {
			'size': 'invisible'
		});
		try {
			await setPersistence(auth, browserSessionPersistence)
		} catch (e) {
			console.log(e)
			// TODO
		}

		try {
			const confirmationResult: ConfirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
			setCookie('lastScene', 'otpScene', { expires: 7, path: '' });
			this.scene.stop()
			this.scene.launch('otp', {
				confirmationResult: confirmationResult,
				data: { phoneNumber: phoneNumber }
			});
			
		} catch (e) {
			// TODO handle ERROR Message
			// reset recaptcha
			console.log(e)
		}

	}
}

