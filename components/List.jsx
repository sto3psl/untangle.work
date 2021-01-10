/* @jsx h */
import { h } from "preact"
import { Link, useRoute } from "wouter-preact"
import { Droppable, Draggable } from "react-beautiful-dnd"
import cx from "classnames"
import hashbow from "hashbow"
import styles from "./List.module.css"

export function List({ id, index, children, items, title, renderListItem }) {
  return (
    <Draggable draggableId={id} key={id} id={id} index={index}>
      {(provided, snapshot) => (
        <div
          className="p-2"
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={provided.draggableProps.style}
        >
          <div className={styles.list}>
            <h2
              className="p-2 text-gray-900 text-xl font-black z-10"
              {...provided.dragHandleProps}
            >
              {title}
            </h2>
            <Droppable droppableId={id} type="LIST">
              {(provided, snapshot) => (
                <div className="overflow-y-scroll rounded">
                  <div
                    ref={provided.innerRef}
                    className={cx(styles.dropList, {
                      [styles.draggingOver]: snapshot.isDraggingOver,
                    })}
                  >
                    {items.map(renderListItem)}
                    {provided.placeholder}
                    <div className="flex">{children}</div>
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        </div>
      )}
    </Draggable>
  )
}

export function Board({ id, children, items, renderListItem }) {
  return (
    <Droppable droppableId={id} direction="horizontal" type="COLUMN">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          className={cx(styles.dropListHorizontal, {
            [styles.draggingOverHorizontal]: snapshot.isDraggingOver,
          })}
        >
          {items.map(renderListItem)}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

export function ListItem({ id, index, children, tags }) {
  const [match, params] = useRoute("/:id")
  const filteredTags = tags.filter(Boolean)
  const visibleTags = 4
  const highlight = params?.id === id

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <Link href={`/${id}`}>
          <a
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cx(styles.item, {
              [styles.highlight]: highlight,
              [styles.itemDragging]: snapshot.isDragging,
            })}
            style={provided.draggableProps.style}
          >
            {filteredTags.length ? (
              <div>
                {filteredTags.slice(0, visibleTags).map((tag) => {
                  const color = hashbow(tag, 90)
                  return (
                    <span
                      className="inline-block rounded text-xs px-1 font-bold border-2 mr-1"
                      style={`border-color: ${color}; color: ${color}`}
                    >
                      {tag}
                    </span>
                  )
                })}
                {filteredTags.length >= visibleTags ? (
                  <span className="inline-block rounded text-xs font-boldmr-1">
                    ...
                  </span>
                ) : null}
              </div>
            ) : null}
            <div>{children}</div>
          </a>
        </Link>
      )}
    </Draggable>
  )
}
