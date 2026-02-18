'use client';

import React, { forwardRef } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  diffSourcePlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  UndoRedo,
  DiffSourceToggleWrapper,
  type MDXEditorMethods,
} from '@mdxeditor/editor';

interface MarkdownEditorProps {
  markdown: string;
  onChange?: (markdown: string) => void;
  readOnly?: boolean;
  minHeight?: number;
}

const MarkdownEditorInner = forwardRef<MDXEditorMethods, MarkdownEditorProps>(
  ({ markdown, onChange, readOnly = false, minHeight = 400 }, ref) => {
    const plugins = [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      tablePlugin(),
      thematicBreakPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      imagePlugin(),
      markdownShortcutPlugin(),
      diffSourcePlugin({ viewMode: 'rich-text' }),
    ];

    if (!readOnly) {
      plugins.push(
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <ListsToggle />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertThematicBreak />
            </DiffSourceToggleWrapper>
          ),
        })
      );
    }

    return (
      <div style={{ minHeight }}>
        <MDXEditor
          ref={ref}
          markdown={markdown}
          onChange={onChange}
          readOnly={readOnly}
          plugins={plugins}
          contentEditableClassName="prose max-w-none p-4"
        />
      </div>
    );
  }
);

MarkdownEditorInner.displayName = 'MarkdownEditorInner';

export default MarkdownEditorInner;
