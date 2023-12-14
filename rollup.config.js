import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import clear from 'rollup-plugin-clear'
import cleanup from 'rollup-plugin-cleanup'
import size from 'rollup-plugin-sizes'
import { visualizer } from 'rollup-plugin-visualizer'
import builtins from 'rollup-plugin-node-builtins'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified')
}
// generate *.d.ts file
const isDeclaration = process.env.TYPES !== 'false'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const masterVersion = require('./package.json').version
const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, process.env.TARGET)
const packageDirDist = process.env.LOCALDIR === 'undefined' ? `${packageDir}/dist` : process.env.LOCALDIR
const name = path.basename(packageDir)
const M = '@firebird'
const packageDirs = fs.readdirSync(packagesDir)
const paths = {}
packageDirs.forEach((dir) => {
  // filter hidden files
  if (dir.startsWith('.')) return
  paths[`${M}/${dir}`] = [`${packagesDir}/${dir}/src`]
})

const firebirdAnnotation = `/* ${M}/${name} version ' + ${masterVersion} */`
// for react
const processEnvBanner = `
  var process = {
    env: {
      NODE_ENV: 'production'
    }
  }
`
const includeEnvNames = ['react', 'web']
const banner = `${firebirdAnnotation}${includeEnvNames.includes(name) ? '\n' + processEnvBanner : ''}`

function getCommon(format) {
  const common = {
    input: `${packageDir}/src/index.ts`,
    output: {
      banner,
      footer: '/* follow me on Github! @ly */',
      globals: {
        react: 'React',
        jsxRuntime: 'jsxRuntime'
      }
    },
    // 外部依赖，也是防止重复打包的配置
    external: [...Object.keys(paths), 'react', 'jsxRuntime'],
    plugins: [
      commonjs({
        exclude: 'node_modules'
      }),
      builtins(),
      resolve(),
      size(),
      visualizer({
        title: `${M} analyzer`,
        filename: 'analyzer.html'
      }),
      json(),
      cleanup({
        comments: 'none'
      }),

      typescript({
        tsconfig: 'tsconfig.build.json',
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: isDeclaration,
            declarationMap: isDeclaration,
            declarationDir: `${packageDirDist}/packages/`, // 类型声明文件的输出目录
            module: 'ES2015',
            paths
          }
        },
        include: ['*.ts+(|x)', '**/*.ts+(|x)', '../**/*.ts+(|x)']
      })
    ]
  }
  return common
}

const common = getCommon()

const esmPackage = {
  ...common,
  output: {
    file: `${packageDirDist}/${name}.esm.js`,
    format: 'es',
    sourcemap: true,
    ...common.output
  },
  plugins: [
    ...common.plugins,
    clear({
      targets: [packageDirDist]
    })
  ]
}
const cjsPackage = {
  ...common,
  external: [],
  output: {
    file: `${packageDirDist}/${name}.js`,
    format: 'cjs',
    sourcemap: true,
    minifyInternalExports: true,
    ...common.output
  },
  plugins: [...common.plugins]
}

const iifePackage = {
  ...common,
  external: [],
  output: {
    file: `${packageDirDist}/${name}.min.js`,
    format: 'iife',
    name: 'FIREBIRD',
    intro: 'var global = typeof self !== undefined ? self : this;',
    ...common.output
  },
  plugins: [...common.plugins, terser()]
}
const total = {
  esmPackage,
  iifePackage,
  cjsPackage
}
let result = total
export default [...Object.values(result)]
