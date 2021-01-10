/* @jsx h */
import { h } from "preact"
import styles from "./Buttons.module.css"

export function Button({
  component = "button",
  className = styles.normal,
  children,
  ...props
} = {}) {
  return h(component, { className, ...props }, children)
}

export function ButtonPrimary({ className, children, ...props } = {}) {
  return (
    <Button class={styles.primary} {...props}>
      {children}
    </Button>
  )
}

export function ButtonText({ className, children, ...props } = {}) {
  return (
    <Button class={styles.text} {...props}>
      {children}
    </Button>
  )
}
