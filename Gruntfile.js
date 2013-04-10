var path = require('path');

exports = module.exports = function (grunt) {

  var config = grunt.initConfig({
    clean: {
      docs: {
        src: ['docs']
      },
      example: {
        src: ['example/components']
      },
      test: {
        src: ['coverage']
      }
    },
    karma: {
      unit: {
        configFile: 'config/karma.conf.js'
      },
      e2e: {
        configFile: 'config/karma-e2e.conf.js'
      }
    },
    server: {
      testMode: false,
      port: 3000
    },
    jshint: {
      all: ['Gruntfile.js', 'server.js', 'js/*.js', 'test/**/*.js', 'config/*.js', 'example/*.js']
    },
    docs: {
      all: {
        src: ['README.md', 'js/angular-authentication.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('lint', ['jshint']);

  grunt.registerTask('bootstrap', ['doc', 'bootstrap-example']);

  grunt.registerTask('default', ['jshint', 'doc', 'bootstrap-example', 'test']);

  grunt.registerTask('test', 'Run all tests', ['test:unit', 'test:e2e']);

  grunt.registerTask('test:unit', 'Runs all unit tests with PhantomJS', function () {
    grunt.task.run('karma:unit');
  });

  grunt.registerTask('test:e2e', 'Runs all end to end tests with Chrome', function () {
    config.server.testMode = true;
    grunt.task.run('server');
    grunt.task.run('karma:e2e');
  });

  grunt.registerTask('cont', ['continuous:unit']);
  grunt.registerTask('cont:unit', ['continuous:unit']);
  grunt.registerTask('continuous', ['continuous:unit']);
  grunt.registerTask('continuous:unit', 'Runs all unit tests continuously with PhantomJS', function () {
    config.karma.unit.singleRun = false;
    config.karma.unit.autoWatch = true;
    grunt.task.run('karma:unit');
  });

  grunt.registerTask('cont:e2e', ['continuous:e2e']);
  grunt.registerTask('continuous:e2e', 'Runs all end to end tests continuously with Chrome', function () {
    config.karma.e2e.singleRun = false;
    config.karma.e2e.autoWatch = true;
    config.server.testMode = true;
    grunt.task.run('server');
    grunt.task.run('karma:e2e');
  });

  grunt.registerTask('check', 'Check to be sure JS is linted and app is tested', ['jshint', 'test']);

  grunt.registerTask('server', 'Run the example server', function () {
    var server, done,
      start = require('./server.js');

    server = start(config.server.port);

    if (!config.server.testMode) {
      done = this.async();
      server.on('close', done);
    }
  });

  // Generate documentation
  grunt.registerMultiTask('docs', 'Generate documentation', function () {
    var done = this.async();

    var child = grunt.util.spawn({
      cmd: path.resolve('./node_modules/.bin/docco'),
      grunt: false,
      args: this.filesSrc
    }, function (error, result, code) {
      grunt.log.ok('Generated documentation at ./docs/');
      done();
    });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });

  grunt.registerTask('doc', ['docs']);

  // Bootstrap example
  grunt.registerTask('bootstrap-example', 'Bootstrap example', function () {
    var done = this.async();

    grunt.file.setBase('./example');

    var child = grunt.util.spawn({
      cmd: path.resolve('../node_modules/.bin/bower'),
      grunt: false,
      args: ['install']
    }, function (error, result, code) {
      grunt.log.ok('Bootstrapped ./example/');
      done();
    });

    grunt.file.setBase('../');

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
};
