var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var panini = require('panini');
var del = require('del');
var browserSync = require('browser-sync').create();
var environments = require('gulp-environments');

var development = environments.development;
var production = environments.production;

gulp.task('clean', function(cb) {
	del(['dist/*', '!dist', '!dist/assets'], cb);
});

gulp.task('copy', function() {
	gulp.src('src/assets/**/*').pipe(gulp.dest('dist/assets'));
});

var sassOptions = {
	errLogToConsole: true,
	outputStyle: 'expanded',
	includePaths: ['node_modules/bootstrap/scss/']
};

gulp.task('sass', function() {
	gulp.src(['src/scss/app.scss'])
    	.pipe(development(sourcemaps.init()))
    	.pipe(sass(sassOptions).on('error', sass.logError))
    	.pipe(development(sourcemaps.write()))
    	.pipe(gulp.dest('dist/css'));
})

gulp.task('html', function() {
	gulp.src('src/html/pages/**/*.html')
		.pipe(panini({
			root: 'src/html/',
			layouts: 'src/html/layouts/',
			partials: 'src/html/partials/',
			helpers: 'src/html/helpers/',
			data: 'src/html/data/'
		}))
		.pipe(gulp.dest('dist'))
		.on('finish', browserSync.reload);
});

gulp.task('html:reset', function(done) {
	panini.refresh();
	done();
});

gulp.task('scripts', function() {
	return gulp.src(['node_modules/jquery/dist/jquery.min.js', 'node_modules/popper.js/dist/umd/popper.min.js', 'node_modules/bootstrap/dist/js/bootstrap.min.js'])
		.pipe(concat('app.js'))
		.pipe(gulp.dest('./dist/js'));
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
});

gulp.task('watch', function() {
	gulp.watch('src/scss/**/*', ['sass', browserSync.reload]);
	gulp.watch('src/html/pages/**/*', ['html']);
	gulp.watch(['src/html/{layouts, partials, helpers, data}/**/*'], ['html:reset','html']);
});

gulp.task('build', ['clean', 'copy', 'scripts', 'sass', 'html']);
gulp.task('default', ['browser-sync', 'watch']);