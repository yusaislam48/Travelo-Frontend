// Chatbot state
let userName = localStorage.getItem('travelo_user_name');
let isChatOpen = false;
let isFirstMessage = !userName;

// Chat messages history
let chatHistory = [];

// Create chat interface
function createChatInterface() {
  const chatHTML = `
    <div id="chat-container" class="chat-container ${isChatOpen ? 'open' : ''}">
      <div class="chat-header" onclick="toggleChat()">
        <div class="chat-avatar">
          <img src="https://api.dicebear.com/7.x/bottts/svg?seed=travelo&backgroundColor=4ECDC4" alt="Travelo" />
        </div>
        <div class="chat-title">
          <h4>Travelo</h4>
          <p class="status">Your Travel Buddy</p>
        </div>
        <button class="toggle-btn">
          <i class="fas fa-chevron-up"></i>
        </button>
      </div>
      <div class="chat-body">
        <div id="chat-messages" class="chat-messages"></div>
        <div class="chat-input">
          <input type="text" id="user-input" placeholder="Type your message..." />
          <button onclick="sendMessage()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  // Add chat interface to body
  const chatDiv = document.createElement('div');
  chatDiv.innerHTML = chatHTML;
  document.body.appendChild(chatDiv);

  // Add event listener for input
  const input = document.getElementById('user-input');
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Show initial message
  if (isFirstMessage) {
    showBotMessage("Hey there! 👋 I'm Travelo, your friendly travel companion! What's your name?");
  } else {
    showBotMessage(`Welcome back, ${userName}! 🌟 Ready for another adventure?`);
  }
}

// Toggle chat open/closed
function toggleChat() {
  const container = document.getElementById('chat-container');
  isChatOpen = !isChatOpen;
  container.classList.toggle('open');
  
  const toggleBtn = container.querySelector('.toggle-btn i');
  toggleBtn.className = isChatOpen ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
}

// Show bot message with typing animation
function showBotMessage(message, delay = 500) {
  const messagesDiv = document.getElementById('chat-messages');
  
  // Add typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message typing';
  typingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  messagesDiv.appendChild(typingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Replace with actual message after delay
  setTimeout(() => {
    typingDiv.className = 'message bot-message';
    typingDiv.innerHTML = message;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, delay);
}

// Show user message
function showUserMessage(message) {
  const messagesDiv = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user-message';
  messageDiv.textContent = message;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Process user message and generate response
async function processMessage(message) {
  if (isFirstMessage) {
    // Handle name input
    const name = message.trim();
    if (name.length > 0) {
      userName = name;
      localStorage.setItem('travelo_user_name', userName);
      isFirstMessage = false;
      return `Nice to meet you, ${userName}! 😊 I'm your personal travel buddy, here to help you plan amazing adventures! Feel free to ask me anything about travel destinations, planning tips, or just chat about your dream vacation!`;
    }
    return "Oops! I didn't catch that. Could you tell me your name again?";
  }

  // Regular conversation
  const response = await fetch('https://travelo-backend-production-454e.up.railway.app/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_name: userName,
      message: message
    })
  });

  if (!response.ok) {
    return "Sorry, I'm having trouble thinking right now. Could you try again? 😅";
  }

  const data = await response.json();
  return data.response;
}

// Send message
async function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  
  if (message.length === 0) return;
  
  // Clear input
  input.value = '';
  
  // Show user message
  showUserMessage(message);
  
  // Get and show bot response
  const response = await processMessage(message);
  showBotMessage(response, 1000);
}

// Initialize chat interface when DOM is loaded
document.addEventListener('DOMContentLoaded', createChatInterface); 