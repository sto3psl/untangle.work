/* @jsx h */
import { h } from "preact"
import { useState, useRef } from "preact/hooks"

export function QuickTaskButton({ onCreate, children }) {
  const [showInput, setShowInput] = useState(false)
  const input = useRef(null)
  const button = useRef(null)

  function toggle(state) {
    setShowInput(state)

    requestAnimationFrame(() => {
      if (state) {
        input.current.focus()
      } else {
        button.current.focus()
      }
    })
  }

  function handleEnter(e) {
    if (e.key === "Enter" && e.target.value.trim()) {
      onCreate(e)
      toggle(false)
    }

    if (e.key === "Escape") {
      toggle(false)
    }
  }

  function handleBlur(e) {
    if (!e.target.value.trim()) {
      setShowInput(false)
      return
    }

    onCreate && onCreate(e)
  }

  return showInput ? (
    <input
      ref={input}
      className="block p-2 w-full rounded bg-blue-100 border-blue-500 border-2"
      type="text"
      onBlur={handleBlur}
      onKeyUp={handleEnter}
      placeholder="Titel eingeben"
    />
  ) : (
    <button
      ref={button}
      className="p-3 text-blue-600 rounded hover:bg-blue-600 hover:text-white focus:bg-blue-500 focus:text-white transition-colors w-full text-left"
      onClick={toggle}
    >
      {children}
    </button>
  )
}
