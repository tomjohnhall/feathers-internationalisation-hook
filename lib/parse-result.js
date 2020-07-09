const errors = require('@feathersjs/errors')

const defaults = {
  fields: [],
  language: 'en'
}

module.exports = function (options) {
  options = Object.assign({}, defaults, options)

  return function parseI18nResult (context) {
    const { type } = context

    if (type !== 'after') {
      throw new errors.Forbidden(
        '`parseI18nResult` can only be run on a `after` hook.'
      )
    }

    context.result = parseResult(
      context.result,
      options.language,
      options.fields
    )

    return context
  }
}

function parseItem (data, keys, language) {
  const iterKeys = keys.slice()
  while (iterKeys.length) {
    let key = iterKeys.shift()
    if (!data[key]) break
    if (Array.isArray(data[key])) {
      if (iterKeys.length) {
        data[key] = data[key].map((item) => parseItem(item, iterKeys, language))
        break
      } else {
        data[key] = data[key].map(inObj => inObj[language] || inObj[defaults.language])
      }
    } else if (iterKeys.length === 0) {
      if (typeof data[key] === 'object') { data[key] = data[key][language] || data[key][defaults.language] }
    } else {
      data[key] = parseItem(data[key], iterKeys, language)
    }
  }
  return data
}

/**
 * This will replace a nested object such as { description: { en: 'something' } }
 * with { description: 'something' }
 * @param {Array|Object} result the data to be modified
 * @param {String} language the language data to replace the nested object with
 * @param {Array} props array of props to replace
 */
function parseResult (result, language, props = []) {
  if (result === null || result === undefined) {
    return null
  }

  let data

  if (Array.isArray(result)) data = result
  else if (Array.isArray(result.data)) data = result.data.concat(result)
  else data = [result]

  data.map((item) => {
    props.forEach((prop) => {
      item = parseItem(item, prop.split('.'), language)
    })
    return item
  })

  return result
}

/**
 * This will replace a nested object such as { description: { en: 'something' } }
 * with { description: 'something' }
 * @param {Array|Object} result the data to be modified
 * @param {String} language the language data to replace the nested object with
 * @param {Array} props array of props to replace
 */
/*
function parseResult(result, language, props = []) {
  if (result === null || result === undefined) {
    return null;
  }

  const data = [].concat(result.data || result);

  data.forEach((item, index) => {
    Object.keys(item).forEach(key => {
      if (props.includes(key)) {
        // Find data of specified language, otherwise fallback to default
        const res =
          data[index][key][language] || data[index][key][defaults.language];
        if (res || res === "") {
          Object.assign(data[index], { [key]: res });
        }
      }
    });
  });

  return result;
}
*/
