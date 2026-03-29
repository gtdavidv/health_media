import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import '../styles/ChatInterface.css'

const ChatInterface = () => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)
  const pendingMessagesRef = useRef([])

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('health-media-chat-messages')
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [])

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('health-media-chat-messages', JSON.stringify(messages))
  }, [messages])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    // Add user message to chat and pending messages
    setMessages(prev => [...prev, userMessage])
    pendingMessagesRef.current.push(userMessage)
    setInputValue('')

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // If already loading, just add to pending and return
    if (isLoading) {
      return
    }

    setIsLoading(true)

    try {
      // Create new abort controller
      abortControllerRef.current = new AbortController()

      // Get all pending messages to send
      const pendingMessages = [...pendingMessagesRef.current]
      const conversationHistory = messages.filter(msg => !pendingMessagesRef.current.some(pending => pending.id === msg.id))

      // Send all pending messages in one request
      const response = await axios.post('/api/chat', {
        messages: pendingMessages.map(msg => msg.text),
        conversationHistory: conversationHistory
      }, {
        signal: abortControllerRef.current.signal
      })

      const botMessage = {
        id: Date.now() + Math.random(),
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }

      // Clear pending messages and add bot response
      pendingMessagesRef.current = []
      setMessages(prev => [...prev, botMessage])
      
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        // Request was cancelled, don't show error
        return
      }
      
      console.error('Error sending message:', error)
      
      const errorMessage = {
        id: Date.now() + Math.random(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      }
      
      // Clear pending messages and add error message
      pendingMessagesRef.current = []
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem('health-media-chat-messages')
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>Chat with Health Media Assistant</h2>
        <button onClick={clearChat} className="clear-button">
          Clear Chat
        </button>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start a conversation about health media topics, treatments, or research.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
            >
              <div className="message-content">
                <div className="message-text">
                  {message.text.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <span className="timestamp">
                  {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="message bot loading">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim()}
            className="send-button"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatInterface