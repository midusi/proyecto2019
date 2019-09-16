export const formValidation = state => {
  const { current, fields } = state

  const hasError = Object.entries(fields)
    .filter(f => f[0].includes('HasError'))
    .find(f => f[1] === true)

  if (hasError) {
    return false
  }

  const updated = Object.keys(fields)
    .filter(f => !(f.includes('HasError') || f.includes('ErrorMsg')))
    .filter(f => current.hasOwnProperty(f))
    .find(f => current[f] !== fields[f])

  if (!updated) {
    return false
  }

  return true
}

export default {
  formValidation,
}
  