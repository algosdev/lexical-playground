/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import * as React from 'react';

export default function SaveButton(): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const handleSave = () => {
    editor.getEditorState().read(() => {
      const newParsedHtml = $generateHtmlFromNodes(editor, null);
      // eslint-disable-next-line no-console
      console.log(newParsedHtml);
    });
  }

  return (<button
    className="action-button connect"
    onClick={handleSave}
    title={`Save`}>
    <i className={'save' } />
  </button>)
}
