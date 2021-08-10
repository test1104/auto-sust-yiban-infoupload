export const getMorningData = (location: string, temperature: string) => ({
  '24[0][0][name]': 'form[24][field_1588749561_2922][]',
  '24[0][0][value]': temperature,
  '24[0][1][name]': 'form[24][field_1588749738_1026][]',
  '24[0][1][value]': (location + ' ').replace(/ /g, '+'),
  '24[0][2][name]': 'form[24][field_1588749759_6865][]',
  '24[0][2][value]': '是',
  '24[0][3][name]': 'form[24][field_1588749842_2715][]',
  '24[0][3][value]': '否',
  '24[0][4][name]': 'form[24][field_1588749886_2103][]',
  '24[0][4][value]': ''
})

export const getNoonData = (location: string, temperature: string) => ({
  '25[0][0][name]': 'form[25][field_1588750276_2934][]',
  '25[0][0][value]': temperature,
  '25[0][1][name]': 'form[25][field_1588750304_5363][]',
  '25[0][1][value]': location + ' ',
  '25[0][2][name]': 'form[25][field_1588750323_2500][]',
  '25[0][2][value]': '是',
  '25[0][3][name]': 'form[25][field_1588750343_3510][]',
  '25[0][3][value]': '否',
  '25[0][4][name]': 'form[25][field_1588750363_5268][]',
  '25[0][4][value]': ''
})

export const getVacationData = (location: string, temperature: string) => ({
  '13[0][0][name]': 'form[13][field_1587635120_1722][]',
  '13[0][0][value]': temperature,
  '13[0][1][name]': 'form[13][field_1587635142_8919][]',
  '13[0][1][value]': '正常',
  '13[0][2][name]': 'form[13][field_1587635252_7450][]',
  '13[0][2][value]': location + ' ',
  '13[0][3][name]': 'form[13][field_1587635509_7740][]',
  '13[0][3][value]': '否',
  '13[0][4][name]': 'form[13][field_1587998920_6988][]',
  '13[0][4][value]': '0',
  '13[0][5][name]': 'form[13][field_1587998777_8524][]',
  '13[0][5][value]': '否',
  '13[0][6][name]': 'form[13][field_1587635441_3730][]',
  '13[0][6][value]': ''
})

export const mapNameToId = {
  morning: '24',
  noon: '25',
  vacation: '13'
}

export const isSuccess = (msg: string) => msg.includes('请勿多次提交') || msg === 'SU'
