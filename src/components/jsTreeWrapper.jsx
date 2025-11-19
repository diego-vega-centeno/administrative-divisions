import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import $ from "jquery";
window.jQuery = $;
window.$ = $;
import "jstree";
import 'jstree/dist/themes/default/style.min.css';

const JsTreeWrapper = forwardRef(({ data, onSelect, filter }, ref) => {

  const treeRef = useRef(null);

  useEffect(() => {
    $(treeRef.current).jstree({
        'core': {
          'data': data,
          'themes': {
            'icons': false
          },
        },
        "plugins": ["checkbox", "search", "contextmenu"],
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
                "label": "select immediate childs",
                // obj is the button object
                "action": function (obj) {
                  // select only immediate children
                  node.children.forEach(child => {
                    $(treeRef.current).jstree("select_node", child, true);
                  });
                }
              },
              "allChildss": {
                "label": "select all childs",
                "action": function (obj) {
                  node.children_d.forEach(child => {
                    $(treeRef.current).jstree("select_node", child, true);
                  })
                }
              }
            }
          }
        }
      });
    
    $(treeRef.current).on('changed.jstree', function(e, data){
      onSelect($(treeRef.current).jstree(true).get_selected(true));
    });

    return () => {
      $(treeRef.current).jstree("destroy");
    };
  }, []);

  useImperativeHandle(ref, () => ({
    deselectAll: () => {
      $(treeRef.current).jstree(true).deselect_all();
    },
    getSelected: () => {
      return $(treeRef.current).jstree(true).get_selected(true);
    },
    filter: (filter) => {
      $(treeRef.current).jstree(true).search(filter);
    },
  }));

  return <div ref={treeRef} />;
})

export default JsTreeWrapper;
