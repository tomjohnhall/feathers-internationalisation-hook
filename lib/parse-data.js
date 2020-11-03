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

    parseData(context.data, options.language, options.fields)

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
    return data
  }

  if (Array.isArray(data)) {
    data = data.map(val => parseData(val, language, props))
  } else if (getType(data) === 'string') {
    data = { [language]: data }
  } else {
    // do not convert if already converted
    if (data[language]) return data
    data = props.reduce((parsedData, prop) => {
      let value = data[prop]

      if (value !== null && value !== undefined) { parsedData[prop] = parseData(value, language, props) }

      return parsedData
    }, data)
  }
  return data
}
