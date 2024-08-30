class ChatSession {
  chatByUser: { [username: string]: { chatId: number } } = {};

  updateChatIdByUser = (username: string, chatId: number) => {
    this.chatByUser[username] = { chatId };
  };
}

export const chatSession = new ChatSession();
