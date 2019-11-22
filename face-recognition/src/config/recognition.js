import _ from 'underscore'

import angry from 'src-static/images/expressions/angry.png'
import fearfull from 'src-static/images/expressions/fearfull.png'
import happy from 'src-static/images/expressions/happy.png'
import neutral from 'src-static/images/expressions/neutral.png'
import sad from 'src-static/images/expressions/sad.png'

export const MODEL_URL = process.env.NODE_ENV === 'development' ? '/models' : '/proyecto2019/models'
export const MIN_CONFIDENCE = 0.6
export const REFRESH_TIME = 10
export const STEP_TIME = 3

// size at which image is processed, the smaller the faster,
// but less precise in detecting smaller faces, must be divisible
// by 32, common sizes are 128, 160, 224, 320, 416, 512, 608,
// for face tracking via webcam I would recommend using smaller sizes,
// e.g. 128, 160, for detecting smaller faces use larger sizes, e.g. 512, 608
// default: 416
export const INPUT_SIZE = 416
export const MIN_PROBABILITY = 0.1
export const SCORE_WIDTH = 350
export const SCORE_HEIGHT = 350
export const STEPS = 3
export const MIN_CONSISTENCY = 500

export const expressions = [{
  name: 'neutral',
  image: neutral,
  minHigh: 0.90,
  maxHigh: 1,
}, {
  name: 'happy',
  image: happy,
  minHigh: 0.90,
  maxHigh: 1,
}, {
  name: 'sad',
  image: sad,
  minHigh: 0.7,
  maxHigh: 1,
}, {
  name: 'angry',
  image: angry,
  minHigh: 0.6,
  maxHigh: 1,
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

export const supportedExpressions = _.shuffle(expressions.filter(e => !e.disabled))
