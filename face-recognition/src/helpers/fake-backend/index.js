import { asyncLocalStorage } from 'src/helpers/local-storage'

const getScores = () => 
  asyncLocalStorage.getItem('scores')
    .then(result => JSON.parse(result || '[]'))

const clearScores = () => {
  asyncLocalStorage.setItem('scores', JSON.stringify([]))

  return getScores()
}

const addScore = score =>
  getScores()
    .then(scores => asyncLocalStorage.setItem('scores', JSON.stringify([ ...scores, score ])))

export default {
  getScores,
  clearScores,
  addScore,
}