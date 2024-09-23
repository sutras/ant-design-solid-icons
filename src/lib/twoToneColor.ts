import { blue, generate } from '@ant-design/colors'
import { createStore } from 'solid-js/store'

export const [twoToneColorPalette, setTwoToneColorPalette] = createStore({
  primaryColor: '#333',
  secondaryColor: '#E6E6E6',
})

setTwoToneColor(blue.primary)

export type TwoToneColor = string | string[]

export function normalizeTwoToneColors(twoToneColor?: TwoToneColor): string[] {
  if (!twoToneColor) {
    return []
  }

  return Array.isArray(twoToneColor) ? twoToneColor : [twoToneColor]
}

export function getTwoToneColorByColor(twoToneColor?: TwoToneColor) {
  let [primaryColor, secondaryColor] = normalizeTwoToneColors(twoToneColor)
  if (!primaryColor) {
    primaryColor = twoToneColorPalette.primaryColor
    secondaryColor = twoToneColorPalette.secondaryColor
  } else if (!secondaryColor) {
    secondaryColor = generate(primaryColor)[0]
  }
  return [primaryColor, secondaryColor] as const
}

export function setTwoToneColor(twoToneColor?: TwoToneColor) {
  const [primaryColor, secondaryColor] = getTwoToneColorByColor(twoToneColor)

  setTwoToneColorPalette('primaryColor', primaryColor)
  setTwoToneColorPalette('secondaryColor', secondaryColor)
}

export function getTwoToneColor(): [string, string] {
  return [twoToneColorPalette.primaryColor, twoToneColorPalette.secondaryColor]
}
