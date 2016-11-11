/*
The MIT License (MIT)

Copyright (c) 2015 Philipp Wolfer, phil@parolu.de, parolu UG (haftungsbeschränkt)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

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

      // Hash > characters used to mark block quotes
      text = text.replace(/(^[ \t]*>([ \t]*>)*)(?=.*?$)/gm, function (
        wholeMatch) {
        wholeMatch = wholeMatch.replace(/>/g, '~Q')
        return wholeMatch
      })

      // Hash existing code blocks, those will be esacaped
      // by the corresponding parser.
      if (options.ghCodeBlocks) {
        text = text.replace(/(^|\n)(```(.*)\n([\s\S]*?)\n```)/g,
          function (wholeMatch, m1, m2) {
            return m1 + hashCodeBlock(m2)
          }
        )
      }

      // Find Markdown code blocks, also find those nested in block quotes
      // m1 ((?:(?:(?: |\t|~Q)*?~Q)?\n){2}|^): Leading empty lines, can contain
      //                                      block quotes
      // m2 ((?:(?:(?: |\t|~Q)*?~Q)?(?:[ ]{4}|\t).*\n+)+): The code block lines
      // m3 ((?:(?: |\t|~Q)*?~Q)?\n*[ ]{0,3}(?![^ \t\n])|(?=~0)): Additional lines
      text = text.replace(
        /((?:(?:(?: |\t|~Q)*?~Q)?\n){2}|^(?:(?: |\t|~Q)*?~Q)?)((?:(?:(?: |\t|~Q)*?~Q)?(?:[ ]{4}|\t).*\n+)+)((?:(?: |\t|~Q)*?~Q)?\n*[ ]{0,3}(?![^ \t\n])|(?=(?:(?: |\t|~Q)*?~Q)?~0))/g,
        function (wholeMatch, m1, m2, m3) {
          return m1 + hashCodeBlock(m2) + m3
        })

      // Markfown inline code
      text = text.replace(
        /(^|[^\\])((`+)([^\r]*?[^`])\3)(?!`)/gm,
        function (wholeMatch) {
          return hashCodeBlock(wholeMatch)
        })

      // Escape HTML special chars
      text = text.replace(/&/g, '&amp;')
      text = text.replace(/</g, '&lt;')
      text = text.replace(/>/g, '&gt;')

      // Put the code blocks back in place
      while (text.search(/~C(\d+)C/) >= 0) {
        var codeBlock = codeBlocks[RegExp.$1]
        codeBlock = codeBlock.replace(/\$/g, '$$$$') // Escape any dollar signs
        text = text.replace(/~C\d+C/, codeBlock)
      }

      // Restore block quote signs
      text = text.replace(/~Q/g, '>')
      text = text.replace(/~0$/, '')

      return text
    }
  }]

  // Client-side export
  if (typeof window !== 'undefined' && window.showdown && window.showdown.extension) {
    window.showdown.extension('htmlescape', htmlEscape)
  }

  // Server-side export
  if (typeof module !== 'undefined') {
    module.exports = htmlEscape
  }
}())
