const assert = require('assert')
const makeHook = require('../lib/parse-result')

const parseResult = makeHook({ fields: ['title', 'description'] })
const parseNestedResult = makeHook({ fields: ['nest.title'] })

describe('Result', function() {
  it('transforms the result as object', function() {
    const context = {
      type: 'after',
      result: {
        title: {
          en: 'a huge title'
        },
        date: 'a date'
      }
    }

    parseResult(context)
    const { result } = context

    assert.strictEqual(
      result.title,
      'a huge title',
      'we have converted the title'
    )
    assert.strictEqual(result.date, 'a date', 'date has not been modified')
  })

  it('transforms the empty string', function() {
    const context = {
      type: 'after',
      result: {
        data: [
          {
            title: {
              en: ''
            },
            description: {
              en: ''
            }
          }
        ]
      }
    }

    parseResult(context)
    const { result } = context
    assert.strictEqual(result.data[0].title, '', 'Space not parsed correctly')
    assert.strictEqual(
      result.data[0].description,
      '',
      'Space not parsed correctly'
    )
  })

  it('ignores already transformed result', function() {
    const context = {
      type: 'after',
      result: {
        title: 'a huge title',
        date: 'a date'
      }
    }

    parseResult(context)
    const { result } = context

    assert.strictEqual(
      result.title,
      'a huge title',
      'we have converted the title'
    )
    assert.strictEqual(result.date, 'a date', 'date has not been modified')
  })

  it('transforms the result as array (not-paginated)', function() {
    const context = {
      type: 'after',
      result: [
        {
          title: {
            en: 'a huge title'
          },
          date: 'a date'
        },
        {
          title: {
            en: 'another title'
          },
          description: {
            en: 'a description',
            fr: 'a la french description'
          },
          date: 'a date'
        }
      ]
    }

    parseResult(context)
    const { result } = context

    assert.strictEqual(
      result[0].title,
      'a huge title',
      'we have converted the title'
    )
    assert.strictEqual(result[0].date, 'a date', 'date has not been modified')

    assert.strictEqual(
      result[1].title,
      'another title',
      'we have converted the title'
    )
    assert.strictEqual(
      result[1].description,
      'a description',
      'we have the correct description'
    )
    assert.strictEqual(result[1].date, 'a date', 'date has not been modified')
  })

  it('transforms the result as array (paginated)', function() {
    const context = {
      type: 'after',
      result: {
        data: [
          {
            title: {
              en: 'a huge title'
            },
            date: 'a date'
          },
          {
            title: {
              en: 'another title'
            },
            description: {
              en: 'a description',
              fr: 'a la french description'
            },
            date: 'a date'
          }
        ]
      }
    }

    parseResult(context)
    const { result } = context

    assert.strictEqual(
      result.data[0].title,
      'a huge title',
      'we have converted the title'
    )
    assert.strictEqual(
      result.data[0].date,
      'a date',
      'date has not been modified'
    )

    assert.strictEqual(
      result.data[1].title,
      'another title',
      'we have converted the title'
    )
    assert.strictEqual(
      result.data[1].description,
      'a description',
      'we have the correct description'
    )
    assert.strictEqual(
      result.data[1].date,
      'a date',
      'date has not been modified'
    )
  })

  it('can change language (fallback to en)', function() {
    const context = {
      type: 'after',
      result: {
        data: [
          {
            title: {
              en: 'a huge title'
            },
            date: 'a date'
          },
          {
            title: {
              en: 'another title'
            },
            description: {
              en: 'a description',
              fr: 'a la french description'
            },
            date: 'a date'
          }
        ]
      }
    }

    makeHook({ fields: ['title', 'description'], language: 'fr' })(context)
    const { result } = context
    assert.strictEqual(
      result.data[0].title,
      'a huge title',
      'we have converted the title'
    )
    assert.strictEqual(
      result.data[0].date,
      'a date',
      'date has not been modified'
    )

    assert.strictEqual(
      result.data[1].title,
      'another title',
      'we have converted the title'
    )
    assert.strictEqual(
      result.data[1].description,
      'a la french description',
      'we have the correct description'
    )
    assert.strictEqual(
      result.data[1].date,
      'a date',
      'date has not been modified'
    )
  })

  it('transforms a nested object', function() {
    const context = {
      type: 'after',
      result: {
        nest: {
          title: {
            en: 'a huge title'
          }
        },
        date: 'a date'
      }
    }

    parseNestedResult(context)
    const { result } = context

    assert.strictEqual(
      result.nest.title,
      'a huge title',
      'we have converted the title'
    )
    assert.strictEqual(result.date, 'a date', 'date has not been modified')
  })

  it('transforms an array of nested objects', function() {
    const context = {
      type: 'after',
      result: {
        nest: [
          {
            title: {
              en: 'a huge title'
            },
            date: 'a date'
          },
          {
            title: {
              en: 'another title'
            },
            date: 'a date'
          }
        ]
      }
    }

    parseNestedResult(context)
    const { result } = context

    assert.strictEqual(
      result.nest[0].title,
      'a huge title',
      'we have converted the title'
    )
    assert.strictEqual(
      result.nest[1].title,
      'another title',
      'we have converted the title'
    )
    assert.strictEqual(
      result.nest[0].date,
      'a date',
      'date has not been modified'
    )
  })

  it('transforms an array of deep nested objects', function() {
    const context = {
      type: 'after',
      result: {
        nest: {
          deepNest: [
            {
              title: {
                en: 'a huge title'
              },
              date: 'a date'
            },
            {
              title: {
                en: 'another title'
              },
              date: 'a date'
            }
          ]
        }
      }
    }

    makeHook({ fields: ['nest.deepNest.title'] })(context)
    const { result } = context

    assert.strictEqual(
      result.nest.deepNest[0].title,
      'a huge title',
      'we have converted the title'
    )
    assert.strictEqual(
      result.nest.deepNest[1].title,
      'another title',
      'we have converted the title'
    )
  })
})
