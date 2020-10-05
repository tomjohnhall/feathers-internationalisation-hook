const errors = require('@feathersjs/errors')
const { getType } = require('./utils')

const defaults = {
  fields: [],
  language: 'en'
}

module.exports = function (options) {
  options = Object.assign({}, defaults, options)

  return function parsenI18nData (context) {
    const { type, method } = context

    if (type !== 'before' && (method === 'find' || method === 'get')) {
      throw new errors.Forbidden('`parsenI18nData` can only be run on a `before` hook.')
    }

    context.data = parseData(context.data, options.language, options.fields)

    return context
  }
}

/**
 * This will create a nested query such as { 'description.en': 'something' }
 * from this { description: 'something' }
 * @param {Array|Object} query the query to be modified
 * @param {String} language the language the query is to be modified with
 * @param {Array} props array of props to replace
 */
function parseData (data, language, props = []) {
  if (data === null || data === undefined) {
    return null
  }

  if (Array.isArray(data)) {
    return data.map(val => parseData(val, language, props))
  } else if (getType(data) === 'string') {
    return { [language]: data }
  } else {
    return props.reduce((parsedData, prop) => {
      if (data[prop]) {
        let value = data[prop]
        let type = getType(value)

        if (type === 'array') {
          parsedData[prop] = value.map(value => parseData(value, language, props))
        } else {
          parsedData[prop] = Object.assign({}, parsedData[prop], { [language]: value })
        }
      }
      return parsedData
    }, data)
  }
}
