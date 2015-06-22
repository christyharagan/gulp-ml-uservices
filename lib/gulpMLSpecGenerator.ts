import * as through2 from 'through2'
import File = require('vinyl')
import {MLSpecs, generateMLSpec as _generateMLSpec} from 'ml-uservices'
import * as s from 'typescript-schema'
import * as path from 'path'

export interface Options {
  base?: string
  path: string
  modules?: string[]
}

export function generateMLSpec(options: Options) {
  return through2.obj(function(file: File, enc: string, callback: (error, chunk?) => void) {
    let schema = <s.Schema> JSON.parse(file.contents.toString())

    let modules = options.modules || Object.keys(schema)
    let base = options.base || file.base

    let specs: MLSpecs = {}
    let self = this
    modules.forEach(function(moduleSchemaName) {
      let _specs = _generateMLSpec(schema, schema[moduleSchemaName])
      Object.keys(_specs).forEach(function(specName) {
        specs[specName] = _specs[specName]
      })
    })

    callback(null, new File({
      base: base,
      path: path.join(base, options.path),
      contents: new Buffer(JSON.stringify(specs, null, '  '))
    }))
  })
}
