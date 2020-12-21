/* @jsx h */
import "./main.css"
import { h, Fragment } from "preact"
import ReactDOM from "preact/compat"
import { Route, Link, Switch } from "wouter-preact"
import { DragDropContext, Draggable } from "react-beautiful-dnd"

import { List, Board, ListItem } from "./components/List.jsx"
import { QuickTaskButton } from "./components/QuickTaskButton.jsx"
import TaskView from "./components/TaskView.jsx"
import NewTaskView from "./components/NewTaskView.jsx"

import { useTaskStore } from "./hooks/useTaskStore"

import styles from "./index.module.css"

function App() {
  const [
    lists,
    tasks,
    { save, update, del, updatePosition, changeList, reorderLists },
  ] = useTaskStore()

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
      <header className="h-full sticky top-0 left-0 flex items-center w-screen overflow-auto z-10 bg-white py-3">
        <h1 className="text-2xl px-2 font-black">
          <span className="bg-gradient-to-r from-pink-700 to-red-500 text-transparent bg-clip-text">
            🐘 untangle.work
          </span>
        </h1>
        <Link
          href="/neu"
          className="py-2 px-4 ml-auto mr-2 bg-gradient-to-r to-blue-800 from-blue-600 rounded-lg text-blue-100"
        >
          ✚ Neu
        </Link>
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
                      {item.doc.title}
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
