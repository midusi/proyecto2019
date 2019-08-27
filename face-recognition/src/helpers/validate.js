import moment from 'moment-timezone'
import validate from 'validate.js'

validate.extend(validate.validators.datetime, {
  // The value is guaranteed not to be null or undefined but otherwise it
  // could be anything.
  parse: function(value) {
    return +moment.utc(value, 'DD/MM/YYYY')
  },

  // Input is a unix timestamp
  format: function(value, options) {
    var format = options.dateOnly ?
      'DD/MM/YYYY' :
      'DD/MM/YYYY hh:mm:ss'

    return moment.utc(value).format(format)
  }
})

export default validate
