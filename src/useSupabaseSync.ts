import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from './supabaseClient'

/**
 * Hook to sync a collection (notes / todos / events) with Supabase.
 *
 * Table must have columns: id (int8 primary key), user_id (text), data (jsonb).
 * Each row stores one item as JSON in the `data` column.
 */
export function useSupabaseSync<T extends { id: number }>(
    tableName: string,
    userId: string | undefined
) {
    const [items, setItems] = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const isMounted = useRef(true)

    useEffect(() => {
        isMounted.current = true
        return () => { isMounted.current = false }
    }, [])

    // Load from Supabase on mount / userId change
    useEffect(() => {
        if (!userId) return
        setLoading(true)

        supabase
            .from(tableName)
            .select('id, data')
            .eq('user_id', userId)
            .then(({ data, error }) => {
                if (!isMounted.current) return
                if (error) {
                    console.error(`[${tableName}] load error:`, error)
                    setItems([])
                } else {
                    setItems((data || []).map((row) => ({ ...row.data, id: row.id } as T)))
                }
                setLoading(false)
            })
    }, [tableName, userId])

    const upsertItem = useCallback(
        async (item: T) => {
            if (!userId) return
            const { error } = await supabase
                .from(tableName)
                .upsert({ id: item.id, user_id: userId, data: item }, { onConflict: 'id' })
            if (error) console.error(`[${tableName}] upsert error:`, error)
        },
        [tableName, userId]
    )

    const deleteItem = useCallback(
        async (id: number) => {
            if (!userId) return
            const { error } = await supabase.from(tableName).delete().eq('id', id).eq('user_id', userId)
            if (error) console.error(`[${tableName}] delete error:`, error)
        },
        [tableName, userId]
    )

    const addItem = useCallback(
        (item: T) => {
            setItems((prev) => [item, ...prev])
            upsertItem(item)
        },
        [upsertItem]
    )

    const updateItem = useCallback(
        (id: number, updater: (prev: T) => T) => {
            setItems((prev) => {
                const updated = prev.map((it) => (it.id === id ? updater(it) : it))
                const changed = updated.find((it) => it.id === id)
                if (changed) upsertItem(changed)
                return updated
            })
        },
        [upsertItem]
    )

    const removeItem = useCallback(
        (id: number) => {
            setItems((prev) => prev.filter((it) => it.id !== id))
            deleteItem(id)
        },
        [deleteItem]
    )

    return { items, setItems, loading, addItem, updateItem, removeItem, upsertItem }
}
