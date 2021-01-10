import { useEffect, useState } from "preact/hooks"

export function usePersistedData() {
  const [isInitialized, setInitialized] = useState(false)
  const [isPersisted, setPersisted] = useState(false)

  async function check() {
    const p = await navigator.storage.persisted()
    setPersisted(p)
    setInitialized(true)
  }

  async function askPermission() {
    const p = await navigator.storage.persist()
    setPersisted(p)
  }

  useEffect(() => {
    if (navigator?.storage?.persist && !isPersisted) {
      check()
    }
  }, [isPersisted, check])

  return [isInitialized ? isPersisted : true, askPermission]
}
