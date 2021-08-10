/* eslint-disable camelcase */
import axios_ from 'axios'
import { stringify } from 'querystring'
import { getMorningData, getNoonData, getVacationData } from './data'
import { getIMEI, encryptPassword, USER_AGENT, USER_AGENT_YIBAN, randomTemperature } from './utils'

export interface Response <T = any> {
  response: number
  message: string
  is_mock: boolean
  data: T
}

const axios = axios_.create({
  timeout: 30000,
  headers: { 'User-Agent': USER_AGENT, AppVersion: '5.0', 'X-Requested-With': 'com.yiban.app' }
})

export const login = (mobile: string, password: string) => axios.post<Response<{
  access_token: string
  user: {
    authority: string
    isSchoolVerify: boolean
    name: string
    nick: string
    phone: string
    pic: { s: string, m: string, b: string, o: string }
    school: {
      classId: number
      className: string
      collegeId: number
      collegeName: string
      isVerified: boolean
      joinSchoolYear: string
      schoolId: number
      schoolName: string
      schoolOrgId: number
    }
    sex: string
    user_id: number
  }
}>>(
  'https://mobile.yiban.cn/api/v4/passport/login',
  stringify({
    device: 'vivo AV1938T',
    v: '5.0',
    password: encryptPassword(password),
    token: '',
    mobile,
    ct: '2',
    identify: getIMEI(mobile),
    sversion: '25',
    app: '1',
    apn: 'wifi',
    authCode: '',
    sig: '5692393ff332462c'
  }),
  {
    headers: {
      'User-Agent': USER_AGENT_YIBAN,
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://mobile.yiban.cn',
      Referer: 'https://mobile.yiban.cn',
      logintoken: ''
    }
  }
).then(({ status, data }) => {
  if (data && (data.response !== 100 || !data.response)) throw new Error(data.message)
  if (status !== 200) throw new Error(data as any)
  return data
})

export const getYiTongBangCookies = (token: string) => axios.get('http://f.yiban.cn/iapp610661', {
  headers: {
    Origin: 'http://f.yiban.cn',
    logintoken: token,
    Authorization: token,
    Cookie: 'loginToken=' + token
  }
}).then(it => {
  const cookies: string | string[] = it.headers['set-cookie']
  return (Array.isArray(cookies) ? cookies : [cookies]).filter(c => !c.includes('waf_cookie=')).map(c => c.split(';')[0]).join('; ')
})

export const upload = (designId: string, listId: string, cookies: string, data: any) => axios.post<{ code: String, msg: string }>(
  'http://yiban.sust.edu.cn/v4/public/index.php/Index/formflow/add.html',
  stringify(data, undefined, undefined, { encodeURIComponent: encodeURI }),
  {
    params: { desgin_id: designId, list_id: listId },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'http://yiban.sust.edu.cn',
      Referer: `http://yiban.sust.edu.cn/v4/public/index.php/index/formflow/form.html?desgin_id=${designId}&list_id=${designId}`,
      Cookie: cookies
    }
  }
).then(({ status, data }) => {
  if (status !== 200) throw new Error(data as any)
  return data
})

export default async (mobile: string, password: string, id: '24' | '25' | '13', location?: string, temperature?: string) => login(mobile, password)
  .then(data => getYiTongBangCookies(data.data.access_token))
  .then(cookies => upload(id, id === '13' ? '9' : '12', cookies,
    (id === '13' ? getVacationData : id === '24' ? getMorningData : getNoonData)(
      location || '陕西省 西安市 未央区 111县道 2号 靠近北城驾校',
      temperature || randomTemperature()
    )))
