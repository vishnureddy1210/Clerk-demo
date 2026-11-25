import { useEditor, useEditorState, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { useEffect, useCallback, type CSSProperties, type ReactNode } from 'react'

interface RichEditorProps {
    content: string
    onChange: (html: string) => void
    placeholder?: string
    editable?: boolean
    minHeight?: number
}

type ToolbarButtonProps = {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    title: string
    children: ReactNode
}

const HTML_BLOCK_RE = /<(p|h[1-6]|ul|ol|blockquote|pre|hr|div)\b/i

/** Converts legacy plain-text notes (with newlines) into HTML paragraphs for Tiptap. */
export function normalizeNoteHtml(raw: string): string {
    if (!raw) return ''
    if (HTML_BLOCK_RE.test(raw)) return raw
    return raw
        .split(/\r?\n/)
        .map((line) => {
            const escaped = line
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
            return `<p>${escaped}</p>`
        })
        .join('')
}

/** Extracts visible plain text from note HTML or plain text for search and empty checks. */
export function getPlainNoteText(raw: string): string {
    return raw
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim()
}

function normalizeLinkUrl(input: string): string | null {
    const trimmed = input.trim()
    if (!trimmed) return ''
    if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null // block unsafe schemes like javascript:
    return `https://${trimmed}`
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            className={`re-btn${active ? ' re-btn--active' : ''}`}
            disabled={disabled}
            onMouseDown={(e) => {
                e.preventDefault()
                if (!disabled) onClick()
            }}
            title={title}
            aria-label={title}
            aria-pressed={active}
        >
            {children}
        </button>
    )
}

export default function RichEditor({
    content,
    onChange,
    placeholder = 'Take a note, capture thoughts, or paste links...',
    editable = true,
    minHeight = 80,
}: RichEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                link: {
                    openOnClick: false,
                    autolink: true,
                    HTMLAttributes: {
                        rel: 'noopener noreferrer',
                        target: '_blank',
                    },
                },
            }),
            Placeholder.configure({ placeholder }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: normalizeNoteHtml(content),
        editable,
        onUpdate({ editor: currentEditor }) {
            const html = currentEditor.isEmpty ? '' : currentEditor.getHTML()
            onChange(html)
        },
    })

    const activeState = useEditorState({
        editor,
        selector: ({ editor: e }) => ({
            bold: e?.isActive('bold') ?? false,
            italic: e?.isActive('italic') ?? false,
            underline: e?.isActive('underline') ?? false,
            strike: e?.isActive('strike') ?? false,
            code: e?.isActive('code') ?? false,
            h1: e?.isActive('heading', { level: 1 }) ?? false,
            h2: e?.isActive('heading', { level: 2 }) ?? false,
            h3: e?.isActive('heading', { level: 3 }) ?? false,
            bulletList: e?.isActive('bulletList') ?? false,
            orderedList: e?.isActive('orderedList') ?? false,
            blockquote: e?.isActive('blockquote') ?? false,
            codeBlock: e?.isActive('codeBlock') ?? false,
            link: e?.isActive('link') ?? false,
            alignLeft: e?.isActive({ textAlign: 'left' }) ?? false,
            alignCenter: e?.isActive({ textAlign: 'center' }) ?? false,
            alignRight: e?.isActive({ textAlign: 'right' }) ?? false,
            canUndo: e?.can().undo() ?? false,
            canRedo: e?.can().redo() ?? false,
        }),
    })

    // Sync external content changes (e.g., resetting composer after submit)
    useEffect(() => {
        if (!editor) return
        const incoming = normalizeNoteHtml(content)
        const current = editor.isEmpty ? '' : editor.getHTML()
        if (current !== incoming) {
            editor.commands.setContent(incoming, { emitUpdate: false })
        }
    }, [content, editor])

    const setLink = useCallback(() => {
        if (!editor) return
        const prev = editor.getAttributes('link').href as string | undefined
        const rawUrl = window.prompt('Enter URL (leave empty to remove link):', prev ?? 'https://')
        if (rawUrl === null) return

        const normalized = normalizeLinkUrl(rawUrl)
        if (normalized === null) {
            window.alert('Please enter a valid http://, https://, or mailto: link.')
            return
        }
        if (normalized === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: normalized }).run()
        }
    }, [editor])

    if (!editor) return null

    return (
        <div className="re-wrap" style={{ '--re-min-h': `${minHeight}px` } as CSSProperties}>
            {editable && (
                <div className="re-toolbar" role="toolbar" aria-label="Text formatting">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={activeState?.bold}
                        title="Bold (Ctrl+B)"
                    >
                        <b>B</b>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={activeState?.italic}
                        title="Italic (Ctrl+I)"
                    >
                        <i>I</i>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        active={activeState?.underline}
                        title="Underline (Ctrl+U)"
                    >
                        <u>U</u>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        active={activeState?.strike}
                        title="Strikethrough"
                    >
                        <s>S</s>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        active={activeState?.code}
                        title="Inline code"
                    >
                        <code>`c`</code>
                    </ToolbarButton>

                    <span className="re-sep" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        active={activeState?.h1}
                        title="Heading 1 (# + space)"
                    >
                        H1
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        active={activeState?.h2}
                        title="Heading 2 (## + space)"
                    >
                        H2
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        active={activeState?.h3}
                        title="Heading 3 (### + space)"
                    >
                        H3
                    </ToolbarButton>

                    <span className="re-sep" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={activeState?.bulletList}
                        title="Bullet list (- + space)"
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                            <circle cx="3" cy="4" r="1" fill="currentColor" stroke="none" />
                            <circle cx="3" cy="8" r="1" fill="currentColor" stroke="none" />
                            <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
                            <path d="M6 4h8M6 8h8M6 12h8" />
                        </svg>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={activeState?.orderedList}
                        title="Numbered list (1. + space)"
                    >
                        1.
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        active={activeState?.blockquote}
                        title="Quote (> + space)"
                    >
                        ”
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        active={activeState?.codeBlock}
                        title="Code block (```)"
                    >
                        {'</>'}
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Divider (---)"
                    >
                        ―
                    </ToolbarButton>

                    <span className="re-sep" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        active={activeState?.alignLeft}
                        title="Align left"
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                            <path d="M2 3.5h12M2 6.5h8M2 9.5h12M2 12.5h9" />
                        </svg>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        active={activeState?.alignCenter}
                        title="Align center"
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                            <path d="M2 3.5h12M4 6.5h8M2 9.5h12M3.5 12.5h9" />
                        </svg>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        active={activeState?.alignRight}
                        title="Align right"
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                            <path d="M2 3.5h12M6 6.5h8M2 9.5h12M5 12.5h9" />
                        </svg>
                    </ToolbarButton>

                    <span className="re-sep" />

                    <ToolbarButton
                        onClick={setLink}
                        active={activeState?.link}
                        title={activeState?.link ? 'Edit link' : 'Add link'}
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6.5 9.5a3.2 3.2 0 0 0 4.5 0l2-2a3.2 3.2 0 0 0-4.5-4.5L7.4 4.1" />
                            <path d="M9.5 6.5a3.2 3.2 0 0 0-4.5 0l-2 2a3.2 3.2 0 0 0 4.5 4.5l1.1-1.1" />
                        </svg>
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!activeState?.canUndo}
                        title="Undo (Ctrl+Z)"
                    >
                        ↶
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!activeState?.canRedo}
                        title="Redo (Ctrl+Shift+Z)"
                    >
                        ↷
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                        title="Clear formatting"
                    >
                        ✕
                    </ToolbarButton>
                </div>
            )}
            <EditorContent editor={editor} className="re-editor" />
        </div>
    )
}
