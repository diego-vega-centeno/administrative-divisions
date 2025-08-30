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
      })


    return () => {
      $(treeRef.current).jstree("destroy");
    };
  }, [data, onSelect]);

  return <div ref={treeRef} />;
}
