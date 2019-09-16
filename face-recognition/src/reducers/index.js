import { combineReducers } from 'redux'

import scoreReducer from './score'

export default combineReducers({
  score: scoreReducer,
})
