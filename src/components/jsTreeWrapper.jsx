import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import $ from "jquery";
window.jQuery = $;
window.$ = $;
import "jstree";
import 'jstree/dist/themes/default/style.min.css';
import logger from "../utils/logger";
import add_flat_countries from '../add_flat_countries.json'

const fetchCountryChildren = async (countrId) => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/country/${countrId}/children`);
  if (!response.ok) throw new Error(`Failed fetch of country: ${countrId}`);
  return response.json();
}

const JsTreeWrapper = forwardRef(({ onSelect }, ref) => {

  const treeRef = useRef(null);

  useEffect(() => {
    $(treeRef.current).jstree({
      'core': {
        // jsTree calls this function whenever it needs data
        // passes the node on the 'node' parameter
        'data': async function (node, callback) {
          try {
            if (node.id == '#') {
              return callback(add_flat_countries)
            } else if (node.parent == '#') {
              const children = await fetchCountryChildren(node.id);
              callback(children)
            } else {
              callback([]);
            }
          } catch (error) {
            logger.error(`Error loading node: ${node}; error: `, error);
            callback([])
          }
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
