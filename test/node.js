/* eslint-env mocha */

(function () {
  'use strict'

  require('chai').should()

  var fs = require('fs')
  var extension = require('../src/showdown-htmlescape.js')
  var showdown = require('showdown')
  var cases = fs.readdirSync('test/cases/')
      .filter(filter())
      .map(map('test/cases/'))
  var issues = []
  // issues = fs.readdirSync('test/issues/')
  //   .filter(filter())
  //   .map(map('test/issues/'));

  // ///////////////////////////////////////////////////////////////////////////
  // Test cases
  //
  describe('HTML Escape Extension simple testcases', function () {
    for (var i = 0; i < cases.length; ++i) {
      it(cases[i].name, assertion(cases[i]))
    }
  })

  describe('HTML Escape Extension issues testcase', function () {
    for (var i = 0; i < issues.length; ++i) {
      it(issues[i].name, assertion(issues[i]))
    }
  })

  // ///////////////////////////////////////////////////////////////////////////
  // Test cases
  //
  function filter () {
    return function (file) {
      var ext = file.slice(-3)
      return (ext === '.md')
    }
  }

  function map (dir) {
    return function (file) {
      var name = file.replace('.md', '')
      var htmlPath = dir + name + '.html'
      var html = fs.readFileSync(htmlPath, 'utf8')
      var mdPath = dir + name + '.md'
      var md = fs.readFileSync(mdPath, 'utf8')
      var optionsPath = dir + name + '.json'
      var options = {}

      try {
        options = JSON.parse(fs.readFileSync(optionsPath, 'utf8'))
        options.extensions = [extension]
      } catch (e) {
        options.extensions = [extension]
      }

      return {
        name: name,
        input: md,
        expected: html,
        options: options
      }
    }
  }

  // Normalize input/output
  function normalize (testCase) {
    // Normalize line returns
    testCase.expected = testCase.expected.replace(/\r/g, '')
    testCase.actual = testCase.actual.replace(/\r/g, '')

    // Ignore all leading/trailing whitespace
    testCase.expected = testCase.expected.split('\n').map(function (x) {
      return x.trim()
    }).join('\n')
    testCase.actual = testCase.actual.split('\n').map(function (x) {
      return x.trim()
    }).join('\n')

    // Ignore double line breaks
    testCase.expected = testCase.expected.replace(/\n+/g, '\n')
    testCase.actual = testCase.actual.replace(/\n+/g, '\n')

    // Remove extra lines
    testCase.expected = testCase.expected.trim()

    // Convert whitespace to a visible character so that it shows up on error reports
    testCase.expected = testCase.expected.replace(/ /g, '·')
    testCase.expected = testCase.expected.replace(/\n/g, '•\n')
    testCase.actual = testCase.actual.replace(/ /g, '·')
    testCase.actual = testCase.actual.replace(/\n/g, '•\n')

    return testCase
  }

  function assertion (testCase) {
    return function () {
      var converter = new showdown.Converter(testCase.options)
      testCase.actual = converter.makeHtml(testCase.input)
      testCase = normalize(testCase)

      // Compare
      testCase.actual.should.equal(testCase.expected)
    }
  }
})()
