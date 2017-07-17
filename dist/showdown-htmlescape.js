/*! showdown-htmlescape 17-07-2017 */

(function () {
  'use strict'

  var htmlEscape = [{
    type: 'lang',
    filter: function (text, converter, options) {
      var codeBlocks = []

      function hashCodeBlock (code) {
        code = '~C' + (codeBlocks.push(code) - 1) + 'C'
        return code
      }

      text += '~0'
      text = text.replace(/(^[ \t]*>([ \t]*>)*)(?=.*?$)/gm, function (
        wholeMatch) {
        wholeMatch = wholeMatch.replace(/>/g, '~Q')
        return wholeMatch
      })
      if (options.ghCodeBlocks) {
        text = text.replace(/(^|\n)(```(.*)\n([\s\S]*?)\n```)/g,
          function (wholeMatch, m1, m2) {
            return m1 + hashCodeBlock(m2)
          }
        )
      }
      text = text.replace(
        /((?:(?:(?: |\t|~Q)*?~Q)?\n){2}|^(?:(?: |\t|~Q)*?~Q)?)((?:(?:(?: |\t|~Q)*?~Q)?(?:[ ]{4}|\t).*\n+)+)((?:(?: |\t|~Q)*?~Q)?\n*[ ]{0,3}(?![^ \t\n])|(?=(?:(?: |\t|~Q)*?~Q)?~0))/g,
        function (wholeMatch, m1, m2, m3) {
          return m1 + hashCodeBlock(m2) + m3
        })
      text = text.replace(
        /(^|[^\\])((`+)([^\r]*?[^`])\3)(?!`)/gm,
        function (wholeMatch) {
          return hashCodeBlock(wholeMatch)
        })
      text = text.replace(/&/g, '&amp;')
      text = text.replace(/</g, '&lt;')
      text = text.replace(/>/g, '&gt;')
      while (text.search(/~C(\d+)C/) >= 0) {
        var codeBlock = codeBlocks[RegExp.$1]
        codeBlock = codeBlock.replace(/\$/g, '$$$$') // Escape any dollar signs
        text = text.replace(/~C\d+C/, codeBlock)
      }
      text = text.replace(/~Q/g, '>')
      text = text.replace(/~0$/, '')

      return text
    }
  }]
  if (typeof window !== 'undefined' && window.showdown && window.showdown.extension) {
    window.showdown.extension('htmlescape', htmlEscape)
  }
  if (typeof module !== 'undefined') {
    module.exports = htmlEscape
  }
}())

//# sourceMappingURL=showdown-htmlescape.js.map