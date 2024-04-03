"use client";

import { RefObject, useCallback, useEffect, useState } from "react";

export const useScrollSync = () => {
  const [panes, setPanes] = useState<HTMLDivElement[]>([]);

  const findPane = useCallback(
    (node: HTMLDivElement) => panes.find((pane) => pane === node),
    [panes]
  );


  const registerPane = (node: HTMLDivElement) => {
    if (!findPane(node)) {
      if (panes.length > 0) {
        syncScrollPosition(panes[0], node);
      }
      panes.push(node);
    }
    addEvents(node);
  };

  const unregisterPane = (node: HTMLDivElement) => {
    if (findPane(node)) {
      removeEvents(node);
      panes?.splice(panes.indexOf(node), 1);
    }
  };

  const addEvents = (node: HTMLDivElement) => {
    /* For some reason element.addEventListener doesnt work with document.body */
    node.onscroll = handlePaneScroll.bind(this, node);
  };

  const removeEvents = (node: HTMLDivElement) => {
    /* For some reason element.removeEventListener doesnt work with document.body */
    node.onscroll = null;
  };


  const handlePaneScroll = (node: HTMLDivElement) => {
    window.requestAnimationFrame(() => {
      syncScrollPositions(node);
    });
  };

  const syncScrollPosition = (scrolledPane: HTMLDivElement, pane: HTMLDivElement) => {
    const {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollLeft,
      scrollWidth,
      clientWidth
    } = scrolledPane;

    const scrollTopOffset = scrollHeight - clientHeight;
    const scrollLeftOffset = scrollWidth - clientWidth;


    /* Calculate the actual pane height */
    const paneHeight = pane.scrollHeight - clientHeight;
    const paneWidth = pane.scrollWidth - clientWidth;
    /* Adjust the scrollTop position of it accordingly */
    if (scrollTopOffset > 0) {
      pane.scrollTop = (paneHeight * scrollTop) / scrollTopOffset;
    }
    if (scrollLeftOffset > 0) {
      pane.scrollLeft = (paneWidth * scrollLeft) / scrollLeftOffset;
    }
  };

  const syncScrollPositions = (scrolledPane: HTMLDivElement) => {
    panes.forEach((pane) => {
      /* For all panes beside the currently scrolling one */
      if (scrolledPane !== pane) {
        /* Remove event listeners from the node that we'll manipulate */
        removeEvents(pane);
        syncScrollPosition(scrolledPane, pane);
        /* Re-attach event listeners after we're done scrolling */
        window.requestAnimationFrame(() => {
          addEvents(pane);
        });
      }
    });


  };
  return {
    registerPane, unregisterPane, handlePaneScroll
  };
};


export const useScrollSyncWrap = (nodeRefs: RefObject<HTMLDivElement>[]) => {
  const { registerPane, unregisterPane, handlePaneScroll } = useScrollSync(
  );

  useEffect(() => {
    nodeRefs?.forEach((nodeRef) => {
      if (nodeRef && nodeRef.current) {
        registerPane(nodeRef.current);
      }
    });
    return () =>
      nodeRefs?.forEach((nodeRef) => {
        if (nodeRef && nodeRef.current) {
          unregisterPane(nodeRef.current);
        }
      });
  }, [nodeRefs, registerPane, unregisterPane]);

  return {};
};