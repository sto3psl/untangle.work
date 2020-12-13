/* @jsx h */
import { h } from "preact"
import { useRef, useEffect } from "preact/hooks"
import { Link, useLocation } from "wouter-preact"
import { useLists } from "../hooks/useTaskStore.js"
import get from "lodash-es/get"
import set from "lodash-es/set"
import styles from "./TaskView.module.css"

export default function TaskView({ task, update, del }) {
  const [, setLocation] = useLocation()
  const [lists] = useLists()

  const form = useRef(null)
  const modal = useRef(null)

  useEffect(() => {
    modal.current?.focus()
  }, [modal.current])

  function handleSubmit(e) {
    e.preventDefault()
    const data = new FormData(form.current)
    const newTask = {}
    for (const [key, value] of data.entries()) {
      set(newTask, key, value)
    }

    update(newTask)
  }

  function handleDelete() {
    del()
    setLocation("/")
  }

  function close(e) {
    if (e.target === e.currentTarget) {
      setLocation("/")
    }
  }

  function handleKeyPress(e) {
    if (e.key === "Escape") {
      setLocation("/")
    }
  }

  return (
    <div
      className="flex fixed z-20 p-4 inset-0 bg-gray-800 bg-opacity-70 justify-center items-center"
      onClick={close}
    >
      <div
        ref={modal}
        className="bg-white p-4 rounded w-full max-w-2xl max-h-full overflow-auto"
        tabIndex={0}
        onKeyPress={handleKeyPress}
      >
        <form ref={form} onSubmit={handleSubmit}>
          <label className="block pb-2">
            <div class="pb-2 font-bold">Titel</div>
            <input
              className="block w-full bg-gray-100 rounded p-3"
              name="doc.title"
              id="doc.title"
              type="text"
              value={task.doc.title}
            />
          </label>
          <label className="block pb-2">
            <div class="pb-2 font-bold">Beschreibung</div>
            <textarea
              className="block w-full bg-gray-100 rounded p-3 h-48"
              name="doc.description"
              value={task.doc.description}
            ></textarea>
          </label>
          <label className="block w-1/2">
            <div class="pb-2 font-bold">Tag</div>
            <input
              className="block w-full bg-gray-100 rounded p-3"
              name="tags.0"
              id="tags.0"
              type="text"
              value={task.tags[0]}
            />
          </label>
          <div class="flex items-end">
            <label className="block w-1/2">
              <div class="pb-2 font-bold">Liste</div>
              <div className={styles.selectWrapper}>
                <select className={styles.select} name="list" value={task.list}>
                  {lists.map((list) => (
                    <option value={list}>{list}</option>
                  ))}
                </select>
              </div>
            </label>
            <button
              type="button"
              onClick={handleDelete}
              className="ml-auto py-2 px-3 bg-gray-100 rounded-lg text-gray-800"
            >
              ❌
            </button>
            <button
              type="submit"
              className="ml-1 py-2 px-4 bg-gradient-to-r to-blue-800 from-blue-600 rounded-lg text-blue-100"
            >
              Speichern
            </button>
          </div>
        </form>
        <Link class="absolute top-0 right-0 rounded p-3" href="/">
          ✖️
        </Link>
      </div>
    </div>
  )
}