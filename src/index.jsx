/* @jsx h */
import "windi.css"
import { h, Fragment } from "preact"
import ReactDOM from "preact/compat"
import { Route, Link, Switch } from "wouter-preact"
import { DragDropContext, Draggable } from "react-beautiful-dnd"

import { List, Board, ListItem } from "./components/List.jsx"
import { QuickTaskButton } from "./components/QuickTaskButton.jsx"
import TaskView from "./components/TaskView.jsx"
import NewTaskView from "./components/NewTaskView.jsx"

import { useTaskStore } from "./hooks/useTaskStore"

import "./main.css"
import styles from "./index.module.css"
import { ButtonPrimary, ButtonText } from "./components/Buttons"
import { usePersistedData } from "./hooks/usePersistedData"

function App() {
  const [
    lists,
    tasks,
    { save, update, del, updatePosition, changeList, reorderLists },
  ] = useTaskStore()
  const [isPersisted, askPermission] = usePersistedData()

  function onDragEnd({ source, destination, type }) {
    // dropped outside the list
    if (!destination) {
      return
    }

    if (type === "COLUMN") {
      reorderLists({
        previousIndex: source.index,
        index: destination.index,
      })
      return
    }

    if (source.droppableId === destination.droppableId) {
      return updatePosition(source.droppableId, {
        previousIndex: source.index,
        index: destination.index,
      })
    }

    changeList(destination.droppableId, {
      currentList: source.droppableId,
      previousIndex: source.index,
      index: destination.index,
    })
  }

  async function handleTaskCreation(e) {
    const value = e.target.value.trim()

    if (value) {
      await save({
        doc: {
          title: value,
          description: null,
        },
        list: "Heute",
        tags: [],
      })
    }
  }

  return (
    <Fragment>
      <header className="h-full sticky top-0 left-0 flex flex-wrap items-center w-screen overflow-auto z-10 bg-white py-3">
        <h1 className="text-2xl px-2 font-black">
          <span className="bg-gradient-to-r from-pink-700 to-red-500 text-transparent bg-clip-text">
            🐘 untangle.work
          </span>
        </h1>
        <div class="ml-auto mr-2 space-x-2">
          <ButtonPrimary component={Link} href="/neu">
            ✚ Neu
          </ButtonPrimary>
        </div>
      </header>
      <main className="grid col-span-2">
        <DragDropContext onDragEnd={onDragEnd}>
          <Board
            id="list-container"
            items={Array.from(lists)}
            renderListItem={([name, list], index) => (
              <List
                title={name}
                index={index}
                id={name}
                items={list}
                renderListItem={(id, index) => {
                  const item = tasks[id]
                  return (
                    <ListItem
                      key={item.id}
                      id={item.id}
                      index={index}
                      tags={item.tags}
                    >
                      <h3 class="font-bold">{item.doc.title}</h3>
                      <div class={styles.description}>
                        {item.doc?.description}
                      </div>
                    </ListItem>
                  )
                }}
              >
                {!index && (
                  <QuickTaskButton onCreate={handleTaskCreation}>
                    Neue Aufgabe
                  </QuickTaskButton>
                )}
              </List>
            )}
          />
        </DragDropContext>
      </main>
      <footer className="h-full sticky left-0 flex"></footer>
      {!isPersisted ? (
        <div class="fixed bottom-4 right-4 w-80 p-4 rounded bg-blue-200 shadow-lg border-2 border-blue-400">
          <p class="text-gray-900">
            Um Daten dauerhaft speichern zu können, musst du "Persistent
            Storage" aktivieren!
          </p>
          <div class="flex justify-end">
            <ButtonText onClick={askPermission}>Aktivieren</ButtonText>
          </div>
        </div>
      ) : null}
      <Switch>
        <Route path="/neu">
          <NewTaskView create={save} lists={lists} />
        </Route>
        <Route path="/:task">
          {(params) =>
            tasks[params.task] ? (
              <TaskView
                task={tasks[params.task]}
                lists={lists}
                update={update}
                del={del}
              />
            ) : null
          }
        </Route>
      </Switch>
    </Fragment>
  )
}

// Put the things into the DOM!
ReactDOM.render(<App />, document.getElementById("root"))
