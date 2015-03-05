var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var notify = require('gulp-notify');
var header = require('gulp-header');
var gzip = require('gulp-gzip');

var config = {
    uglify: {
        mangle: true,
        //compress: true,
        //sourceMap: true,
        //sourceMapIncludeSources: true,
        //sourceMapName: 'js/app.min.js.map',
        //mangle: {
        //    //toplevel: true,
        //    //screw_ie8: true

        //},
        compress: {
            //screw_ie8: true, // ?
            sequences: true, // join consecutive statemets with the “comma operator”
            properties: false, // optimize property access: a["foo"] → a.foo
            dead_code: true, // discard unreachable code
            drop_debugger: true, // discard “debugger” statements
            unsafe: false, // some unsafe optimizations (see below)
            conditionals: true, // optimize if-s and conditional expressions
            comparisons: true, // optimize comparisons
            evaluate: true, // evaluate constant expressions
            booleans: true, // optimize boolean expressions
            loops: true, // optimize loops
            unused: true, // drop unused variables/functions
            hoist_funs: true, // hoist function declarations
            hoist_vars: true, // hoist variable declarations
            if_return: true, // optimize if-s followed by return/continue
            join_vars: true, // join var declarations
            cascade: true, // try to cascade `right` into `left` in sequences
            side_effects: true, // drop side-effect-free statements
            warnings: false, // warn about potentially dangerous optimizations/code
            //negate_iife: true,
            drop_console: true,
            //droop func
            pure_funcs: [
                'log'
            ],
            // global definitions
            global_defs: {
                DEBUG: false
            }
        },
        output: true
        //    {
        //    indent_start: 0, // start indentation on every line (only when `beautify`)
        //    indent_level: 4, // indentation level (only when `beautify`)
        //    quote_keys: false, // quote all keys in object literals?
        //    space_colon: true, // add a space after colon signs?

        //    inline_script: false, // escape "</script"?
        //    width: 80, // informative maximum line width (for beautified output)
        //    max_line_len: 32000, // maximum line length (for non-beautified output)
        //    beautify: false, // beautify output?
        //    source_map: 's.map', // output a source map
        //    bracketize: false, // use brackets every time?
        //    comments: false, // output comments?
        //    semicolons: true, // use semicolons to separate statements? (otherwise, newlines)
        //    ascii_only: true // output ASCII-safe? (encodes Unicode characters as ASCII)
        //}//,
        //sourceMapIncludeSources: true,
        //outSourceMap: true,
        //sourceRoot: ''
    },
    uglifyRelease: {
    	mangle: false,
    	compress: {
    		//screw_ie8: true, // ?
    		sequences: false, // join consecutive statemets with the “comma operator”
    		properties: false, // optimize property access: a["foo"] → a.foo
    		dead_code: true, // discard unreachable code
    		drop_debugger: true, // discard “debugger” statements
    		unsafe: false, // some unsafe optimizations (see below)
    		conditionals: false, // optimize if-s and conditional expressions
    		comparisons: false, // optimize comparisons
    		evaluate: false, // evaluate constant expressions
    		booleans: false, // optimize boolean expressions
    		loops: false, // optimize loops
    		unused: true, // drop unused variables/functions
    		hoist_funs: false, // hoist function declarations
    		hoist_vars: false, // hoist variable declarations
    		if_return: false, // optimize if-s followed by return/continue
    		join_vars: false, // join var declarations
    		cascade: false, // try to cascade `right` into `left` in sequences
    		side_effects: false, // drop side-effect-free statements
    		warnings: false, // warn about potentially dangerous optimizations/code
    		//negate_iife: true,
    		drop_console: true,
    		//droop func
    		// pure_funcs: [
                // 'console.log'
    		// ],
    		// global definitions
    		global_defs: {
    			DEBUG: false
    		}
    	},
    	output: {
    		beautify: true
    	}
    }
};

var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

//scripts
gulp.task('clean-scripts', function () {
    return del.sync(['./dist']);
});
gulp.task('scripts-release', function () {
	return gulp.src('src/liveinput.js')
        .pipe(plumber())
        .pipe(concat('liveinput.js'))
        .pipe(uglify(config.uglifyRelease))
		.pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('./dist'))
        .pipe(notify({ message: "scripts-release generated file: <%= file.relative %>" }));
});
gulp.task('scripts-min', ['scripts-release'], function () {
	return gulp.src('./dist/liveinput.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('liveinput.min.js'))
        .pipe(uglify(config.uglify))
		.pipe(header(banner, { pkg: pkg }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'))
        .pipe(notify({ message: "scripts-min generated file: <%= file.relative %>" }));
});
gulp.task('scripts-gizp', ['scripts-min'], function () {
	return gulp.src('./dist/liveinput.min.js')
        .pipe(plumber())
		.pipe(gzip())
        .pipe(gulp.dest('./dist'))
        .pipe(notify({ message: "scripts-gizp generated file: <%= file.relative %>" }));
});
gulp.task('build-scripts', ['clean-scripts', 'scripts-gizp']);
gulp.task('watch-scripts', function () {
	gulp.watch('src/**/*.js', ['build-scripts']);
});

gulp.task('build', ['build-scripts']);
gulp.task('watch', ['watch-scripts']);

gulp.task('default', ['build']);