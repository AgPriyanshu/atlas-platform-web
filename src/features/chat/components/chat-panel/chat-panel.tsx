import { Box, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";
import { ResizableBox } from "react-resizable";
import useResizeObserver from "use-resize-observer";
import { DEFAULT_WIDTH, MAX_WIDTH, MIN_WIDTH } from "../../constants";
import { useWebSocket } from "../../hooks/use-websocket/use-websocket";
import { chatStore } from "../../store/chat-store";
import { ChatPanelBody } from "./chat-panel-body";
import { ChatPanelTitle } from "./chat-panel-title";

export const ChatPanel = observer(() => {
  // Store.
  const {
    isPanelOpen,
    activeSessionId,
    connectionStatus,
    isWaitingForResponse,
    isSessionListOpen,
  } = chatStore;

  // States.
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);

  // Hooks.
  const { ref: containerRef, height: containerHeight = 600 } =
    useResizeObserver<HTMLDivElement>();

  const { sendMessage } = useWebSocket(isPanelOpen ? activeSessionId : null);

  // Handlers.
  const handleSend = (message: string) => {
    chatStore.addOptimisticMessage(message, 0);
    sendMessage(message);
  };

  const handleResize = useCallback(
    (_: unknown, { size }: { size: { width: number } }) => {
      setPanelWidth(size.width);
    },
    []
  );

  if (!isPanelOpen) {
    return null;
  }

  return (
    <Box
      className="chat-panel-container"
      ref={containerRef}
      h="full"
      position="relative"
    >
      <ResizableBox
        width={panelWidth}
        height={containerHeight}
        minConstraints={[MIN_WIDTH, containerHeight]}
        maxConstraints={[MAX_WIDTH, containerHeight]}
        axis="x"
        resizeHandles={["w"]}
        onResize={handleResize}
        handle={
          <Box
            className="chat-panel-resize-handle"
            position="absolute"
            left={0}
            top={0}
            bottom={0}
            w="6px"
            cursor="col-resize"
            zIndex={10}
            transition="background 0.15s ease"
            _hover={{ bg: "intent.primary" }}
            _active={{ bg: "intent.primary" }}
            css={{
              "&::after": {
                content: '""',
                position: "absolute",
                left: "2px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "2px",
                height: "32px",
                borderRadius: "full",
                background: "var(--chakra-colors-border-default)",
                transition: "background 0.15s ease",
              },
              "&:hover::after": {
                background: "var(--chakra-colors-intent-primary)",
              },
            }}
          />
        }
      >
        <VStack
          className="chat-panel"
          w="full"
          h="full"
          gap={0}
          borderLeftWidth="1px"
          borderColor="border.default"
          bg="surface.container"
        >
          {/* Title bar */}
          <ChatPanelTitle
            connectionStatus={connectionStatus}
            isSessionListOpen={isSessionListOpen}
            activeSessionId={activeSessionId}
          />

          {/* Body */}
          <ChatPanelBody
            handleSend={handleSend}
            activeSessionId={activeSessionId}
            isWaitingForResponse={isWaitingForResponse}
            connectionStatus={connectionStatus}
            isSessionListOpen={isSessionListOpen}
          />
        </VStack>
      </ResizableBox>
    </Box>
  );
});
