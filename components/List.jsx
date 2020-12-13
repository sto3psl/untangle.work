/* @jsx h */
import { h } from "preact"
import { Link } from "wouter-preact"
import { Droppable, Draggable } from "react-beautiful-dnd"
import hashbow from "hashbow"
import styles from "./List.module.css"

export function List({ id, children, items, title, renderListItem }) {
  return (
    <div className={styles.list}>
      {title && (
        <h2 className="p-2 text-gray-900 text-xl font-black">{title}</h2>
      )}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div className="overflow-y-scroll rounded">
            <div
              ref={provided.innerRef}
              className={
                snapshot.isDraggingOver ? styles.draggingOver : styles.dropList
              }
            >
              {items.map(renderListItem)}
              {provided.placeholder}
              <div className="flex">{children}</div>
            </div>
          </div>
        )}
      </Droppable>
    </div>
  )
}

export function ListItem({ id, index, children, tags }) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <Link href={`/${id}`}>
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={snapshot.isDragging ? styles.itemDragging : styles.item}
            style={provided.draggableProps.style}
          >
            {tags.length ? (
              <div className="pb-2">
                {tags.filter(Boolean).map((tag) => {
                  const color = hashbow(tag.toLowerCase(), 90)
                  return (
                    <span
                      className="rounded text-sm px-1 font-bold border-2"
                      style={`border-color: ${color}; color: ${color}`}
                    >
                      {tag}
                    </span>
                  )
                })}
              </div>
            ) : null}
            <div>{children}</div>
          </div>
        </Link>
      )}
    </Draggable>
  )
}
