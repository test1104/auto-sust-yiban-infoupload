const fs = require('fs')
const http = require('http')
const axios = require('axios').default
const createRandom = require('random-seed').create
const mod10 = require('checkdigit').mod10

if (!fs.existsSync('config.json')) fs.writeFileSync('config.json', '{}')

let config = JSON.parse(fs.readFileSync('config.json').toString())

let lastTry = ''
let status = {}
const getName = it => it.slice(0, 1) + '*'.repeat(it.length - 1)

const getIMEI = email => {
  const rand = createRandom(email)
  const str = '86' + rand.range(999999).toString().padStart(6, 0) + rand.range(999999).toString().padStart(6, 0)
  return str + mod10.create(str)
}

const padStart = str => str.toString().padStart(2, '0')
const getStatusPage = () => `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>奇怪的页面增加了!</title>
  <style>
    body {
      color: rgba(0,0,0,.85);
      font-size: 14px;
      font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
    }
  </style>
  <script>
    if (typeof fetch !== 'function') alert('请更新您的浏览器!')
    function submit0 () {
      var file = document.getElementById('file').files[0]
      if (!file) return alert('你还没有上传文件!')
      var reader = new FileReader()
      reader.onload = function () {
        var name = /"userName":"(.+?)"/.exec(reader.result), token = /access_token=(.+?)&/.exec(reader.result)
        if (!name || !token || token[1].length !== 32) return alert('你上传了错误的文件!')
        name = name[1]
        if (!confirm(name + ', 确认更新令牌?')) return
        fetch('/updateToken', { method: 'POST', body: JSON.stringify({ name: name, token: token[1] }) }).then(function (it) { return it.text() })
          .then(function (it) {
            alert(it)
            location.reload()
          }).catch(function (e) {
            console.error(e)
            alert('保存失败!')
          })
      }
      reader.readAsText(file)
    }
    function submit1 () {
      var username = document.getElementById('username').value, password = document.getElementById('password').value
      if (!username || !password) return alert('你没有填写账号或密码!')
      fetch('/updateAccount', { method: 'POST', body: JSON.stringify({ username: username, password: password }) }).then(function (it) { return it.text() })
        .then(function (it) {
          alert(it)
          location.reload()
        }).catch(function (e) {
          console.error(e)
          alert('保存失败!')
        })
    }
    function checkin () {
      var name = document.getElementById('account').value
      if (!username || !password) return alert('你没有填写姓名!')
      fetch('/checkin', { method: 'POST', body: JSON.stringify({ name: name }) }).then(function (it) { return it.text() })
        .then(function (it) {
          alert(it)
          location.reload()
        }).catch(function (e) {
          console.error(e)
          alert('打卡失败!')
        })
    }
  </script>
</head>

<body>
  <h2>当前打卡状态:</h2>
  <p>最后尝试打卡时间: ${lastTry}</p>
  <ul>
    ${Object.entries(status).map(([name, text]) => `<li>${name}: <span style="color:#${text === '打卡成功!' ? '389e0d' : 'f5222d'}">${text}</span></li>`).join('')}
  </ul>
  <div><label>现场打卡-姓名:</label> <input placeholder="请填写你的姓名" id="account"><button onclick="checkin()">现场打卡</button></div>
  <h2>如果你的登录已失效, 请选择以下任意一种方式进行登录账号</h2>
  <div>
    <p>方法一 - 上传登录令牌文件 (优点: 可以与手机易班同时登陆, 但每次手机易班重新登陆后就需要重新上传):</p>
    <label>手机yiban/cache中的文件:</label> <input type="file" accept=".0" id="file"><br>
    <button onclick="submit0()">更新令牌</button>
  </div>
  <div>
    <p>方法二 - 填写账号密码登录 (优点: 稳定, 手机易班重新登陆后也能使用):</p>
    <label>账号:</label> <input placeholder="请填写你的账号" id="username"><br>
    <label>密码:</label> <input placeholder="请填写你的密码" type="password" id="password"><br>
    <button onclick="submit1()">更新令牌</button>
  </div>
</body>

</html>`

const getBody = (req, cb) => {
  const arr = []
  req.on('error', cb).on('data', chunk => arr.push(chunk)).on('end', () => {
    try {
      cb(null, JSON.parse(Buffer.concat(arr).toString()))
    } catch (e) {
      cb(e)
    }
  })
}

const getToken = (mobile, passwd) => axios.get('https://mobile.yiban.cn/api/v3/passport/login', {
  timeout: 10000,
  params: { mobile, passwd, imei: getIMEI() },
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': UA,
    Origin: 'http://mobile.yiban.cn',
    Referer: 'http://mobile.yiban.cn'
  }
})

const save = () => fs.promises.writeFile('config.json', JSON.stringify(config, null, 2))

const UA = 'Mozilla/5.0 (Linux; Android 10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/85.0.4183.127 Mobile Safari/537.36 yiban_android'

const upload = (id, name, token) => {
  const hName = getName(name)
  if (status[hName] === '打卡成功!') return Promise.resolve()
  return axios.get('http://f.yiban.cn/iapp610661', {
    timeout: 10000,
    params: { access_token: token },
    headers: {
      Origin: 'https://f.yiban.cn',
      'User-Agent': UA
    }
  })
    .then(it => {
      if (it.status !== 200) throw new Error(it.statusText)
      const cookies = it.headers['set-cookie']
      return axios.post(`http://yiban.sust.edu.cn/v4/public/index.php/Index/formflow/add.html`,
        id === '24'
          ? '24%5B0%5D%5B0%5D%5Bname%5D=form%5B24%5D%5Bfield_1588749561_2922%5D%5B%5D&24%5B0%5D%5B0%5D%5Bvalue%5D=36.3&24%5B0%5D%5B1%5D%5Bname%5D=form%5B24%5D%5Bfield_1588749738_1026%5D%5B%5D&24%5B0%5D%5B1%5D%5Bvalue%5D=%E9%99%95%E8%A5%BF%E7%9C%81+%E8%A5%BF%E5%AE%89%E5%B8%82+%E6%9C%AA%E5%A4%AE%E5%8C%BA+111%E5%8E%BF%E9%81%93+2%E5%8F%B7+%E9%9D%A0%E8%BF%91%E5%8C%97%E5%9F%8E%E9%A9%BE%E6%A0%A1+&24%5B0%5D%5B2%5D%5Bname%5D=form%5B24%5D%5Bfield_1588749759_6865%5D%5B%5D&24%5B0%5D%5B2%5D%5Bvalue%5D=%E6%98%AF&24%5B0%5D%5B3%5D%5Bname%5D=form%5B24%5D%5Bfield_1588749842_2715%5D%5B%5D&24%5B0%5D%5B3%5D%5Bvalue%5D=%E5%90%A6&24%5B0%5D%5B4%5D%5Bname%5D=form%5B24%5D%5Bfield_1588749886_2103%5D%5B%5D&24%5B0%5D%5B4%5D%5Bvalue%5D='
          : '25%5B0%5D%5B0%5D%5Bname%5D=form%5B25%5D%5Bfield_1588750276_2934%5D%5B%5D&25%5B0%5D%5B0%5D%5Bvalue%5D=36.4&25%5B0%5D%5B1%5D%5Bname%5D=form%5B25%5D%5Bfield_1588750304_5363%5D%5B%5D&25%5B0%5D%5B1%5D%5Bvalue%5D=%E9%99%95%E8%A5%BF%E7%9C%81+%E8%A5%BF%E5%AE%89%E5%B8%82+%E6%9C%AA%E5%A4%AE%E5%8C%BA+111%E5%8E%BF%E9%81%93+2%E5%8F%B7+%E9%9D%A0%E8%BF%91%E5%8C%97%E5%9F%8E%E9%A9%BE%E6%A0%A1+&25%5B0%5D%5B2%5D%5Bname%5D=form%5B25%5D%5Bfield_1588750323_2500%5D%5B%5D&25%5B0%5D%5B2%5D%5Bvalue%5D=%E6%98%AF&25%5B0%5D%5B3%5D%5Bname%5D=form%5B25%5D%5Bfield_1588750343_3510%5D%5B%5D&25%5B0%5D%5B3%5D%5Bvalue%5D=%E5%90%A6&25%5B0%5D%5B4%5D%5Bname%5D=form%5B25%5D%5Bfield_1588750363_5268%5D%5B%5D&25%5B0%5D%5B4%5D%5Bvalue%5D=',
        {
          timeout: 10000,
          params: { desgin_id: id, list_id: '12' }
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': UA,
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: 'http://yiban.sust.edu.cn',
            Referer: `http://yiban.sust.edu.cn/v4/public/index.php/index/formtime/form.html?desgin_id=${id}&list_id=12`,
            Cookie: (Array.isArray(cookies) ? cookies : [cookies]).join('').replace('; path=/; domain=.sust.edu.cn', '')
          }
        }
      )
    })
    .then(it => {
      if (typeof it.data === 'string') {
        if (it.data.includes('网关')) throw new Error('网关错误!')
        if (it.data.includes('易班账号验证失败')) {
          const account = config[name]
          if (typeof account === 'object') {
            return getToken(account.username, account.password).then(it => {
              if (it.data.response !== '100' || !it.data.data.access_token) throw new Error('登录-' + it.data.message)
              if (it.data.data.user.name !== name) throw new Error('当前程序仅限白名单用户使用!')
              const t = config[name].token = it.data.data.access_token
              return save().then(() => upload(id, name, t))
            })
          } else throw new Error('登录已过期!')
        }
      }
      if (!it.data.msg) {
        console.error(it.data)
        throw new Error('返回错误!')
      }
      if (it.data.msg.includes('多次提交')) {
        status[hName] = '打卡成功!'
        return
      }
      if (it.data.msg === 'SU') {
        console.log(name + ':', '打卡成功!')
        status[hName] = '打卡成功!'
      }
      throw new Error(it.data.msg)
    })
    .catch(e => {
      console.error(name + ':', e)
      status[hName] = `打卡失败! (${e.message})`
    })
}
const f = id => {
  Object.entries(config).forEach(([name, token]) => upload(id, name, typeof token === 'object' ? token.token : token))
  const t = new Date()
  lastTry = `${t.getFullYear()}-${padStart(t.getMonth() + 1)}-${padStart(t.getDay() + 1)} ${padStart(t.getHours())}:${padStart(t.getMinutes())}:${padStart(t.getSeconds())}`
}

f(new Date().getHours() > 12 ? '25' : '24')
setInterval(() => {
  switch (new Date().getHours()) {
    case 5:
    case 11:
      status = {}
      break
    case 6:
      f('24')
      break
    case 12:
      f('25')
  }
}, 15 * 60 * 1000)
console.log('Started!')
console.log(config)

http.createServer(function (req, res) {
  switch (req.url) {
    case '/status':
      if (req.method !== 'GET') break
      res.end(getStatusPage())
      return
    case '/checkin':
      if (req.method !== 'POST') break
      const hour = new Date().getHours()
      if (!((hour >= 6 && hour <= 8) || (hour >= 12 && hour <= 15))) {
        res.end('错误的时间遇上了错误的卡!')
        return
      }
      getBody(req, (err, data) => {
        if (err) {
          console.error(err)
          res.end('发生错误!')
          return
        }
        const name = data.name
        if (!(name in config)) {
          res.end('当前程序仅限白名单用户使用!')
          return
        }
        const token = config[name]
        upload(new Date().getHours() > 12 ? '25' : '24', name, typeof token === 'object' ? token.token : token)
        res.end('提交成功!')
      })
      return
    case '/updateToken':
      if (req.method !== 'POST') break
      getBody(req, (err, data) => {
        if (err) {
          console.error(err)
          res.end('发生错误!')
          return
        }
        const name = data.name
        if (!(name in config)) {
          res.end('当前程序仅限白名单用户使用!')
          return
        }
        if (!data.token || data.token.length !== 32) {
          res.end('错误的账号令牌!')
          return
        }
        config[name] = data.token
        save()
        res.end('保存成功!')
      })
      return
    case '/updateAccount':
      if (req.method !== 'POST') break
      getBody(req, (err, data) => {
        if (err) {
          console.error(err)
          res.end('发生错误!')
          return
        }
        if (typeof data.username !== 'string' || typeof data.password !== 'string') {
          res.end('提交数据错误!')
          return
        }
        getToken(data.username, data.password).then(it => {
          if (it.data.response !== '100' || !it.data.data.access_token) {
            res.end('易班接口返回错误!')
            return
          }
          const name = it.data.data.user.name
          if (!(name in config)) {
            res.end('当前程序仅限白名单用户使用!')
            return
          }
          config[name] = {
            username: data.username,
            password: data.password,
            token: it.data.data.access_token
          }
          save()
          res.end('保存成功!')
        }).catch(e => {
          console.error(e)
          res.end('发生错误!')
        })
      })
      return
  }
  res.statusCode = 404
  res.end()
}).listen(2333)
