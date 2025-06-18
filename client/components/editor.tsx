"use client"

import type React from 'react';
import { useState } from 'react';

import {
  Bold,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
} from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { Color } from '@tiptap/extension-color';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import {
  Editor,
  EditorContent,
  useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const toggleButtonNavigation = [
  {
    name: "bold",
    icon: <Bold className="h-4 w-4" />,
    command: (editor: Editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    name: "italic",
    icon: <Italic className="h-4 w-4" />,
    command: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    name: "bulletList",
    icon: <List className="h-4 w-4" />,
    command: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    name: "orderedList",
    icon: <ListOrdered className="h-4 w-4" />,
    command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    name: "blockquote",
    icon: <Quote className="h-4 w-4" />,
    command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  }, {
    name: "undo",
    icon: <Undo className="h-4 w-4" />,
    command: (editor: Editor) => editor.chain().focus().undo().run(),
  },
  {
    name: "redo",
    icon: <Redo className="h-4 w-4" />,
    command: (editor: Editor) => editor.chain().focus().redo().run(),
  }, {
    name: "link",
    icon: <LinkIcon className="h-4 w-4" />,
    command: (editor: Editor) => {
      const url = window.prompt("URL");
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  }
]
const paragraphSelects = {
  items: [
    {
      value: "0",
      label: "Paragraph",
      className: "text-base",
    },
    {
      value: "1",
      label: "Heading 1",
      className: "text-2xl font-bold",
    },
    {
      value: "2",
      label: "Heading 2",
      className: "text-xl font-semibold",
    },
    {
      value: "3",
      label: "Heading 3",
      className: "text-lg font-medium",
    },
    {
      value: "4",
      label: "Heading 4",
      className: "text-base font-normal",
    }
  ],
  command: (editor: Editor, value: string) => {
    if (value === "0") {
      editor.commands.setParagraph();
    } else {
      editor
        .chain()
        .focus()
        .toggleHeading({ level: parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6 })
        .run();
    }
  },
  defaultValue: {
    value: "0",
    label: "Paragraph",
  }
}
export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Nội dung bài viết...",
  readOnly = false,
}: {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "text-base",
          },
        },
      }),
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-md max-w-full max-h-[500px] object-contain mx-auto",
        },
      }),
      Link.configure({
        openOnClick: false,
      }),

      Color,
      TextStyle,

    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          `blog-content prose prose-neutral dark:prose-invert max-w-none w-full rounded-md focus:outline-none ${!readOnly ? "border p-4 min-h-[500px]" : "border-none p-0 h-full shadow-none"}`,
      },
    },
    onUpdate: ({ editor }) => {
      if (!readOnly && onChange) {
        onChange(editor.getHTML());
      }
    },
    immediatelyRender: false,
    editable: !readOnly,
  });
  const [color, setColor] = useState(editor ? editor.getAttributes("textStyle").color : "#000000");
  const handleSetColor = useDebouncedCallback((value: string) => {
    if (editor) {
      editor.chain().focus().setColor(value).run();
    }
    setColor(value);
  }, 200);
  const [isSelectedImage, setIsSelectedImage] = useState(false);
  function handleSetImage(file: File | null) {
    if (editor && file) {
      editor.chain().focus().setImage({ src: URL.createObjectURL(file) }).run();
      setIsSelectedImage(false);
    }
  }
  if (!editor) {
    return null;
  }

  return (
    <Card className={cn(readOnly && "border-none shadow-none")}>
      <CardContent className={cn("p-4 space-y-4", readOnly && "p-0")}>
        {
          !readOnly && (
            <div>
              <div className="flex items-center gap-2">
                <Select
                  onValueChange={(value: string) => {
                    paragraphSelects.command(editor, value);
                  }}
                  defaultValue={paragraphSelects.defaultValue.value}
                >
                  <SelectTrigger
                    className="w-fit border-none outline-none h-8 shadow-none focus:ring-0 hover:text-muted-foreground"
                    type="button"
                  >
                    <SelectValue placeholder={paragraphSelects.defaultValue.label} />
                  </SelectTrigger>
                  <SelectContent defaultValue={paragraphSelects.defaultValue.value} className="w-fit">
                    {paragraphSelects.items.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className={cn(
                          "flex items-center gap-2",
                          item.className,
                          "cursor-pointer hover:bg-primary hover:text-white"
                        )}
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {toggleButtonNavigation.map((button) => (
                  <Toggle
                    key={button.name}
                    size="sm"
                    pressed={editor.isActive(button.name)}
                    className="data-[state=on]:bg-primary"
                    onPressedChange={() => button.command(editor)}
                  >
                    {button.icon}
                  </Toggle>
                ))}
                <Button
                  variant="outline"
                  type='button'
                  size="sm"
                  className="size-8 flex-shrink-0 outline-none shadow-none focus:ring-0 rounded-sm p-0 border-none overflow-hidden"
                  onClick={() => setIsSelectedImage(!isSelectedImage)}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Input
                  type="color"
                  value={color}
                  className="size-8 flex-shrink-0 outline-none shadow-none focus:ring-0 rounded-sm p-0 border-none overflow-hidden"
                  onChange={(e) => {
                    handleSetColor(e.target.value);
                  }}
                />
              </div>
              {isSelectedImage && (
                <div>
                  <Label>Chọn hình ảnh</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleSetImage(e.target.files?.[0] || null);
                    }}
                    className="w-full"
                  />
                </div>)}
            </div>
          )
        }
        <EditorContent editor={editor} placeholder={placeholder} />
      </CardContent>
    </Card>
  );
};