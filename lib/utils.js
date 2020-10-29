module.exports.getType = function getType (value) {
  let type = (Array.isArray(value) && 'array') ||
    (value === null && 'null') ||
    value === '' && 'string' || 
    typeof value

  return (type === 'number' && isNaN(value) && 'NaN') || type
}
