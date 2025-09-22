/**
 * RSA加密解密工具模块
 * 功能：提供RSA公私钥加密解密功能
 * 适配自主客户端的jsencrypt.ts，用于PC端登录加密
 */

import JSEncrypt from 'jsencrypt'

/**
 * RSA加密
 * @param {string} txt 需要加密的数据
 * @returns {string|false} 加密后的数据
 */
export function encrypt(txt) {
  const rsaPublicKey = import.meta.env.VITE_GLOB_RSA_PUBLIC_KEY
  if (!rsaPublicKey) {
    console.error('RSA公钥未配置')
    return false
  }
  
  const instance = new JSEncrypt()
  instance.setPublicKey(rsaPublicKey)
  return instance.encrypt(txt)
}

/**
 * RSA解密
 * @param {string} txt 需要解密的数据
 * @returns {string|false} 解密后的数据
 */
export function decrypt(txt) {
  const rsaPrivateKey = import.meta.env.VITE_GLOB_RSA_PRIVATE_KEY
  if (!rsaPrivateKey) {
    console.error('RSA私钥未配置')
    return false
  }
  
  const instance = new JSEncrypt()
  instance.setPrivateKey(rsaPrivateKey)
  return instance.decrypt(txt)
}