import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { useEffect } from 'react'
import '../styles/RichTextEditor.css'

const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content || '')
    }
  }, [content, editor])

  if (!editor) return null

  const handleImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/gif,image/webp'
    input.style.display = 'none'

    input.addEventListener('change', async () => {
      const file = input.files && input.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('image', file)

      try {
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err.error || `Upload failed with status ${response.status}`)
        }

        const { url } = await response.json()
        editor.chain().focus().setImage({ src: url }).run()
      } catch (err) {
        console.error('Image upload error:', err)
        alert(`Image upload failed: ${err.message}`)
      } finally {
        document.body.removeChild(input)
      }
    })

    document.body.appendChild(input)
    input.click()
  }

  return (
    <div className="rich-text-editor">
      <div className="toolbar">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}>H3</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''}>• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''}>1. List</button>
        <button type="button" onClick={handleImageUpload} title="Insert image">&#128247; Image</button>
      </div>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  )
}

export default RichTextEditor
