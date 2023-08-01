import { URLSearchParams } from "url"

type Values = { [key: string]: string | object }

export class Params {
  constructor(public params: URLSearchParams) {}

  getString(key: string, defaultValue?: string) {
    const value = this.params.get(key)
    return value === null ? defaultValue : value
  }

  getList<T extends string = string>(key: string, values: Values = {}) {
    const list = this.params.getAll(key) as T[]
    const extraList = this.params.getAll(`${key}[]`) as T[] // adds support for arrays sent as &key[]=...
    const fullList = list.concat(extraList)
    const validValues = this.getValidValues(values)
    return validValues.length > 0 ? fullList.filter((value) => validValues.includes(value)) : fullList
  }

  getNumber(key: string, defaultValue?: number) {
    const value = this.params.get(key)
    if (value !== null) {
      const parsed = parseFloat(value)
      if (!isNaN(parsed)) {
        return parsed
      }
    }
    return defaultValue
  }

  getBoolean(key: string) {
    const value = this.params.get(key)
    return value !== null
  }

  getValue<T extends string>(key: string, values: Values = {}, defaultValue?: T) {
    const value = this.getString(key, defaultValue)
    if (value) {
      const validValues = this.getValidValues(values)
      if (validValues.length === 0 || validValues.includes(value as T)) {
        return value as T
      }
    }
    return defaultValue
  }

  private getValidValues<T extends string>(values: Values = {}) {
    const validValues = Object.values(values).filter((value) => typeof value === "string") as T[]
    return validValues
  }
}
