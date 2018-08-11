// 深度优先遍历
export default function dfs(array, callback) {
  var result = []
    ; (function traverse(a) {
      if (a instanceof Array) {
        for (var j = 0; j < a.length; j++) {
          traverse(a[j])
        }
      } else {
        result.push(a)
        if (callback) callback(a)
      }
    })(array)
  return result
}

// 广度优先遍历
export function bfs(array) {
  var result = [];
  (function traverse(a) {
    let t = []
    for (var i = 0; i < a.length; i++) {
      if (typeof a[i] === 'object') {
        t = t.concat(a[i])
      } else {
        result.push(a[i])
      }
    }
    if (t.length > 0) {
      traverse(t)
    }
    return result
  })(array)
  return result
}