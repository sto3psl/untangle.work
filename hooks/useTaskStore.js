import { useState, useEffect } from "preact/hooks"
import { Store, set, get } from "idb-keyval"

const untangleStore = new Store("untangle", "untangle-store")

const INITIAL_TASK = {
  id: "task-0",
  doc: {
    title: "Eine neue Aufgabe erstellen ⬇️",
    description: 'Klicke auf den blauen "Todo erstellen" Button!',
  },
  list: "Heute",
  tags: ["tutorial"],
}

const DEFAULT_LISTS = new Map([
  ["Heute", [INITIAL_TASK.id]],
  ["Diese Woche", []],
  ["Diesen Monat", []],
  ["Backlog", []],
  ["Erledigt", []],
])

async function writeInitialData() {
  await set("LISTS", DEFAULT_LISTS, untangleStore)
  await set("TASKS", { [INITIAL_TASK.id]: INITIAL_TASK }, untangleStore)
}

// writeInitialData()

async function readFromDB() {
  const tasks = await get("TASKS", untangleStore)
  const lists = await get("LISTS", untangleStore)

  if (!lists || !tasks) {
    await writeInitialData()
    return await readFromDB()
  }

  return { tasks, lists }
}

export function useTaskStore() {
  const [state, setState] = useState("created")
  const [lists, setLists] = useState(new Map())
  const [tasks, setTasks] = useState({})

  async function initialize() {
    const { tasks, lists } = await readFromDB()

    setTasks(tasks)
    setLists(lists)
    setState("initialized")
  }

  useEffect(() => {
    if (state === "created") initialize()
  }, [state])

  useEffect(() => {
    if (state === "initialized") {
      set("LISTS", lists, untangleStore)
      set("TASKS", tasks, untangleStore)
    }
  }, [state, lists, tasks])

  const methods = {
    async save(task) {
      task.id = `task-${Object.keys(tasks).length}`

      const newTasks = { ...tasks }
      newTasks[task.id] = task
      setTasks(newTasks)

      const newLists = new Map(lists)
      const list = newLists.get(task.list)
      list.push(task.id)
      newLists.set(task.list, list)
      setLists(newLists)
      return task
    },
    update(updatedTask) {
      const oldTask = tasks[updatedTask.id]
      if (oldTask.list !== updatedTask.list) {
        const updatedLists = new Map(lists)
        const oldList = updatedLists.get(oldTask.list)
        const newList = updatedLists.get(updatedTask.list)

        const previousIndex = oldList.findIndex((id) => id === updatedTask.id)

        const [taskId] = oldList.splice(previousIndex, 1)
        newList.unshift(taskId)

        updatedLists.set(oldTask.list, oldList)
        updatedLists.set(updatedTask.list, newList)

        setLists(updatedLists)
      }

      const newTasks = { ...tasks }
      newTasks[oldTask.id] = updatedTask

      setTasks(newTasks)
    },
    del(task) {
      const newTasks = { ...tasks }
      newTasks[task.id] = undefined

      setTasks(newTasks)

      const updatedLists = new Map(lists)
      const list = updatedLists.get(task.list)
      const index = list.findIndex((id) => task.id === id)
      list.splice(index, 1)
      setLists(updatedLists)
    },
    updatePosition(listId, { previousIndex, index }) {
      const updatedLists = new Map(lists)

      const memoryList = updatedLists.get(listId)

      const [task] = memoryList.splice(previousIndex, 1)

      memoryList.splice(index, 0, task)

      setLists(updatedLists)
    },
    changeList(listId, { currentList, previousIndex, index }) {
      const updatedLists = new Map(lists)

      const oldList = updatedLists.get(currentList)
      const newList = updatedLists.get(listId)

      const [taskId] = oldList.splice(previousIndex, 1)
      newList.splice(index, 0, taskId)
      setLists(updatedLists)

      const newTasks = { ...tasks }
      const updatedTask = tasks[taskId]
      updatedTask.list = listId
      newTasks[taskId] = updatedTask

      setTasks(newTasks)
    },
    reorderLists ({ previousIndex, index }) {
      const listArray = Array.from(lists)

      const [list] = listArray.splice(previousIndex, 1)
      listArray.splice(index, 0, list)

      setLists(new Map(listArray))
    }
  }

  return [lists, tasks, methods]
}
