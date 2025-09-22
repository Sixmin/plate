/**
 * 加密工具模块
 * 功能：提供AES加密/解密和相关工具函数
 * 适配自主客户端的crypto.ts，用于PC端登录加密
 */

import CryptoJS from 'crypto-js'

function randomUUID() {
  const chars = [
    ...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  ]
  const uuid = Array.from({ length: 36 })
  let rnd = 0
  let r
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid[i] = '-'
    } else if (i === 14) {
      uuid[i] = '4'
    } else {
      if (rnd <= 0x02)
        rnd = Math.trunc(0x2_00_00_00 + Math.random() * 0x1_00_00_00)
      r = rnd & 16
      rnd = rnd >> 4
      uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r]
    }
  }
  return uuid.join('').replaceAll('-', '').toLowerCase()
}

/**
 * 随机生成aes 密钥
 * @returns {CryptoJS.lib.WordArray} aes 密钥
 */
export function generateAesKey() {
  return CryptoJS.enc.Utf8.parse(randomUUID())
}

/**
 * base64编码
 * @param {CryptoJS.lib.WordArray} str
 * @returns {string} base64编码
 */
export function encryptBase64(str) {
  return CryptoJS.enc.Base64.stringify(str)
}

/**
 * 使用AES加密
 * @param {string} message 加密内容
 * @param {CryptoJS.lib.WordArray} aesKey aesKey
 * @returns {string} 使用AES加密的结果
 */
export function encryptWithAes(message, aesKey) {
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString()
}

/**
 * 解密base64
 * @param {string} str
 * @returns {CryptoJS.lib.WordArray}
 */
export function decryptBase64(str) {
  return CryptoJS.enc.Base64.parse(str)
}

/**
 * 使用密钥对数据进行AES解密
 * @param {string} message 加密的消息
 * @param {CryptoJS.lib.WordArray} aesKey aes密钥
 * @returns {string} 解密后的数据
 */
export function decryptWithAes(message, aesKey) {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}