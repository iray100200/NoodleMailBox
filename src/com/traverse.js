export default function (array, callback) {
  var results = []
  ;(function traverse (a) {
    if (a instanceof Array) {
      for (var j = 0; j < a.length; j++) {
        traverse(a[j])
      }
    } else {
      results.push(a)
      if (callback) callback(a)
    }
  })(array)
  return results
}
