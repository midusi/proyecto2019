export default {
  device: null,
  collections: {
    isFetching: false,
    error: null,
    scores: null,
  },
  form: {
    isFetching: false,
    error: '',
    success: false,
    current: {
      image: '',
      expression: '',
      probability: '',
    },
    fields: {
      image: '',
      imageErrorMsg: '',
      imageHasError: false,
      expression: '',
      expressionErrorMsg: '',
      expressionHasError: false,
      probability: '',
      probabilityErrorMsg: '',
      probabilityHasError: false,
    },
  }
}