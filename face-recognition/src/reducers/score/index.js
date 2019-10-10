import initialState from 'src/state/score'
import {
  SCORE_SET_DEVICE,

  SCORES_GET_REQUEST,
  SCORES_GET_SUCCESS,
  SCORES_GET_FAILURE,

  SCORES_CLEAR_REQUEST,
  SCORES_CLEAR_SUCCESS,
  SCORES_CLEAR_FAILURE,

  SCORE_ADD_REQUEST,
  SCORE_ADD_SUCCESS,
  SCORE_ADD_FAILURE,

  ON_SCORE_FORM_CLEAR,
  ON_SCORE_FORM_FIELD_CHANGE,
} from 'src/constants'

const formRequest = state => ({
  ...state,
  form: {
    ...state.form,
    isFetching: true,
    error: null,
  }
})

const formSuccess = state => ({
  ...state,
  form: {
    ...state.form,
    isFetching: true,
    error: null,
    success: true,
  }
})

const formFailure = (state, err) => ({
  ...state,
  form: {
    ...state.form,
    isFetching: true,
    error: err,
  }
})

const mutations = {
  [ON_SCORE_FORM_CLEAR](state) {
    return {
      ...state,
      form: initialState.form,
    }
  },
  [ON_SCORE_FORM_FIELD_CHANGE](state, { field, value }) {
    return {
      ...state,
      form: {
        ...state.form,
        fields: {
          ...state.form.fields,
          [field]: value,
        }
      }
    }
  },

  [SCORE_SET_DEVICE](state, device) {
    return {
      ...state,
      device,
    }
  },

  [SCORES_GET_REQUEST](state) {
    return {
      ...state,
      collections: {
        ...state.collections,
        isFetching: true,
      }
    }
  },
  [SCORES_GET_SUCCESS](state, scores) {
    return {
      ...state,
      collections: {
        ...state.collections,
        isFetching: false,
        scores,
      }
    }
  },
  [SCORES_GET_FAILURE](state, err) {
    return {
      ...state,
      collections: {
        ...state.collections,
        isFetching: false,
        error: err,
      }
    }
  },

  [SCORES_CLEAR_REQUEST](state) {
    return {
      ...state,
      collections: {
        ...state.collections,
        isFetching: true,
      }
    }
  },
  [SCORES_CLEAR_SUCCESS](state) {
    return {
      ...state,
      collections: {
        ...state.collections,
        isFetching: false,
        scores: null,
      }
    }
  },
  [SCORES_CLEAR_FAILURE](state, err) {
    return {
      ...state,
      collections: {
        ...state.collections,
        isFetching: false,
        error: err,
      }
    }
  },
  [SCORE_ADD_REQUEST]: formRequest,
  [SCORE_ADD_SUCCESS]: formSuccess,
  [SCORE_ADD_FAILURE]: formFailure,
}

export default (state = initialState, action) => mutations.hasOwnProperty(action.type) ?
  mutations[action.type](state, action.payload) :
  state