import { useEffect, useRef } from "react";
import $ from "jquery";
window.jQuery = $;
window.$ = $;
import "jstree";
import 'jstree/dist/themes/default/style.min.css';

export default function JsTreeWrapper({ data, onSelect }) {
  const treeRef = useRef(null);

  useEffect(() => {
    $(treeRef.current)
      .jstree({
        'core': {
          'data': data,
          'themes': {
            'icons': false
          },
        },
        "plugins": ["checkbox", 'wholerow', "search", "contextmenu"],
        "checkbox": {
          "three_state": false,
          // "cascade": "down",
          "whole_node": true
        },
      });

    $(treeRef.current).on("changed.jstree", (e, data) => {
      const selectedNodes = data.instance.get_selected(true);
      onSelect(selectedNodes);
    });

    return () => {
      $(treeRef.current).jstree("destroy");
    };
  }, []);

  return <div ref={treeRef} />;
}
