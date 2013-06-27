/*
  backgrid-select2-cell
  http://github.com/wyuenho/backgrid-select2-cell

  Copyright (c) 2013 Jimmy Yuen Ho Wong and contributors
  Licensed under the MIT license.
*/

// jshint globalstrict:true, node:true

"use strict";

module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON("package.json"),

    banner: '/*!\n  <%= pkg.name %>\n' +
      '  <%= pkg.repository.url %>\n\n' +
      '  Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
      '  Licensed under the MIT license.\n' +
      '*/\n\n',

    clean: {
      options: {
        force: true
      },
      api: [
        "api/**/*"
      ],
      "default": [
        "*.min.*",
        "test/coverage/**/*"
      ]
    },
    jasmine: {
      test: {
        version: "1.3.1",
        src: [
          "backgrid-select2-cell.js"
        ],
        options: {
          specs: [
            "test/s*.js"
          ],
          template: require("grunt-template-jasmine-istanbul"),
          templateOptions: {
            coverage: "test/coverage/coverage.json",
            report: {
              type: "html",
              options: {
                dir: "test/coverage"
              }
            }
          },
          vendor: [
            "test/vendor/js/jquery.js",
            "test/vendor/js/bootstrap.js",
            "test/vendor/js/underscore.js",
            "test/vendor/js/backbone.js",
            "test/vendor/js/backgrid.js",
            'test/vendor/js/backbone-pageable.js',
            'test/vendor/js/select2-cell.js'
          ]
        }
      }
    },
    jsduck: {
      main: {
        src: ["backgrid-select2-cell.js"],
        dest: "api",
        options: {
          "external": ["Backbone.Model,Backbone.Collection,Backbone.View,Backgrid.Grid,Backgrid.Column,Backgrid.SelectCellEditor,Backgrid.SelectCell"],
          "title": "backgrid-select2-cell",
          "no-source": true,
          "categories": "categories.json",
          "warnings": "-no_doc",
          "pretty-json": true
        }
      }
    },
    recess: {
      csslint: {
        options: {
          compile: true
        },
        files: {
          "backgrid-select2-cell.css": ["backgrid-select2-cell.css"]
        }
      },
      "default": {
        options: {
          compress: true
        },
        files: {
          "backgrid-select2-cell.min.css": ["backgrid-select2-cell.css"]
        }
      }
    },
    uglify: {
      options: {
        mangle: true,
        compress: true,
        preserveComments: "some"
      },
      "default": {
        files: {
          "backgrid-select2-cell.min.js": ["backgrid-select2-cell.js"]
        }
      }
    },
    usebanner: {
      dist: {
        options: {
          position: 'top',
          banner: '<%= banner %>'
        },
        files: {
          src: [ '*.min.css' ]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-recess");
  grunt.loadNpmTasks("grunt-jsduck");
  grunt.loadNpmTasks("grunt-contrib-jasmine");
  grunt.loadNpmTasks('grunt-banner');

  grunt.registerTask("dist", [ "uglify", "recess", "usebanner" ] );
  grunt.registerTask("default", ["clean", "jsduck", "dist", "jasmine"]);
};
