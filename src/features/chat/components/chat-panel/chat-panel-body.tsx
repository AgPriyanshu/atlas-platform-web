import { Flex, Text } from "@chakra-ui/react";
import { ConnectionStatus } from "../../store/types";
import { MessageList } from "../message-list";
import { SessionList } from "../session-list";
import { ChatInput } from "./chat-input";

type ChatPanelBodyProps = {
  handleSend: (message: string) => void;
  activeSessionId: string | null;
  isWaitingForResponse: boolean;
  connectionStatus: ConnectionStatus;
  isSessionListOpen: boolean;
};

export const ChatPanelBody: React.FC<ChatPanelBodyProps> = ({
  activeSessionId,
  isWaitingForResponse,
  connectionStatus,
  handleSend,
  isSessionListOpen,
}) => {
  return (
    <Flex className="chat-panel-body" flex={1} overflow="hidden" w="full">
      {/* Chat area */}
      <Flex direction="column" flex={1} minW={0}>
        {activeSessionId ? (
          <>
            <MessageList />
            <ChatInput
              onSend={handleSend}
              disabled={
                connectionStatus !== ConnectionStatus.Connected ||
                isWaitingForResponse
              }
            />
          </>
        ) : (
          <Flex flex={1} alignItems="center" justifyContent="center" px={6}>
            <Text
              fontSize="sm"
              color="text.muted"
              textAlign="center"
              lineHeight={1.6}
            >
              Select a session or create a new one to start chatting.
            </Text>
          </Flex>
        )}
      </Flex>
      {isSessionListOpen && <SessionList />}
    </Flex>
  );
};
