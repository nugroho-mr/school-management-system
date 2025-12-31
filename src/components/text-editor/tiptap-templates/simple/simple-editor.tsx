'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { debounce } from 'lodash'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'

// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Highlight } from '@tiptap/extension-highlight'
import { Selection } from '@tiptap/extensions'

// --- UI Primitives ---
import { Button } from '../../tiptap-ui-primitive/button'
import { Spacer } from '../../tiptap-ui-primitive/spacer'
import { Toolbar, ToolbarGroup, ToolbarSeparator } from '../../tiptap-ui-primitive/toolbar'

// --- Tiptap Node ---
import { HorizontalRule } from '../../tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'
import '../../tiptap-node/blockquote-node/blockquote-node.scss'
import '../../tiptap-node/code-block-node/code-block-node.scss'
import '../../tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '../../tiptap-node/list-node/list-node.scss'
import '../../tiptap-node/heading-node/heading-node.scss'
import '../../tiptap-node/paragraph-node/paragraph-node.scss'

// --- Tiptap UI ---
import { HeadingDropdownMenu } from '../../tiptap-ui/heading-dropdown-menu'
import { ListDropdownMenu } from '../../tiptap-ui/list-dropdown-menu'
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from '../../tiptap-ui/color-highlight-popover'
import { LinkPopover, LinkContent, LinkButton } from '../../tiptap-ui/link-popover'
import { MarkButton } from '../../tiptap-ui/mark-button'
import { TextAlignButton } from '../../tiptap-ui/text-align-button'
import { UndoRedoButton } from '../../tiptap-ui/undo-redo-button'

// --- Icons ---
import { ArrowLeftIcon } from '../../tiptap-icons/arrow-left-icon'
import { HighlighterIcon } from '../../tiptap-icons/highlighter-icon'
import { LinkIcon } from '../../tiptap-icons/link-icon'

// --- Hooks ---
import { useIsBreakpoint } from '@/hooks/use-is-breakpoint'
import { useWindowSize } from '@/hooks/use-window-size'
import { useCursorVisibility } from '@/hooks/use-cursor-visibility'

// --- Styles ---
import '../../tiptap-templates/simple/simple-editor.scss'

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile = false,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile?: boolean
}) => {
  return (
    <>
      <div className="flex flex-wrap gap-1 p-2 justify-center mx-auto">
        <ToolbarGroup>
          <UndoRedoButton action="undo" />
          <UndoRedoButton action="redo" />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
          <ListDropdownMenu types={['bulletList', 'orderedList']} portal={isMobile} />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <MarkButton type="bold" />
          <MarkButton type="italic" />
          <MarkButton type="underline" />
          {!isMobile ? (
            <ColorHighlightPopover />
          ) : (
            <ColorHighlightPopoverButton onClick={onHighlighterClick} />
          )}
          {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <TextAlignButton align="left" />
          <TextAlignButton align="center" />
          <TextAlignButton align="right" />
        </ToolbarGroup>
      </div>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: 'highlighter' | 'link'
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === 'highlighter' ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? <ColorHighlightPopoverContent /> : <LinkContent />}
  </>
)

export function SimpleEditor({
  content = '',
  onChangeHandler,
}: {
  content?: string
  onChangeHandler: (content: string) => void
}) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link'>('main')
  const toolbarRef = useRef<HTMLDivElement>(null)

  const debouncedUpdate = useMemo(
    () =>
      debounce((editor: any) => {
        onChangeHandler(editor.getHTML())
      }, 150),
    [onChangeHandler],
  )

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Main content area, start typing to enter text.',
        class: 'simple-editor',
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Selection,
    ],
    content,
    onUpdate: ({ editor }) => {
      debouncedUpdate(editor)
    },
  })

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main')
    }
  }, [isMobile, mobileView])

  return (
    <div className="w-full h-full overflow-hidden border border-input rounded-md relative">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar ref={toolbarRef}>
          <MainToolbarContent
            onHighlighterClick={() => setMobileView('highlighter')}
            onLinkClick={() => setMobileView('link')}
          />
        </Toolbar>

        <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
      </EditorContext.Provider>
    </div>
  )
}
