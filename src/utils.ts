import { create as createRandom } from 'random-seed'
import { mod10 } from 'checkdigit'
import NodeRsa from 'node-rsa'

const key = new NodeRsa(`-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA6aTDM8BhCS8O0wlx2KzA
Ajffez4G4A/QSnn1ZDuvLRbKBHm0vVBtBhD03QUnnHXvqigsOOwr4onUeNljegIC
XC9h5exLFidQVB58MBjItMA81YVlZKBY9zth1neHeRTWlFTCx+WasvbS0HuYpF8+
KPl7LJPjtI4XAAOLBntQGnPwCX2Ff/LgwqkZbOrHHkN444iLmViCXxNUDUMUR9bP
A9/I5kwfyZ/mM5m8+IPhSXZ0f2uw1WLov1P4aeKkaaKCf5eL3n7/2vgq7kw2qSmR
AGBZzW45PsjOEvygXFOy2n7AXL9nHogDiMdbe4aY2VT70sl0ccc4uvVOvVBMinOp
d2rEpX0/8YE0dRXxukrM7i+r6lWy1lSKbP+0tQxQHNa/Cjg5W3uU+W9YmNUFc1w/
7QT4SZrnRBEo++Xf9D3YNaOCFZXhy63IpY4eTQCJFQcXdnRbTXEdC3CtWNd7SV/h
mfJYekb3GEV+10xLOvpe/+tCTeCDpFDJP6UuzLXBBADL2oV3D56hYlOlscjBokNU
AYYlWgfwA91NjDsWW9mwapm/eLs4FNyH0JcMFTWH9dnl8B7PCUra/Lg/IVv6HkFE
uCL7hVXGMbw2BZuCIC2VG1ZQ6QD64X8g5zL+HDsusQDbEJV2ZtojalTIjpxMksbR
ZRsH+P3+NNOZOEwUdjJUAx8CAwEAAQ==
-----END PUBLIC KEY-----`)

key.setOptions({ encryptionScheme: 'pkcs1' })

export const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
export const USER_AGENT_YIBAN = 'YiBan/5.0 Mozilla/5.0 (Linux; Android 7.1.2; V1938T Build/N2G48C; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/68.0.3440.70 Safari/537.36'

export const getName = (it: string) => it.slice(0, 1) + '*'.repeat(it.length - 1)

export const getIMEI = (mobile: string) => {
  const rand = createRandom(mobile)
  const str = '86' + rand.range(999999).toString().padStart(6, '0') + rand.range(999999).toString().padStart(6, '0')
  return str + mod10.create(str)
}

export const padStart = (str: number) => str.toString().padStart(2, '0')

export const encryptPassword = (password: string) => key.encrypt(password, 'base64')

export const randomTemperature = () => '36.' + (1 + Math.random() * 3 | 0)

export const sleep = (time = 5000) => new Promise(resolve => setTimeout(resolve, time))
