const OpenCC = require('opencc')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const basePath = path.join(__dirname, '../src/lang/')

let cnRawData = require(`${basePath}zh-CN.json`)
let twRawData = require(`${basePath}zh-TW.json`)

const simpleToTradition = new OpenCC('s2t.json')
const traditionToSimple = new OpenCC('t2s.json')
const localeRawData = _.merge(twRawData, cnRawData)

const translatedToTraditionCN = {}
const translatedToSimpleCN = {}

function translate(translateStrategy, obj, storeObj) {
  function recurse(obj, subKey) {
    for (const key in obj) {
      let value = obj[key]
      if (value != undefined) {
        if (value && typeof value === 'object') {
          recurse(value, key)
        } else {
          if (subKey) {
            const k = subKey
            translateStrategy
              .convertPromise(value)
              .then((tran) => {
                _.set(storeObj, `${k}.${key}`, tran)
              })
              .catch((e) => {
                console.log(e)
              })
          } else {
            translateStrategy
              .convertPromise(value)
              .then((tran) => {
                storeObj[key] = tran
              })
              .catch((e) => {
                console.log(e)
              })
          }
        }
      }
    }
    subKey = null
  }
  recurse(obj)
}

function replaceFile(fileName, val) {
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true })
  }
  fs.writeFile(path.join(basePath, `${fileName}.json`), JSON.stringify(val, null, 2), (err) => {
    if (err) throw err
    console.log(`[success] replaced file: "lan/${fileName}.json"`)
  })
}

translate(traditionToSimple, localeRawData, translatedToSimpleCN)
translate(simpleToTradition, localeRawData, translatedToTraditionCN)

setTimeout(() => {
  replaceFile('zh-CN', translatedToSimpleCN)
  replaceFile('zh-TW', translatedToTraditionCN)
}, 1000)
