export const MODEL_URL = '/models'
export const MIN_CONFIDENCE = 0.6
export const INPUT_SIZE = 320
export const MIN_PROBABILITY = 0.1
export const SCORE_WIDTH = 350
export const SCORE_HEIGHT = 350
export const STEPS = 5

export const expressions = [{
  name: 'neutral',
  icon: 'meh',
}, {
  name: 'happy',
  icon: 'smile',
}, {
  name: 'sad',
  icon: 'sad-tear',
  disabled: true,
}, {
  name: 'angry',
  icon: 'angry',
}, {
  name: 'fearfull',
  icon: '', 
  disabled: true,
}, {
  name: 'disgusted',
  icon: '',
  disabled: true,
}, {
  name: 'surprised',
  icon: '',
  disabled: true,
}]

export const supportedExpressions = expressions.filter(e => !e.disabled)
