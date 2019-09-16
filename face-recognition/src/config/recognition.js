import angry from 'src-static/images/expressions/angry.png'
import fearfull from 'src-static/images/expressions/fearfull.png'
import happy from 'src-static/images/expressions/happy.png'
import neutral from 'src-static/images/expressions/neutral.png'
import sad from 'src-static/images/expressions/sad.png'

export const MODEL_URL = '/models'
export const MIN_CONFIDENCE = 0.6
export const REFRESH_TIME = 10
export const STEP_TIME = 5
export const INPUT_SIZE = 320
export const MIN_PROBABILITY = 0.1
export const SCORE_WIDTH = 350
export const SCORE_HEIGHT = 350
export const STEPS = 3

export const expressions = [{
  name: 'neutral',
  image: neutral,
  minHigh: 0.96,
  maxHigh: 1,
}, {
  name: 'happy',
  image: happy,
  minHigh: 0.95,
  maxHigh: 1,
}, {
  name: 'sad',
  image: sad,
  minHigh: 0.8,
  maxHigh: 1,
}, {
  name: 'angry',
  image: angry,
  minHigh: 0.90,
  maxHigh: 0.98,
}, {
  name: 'fearfull',
  image: fearfull,
  disabled: true,
  minHigh: 0.55,
  maxHigh: 1,
}, {
  name: 'disgusted',
  image: '',
  disabled: true,
}, {
  name: 'surprised',
  image: '',
  disabled: true,
}]

export const supportedExpressions = expressions.filter(e => !e.disabled)
