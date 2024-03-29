import _ from 'underscore'

export const winners = expression => descriptions => {
  if (!descriptions[0])
    return null

  return _.sample(_.sortBy(descriptions, description => {
    return description.expressions[expression]
  }), 3)
}

export default {
  winners,
}
