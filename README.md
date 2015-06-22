Gulp tasks for ml-uservices
==

Overview
--

Provides gulp tasks for [ml-uservices](https://github.com/christyharagan/ml-uservices)

Usage
--

Install:
```
npm install gulp-ml-uservices
```

Basic Usage:

```TypeScript
var gulp = require('gulp')
var generateSchema = require('gulp-typescript-schema').generateSchema
var generateMLSpec = require('gulp-ml-uservices').generateMLSpec

gulp.task('generate', function() {
  return gulp.src('lib/**/*.ts').pipe(generateSchema({
    path: './schema.json'
  })).pipe(generateMLSpec({
    path: './specs.json'
  })).pipe(gulp.dest('dist'))
})

```
