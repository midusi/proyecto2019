import _ from 'underscore'

export const winner = expression => descriptions => {
  if (!descriptions[0])
    return null

  return _.max(descriptions, description => {
    return description.expressions[expression]
  })
}

export default {
  winner,
}
