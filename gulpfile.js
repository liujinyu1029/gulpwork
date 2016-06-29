/**
 * Created by 刘金宇 on 2016/6/14.
 */
var gulp = require('gulp');
var concat = require('gulp-concat');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var htmlmin = require('gulp-htmlmin');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var dirName = 'dist'; //生产目录名
var port = 9000;

gulp.task('serve', () => {
    browserSync({
        notify: false,
        port: port,
        server: {
            baseDir: ['app'],
            routes: {
                //'/bower_components': 'bower_components'
            }
        }
    });
    gulp.watch([
        'app/**/*'
    ]).on('change', reload);
});

gulp.task('serve:'+dirName, () => {
    browserSync({
        notify: false,
        port: port+1,
        server: {
            baseDir: [dirName]
        }
    });
});


gulp.task('html', ['css', 'js','images'], () => {
    var options = {
        collapseWhitespace: true,//压缩html
        removeComments:true,//清除html注释
        minifyJS:true,
        minifyCSS:true
    }
    return gulp.src('app/**/*.{shtml,html,htm}')
        .pipe(htmlmin(options))
        .pipe(gulp.dest(dirName))
});

gulp.task('images', () => {
    return gulp.src('app/**/*.{jpg,png}')
        .pipe(cache(imagemin({
            progressive: true,
            interlaced: true,
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{cleanupIDs: false}]
        })))
        .pipe(gulp.dest(dirName));
});

gulp.task('css',() =>{
    return gulp.src('app/**/*.css')
        .pipe(concat('style.css'))
        .pipe(gulp.dest(dirName+'/css'))
        .pipe(minifycss())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest(dirName+'/css'))
})

gulp.task('js',() => {
    return gulp.src('app/**/*.js')
        .pipe(concat("main.js"))
        .pipe(gulp.dest(dirName+'/js'))
        .pipe(uglify())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest(dirName+'/js'))
})

gulp.task('watch',()=>{
    gulp.watch('app/*',['html'])
})

gulp.task('default',['html']);
