/**
 * 表单验证工具函数
 */

export const required = (value) => {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

export const email = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const phone = (phone) => {
  const regex = /^1[3-9]\d{9}$/
  return regex.test(phone)
}

export const passwordLength = (password, minLength = 6) => {
  return password && password.length >= minLength
}

export const passwordMatch = (password1, password2) => {
  return password1 === password2
}

export const number = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

export const integer = (value) => {
  return Number.isInteger(Number(value))
}

export const range = (value, min, max) => {
  const num = Number(value)
  return num >= min && num <= max
}

export const username = (username) => {
  const regex = /^[a-zA-Z0-9_]{4,20}$/
  return regex.test(username)
}

export default {
  required,
  email,
  phone,
  passwordLength,
  passwordMatch,
  number,
  integer,
  range,
  username
}
