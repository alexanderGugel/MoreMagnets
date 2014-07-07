var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint');

gulp.task('lint', function () {
  gulp.src('./**/*.js')
    .pipe(jshint());
});

gulp.task('develop', function () {
  nodemon({ script: 'server.js', ext: 'js' })
    .on('change', ['lint']);
  nodemon({ script: 'bot.js', ext: 'js' })
    .on('change', ['lint']);
});

gulp.task('default', ['lint', 'develop']);
