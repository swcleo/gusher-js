import path from 'path'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser'
import nodePolyfills from 'rollup-plugin-polyfill-node'; // events
import pkg from './package.json'

const env = process.env.NODE_ENV

const name = 'Gusher'
const config = {
  input: path.resolve(__dirname, 'src/index.ts'),
  output: [
    {
      name,
      file: pkg.main,
      format: 'cjs',
    },
    {
      name,
      file: pkg.module,
      format: 'esm'
    },
  ],
  plugins: [
    nodePolyfills(),
    resolve(),
    commonjs(),
    typescript(),
    babel({
      presets: [
        '@babel/preset-env'
      ],
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    })
  ]
}

if (env === 'production') {
  config.plugins.push(terser({
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false
    }
  }))
}

export default config
