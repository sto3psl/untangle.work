/* @jsx h */
import { h } from "preact"
import { useRef, useEffect } from "preact/hooks"
import { Link, useLocation } from "wouter-preact"
import set from "lodash-es/set"
import styles from "./TaskView.module.css"
import { Button, ButtonPrimary } from "./Buttons"

export default function TaskView({ task, lists, update, del }) {
  const [, setLocation] = useLocation()

  const form = useRef(null)
  const modal = useRef(null)

  useEffect(() => {
    modal.current?.focus()
  }, [modal.current])

  function handleSubmit(e) {
    e.preventDefault()
    const data = new FormData(form.current)
    const newTask = { id: task.id }
    for (const [key, value] of data.entries()) {
      console.log(key)
      switch (key) {
        case "tags":
          const tags = value
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean)
          set(newTask, key, tags)
          break
        default:
          set(newTask, key, value)
          break
      }
    }
    update(newTask)
    setLocation("/")
  }

  function handleDelete() {
    del(task)
    setLocation("/")
  }

  function close(e) {
    if (e.target === e.currentTarget) {
      setLocation("/")
    }
  }

  function handleKeyUp(e) {
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
        className="bg-white rounded w-full max-w-2xl max-h-full overflow-auto"
        tabIndex={0}
        onKeyUp={handleKeyUp}
      >
        <form class="p-4" ref={form} onSubmit={handleSubmit}>
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
              name="tags"
              id="tags"
              type="text"
              value={task.tags.join(", ")}
            />
          </label>
          <div class="flex items-end">
            <label className="block w-1/2">
              <div class="pb-2 font-bold">Liste</div>
              <div className={styles.selectWrapper}>
                <select className={styles.select} name="list" value={task.list}>
                  {Array.from(lists.keys()).map((list) => (
                    <option value={list}>{list}</option>
                  ))}
                </select>
              </div>
            </label>
            <div class="ml-auto flex space-x-2">
              <Button type="button" onClick={handleDelete}>
                ❌
              </Button>
              <ButtonPrimary type="submit">Speichern</ButtonPrimary>
            </div>
          </div>
        </form>
        <Link class="absolute top-0 right-0 rounded p-3" href="/">
          ✖️
        </Link>
      </div>
    </div>
  )
}
