import classNames from 'classnames'
import { createMemo, For, JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { type IconDefinition } from '@ant-design/icons-svg/lib/types'
import { getTwoToneColorByColor, normalizeTwoToneColors } from './twoToneColor'

import './style/index.css'

export interface AntdIconProps {
  class?: string
  style?: JSX.CSSProperties | string
  rotate?: number
  spin?: boolean
  twoToneColor?: string | [string, string]
  ref?: HTMLSpanElement
  onClick?: (event: MouseEvent) => void
}

interface IconComponentProps extends AntdIconProps {
  icon: IconDefinition
}

const prefixCls = 'anticon'

export const AntdIcon = (props: IconComponentProps) => {
  const twoToneColor = createMemo(() =>
    normalizeTwoToneColors(props.twoToneColor),
  )

  const iconConfig = createMemo(() => {
    if (typeof props.icon.icon === 'function') {
      const [primaryColor, secondaryColor] =
        getTwoToneColorByColor(twoToneColor())

      return props.icon.icon(primaryColor, secondaryColor)
    }
    return props.icon.icon
  })

  const classString = createMemo(() =>
    classNames(
      prefixCls,
      {
        [`${prefixCls}-spin`]: !!props.spin,
      },
      props.class,
    ),
  )

  const svgStyle = createMemo(() =>
    props.rotate
      ? {
          transform: `rotate(${props.rotate}deg)`,
        }
      : undefined,
  )

  const iconTabIndex = createMemo(() => (props.onClick ? -1 : undefined))

  return (
    <span
      ref={props.ref}
      class={classString()}
      style={props.style}
      tabIndex={iconTabIndex()}
      role="img"
      onClick={props.onClick}
    >
      <Dynamic
        component={iconConfig().tag}
        {...iconConfig().attrs}
        style={svgStyle()}
        width="1em"
        height="1em"
        fill="currentColor"
      >
        <For each={iconConfig().children}>
          {(item) => <Dynamic component={item.tag} {...item.attrs}></Dynamic>}
        </For>
      </Dynamic>
    </span>
  )
}
