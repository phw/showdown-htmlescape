module.exports = function (grunt) {
  'use strict'

  require('load-grunt-tasks')(grunt)

  var config = {
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        sourceMap: true
      },
      dist: {
        src: ['src/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    comments: {
      js: {
        options: {
          singleline: true,
          multiline: true
        },
        src: ['<%= concat.dist.dest %>']
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        sourceMap: true
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    eslint: {
      options: {
      },
      target: [
        'Gruntfile.js',
        'src/**/*.js',
        'test/**/*.js'
      ]
    },

    bump: {
      options: {
        files: [
          'bower.json',
          'package.json'
        ],
        commit: true,
        commitMessage: 'chore(release): version %VERSION%',
        commitFiles: [
          'CHANGELOG.md',
          'bower.json',
          'package.json',
          'dist/*.js',
          'dist/*.js.map'
        ],
        createTag: true,
        tagName: '%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'origin'
      }
    },

    conventionalChangelog: {
      options: {
        changelogOpts: {
          preset: 'angular'
        }
      },
      release: {
        src: 'CHANGELOG.md'
      }
    },

    // Server-side tests
    simplemocha: {
      test: {
        src: 'test/node.js',
        options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: false,
          reporter: 'spec'
        }
      }
    },

    mocha_istanbul: {
      coverage: {
        src: 'test/node.js', // a folder works nicely
        options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: false,
          reporter: 'spec'
        }
      }
    }
  }

  grunt.initConfig(config)

  grunt.registerTask('lint', ['eslint'])
  grunt.registerTask('test', ['lint', 'simplemocha'])
  grunt.registerTask('coverage', ['lint', 'mocha_istanbul'])
  grunt.registerTask('build', ['test', 'concat', 'comments', 'uglify'])
  grunt.registerTask('release', [
    'bump-only', 'build', 'conventionalChangelog', 'bump-commit'
  ])

  grunt.registerTask('default', [])
}
