import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import $ from "jquery";
window.jQuery = $;
window.$ = $;
import "jstree";
import 'jstree/dist/themes/default/style.min.css';
import { childrenIndex } from "../utils/addData.js";

const JsTreeWrapper = forwardRef(({ onSelect }, ref) => {

  const treeRef = useRef(null);

  useEffect(() => {
    $(treeRef.current).jstree({
      'core': {
        // jsTree calls this function whenever it needs data
        // passes the node on the 'node' parameter

        // help jstree by using childrenIndex wich is O(1) lookup
        // tc: O(m); m is number of childs
        'data': function (node, callback) {
          const children = childrenIndex[node.id] || []; // O(1)
          // O(m)
          const childrenWithHas = children.map(child => ({
            ...child,
            children: Boolean(childrenIndex[child.id]) // O(1)
          }))
          callback(childrenWithHas);
          $(treeRef.current).trigger('lazy_load_done.jstree', [node]);
        },
        'themes': {
          'icons': false
        },
      },
      "plugins": ["checkbox", "search", "contextmenu"],
      "checkbox": {
        "three_state": false,
        "cascade": "up+undetermined",
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
                const tree = $(treeRef.current).jstree(true);
                // manually open node instead of attaching events
                tree.open_node(node, function () {
                  const updatedNode = tree.get_node(node.id);
                  updatedNode.children.forEach(child => {
                    tree.select_node(child);
                  });
                  tree.deselect_node(node.id);
                });
              }
            },
            // "allChilds": {
            //   "label": "select all childs",
            //   "action": function (obj) {
            //     const tree = $(treeRef.current).jstree(true);
            //     // Manually open and select nodes
            //     // to avoid race situation between lazy loading and events
            //     function openNodeAndSelectChildren(nodeId) {
            //       tree.open_node(nodeId, function () {
            //         const updatedNode = tree.get_node(nodeId);
            //         updatedNode.children.forEach(childId => {
            //           tree.select_node(childId);
            //           if (childrenIndex[childId]) {
            //             openNodeAndSelectChildren(childId);
            //           }
            //         })
            //       });
            //     }
            //     openNodeAndSelectChildren(node.id);
            //   }
            // }
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
