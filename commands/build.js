import * as babel from '@babel/core'
import solid from 'babel-preset-solid'
import fs from 'node:fs/promises'
import path from 'node:path'
import child_process from 'node:child_process'
import { glob } from 'glob'

const srcDir = path.resolve(process.cwd(), 'src/lib')
const tempDir = path.resolve(process.cwd(), 'temp')
const libDir = path.resolve(process.cwd(), 'lib')

async function compileSolid(filePath, source) {
  const babelOptions = {
    root: process.cwd(),
    filename: filePath,
    sourceFileName: filePath,
    presets: [
      [
        solid,
        {
          generate: 'dom',
          hydratable: false,
          moduleName: 'solid-js/web',
        },
      ],
      // ['@babel/preset-typescript'],
    ],
    plugins: [],
    ast: false,
    sourceMaps: true,
    configFile: false,
    babelrc: false,
    parserOpts: {
      plugins: ['jsx', 'typescript'],
    },
  }

  const { code } = await babel.transformAsync(source, babelOptions)
  return code
}

async function copyTs() {
  const files = await glob(srcDir + '/**/*.{ts,tsx}')

  await Promise.all(
    files.map(async (file) => {
      const src = path.resolve(process.cwd(), file)
      const dest = file.replace(srcDir, tempDir)
      await fs.mkdir(path.dirname(dest), {
        recursive: true,
      })
      await fs.copyFile(src, dest)
    }),
  )
}

async function copyOthers() {
  const files = await glob(srcDir + '/**/*.css')

  await Promise.all(
    files.map(async (file) => {
      const src = path.resolve(process.cwd(), file)
      const dest = file.replace(srcDir, libDir)
      await fs.mkdir(path.dirname(dest), {
        recursive: true,
      })
      await fs.copyFile(src, dest)
    }),
  )
}

async function compileTsx() {
  const files = await glob('src/lib/**/*.tsx')

  await Promise.all(
    files.map(async (file) => {
      const src = path.resolve(process.cwd(), file)
      const source = (await fs.readFile(src)).toString()
      const compiledSource = await compileSolid(file, source)
      const dest = file.replace(srcDir, tempDir).replace('.tsx', '.ts')
      await fs.mkdir(path.dirname(dest), {
        recursive: true,
      })
      await fs.writeFile(dest, compiledSource)
    }),
  )
}

async function compileTs() {
  const tsconfig = {
    include: [`${tempDir}/**/*`],
    compilerOptions: {
      strict: true,
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      jsx: 'preserve',
      jsxImportSource: 'solid-js',
      isolatedModules: true,
      declaration: true,
      outDir: libDir,
    },
  }

  const tsconfigFile = path.resolve(tempDir, 'tsconfig.json')

  await fs.mkdir(path.dirname(tsconfigFile), {
    recursive: true,
  })
  await fs.writeFile(tsconfigFile, JSON.stringify(tsconfig))

  await new Promise((resolve, reject) => {
    const subProcess = child_process.spawn('tsc', ['-p', tsconfigFile], {
      stdio: 'inherit',
    })
    subProcess.on('exit', (code) => {
      if (code) {
        reject()
      } else {
        resolve()
      }
    })
  })
}

async function copyPkg() {
  const src = path.resolve(process.cwd(), 'package.json')
  const dest = src.replace(process.cwd(), libDir)
  await fs.mkdir(path.dirname(dest), {
    recursive: true,
  })
  await fs.copyFile(src, dest)
}

async function build() {
  await fs.rm(tempDir, {
    recursive: true,
  })
  await copyTs()
  await compileTs()
  // await compileTsx()
  await copyOthers()
  await copyPkg()
}

build()
