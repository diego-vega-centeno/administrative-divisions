import { useEffect, useRef } from "react";
import $ from "jquery";
window.jQuery = $;
window.$ = $;
import "jstree";
import 'jstree/dist/themes/default/style.min.css';

export default function JsTreeWrapper({ data, onSelect, filter }) {
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
        "search": {
          "show_only_matches": true
        },
        "contextmenu": {
          "select_node": false,
          "items": function (node) {
            return {
              "childs": {
                "label": "select childs",
                // obj is the button object
                "action": function (obj) {
                  // select only immediate children
                  node.children.forEach(child => {
                    $(node).jstree("select_node", child, true);
                  });
                  onSelect($(treeRef.current).jstree(true).get_selected(true))
                }
              },
              "allChildss": {
                "label": "select all childs",
                "action": function (obj) {
                  node.children_d.forEach(child => {
                    $(node).jstree("select_node", child, true);
                  });
                  onSelect($(treeRef.current).jstree(true).get_selected(true));
                }
              }
            }
          }
        }
      });

    $(treeRef.current).on("changed.jstree", (e, data) => {
      const selectedNodes = data.instance.get_selected(true);
      onSelect(selectedNodes);
    });

    return () => {
      $(treeRef.current).jstree("destroy");
    };
  }, []);

  useEffect(() => {
    if (treeRef.current) {
      $(treeRef.current).jstree(true).search(filter);
    }
  }, [filter]);

  return <div ref={treeRef} />;
}
