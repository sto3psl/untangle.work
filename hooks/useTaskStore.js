import { createContext } from "preact"
import { useState, useEffect, useContext } from "preact/hooks"
import { useLocation } from "wouter-preact"
import { Store, keys, set, get, del, clear } from "idb-keyval"

const taskStore = new Store("task-db", "task-store")
const listStore = new Store("list-db", "list-store")

// clear(taskStore)
// clear(listStore)

const INITIAL_TASK = {
  id: "task-1",
  doc: {
    title: "Eine neue Aufgabe erstellen ⬇️",
    description: 'Klicke auf den blauen "Todo erstellen" Button!',
  },
  list: "Heute",
  tags: ["tutorial"],
}

const DEFAULT_LISTS = new Map([
  [
    "__order__",
    ["Heute", "Diese Woche", "Diesen Monat", "Backlog", "Erledigt"],
  ],
  ["Heute", [INITIAL_TASK.id]],
  ["Diese Woche", []],
  ["Diesen Monat", []],
  ["Backlog", []],
  ["Erledigt", []],
])

export function useTaskStore() {
  const [state, setState] = useState("created")
  const [transaction, setTransaction] = useState(0)
  const [lists, setLists] = useState(new Map())
  const [tasks, setTasks] = useState({})

  async function initialize() {
    const lists = await keys(listStore)
    const tasks = await keys(taskStore)

    if (!lists.length) {
      for (const [name, list] of DEFAULT_LISTS) {
        await set(name, list, listStore)
      }
    }

    if (!tasks.length) {
      await set(INITIAL_TASK.id, INITIAL_TASK, taskStore)
    }
    setState("initialized")
  }

  useEffect(() => {
    if (state === "created") initialize()
  }, [state])

  async function getListsWithTasks() {
    const orderedLists = await get("__order__", listStore)

    const lists = new Map(orderedLists.map((name) => [name, []]))
    for (const list of orderedLists) {
      const taskIds = await get(list, listStore)

      const tasks = await Promise.all(taskIds.map((id) => get(id, taskStore)))

      lists.set(list, tasks)
    }
    setLists(lists)
  }

  async function getTasks() {
    const taskIds = await keys(taskStore)

    const tasks = {}
    for (const id of taskIds) {
      const task = await get(id, taskStore)

      async function updateList(updatedTask) {
        const oldList = await get(task.list, listStore)
        const newList = await get(updatedTask.list, listStore)

        const index = oldList.findIndex((t) => t === task.id)

        oldList.splice(index, 1)
        await set(task.list, oldList, listStore)

        newList.unshift(updatedTask.id)
        await set(updatedTask.list, newList, listStore)
      }

      tasks[id] = {
        task,
        async update(updatedTask) {
          updatedTask.id = task.id
          if (task.list !== updatedTask.list) {
            await updateList(updatedTask)
          }

          await set(updatedTask.id, updatedTask, taskStore)
          setTransaction((t) => t + 1)
        },
        async del() {
          const list = await get(task.list, listStore)

          const index = list.findIndex((id) => task.id === id)
          list.splice(index, 1)

          await set(task.list, list, listStore)
          await del(task.id, taskStore)
          setTransaction((t) => t + 1)
        },
      }
    }
    setTasks(tasks)
  }

  useEffect(() => {
    if (state === "initialized") {
      getListsWithTasks()
      getTasks()
    }
  }, [state, transaction])

  async function flushUpdatePosition(listId, { previousIndex, index }) {
    const list = await get(listId, listStore)

    const [taskId] = list.splice(previousIndex, 1)

    list.splice(index, 0, taskId)

    await set(listId, list, listStore)
    setTransaction((t) => t + 1)
  }

  async function flushListChange(
    listId,
    { currentList, previousIndex, index }
  ) {
    const oldList = await get(currentList, listStore)
    const newList = await get(listId, listStore)

    const [taskId] = oldList.splice(previousIndex, 1)

    const task = await get(taskId, taskStore)
    task.list = listId
    await set(task.id, task, taskStore)

    newList.splice(index, 0, taskId)

    await set(listId, newList, listStore)
    await set(currentList, oldList, listStore)
    setTransaction((t) => t + 1)
  }

  const methods = {
    async save(task) {
      const tasks = await keys(taskStore)
      task.id = `task-${tasks.length + 1}`
      // save in task database
      await set(task.id, task, taskStore)

      // save to list index
      const list = await get(task.list, listStore)
      list.push(task.id)
      await set(task.list, list, listStore)
      setTransaction((t) => t + 1)
      return task
    },
    updatePosition(listId, { previousIndex, index }) {
      flushUpdatePosition(listId, { previousIndex, index })
      // optimistic update
      const updatedLists = new Map(lists)

      const memoryList = updatedLists.get(listId)

      const [task] = memoryList.splice(previousIndex, 1)

      memoryList.splice(index, 0, task)

      setLists(updatedLists)
    },
    changeList(listId, { currentList, previousIndex, index }) {
      flushListChange(listId, { currentList, previousIndex, index })
      const updatedLists = new Map(lists)

      const oldList = updatedLists.get(currentList)
      const newList = updatedLists.get(listId)

      const [task] = oldList.splice(previousIndex, 1)

      newList.splice(index, 0, task)

      setLists(updatedLists)
    },
  }

  return [lists, tasks, methods]
}

export function useLists() {
  const [lists, setLists] = useState([])

  async function loadLists() {
    const lists = await get("__order__", listStore)
    setLists(lists)
  }

  useEffect(() => {
    loadLists()
  }, [])

  return [lists]
}
