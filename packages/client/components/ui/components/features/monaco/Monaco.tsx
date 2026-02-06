import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import { onCleanup, onMount } from "solid-js";

import { cva } from "styled-system/css";

type Props = {
  defaultValue: string;
  onChange?: (
    event: monaco.editor.IModelContentChangedEvent,
    editor: monaco.editor.IModel | null,
  ) => void;
};

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label == "css") {
      return new cssWorker();
    }

    return new editorWorker();
  },
};

const monacoStyle = cva({
  base: {
    width: "100%",
    height: "600px",
    border: "1px solid #ccc",
  },
});

/**
 * Monaco Editor wrapper
 */
export default function MonacoEditor(props: Props) {
  let element!: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;
  const disposables: (monaco.IDisposable | undefined)[] = [];

  onMount(() => {
    if (element?.isConnected) {
      editor = monaco.editor.create(element, {
        value: props.defaultValue,
        language: "css",
      });

      if (props.onChange) {
        disposables.push(
          editor
            .getModel()
            ?.onDidChangeContent((ev) =>
              props.onChange!(ev, editor.getModel()),
            ),
        );
      }
    }
  });

  onCleanup(() => {
    for (const disposable of disposables) {
      if (!disposable) continue;

      disposable.dispose();
    }

    editor.dispose();
  });

  return <div class={"monaco " + monacoStyle()} ref={element} />;
}
