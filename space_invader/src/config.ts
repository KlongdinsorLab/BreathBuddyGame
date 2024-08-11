export const SCREEN_WIDTH = 720
export const SCREEN_HEIGHT = 1280
export const MARGIN = 48
export const PLAYER_START_MARGIN = 240
export const PLAYER_SPEED = 480
export const LASER_SPEED = 800
export const TRIPLE_LASER_X_SPEED = 80
export const LASER_FREQUENCY_MS = 500
export const BULLET_COUNT = 30
export const RELOAD_COUNT = 10
export const HOLD_DURATION_MS = 1000
export const HOLD_BAR_HEIGHT = 40
export const HOLD_BAR_BORDER = 8
export const HOLD_BAR_COLOR = 0x9966ff
export const HOLD_BAR_IDLE_COLOR = 0x603f8b
export const HOLD_BAR_CHARGING_COLOR = 0xefc53f
export const HOLD_BAR_CHARGED_COLOR = 0x00b1b0
export const HOLD_BAR_EMPTY_COLOR = 0xff8370
export const MODAL_BACKGROUND_COLOR = 0x473d4d
export const HOLDBAR_REDUCING_RATIO = 0.5
export const CIRCLE_GAUGE_MARGIN = 68
export const CIRCLE_GAUGE_RADUIS = 56
export const CIRCLE_OVER_GAUGE_RADUIS = 40
export const CIRCLE_GAUGE_SHAKE_X = 8
export const SPACE_BETWEEN_MARGIN_SCALE = 0.5
export const FULLCHARGE_SCALE = 1.12
export const FULLCHARGE_ANIMATION_MS = 300

export const METEOR_FREQUENCY_MS = 2500
export const METEOR_SPEED = 300
export const METEOR_SPIN_SPEED = 100
export const PLAYER_HIT_DELAY_MS = 3000
export const HIT_METEOR_SCORE = -200
export const DESTROY_METEOR_SCORE = 400

export const GAME_TIME_LIMIT_MS = 160000
export const TUTORIAL_DELAY_MS = 3000
export const MEDIUM_FONT_SIZE = '3.6em'
export const LARGE_FONT_SIZE = '5em'

const env = import.meta.env;
export const FIREBASE_API_KEY = (env.VITE_FIREBASE_API_KEY);
export const FIREBASE_PROJECT_ID = (env.VITE_FIREBASE_PROJECT_ID);
export const VITE_URL_PATH = (process.env.VITE_URL_PATH);