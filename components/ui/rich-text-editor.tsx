import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextStyle from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import { Bold, Italic, Paperclip } from "lucide-react";
import { Button } from "./button";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  onAttachUpload?: (files: File[]) => Promise<Array<{ src: string }>>;
}

export function RichTextEditor({ value, onChange, placeholder, className, onAttachUpload }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      TextStyle,
      Image.configure({ inline: true }),
      StarterKit.configure({
        heading: { levels: [1, 2, 3], HTMLAttributes: { class: "font-semibold" } },
        orderedList: { keepMarks: true },
        bulletList: { keepMarks: true },
        codeBlock: false,
        code: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || "",
      }),
    ],
    content: value,
    editorProps: {
      handlePaste(view, event) {
        if (!onAttachUpload) return false;
        const files = Array.from(event.clipboardData?.files || []).filter((f) => f.type.startsWith("image/"));
        if (files.length) {
          event.preventDefault();
          onAttachUpload(files).then((uploads) => {
            uploads.forEach((u) => {
              editor?.chain().focus().setImage({ src: u.src }).run();
            });
          });
          return true;
        }
        return false;
      },
      handleDrop(view, event) {
        if (!onAttachUpload) return false;
        const files = Array.from(event.dataTransfer?.files || []).filter((f) => f.type.startsWith("image/"));
        if (files.length) {
          event.preventDefault();
          onAttachUpload(files).then((uploads) => {
            uploads.forEach((u) => {
              editor?.chain().focus().setImage({ src: u.src }).run();
            });
          });
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });


  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const toggle = (action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    action();
  };

  return (
    <div className={`border rounded-lg bg-white ${className ?? ""}`}>
      <div className="flex items-center gap-2 p-2 border-b">
        <Button size="icon" variant={editor.isActive("bold") ? "default" : "ghost"} onClick={toggle(() => editor.chain().focus().toggleBold().run())} aria-label="Bold">
          <Bold className="w-4 h-4" />
        </Button>
        <Button size="icon" variant={editor.isActive("italic") ? "default" : "ghost"} onClick={toggle(() => editor.chain().focus().toggleItalic().run())} aria-label="Italic">
          <Italic className="w-4 h-4" />
        </Button>
        {onAttachUpload ? (
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                const uploads = await onAttachUpload(files);
                uploads?.forEach((u) => {
                  editor.chain().focus().setImage({ src: u.src }).run();
                });
                if (e.target) e.target.value = "";
              }}
            />
            <Button size="icon" variant="ghost" asChild aria-label="Attach files">
              <span><Paperclip className="w-4 h-4" /></span>
            </Button>
          </label>
        ) : null}
      </div>
      <div className="px-3 py-2 min-h-[120px] max-h-64 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none leading-6 [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-0 [&_.ProseMirror]:p-0 [&_.ProseMirror]:shadow-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-5 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h3]:text-lg"
        />
      </div>
    </div>
  );
}
