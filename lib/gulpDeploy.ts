import * as through2 from 'through2'
import File = require('vinyl')
import {MLSpec, deploy as _deploy, MLSpecs} from 'ml-uservices'
import * as s from 'typescript-schema'
import {ConnectionParams, Client} from 'marklogic'
import * as mlAdmin from 'ml-admin'
import * as path from 'path'

export function deploy(base: string, mlClientOptions: ConnectionParams, mlAdminOptions: ConnectionParams, baseUri: string, schemaFile: NodeJS.ReadWriteStream, mlSpecsFile: NodeJS.ReadWriteStream) {
  let schemaPromise = new Promise(function(resolve) {
    schemaFile.pipe(through2.obj(function(chunk: File, enc: string, callback: () => {}) {
      resolve(JSON.parse(chunk.contents.toString()))
      callback()
    }))
  })
  let mlSpecsPromise = new Promise(function(resolve) {
    mlSpecsFile.pipe(through2.obj(function(chunk: File, enc: string, callback: () => {}) {
      resolve(JSON.parse(chunk.contents.toString()))
      callback()
    }))
  })
  let promise = Promise.all([schemaPromise, mlSpecsPromise])

  let client = mlAdmin.createAdminClient(mlClientOptions)
  let adminClient = mlAdmin.createAdminClient(mlAdminOptions)

  return through2.obj(function(chunk: File, enc: string, callback: (error, chunk?) => void) {
    let self = this
    promise.then(function(files: [s.Schema, MLSpecs]) {
      let [schema, mlSpecs] = files

      let moduleName = s.fileNameToModuleName(path.relative(base, chunk.path))
      let moduleSchema = schema[moduleName]

      return _deploy(client, adminClient, baseUri, moduleName, mlSpecs, moduleSchema, chunk.contents.toString())
    }).then(function(chunk) {
      callback(null, chunk)
    }).catch(function(error) {
      callback(error)
    })
  })
}
