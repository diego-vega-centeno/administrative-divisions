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
        // 'animation': 0,
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
            "select": {
              "label": "Select",
              "submenu": {
                "childs": {
                  "label": "Select immediate childs",
                  // obj is the button object
                  "action": function (obj) {
                    const tree = $(treeRef.current).jstree(true);

                    // manually open node instead of attaching events
                    tree.open_node(node, function () {
                      const updatedNode = tree.get_node(node.id);
                      // select all children
                      tree.select_node(updatedNode.children, true)
                      // deselect parent
                      tree.deselect_node(node.id);

                      // we dont need a map because all children are selected
                      // wont work if one is not selected
                      onSelect(updatedNode.children.map(id => tree.get_node(id)))
                    });
                  }
                }
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
            // },
            "deselect": {
              "label": "Deselect",
              "submenu": {
                "deselect-all": {
                  "label": "Deselect all",
                  "action": function (obj) {
                    $(treeRef.current).jstree(true).deselect_all();
                  }
                }
              }
            },
            "Close-all": {
              "label": "Close all",
              "action": function (obj) {
                $(treeRef.current).jstree(true).close_all();
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
    getSelected: () => {
      return $(treeRef.current).jstree(true).get_selected(true);
    },
    filter: (filter) => {
      $(treeRef.current).jstree(true).search(filter);
    },
    getNodePath: (nodeId) => {
      const path = $(treeRef.current).jstree(true).get_path(nodeId, ' / ');
      return path.split('/').slice(0, -1).reverse().join(' / ');
    },
    tree: () => {
      return $(treeRef.current).jstree(true);
    }
  }));

  return <div ref={treeRef} />;
})

export default JsTreeWrapper;
