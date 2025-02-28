/*global require*/
var gulp = require('gulp');
var ui5preload = require('gulp-ui5-preload');
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var manifest = require('gulp-manifest3');
var runSequence = require('gulp4-run-sequence');
var clean = require('gulp-clean');
var replace= require('gulp-replace');
var zip = require('gulp-zip');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var webserver = require('gulp-webserver');
var { createProxyMiddleware } = require('http-proxy-middleware');
var execSync = require('child_process').execSync;


var argv = require('yargs').argv;


var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');

var gulpCopy = require('gulp-copy');

var versionNum = argv.buildNum || (new Date()/1000)*1000;
var gitBranch = execSync('git symbolic-ref --short HEAD').toString().trim();
var gitRev = execSync('git describe --abbrev=4 HEAD').toString().trim();
var gitHash = execSync('git rev-parse --short HEAD').toString().trim();


gulp.task('ui5preload', function(){
  return gulp.src([
                    './webapp/Component.js',
                    './webapp/Router.js',
                    './webapp/view/**/**+(xml)',
                    './webapp/view/**/**+(js)',
                    './webapp/util/**/**+(js)',
                    './webapp/services/**/**+(js)',
                    './webapp/fragment/**/**+(xml)',
                    './webapp/controller/**/**+(js)'
          ], { allowEmpty: true })
          .pipe(ui5preload({base:'webapp/',namespace:'news/uk/fara'}))
          .pipe(gulp.dest('./webapp/'));
});

gulp.task('clean', function () {
  return gulp.src([
    './dist',
    './webapp/Component-preload.js'
  ], {read: false, allowEmpty: true})
    .pipe(clean());
});

gulp.task('zip', function () {

  return gulp.src('./dist/**')
    .pipe(zip('build-'+versionNum+'.zip'))
    .pipe(gulp.dest('./distzip'));
});


gulp.task("default", function () {
  return gulp.src("./componentsReact/**/*.jsx")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat("all.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"));
});

gulp.task("copy", function () {
  return gulp.src([
      './webapp/README.txt',
      './webapp/config/**/*',
      './webapp/manifest.json',
      './webapp/i18n/**/*',
      './webapp/resources/**/*',
      './webapp/services/**/*',
      './webapp/util/**/*'
    ])
    .pipe(gulpCopy('./dist/', {}));
});

gulp.task("version", function () {
  require('fs').writeFileSync('./version.js', 'window.serco_version = "3.'+versionNum+'";');
});

gulp.task('manifest', function(cb) {
  gulp.src([
    './dist/i18n/**/*.*',
    './dist/images/**/*.*',
    './dist/buildjs/**/*.*',
    './dist/buildcss/**/*.*'
  ], { base: './dist' })
    .pipe(manifest({
      hash: true,
      preferOnline: true,
      network: ['*'],
      filename: 'app.manifest',
      exclude: 'app.manifest'
     }))
    .pipe(gulp.dest('dist/webapp'));
    cb();
});

gulp.task('deploy', function(cb) {
  var deploy = require('./deploy.js');
  deploy.runDeploy(cb);
});

gulp.task('mydeploy', function(cb) {
  var deploy = require('./mydeploy.js');
  deploy.runDeploy(cb);
});

gulp.task('launch', function(cb) {
  runSequence(
    'build',
    'deploy',
    cb
  );
});

gulp.task('translations', function(cb) {
  var translations = require('./translation.js');
  translations(cb);
});

gulp.task('usemin', function() {
  return gulp.src('./webapp/index.html')
    .pipe(usemin({
      css: [],
      js: [uglify() ],
      inlinejs: [ uglify() ],
      inlinecss: [ minifyCss(), 'concat' ]
    }))
    .pipe(replace(/\$version\$/g, gitRev + ' (' + gitBranch + ')'))
    .pipe(replace(/\$commit\$/g, gitHash))
    .pipe(replace(/\$deploytimestamp\$/g, new Date().toISOString()))
    .pipe(gulp.dest('dist/webapp'));
});

gulp.task('webserver', function() {
  var proxy = createProxyMiddleware('/fara_api', {
      target: 'https://faraformsdev.news.co.uk',
      secure: false
  });

  gulp.task('serve', function() {
  });

  gulp.task('default', gulp.series(['clean', 'serve', 'webserver']));

  gulp.src('./webapp/')
    .pipe(webserver({
      directoryListing: true,
      open: 'index.html',
      host: '127.0.0.1',
      livereload: true,
      middleware: [proxy]
    }));
});

gulp.task('browser-sync', function() {
  var browserSync = require('browser-sync').create();
    browserSync.init({
        server: {
            baseDir: "./webapp/"
        }
    });

    gulp.watch("./*.html").on('change', browserSync.reload);
});

gulp.task('build', function(callback) {
  runSequence('clean',
              'ui5preload',
              'copy',
              'usemin',
              'manifest',
              'zip',
              callback);
});

