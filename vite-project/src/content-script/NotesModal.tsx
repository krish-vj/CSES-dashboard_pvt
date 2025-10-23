
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import './tiptap-styles.css';

const lowlight = createLowlight(common);

interface NotesModalProps {
  taskId: string;
  taskName: string;
  isOpen: boolean;
  onClose: () => void;
}

const NotesModal: React.FC<NotesModalProps> = ({ taskId, taskName, isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialContent, setInitialContent] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        style: 'min-height: 400px; padding: 12px; outline: none;',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Tab') {
          event.preventDefault();
          const { state, dispatch } = view;
          const { tr, selection } = state;
          tr.insertText('    ', selection.from, selection.to);
          dispatch(tr);
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (isOpen) {
      chrome.storage.local.get([`notes_${taskId}`]).then((result) => {
        const savedContent = result[`notes_${taskId}`] || '';
        setInitialContent(savedContent);
        if (editor) {
          editor.commands.setContent(savedContent);
        }
        setIsLoading(false);
      });
    }
  }, [isOpen, taskId, editor]);

  const handleSave = () => {
    if (editor) {
      const html = editor.getHTML();
      chrome.storage.local.set({ [`notes_${taskId}`]: html }).then(() => {
        onClose();
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: (() => {
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const isDark = bodyBg.includes('rgb(') && bodyBg.match(/\d+/g)?.[0] && Number(bodyBg.match(/\d+/g)?.[0]) < 100;
  return isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
})(),
backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor:
  getComputedStyle(document.body).backgroundColor ||
  getComputedStyle(document.documentElement).backgroundColor ||
  '#fff',
color:
  getComputedStyle(document.body).color ||
  getComputedStyle(document.documentElement).color ||
  '#000',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '900px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(128, 128, 128, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
            Notes: {taskName}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
            }}
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '20px' }}>Loading...</div>
        ) : (
          <>
            <div
              style={{
                padding: '10px 20px',
                borderBottom: '1px solid rgba(128, 128, 128, 0.2)',
                display: 'flex',
                gap: '5px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid rgba(128, 128, 128, 0.3)',
                  fontWeight: editor?.isActive('bold') ? 'bold' : 'normal',
                }}
              >
                B
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid rgba(128, 128, 128, 0.3)',
                  fontStyle: editor?.isActive('italic') ? 'italic' : 'normal',
                }}
              >
                I
              </button>
              {/* <button
                onClick={() => editor?.chain().focus().toggleCode().run()}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid rgba(128, 128, 128, 0.3)',
                  fontFamily: editor?.isActive('code') ? 'monospace' : 'inherit',
                }}
              >
                {'</>'}
              </button> */}
              <span style={{ width: '1px', backgroundColor: 'rgba(128, 128, 128, 0.3)', margin: '0 5px' }} />
              <button
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid rgba(128, 128, 128, 0.3)',
                  fontWeight: editor?.isActive('heading', { level: 1 }) ? 'bold' : 'normal',
                }}
              >
                H1
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid rgba(128, 128, 128, 0.3)',
                  fontWeight: editor?.isActive('heading', { level: 2 }) ? 'bold' : 'normal',
                }}
              >
                H2
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid rgba(128, 128, 128, 0.3)',
                  fontWeight: editor?.isActive('heading', { level: 3 }) ? 'bold' : 'normal',
                }}
              >
                H3
              </button>
              <span style={{ width: '1px', backgroundColor: 'rgba(128, 128, 128, 0.3)', margin: '0 5px' }} />
              <button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid rgba(128, 128, 128, 0.3)',
                }}
              >
                • List
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid rgba(128, 128, 128, 0.3)',
                }}
              >
                1. List
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid rgba(128, 128, 128, 0.3)',
                  fontFamily: 'monospace',
                }}
              >
                {'{ } Code Block'}
              </button>
            </div>

            <div
              style={{
                padding: '20px',
                flex: 1,
                overflow: 'auto',
                border: '1px solid rgba(128, 128, 128, 0.3)',
                margin: '10px 20px',
                borderRadius: '4px',
              }}
            >
              <EditorContent editor={editor} />
            </div>
          </>
        )}

        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(128, 128, 128, 0.3)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid rgba(128, 128, 128, 0.3)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid rgba(128, 128, 128, 0.3)',
            }}
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;