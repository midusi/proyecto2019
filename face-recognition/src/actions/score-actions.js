import {
  SCORES_GET_REQUEST,
  SCORES_GET_SUCCESS,
  SCORES_GET_FAILURE,

  SCORE_ADD_REQUEST,
  SCORE_ADD_SUCCESS,
  SCORE_ADD_FAILURE,

  ON_SCORE_FORM_CLEAR,
  ON_SCORE_FORM_FIELD_CHANGE,
} from 'src/constants'

import backend from 'src/helpers/fake-backend'

export const onScoreFormClear = () => ({
  type: ON_SCORE_FORM_CLEAR,
})

export const onScoreFormFieldChange = (field, value) => ({
  type: ON_SCORE_FORM_FIELD_CHANGE,
  payload: { field, value },
})

export const getScores = () => dispatch => {
  dispatch({ type: SCORES_GET_REQUEST })
  return backend.getScores()
    .then(scores => {
      dispatch({ type: SCORES_GET_SUCCESS, payload: scores })
    })
    .catch(err => {
      dispatch({ type: SCORES_GET_FAILURE, payload: err })
    })
}

export const addScore = () => (dispatch, getState) => {
  const {
    score: {
      form: {
        fields: {
          expression,
          probability,
          image,
        },
      }
    }
  } = getState()

  dispatch({ type: SCORE_ADD_REQUEST })
  return backend.addScore({ expression, probability, image })
    .then(() => {
      dispatch({ type: SCORE_ADD_SUCCESS, payload: { expression, probability, image } })
      dispatch(getScores())
    })
    .catch(err => {
      dispatch({ type: SCORE_ADD_FAILURE, payload: err })
    })
}

export default {
  onScoreFormClear,
  onScoreFormFieldChange,
  getScores,
  addScore,
}