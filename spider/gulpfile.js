//引入组件
var gulp = require('gulp');
  minifycss = require('gulp-minify-css'),
  rename = require('gulp-rename'),
  tinypng = require('gulp-tinypng'),
  notify = require('gulp-notify'),
  cache = require('gulp-cache'),
  fontSpider=require('gulp-font-spider'),
  del = require('del');
gulp.task('clean', function(cb) {
  del(['dist/css', 'dist/assets/js', 'dist/assets/img'], cb);
});
gulp.task('cssmin', function() { //执行完clean之后再执行cssmin
  gulp.src('*.css')
    .pipe(rename({
      suffix: '.min'
    })) //suffix后缀名 prefix前缀名 extname文件格式
    .pipe(minifycss())
    .pipe(gulp.dest('dist'))
    .pipe(notify({
      message: 'css compress done'
    }));
});
gulp.task('tinypng', function() {
  gulp.src('*.jpg')
    .pipe(cache(tinypng('HYalYWQL5nNm985-wSaZYAX-3lMZVCRO')))//调用tinypng的api-key
    .pipe(gulp.dest('dist/img'))
    .pipe(notify({
      message: 'image compress done'
    }));
});
gulp.task('testfont',function () {
  gulp.src('*.html')
  .pipe(fontSpider())
  .pipe(notify({
    message: 'font compress done'
  }));
});
//默认的任务数组，运行gulp的时候 与运行 gulp default是同样效果
gulp.task('default', ['clean', 'cssmin', 'tinypng','testfont'], function() {});
gulp.task('watch', function() {
  //Watch css files
  gulp.watch('*.css', ['cssmin']);
});