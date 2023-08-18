const { src, dest, series, watch } = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require('sass');
const gulpSass = require('gulp-sass');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const fileInclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const gulpif = require('gulp-if');
const notify = require('gulp-notify');
const image = require('gulp-imagemin');
const webp = require('gulp-webp');
const mainSass = gulpSass(sass);
const webpackStream = require('webpack-stream');
const plumber = require('gulp-plumber');
const path = require('path');
const zip = require('gulp-zip');
const rootFolder = path.basename(path.resolve());

// paths
const srcFolder = './src';
const buildFolder = './prod';
const paths = {
	srcSvg: `${srcFolder}/img/svg/**.svg`,
	srcImgFolder: `${srcFolder}/img`,
	buildImgFolder: `${buildFolder}/img`,
	srcScss: `${srcFolder}/scss/**/*.scss`,
	buildCssFolder: `${buildFolder}/css`,
	srcFullJs: `${srcFolder}/js/**/*.js`,
	srcMainJs: `${srcFolder}/js/main.js`,
	buildJsFolder: `${buildFolder}/js`,
	srcHTMLComponentsFolder: `${srcFolder}/html/components`,
	filesFolder: `${srcFolder}/files`,
	fontsFolder: `${srcFolder}/fonts`,
};

let isProd = false; // dev by default

const clean = () => {
	return del([buildFolder]);
};

//svg sprite
const svgSprites = () => {
	return src(paths.srcSvg)
		.pipe(
			svgmin({
				js2svg: {
					pretty: true,
				},
			})
		)
		.pipe(
			cheerio({
				run: function ($) {
					$('[fill]').removeAttr('fill');
					$('[stroke]').removeAttr('stroke');
					$('[style]').removeAttr('style');
				},
				parserOptions: {
					xmlMode: true,
				},
			})
		)
		.pipe(replace('&gt;', '>'))
		.pipe(
			svgSprite({
				mode: {
					stack: {
						sprite: '../sprite.svg',
					},
				},
			})
		)
		.pipe(dest(paths.buildImgFolder));
};

// scss styles
const styles = () => {
	return src(paths.srcScss, { sourcemaps: !isProd })
		.pipe(
			plumber(
				notify.onError({
					title: 'SCSS',
					message: 'Error: <%= error.message %>',
				})
			)
		)
		.pipe(mainSass())
		.pipe(
			autoprefixer({
				cascade: false,
				grid: true,
				overrideBrowserslist: ['last 5 versions'],
			})
		)
		.pipe(
			gulpif(
				isProd,
				cleanCSS({
					level: 2,
				})
			)
		)
		.pipe(dest(paths.buildCssFolder, { sourcemaps: '.' }))
		.pipe(browserSync.stream());
};

// scripts
const scripts = () => {
	return src(paths.srcMainJs)
		.pipe(
			plumber(
				notify.onError({
					title: 'JS',
					message: 'Error: <%= error.message %>',
				})
			)
		)
		.pipe(
			webpackStream({
				mode: isProd ? 'production' : 'development',
				output: {
					filename: 'main.js',
				},
				module: {
					rules: [
						{
							test: /\.m?js$/,
							exclude: /node_modules/,
							use: {
								loader: 'babel-loader',
								options: {
									presets: [
										[
											'@babel/preset-env',
											{
												targets: 'defaults',
											},
										],
									],
								},
							},
						},
					],
				},
				devtool: !isProd ? 'source-map' : false,
			})
		)
		.on('error', function (err) {
			console.error('WEBPACK ERROR', err);
			this.emit('end');
		})
		.pipe(dest(paths.buildJsFolder))
		.pipe(browserSync.stream());
};

const fonts = () => {
	return src(`${paths.fontsFolder}/**`).pipe(dest(`${buildFolder}/fonts`));
};

const files = () => {
	return src(`${paths.filesFolder}/**`).pipe(dest(buildFolder));
};

const images = () => {
	return src([`${paths.srcImgFolder}/**/**.{jpg,jpeg,png,svg,ico}`])
		.pipe(
			gulpif(
				isProd,
				image([
					image.mozjpeg({
						quality: 80,
						progressive: true,
					}),
					image.optipng({
						optimizationLevel: 2,
					}),
				])
			)
		)
		.pipe(dest(paths.buildImgFolder));
};

const webpImages = () => {
	return src([`${paths.srcImgFolder}/**/**.{jpg,jpeg,png}`])
		.pipe(webp())
		.pipe(dest(paths.buildImgFolder));
};

const htmlInclude = () => {
	return src([`${srcFolder}/html/pages/*.html`])
		.pipe(
			fileInclude({
				prefix: '@@',
				basepath: '@file',
			})
		)
		.pipe(dest(buildFolder))
		.pipe(browserSync.stream());
};

const watchFiles = () => {
	browserSync.init({
		server: {
			baseDir: `${buildFolder}`,
		},
	});

	watch(paths.srcScss, styles);
	watch(paths.srcFullJs, scripts);
	watch(`${paths.srcHTMLComponentsFolder}/*.html`, htmlInclude);
	watch(`${srcFolder}/html/pages/*.html`, htmlInclude);
	watch(`${paths.filesFolder}/**`, files);
	watch(`${paths.fontsFolder}/**`, fonts);
	watch(`${paths.srcImgFolder}/**/**.{jpg,jpeg,png,svg}`, images);
	watch(`${paths.srcImgFolder}/**/**.{jpg,jpeg,png}`, webpImages);
	watch(paths.srcSvg, svgSprites);
};

const htmlMinify = () => {
	return src(`${buildFolder}/**/*.html`)
		.pipe(
			htmlmin({
				collapseWhitespace: true,
			})
		)
		.pipe(dest(buildFolder));
};

const zipFiles = (done) => {
	del.sync([`${buildFolder}/*.zip`]);
	return src(`${buildFolder}/**/*.*`, {})
		.pipe(
			plumber(
				notify.onError({
					title: 'ZIP',
					message: 'Error: <%= error.message %>',
				})
			)
		)
		.pipe(zip(`${rootFolder}.zip`))
		.pipe(dest(buildFolder));
};

const toProd = (done) => {
	isProd = true;
	done();
};

exports.default = series(
	clean,
	htmlInclude,
	scripts,
	styles,
	fonts,
	files,
	images,
	webpImages,
	svgSprites,
	watchFiles
);

exports.build = series(
	toProd,
	clean,
	htmlInclude,
	scripts,
	styles,
	fonts,
	files,
	images,
	webpImages,
	svgSprites,
	htmlMinify
);

exports.zip = zipFiles;
