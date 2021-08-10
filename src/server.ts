import fs from 'fs'
import http from 'http'
import upload, { login } from './api'
import { compile } from 'ejs'
import { isSuccess } from './data'
import { padStart, sleep } from './utils'

const key = fs.readFileSync('lbs_key', 'utf-8')
const template = compile(fs.readFileSync('index.ejs', 'utf-8'))
if (!fs.existsSync('config.json')) fs.writeFileSync('config.json', '{}')

const config: Record<string, {
  password: string
  location?: string
}> = JSON.parse(fs.readFileSync('config.json').toString())

let lastTry = ''
let status: Record<string, string> = { }

const getBody = <T> (req: http.IncomingMessage, cb: (err: Error | null, ret?: T) => void) => {
  const arr: Buffer[] = []
  req.on('error', cb).on('data', chunk => arr.push(chunk)).on('end', () => {
    try { cb(null, JSON.parse(Buffer.concat(arr).toString())) } catch (e) { cb(e) }
  })
}

const save = () => fs.promises.writeFile('config.json', JSON.stringify(config, null, 2))

const f = async (id: '24' | '25') => {
  for (const mobile in config) {
    if (!config[mobile].password || status[mobile] === '打卡成功!') continue
    try {
      const data = await upload(mobile, config[mobile].password, id, config[mobile].location)
      if (isSuccess(data.msg)) status[mobile] = '打卡成功!'
    } catch (e) {
      console.error(e)
      status[mobile] = `打卡失败! (${(e && e.message) || e})`
    }
    await sleep()
  }
  const t = new Date()
  lastTry = `${t.getFullYear()}-${padStart(t.getMonth() + 1)}-${padStart(t.getDay() + 1)} ${padStart(t.getHours())}:${padStart(t.getMinutes())}:${padStart(t.getSeconds())}`
}

setInterval(() => {
  switch (new Date().getHours()) {
    case 5:
    case 11:
      status = {}
      break
    case 6:
    case 7:
    case 8:
      f('24')
      break
    case 12:
    case 13:
    case 14:
      f('25')
  }
}, 15 * 60 * 1000)
console.log('Started!')
console.log(config)

http.createServer(function (req, res) {
  switch (req.url) {
    case '/':
      if (req.method !== 'GET') break
      res.end(template({ key, lastTry, status }))
      return
    case '/update':
      if (req.method !== 'POST') break
      getBody<{ mobile: string, password: string, location?: string }>(req, (err, data) => {
        if (err) {
          console.error(err)
          res.end('发生错误!')
          return
        }
        const { mobile, password, location } = data!
        if (!mobile || !password || typeof mobile !== 'string' || typeof password !== 'string') {
          res.end('提交数据错误!')
          return
        }
        if (!(mobile in config)) {
          res.end('你不是白名单用户!')
          return
        }
        login(mobile, password).then(async data => {
          const user = config[mobile]
          user.password = password
          user.location = location
          await save()
          return data.data.user.name
        }).then(name => res.end(`${name}, 保存成功!`), e => {
          console.error(e)
          res.end('发生错误!')
        })
      })
      return
  }
  res.statusCode = 404
  res.end()
}).listen(47357)
