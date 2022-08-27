'use strict';
const gulp = require("gulp");
const minify = require('gulp-minify');
const inject = require("gulp-inject-string");
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

const Prepend = `
var PIXI = require("../../@eva/pixi").default;
window.fgui = window.fgui || {};
require("./domparserinone");
var fgui = window.fairygui = window.fgui;
var createjs = window.createjs;
var Zlib = window.Zlib;
var Node = window.Node;
var DOMParser = window.DOMParser || window.Parser.DOMParser;
var document = window.document || window.documentAlias;
var ArrayBuffer = window.ArrayBuffer;
`

gulp.task('build.js', () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(inject.replace('var fgui;', ''))
        .pipe(inject.prepend(Prepend))
        .pipe(inject.replace('var __extends =', 'var __extends = window.__extends ='))
        .pipe(minify({ ext: { min: ".min.js" } }))
        .pipe(gulp.dest('./bin'));
});

gulp.task("build.d.ts", ["build.js"], () => {
    return tsProject.src()
        .pipe(tsProject())
        .dts.pipe(inject.append('import fairygui = fgui;'))
        .pipe(gulp.dest('./bin'));
});

gulp.task("build", ["build.d.ts"], () => {
    return gulp.src('bin/**/*')
        .pipe(gulp.dest('../demo/libs/fairygui/'))
});
