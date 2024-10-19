export const SCREEN_WIDTH = 720
export const SCREEN_HEIGHT = 1280
export const MARGIN = 48
export const PLAYER_START_MARGIN = 240
export const PLAYER_SPEED = 480
export const LASER_SPEED = 800
export const TRIPLE_LASER_X_SPEED = 80
export const LASER_FREQUENCY_MS = 500
export const BULLET_COUNT = 30
export const BOSS_HIT_SCORE = 400
export const BOSS_PHASE1_BULLET_COUNT = 60
export const BOSSV1_PHASE2_BULLET_COUNT = 90
export const BOSSV2_PHASE2_BULLET_COUNT = 120
export const RELOAD_COUNT = 10
export const BOSS_MULTIPLE_COUNT = 5
export const BOSS_TIME_MS = 120_000
export const BOSS_CUTSCENE_DELAY_MS = 3000
export const BOSS_TUTORIAL_DELAY_MS = 1000
export const PHASE_1_BOSS_TIME_MS = 30_000
export const PHASE_2_BOSS_TIME_MS = 45_000
export const COLLECT_BULLET_COUNT = 10

export const BOSS2_SKILL_SCORE_REDUCTION = -200

export const BOSS3_SKILL_SPEED = 600
export const BOSS3_PHASE1_SKILL_ANGLE = 6
export const BOSS3_PHASE2_SKILL_ANGLE = 10
export const BOSS3_SKILL_GAP = 30

export const BOSS_4_DOUBLE_CRESCENT_ANGLE = 10
export const BOSS_4_CRESCENT_SCALE_DURATION = 1600
export const BOSS_4_CRESCENT_VELOCITY_Y = 500
export const BOSS_4_DOUBLE_CRESCENT_VELOCITY_X = 50
export const BOSS_4_CRESCENT_SCORE_REDUCTION = -200

//export const BULLET_COUNT = 5
//export const RELOAD_COUNT = 4
//export const BOSS_MULTIPLE_COUNT = 2
//export const BOSS_TIME_MS = 5000
export const BOSS_HIT_DELAY_MS = 500
export const HOLD_DURATION_MS = 1000
export const HOLD_BAR_HEIGHT = 40 - 16
export const HOLD_BAR_BORDER = 8
export const HOLD_BAR_COLOR = 0x9966ff
export const HOLD_BAR_IDLE_COLOR = 0x603f8b
export const HOLD_BAR_CHARGING_COLOR = 0xefc53f
export const HOLD_BAR_CHARGED_COLOR = 0x00b1b0
export const HOLD_BAR_EMPTY_COLOR = 0xff8370
export const MODAL_BACKGROUND_COLOR = 0xfff6e5
export const HOLDBAR_REDUCING_RATIO = 0.5
export const CIRCLE_GAUGE_MARGIN = 88
export const CIRCLE_GAUGE_RADUIS = 56
export const CIRCLE_OVER_GAUGE_RADUIS = 40
export const CIRCLE_GAUGE_SHAKE_X = 8
export const SPACE_BETWEEN_MARGIN_SCALE = 0.5
export const FULLCHARGE_SCALE = 1.12
export const FULLCHARGE_ANIMATION_MS = 300
export const METEOR_FREQUENCY_MS = 2500
export const METEOR_SPEED = 300
export const METEOR_ITEMPHASE_SPEED = 500
export const METEOR_SPIN_SPEED = 100
export const PLAYER_HIT_DELAY_MS = 3000
export const HIT_METEOR_SCORE = -100
export const DESTROY_METEOR_SCORE = 200
export const BULLET_FREQUENCY_MS = 3000
export const BULLET_SPEED = 300
export const POISON_FREQUENCY_MS = 5000
export const POISON_SPEED = 400
export const HIT_POISON_SCORE = 0
export const BOOSTER_FREQUENCT_MS = 25000
export const MAX_SELECTED_BOOSTER = 1

export const GAME_TIME_LIMIT_MS = 1.8e6 //30 minutes
export const TUTORIAL_DELAY_MS = 3000
export const WARM_UP_DELAY_MS = 1500
export const MEDIUM_FONT_SIZE = '3.6em'
export const LARGE_FONT_SIZE = '5em'

const env = import.meta.env
export const FIREBASE_API_KEY = env.VITE_FIREBASE_API_KEY
export const FIREBASE_PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID
export const VITE_URL_PATH = env.VITE_URL_PATH
export const DARK_BROWN = 0x57453b
export const DARK_PURPLE = 0x583e7c
export const DARK_ORANGE = 0xd35e24
export const GREEN = 0x05ff00

export const VAS_COUNT = 10
export const MAX_PLAYED = 10
export const TOTAL_MC = 2

export const INHALE_GAUGE_SECTIONS = 5

export const ALL_CHARACTER = [
	{
		characterId: 1,
		name: 'นักผจญภัย',
		detail: '',
	},
	{
		characterId: 2,
		name: 'นักเวทย์',
		detail: '',
	},
	{
		characterId: 3,
		name: 'จอมโจร',
		detail: '',
	},
]

export type keyboardInput =
	| 'ONE'
	| 'TWO'
	| 'THREE'
	| 'FOUR'
	| 'LEFT'
	| 'RIGHT'
	| 'SPACE'

const keyboardOne: keyboardInput = 'ONE'
const keyboardTwo: keyboardInput = 'TWO'
const keyboardThree: keyboardInput = 'THREE'
const keyboardFour: keyboardInput = 'FOUR'
const keyboardCharge: keyboardInput = 'SPACE'
const keyboardLeft: keyboardInput = 'LEFT'
const keyboardRight: keyboardInput = 'RIGHT'

export const BUTTON_MAP = {
	'1': {
		controller: 'B6',
		keyboard: keyboardOne,
	},
	'2': {
		controller: 'B4',
		keyboard: keyboardTwo,
	},
	'3': {
		controller: 'B7',
		keyboard: keyboardThree,
	},
	'4': {
		controller: 'B5',
		keyboard: keyboardFour,
	},
	charge: {
		controller: 'B16',
		keyboard: keyboardCharge,
	},
	left: {
		controller: 'LEFT',
		keyboard: keyboardLeft,
	},
	right: {
		controller: 'RIGHT',
		keyboard: keyboardRight,
	},
}
