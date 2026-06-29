// 阿拉伯數字 → 中文數字(用於章節號顯示)
// 支援 1 ~ 99999,涵蓋上千章需求。
// 規則範例:
//   1→一  10→十  11→十一  20→二十  100→一百  101→一百零一
//   110→一百一十  1000→一千  1024→一千零二十四  10000→一萬

const DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const SMALL_UNITS = ['', '十', '百', '千'] // 個十百千

// 轉換 0~9999 的區段
function convertSection(num: number): string {
  if (num === 0) return ''
  let result = ''
  let zeroFlag = false // 是否需要補「零」
  let started = false

  const digits = String(num).padStart(4, '0').split('').map(Number)
  // digits[0]=千, [1]=百, [2]=十, [3]=個
  for (let i = 0; i < 4; i++) {
    const d = digits[i]
    const unitIndex = 3 - i // 千=3, 百=2, 十=1, 個=0
    if (d === 0) {
      // 記住中間出現過 0,等遇到下一個非 0 時補一個「零」
      if (started) zeroFlag = true
    } else {
      if (zeroFlag) {
        result += DIGITS[0] // 補「零」
        zeroFlag = false
      }
      result += DIGITS[d] + SMALL_UNITS[unitIndex]
      started = true
    }
  }
  return result
}

export function toChineseNumber(num: number): string {
  if (!Number.isFinite(num) || num < 0) return String(num)
  num = Math.floor(num)
  if (num === 0) return DIGITS[0]

  const wan = Math.floor(num / 10000) // 萬位區段
  const rest = num % 10000            // 萬以下區段

  let result = ''
  if (wan > 0) {
    result += convertSection(wan) + '萬'
    // 萬以下若不足千(例如 10024 = 一萬零二十四),需補「零」
    if (rest > 0 && rest < 1000) {
      result += DIGITS[0]
    }
  }
  result += convertSection(rest)

  // 處理 10~19 習慣讀法:「一十一」→「十一」(只在沒有更高位時)
  if (wan === 0 && result.startsWith('一十')) {
    result = result.slice(1)
  }
  return result
}

// 章節號顯示:第N章(N 轉中文)
export function chapterLabel(index: number): string {
  return `第${toChineseNumber(index)}章`
}
