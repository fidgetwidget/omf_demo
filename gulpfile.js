var gulp = require('gulp');
var merge = require('merge-stream');
var gutil = require('gulp-util');
var webpackStream = require('webpack-stream');
var webpack = require('webpack');

var paths = {
  jsAssets: ['assets/**/*.js'],
  vendorJs: ['assets/bower/pixi.js/dist/pixi.min.js',
             'assets/bower/pixi.js/dist/pixi.js']
};


gulp.task('bundleJs', function (cb) {

  return gulp.src('./assets/app.js')
    .pipe(webpackStream({ 
      output: {
        filename: './public/js/app.js' 
      } 
    }, webpack))
    .pipe(gulp.dest(''));

});

gulp.task('copyVendorAssets', function (cb) {

  return gulp.src(paths.vendorJs)
    .pipe(gulp.dest('./public/js/vendor/'));

});

gulp.task('watch', function () {

  gulp.watch([paths.jsAssets], ['bundleJs']);

});

gulp.task('default', ['copyVendorAssets', 'bundleJs']);
