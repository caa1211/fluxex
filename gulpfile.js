'use strict';

var gulp = require('gulp'),
    shell = require('gulp-shell');

gulp.task('build_example', function () {
    return gulp.src('examples/*-*/')
    .pipe(
        shell(['cd <%=file.path %>;npm install ../..;npm prune;cp -R ../../node_modules node_modules;npm install;npm run-script build'])
    );
});

gulp.task('watch_document', ['build_document'], function () {
    return gulp.watch(['index.js', 'lib/*.js'], ['build_document']);
});

gulp.task('build_document', shell.task('jsdoc -p README.md index.js lib/*.js -d documents'));
