import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'

export default {
  input: './example/client/index.ts',
  output: {
    file: './examPLE/web/bundle.js',
    format: 'umd'
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript()
  ]
};
