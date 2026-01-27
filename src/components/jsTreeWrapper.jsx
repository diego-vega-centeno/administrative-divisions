import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import $ from "jquery";
window.jQuery = $;
window.$ = $;
import "jstree";
import 'jstree/dist/themes/default/style.min.css';
import addFlatData from '../add_flat.json'

// help jstree by creating a children index
// O(1) lookup
const childrenIndex = {};
addFlatData.forEach(ele => {
  if (!childrenIndex[ele.parent]) childrenIndex[ele.parent] = [];
  childrenIndex[ele.parent].push(ele);
});

const JsTreeWrapper = forwardRef(({ data, onSelect }, ref) => {

  const treeRef = useRef(null);

  useEffect(() => {
    $(treeRef.current).jstree({
      'core': {
        // jsTree calls this function whenever it needs data
        // passes the node on the 'node' parameter
        // tc: O(m) ; m is number of childs
        'data': function (node, callback) {
          const children = childrenIndex[node.id] || []; // O(1)
          // O(m)
          const childrenWithHas = children.map(child => ({
            ...child,
            children: Boolean(childrenIndex[child.id]) // O(1)
          }))
          callback(childrenWithHas)
        },
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
                  $(treeRef.current).jstree("select_node", child);
                });
              }
            },
            "allChilds": {
              "label": "select all childs",
              "action": function (obj) {
                node.children_d.forEach(child => {
                  $(treeRef.current).jstree("select_node", child);
                })
              }
            }
          }
        }
      }
    });

    $(treeRef.current).on('changed.jstree', function (e, data) {
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
