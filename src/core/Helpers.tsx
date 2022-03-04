/*
 * Функция кладет значение в объект по пути
 * пример в src/index.test.tsx
 * */
type ObjectSetParams = {
  obj: { [K: string]: any }
  path: string
  value: any
}
export const objectSet = ({ path, obj, value }: ObjectSetParams) => {
  const pathSplit = pathParse({ path })
  let remakeObj: any
  for (let i = 0; i < pathSplit.length; i++) {
    const pathSplitItem = pathSplit[i]
    if (typeof pathSplitItem === 'string') {
      if (i === pathSplit.length - 1) {
        if (i === 0) {
          obj[pathSplitItem] = value
        } else {
          remakeObj[pathSplitItem] = value
        }
      } else {
        if (i === 0) {
          if (obj[pathSplitItem] === undefined) {
            obj[pathSplitItem] = {}
          }
          remakeObj = obj[pathSplitItem]
        } else {
          if (remakeObj[pathSplitItem] === undefined) {
            remakeObj[pathSplitItem] = {}
          }
          remakeObj = remakeObj[pathSplitItem]
        }
      }
    } else {
      if (i === pathSplit.length - 1) {
        if (i === 0) {
          // let
          if (obj[pathSplitItem.array] === undefined) {
            obj[pathSplitItem.array] = []
            obj[pathSplitItem.array][pathSplitItem.index] = value
          } else {
            obj[pathSplitItem.array][pathSplitItem.index] = value
          }
        } else {
          if (remakeObj[pathSplitItem.array] === undefined) {
            remakeObj[pathSplitItem.array] = []
          }
          remakeObj[pathSplitItem.array][pathSplitItem.index] = value
        }
      } else {
        if (i === 0) {
          if (obj[pathSplitItem.array] === undefined) {
            obj[pathSplitItem.array] = []
          }
          if (obj[pathSplitItem.array][pathSplitItem.index] !== undefined) {
            remakeObj = obj[pathSplitItem.array][pathSplitItem.index]
          } else {
            obj[pathSplitItem.array][pathSplitItem.index] = {}
            remakeObj = obj[pathSplitItem.array][pathSplitItem.index]
          }
        } else {
          if (remakeObj[pathSplitItem.array] === undefined) {
            remakeObj[pathSplitItem.array] = []
          }
          if (
            remakeObj[pathSplitItem.array][pathSplitItem.index] !== undefined
          ) {
            remakeObj = remakeObj[pathSplitItem.array][pathSplitItem.index]
          } else {
            remakeObj[pathSplitItem.array][pathSplitItem.index] = {}
            remakeObj = remakeObj[pathSplitItem.array][pathSplitItem.index]
          }
        }
      }
    }
  }
  return obj
}

/*
 * Функция возвращает значение из объекта по пути
 * пример в src/index.test.tsx
 * */
type ObjectGetParams = {
  path: string
  obj: { [K: string]: any }
}
export const objectGet = ({ obj, path }: ObjectGetParams) => {
  const pathSplit = pathParse({ path }) // парсер атрибута "name"
  let remakeObj: any
  for (let i = 0; i < pathSplit.length; i++) {
    // перебор распаршенного атрибута "name"
    const pathSplitItem = pathSplit[i]
    if (typeof pathSplitItem === 'string') {
      // Если не массив
      if (i === pathSplit.length - 1) {
        // если последний
        if (i === 0) {
          // если один элемент всего
          if (obj[pathSplitItem] !== undefined) {
            remakeObj = obj[pathSplitItem]
          } else {
            remakeObj = undefined
          }
        } else {
          // логика для последнего
          if (
            remakeObj !== undefined &&
            remakeObj !== null &&
            remakeObj[pathSplitItem] !== undefined
          ) {
            remakeObj = remakeObj[pathSplitItem]
          } else {
            remakeObj = undefined
          }
        }
      } else {
        // Если не последний
        if (i === 0) {
          // если первый
          if (obj[pathSplitItem] !== undefined) {
            remakeObj = obj[pathSplitItem]
          } else {
            remakeObj = undefined
          }
        } else {
          // если не первый
          if (
            remakeObj !== undefined &&
            remakeObj !== null &&
            remakeObj[pathSplitItem] !== undefined
          ) {
            remakeObj = remakeObj[pathSplitItem]
          } else {
            remakeObj = undefined
          }
        }
      }
    } else {
      // если массив
      if (i === pathSplit.length - 1) {
        // Если последний
        if (i === 0) {
          // Если единственный
          if (
            obj[pathSplitItem.array] !== undefined &&
            obj[pathSplitItem.array][pathSplitItem.index] !== undefined
          ) {
            remakeObj = obj[pathSplitItem.array][pathSplitItem.index]
          } else {
            remakeObj = undefined
          }
        } else {
          // Если не первый
          if (
            remakeObj !== undefined &&
            remakeObj !== null &&
            remakeObj[pathSplitItem.array] !== undefined &&
            remakeObj[pathSplitItem.array] !== null &&
            remakeObj[pathSplitItem.array][pathSplitItem.index] !== undefined
          ) {
            remakeObj = remakeObj[pathSplitItem.array][pathSplitItem.index]
          } else {
            remakeObj = undefined
          }
        }
      } else {
        // Если не последний
        if (i === 0) {
          // Если первый
          if (
            obj[pathSplitItem.array] !== undefined &&
            obj[pathSplitItem.array][pathSplitItem.index] !== undefined
          ) {
            remakeObj = obj[pathSplitItem.array][pathSplitItem.index]
          } else {
            remakeObj = undefined
          }
        } else {
          // Если не первый
          if (
            remakeObj !== undefined &&
            remakeObj !== null &&
            remakeObj[pathSplitItem.array] !== undefined &&
            remakeObj[pathSplitItem.array] !== null &&
            remakeObj[pathSplitItem.array][pathSplitItem.index] !== undefined
          ) {
            remakeObj = remakeObj[pathSplitItem.array][pathSplitItem.index]
          } else {
            remakeObj = undefined
          }
        }
      }
    }
  }
  return remakeObj
}

/*
 * ф-я делит путь на объекты для нормально работы objectSet и objetctGet
 * */
type ObjectParseParams = {
  path: string
}
type PathSplitType = (string | { array: string; index: number })[]
export const pathParse = (params: ObjectParseParams): PathSplitType => {
  const pathSplitByObj = params.path.split('.')
  const pathSplit: PathSplitType = pathSplitByObj.map((path) => {
    if (path.indexOf('][') !== -1) {
      throw new Error(
        `Array nested in another array is not supported in field name [${path} in ${params.path}]`
      )
    }
    if (path.indexOf('[') !== -1) {
      const arrName = path.substr(0, path.indexOf('['))
      const indexOfLeftBracket = path.indexOf('[') + 1
      const length = path.indexOf(']') + 1 - indexOfLeftBracket
      const index = path.substr(indexOfLeftBracket, length)
      return {
        array: arrName,
        index: parseInt(index)
      }
    } else {
      return path
    }
  })
  return pathSplit
}
