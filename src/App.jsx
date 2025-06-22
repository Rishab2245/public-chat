import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Send, Edit, Trash2, Check, X, Moon, Sun, Palette, Settings, Search, MoreVertical, Phone, Video } from 'lucide-react'
import './App.css'

const BACKEND_URL = 'http://localhost:3001'

function App() {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [senderId, setSenderId] = useState('')
  const [editingMessage, setEditingMessage] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [connected, setConnected] = useState(false)
  const [theme, setTheme] = useState('dark') // 'light', 'dark', 'medium'
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.className = theme
  }, [theme])

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(BACKEND_URL)
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    newSocket.on('existingMessages', (existingMessages) => {
      setMessages(existingMessages)
    })

    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message])
    })

    newSocket.on('messageUpdated', ({ messageId, content }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, content, updatedAt: new Date() } : msg
      ))
    })

    newSocket.on('messageDeleted', ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId))
    })

    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
      alert(error.message)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !senderId.trim()) {
      alert('Please enter both sender ID and message')
      return
    }

    socket.emit('sendMessage', {
      senderId: senderId.trim(),
      content: newMessage.trim(),
      conversationId: 'general'
    })

    setNewMessage('')
  }

  const handleEditMessage = (message) => {
    setEditingMessage(message._id)
    setEditContent(message.content)
  }

  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      alert('Message content cannot be empty')
      return
    }

    socket.emit('updateMessage', {
      messageId: editingMessage,
      content: editContent.trim()
    })

    setEditingMessage(null)
    setEditContent('')
  }

  const handleCancelEdit = () => {
    setEditingMessage(null)
    setEditContent('')
  }

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      socket.emit('deleteMessage', { messageId })
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const cycleTheme = () => {
    const themes = ['light', 'medium', 'dark']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />
      case 'dark': return <Moon className="w-4 h-4" />
      case 'medium': return <Palette className="w-4 h-4" />
      default: return <Sun className="w-4 h-4" />
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme === 'light' ? 'bg-gray-50' : 
      theme === 'medium' ? 'bg-slate-100' : 
      'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
    }`}>
      <div className="max-w-6xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className={`${
          theme === 'light' ? 'bg-white border-gray-200' : 
          theme === 'medium' ? 'bg-slate-200 border-slate-300' : 
          'bg-slate-800/90 border-slate-700'
        } border-b backdrop-blur-sm`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full ${
                theme === 'light' ? 'bg-blue-500' : 
                theme === 'medium' ? 'bg-indigo-500' : 
                'bg-gradient-to-r from-purple-500 to-pink-500'
              } flex items-center justify-center text-white font-semibold`}>
                {senderId ? senderId.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${
                  theme === 'light' ? 'text-gray-900' : 
                  theme === 'medium' ? 'text-slate-800' : 
                  'text-white'
                }`}>
                  {senderId || 'Chat Room'}
                </h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 
                    theme === 'medium' ? 'text-slate-600' : 
                    'text-gray-300'
                  }`}>
                    {connected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className={`${
                  theme === 'light' ? 'hover:bg-gray-100' : 
                  theme === 'medium' ? 'hover:bg-slate-300' : 
                  'hover:bg-slate-700 text-gray-300'
                }`}
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${
                  theme === 'light' ? 'hover:bg-gray-100' : 
                  theme === 'medium' ? 'hover:bg-slate-300' : 
                  'hover:bg-slate-700 text-gray-300'
                }`}
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${
                  theme === 'light' ? 'hover:bg-gray-100' : 
                  theme === 'medium' ? 'hover:bg-slate-300' : 
                  'hover:bg-slate-700 text-gray-300'
                }`}
              >
                <Video className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={cycleTheme}
                className={`${
                  theme === 'light' ? 'hover:bg-gray-100' : 
                  theme === 'medium' ? 'hover:bg-slate-300' : 
                  'hover:bg-slate-700 text-gray-300'
                }`}
              >
                {getThemeIcon()}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${
                  theme === 'light' ? 'hover:bg-gray-100' : 
                  theme === 'medium' ? 'hover:bg-slate-300' : 
                  'hover:bg-slate-700 text-gray-300'
                }`}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {!senderId && (
              <div className={`text-center p-8 rounded-lg ${
                theme === 'light' ? 'bg-blue-50 text-blue-700' : 
                theme === 'medium' ? 'bg-indigo-50 text-indigo-700' : 
                'bg-slate-800/50 text-purple-300'
              }`}>
                <div className="text-lg font-semibold mb-2">Welcome to the Chat Room!</div>
                <div className="text-sm opacity-75">Enter your name below to start chatting</div>
              </div>
            )}
            
            {messages.length === 0 && senderId ? (
              <div className={`text-center py-12 ${
                theme === 'light' ? 'text-gray-500' : 
                theme === 'medium' ? 'text-slate-600' : 
                'text-gray-400'
              }`}>
                <div className="text-lg mb-2">No messages yet</div>
                <div className="text-sm opacity-75">Start the conversation!</div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwn = message.senderId === senderId
                const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId
                
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                      showAvatar ? 'mt-4' : 'mt-1'
                    }`}
                  >
                    <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs lg:max-w-md`}>
                      {!isOwn && showAvatar && (
                        <div className={`w-8 h-8 rounded-full ${
                          theme === 'light' ? 'bg-gray-400' : 
                          theme === 'medium' ? 'bg-slate-500' : 
                          'bg-gradient-to-r from-blue-500 to-purple-500'
                        } flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
                          {message.senderId.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div className={`${
                        isOwn 
                          ? theme === 'light' ? 'bg-blue-500 text-white' : 
                            theme === 'medium' ? 'bg-indigo-500 text-white' : 
                            'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : theme === 'light' ? 'bg-white border border-gray-200 text-gray-900' : 
                            theme === 'medium' ? 'bg-slate-200 border border-slate-300 text-slate-900' : 
                            'bg-slate-700 border border-slate-600 text-white'
                      } rounded-2xl px-4 py-2 shadow-sm`}>
                        {editingMessage === message._id ? (
                          <div className="space-y-2">
                            <Input
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className={`text-sm border-0 ${
                                theme === 'light' ? 'bg-gray-100' : 
                                theme === 'medium' ? 'bg-slate-100' : 
                                'bg-slate-600 text-white'
                              }`}
                              onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                            />
                            <div className="flex gap-1">
                              <Button size="sm" onClick={handleSaveEdit} className="h-6 px-2 bg-green-500 hover:bg-green-600">
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-6 px-2">
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {!isOwn && showAvatar && (
                              <div className={`text-xs font-semibold mb-1 ${
                                theme === 'light' ? 'text-blue-600' : 
                                theme === 'medium' ? 'text-indigo-600' : 
                                'text-purple-300'
                              }`}>
                                {message.senderId}
                              </div>
                            )}
                            <div className="text-sm leading-relaxed">
                              {message.content}
                              {message.updatedAt && (
                                <span className="text-xs opacity-60 ml-2 italic">(edited)</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <div className="text-xs opacity-60">
                                {formatTime(message.timestamp)}
                              </div>
                              {isOwn && (
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditMessage(message)}
                                    className="h-5 w-5 p-0 hover:bg-white/20 opacity-60 hover:opacity-100"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteMessage(message._id)}
                                    className="h-5 w-5 p-0 hover:bg-white/20 opacity-60 hover:opacity-100"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className={`${
          theme === 'light' ? 'bg-white border-gray-200' : 
          theme === 'medium' ? 'bg-slate-200 border-slate-300' : 
          'bg-slate-800/90 border-slate-700'
        } border-t backdrop-blur-sm p-4`}>
          {!senderId ? (
            <div className="flex gap-3">
              <Input
                placeholder="Enter your name to start chatting..."
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                className={`flex-1 ${
                  theme === 'light' ? 'bg-gray-50 border-gray-300' : 
                  theme === 'medium' ? 'bg-slate-100 border-slate-400' : 
                  'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && e.target.value.trim() && setSenderId(e.target.value.trim())}
              />
              <Button 
                onClick={() => senderId.trim() && setSenderId(senderId.trim())}
                disabled={!senderId.trim()}
                className={`px-6 ${
                  theme === 'light' ? 'bg-blue-500 hover:bg-blue-600' : 
                  theme === 'medium' ? 'bg-indigo-500 hover:bg-indigo-600' : 
                  'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                Join Chat
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className={`flex-1 ${
                  theme === 'light' ? 'bg-gray-50 border-gray-300' : 
                  theme === 'medium' ? 'bg-slate-100 border-slate-400' : 
                  'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                }`}
                disabled={!connected}
              />
              <Button 
                type="submit" 
                disabled={!connected || !newMessage.trim()}
                className={`px-6 ${
                  theme === 'light' ? 'bg-blue-500 hover:bg-blue-600' : 
                  theme === 'medium' ? 'bg-indigo-500 hover:bg-indigo-600' : 
                  'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

