#!/usr/bin/env node

import yargs from 'yargs'
import upload from './api'
import { sleep } from './utils'
import { hideBin } from 'yargs/helpers'
import { mapNameToId, isSuccess } from './data'

// eslint-disable-next-line no-unused-expressions
yargs(hideBin(process.argv))
  .command<{ password: string, mobile: string, kind: string, location?: string, temperature?: string, retry: number }>(
    '$0 <mobile> <password>', 'Upload noon infomation',
    () => {},
    async argv => {
      for (let i = 0; i < argv.retry; i++) {
        try {
          console.log('Uploading...')
          const data = await upload(argv.mobile, argv.password, (mapNameToId as any)[argv.kind], argv.location || undefined, argv.temperature)
          console.log(data)
          if (isSuccess(data.msg)) return
          await sleep()
        } catch (e) {
          console.error(e)
        }
      }
      process.exit(-1)
    }
  )
  .option('kind', {
    alias: 'k',
    default: 'morning',
    choices: ['morning', 'noon', 'vacation'],
    description: 'The kind to upload'
  })
  .option('location', {
    alias: 'l',
    description: 'Your location'
  })
  .option('temperature', {
    alias: 't',
    description: 'Your temperature'
  })
  .option('retry', {
    alias: 'r',
    default: 3,
    type: 'number',
    description: 'Retry times'
  })
  .help()
  .demandCommand()
  .argv
