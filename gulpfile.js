var gulp = require('gulp');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');
var istanbul = require('gulp-istanbul');
var formatter = require('eslint-friendly-formatter');

var lint = ['gulpfile.js', 'index.js', 'utils.js'];

gulp.task('coverage', function() {
  return gulp.src(lint.concat(['!gulpfile.js']))
    .pipe(istanbul({
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['coverage'], function() {
  return gulp.src('test.js')
    .pipe(mocha({
      reporter: 'spec'
    }))
    .pipe(istanbul.writeReports())
    .pipe(istanbul.writeReports({
      reporters: [ 'text' ],
      reportOpts: {dir: 'coverage', file: 'summary.txt'}
    }));
});

gulp.task('lint', function() {
  return gulp.src(lint.concat(['test.js']))
    .pipe(eslint())
    .pipe(eslint.format(formatter));
});

gulp.task('default', ['test']);
