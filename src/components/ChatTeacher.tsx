import { Box, Typography, Divider, Paper, Avatar, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useEffect, useState, useRef } from 'react';
import { getChatResponse } from '../utils/openAiService';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatTeacherProps {
    code: string;
    problemDescription: string;
    skeletonCode: string;
    solution: string;
}

function ChatTeacher({ code, problemDescription, skeletonCode, solution }: ChatTeacherProps) {
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scroll to the bottom of the chat when new messages are added
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    const handleSendMessage = async () => {
        if (!chatInput.trim() || !code || !problemDescription || !skeletonCode || !solution) return;
        
        // Add user message to chat
        const userMessage: ChatMessage = { role: 'user', content: chatInput };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsLoadingChat(true);
        
        try {
            // Get previous messages in format needed for API
            const prevMessages = chatMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));
            
            // Get response from OpenAI
            const response = await getChatResponse(
                chatInput,
                code,
                problemDescription,
                skeletonCode,
                solution,
                prevMessages
            );
            
            // Add assistant response to chat
            setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Error getting chat response:', error);
            setChatMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error while generating a response. Please try again.' 
            }]);
        } finally {
            setIsLoadingChat(false);
        }
    };

    return (
        <Box sx={{ 
            my: 2, 
            p: 2, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            height: '300px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SmartToyIcon sx={{ mr: 1 }} /> Teacher Chat
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* Chat messages container */}
            <Box sx={{ 
                flexGrow: 1, 
                overflow: 'auto',
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}>
                {chatMessages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                        Ask the teacher any questions about this problem!
                    </Typography>
                ) : (
                    chatMessages.map((msg, index) => (
                        <Box 
                            key={index} 
                            sx={{ 
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                mb: 1
                            }}
                        >
                            {msg.role === 'assistant' && (
                                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, mr: 1 }}>
                                    <SmartToyIcon fontSize="small" />
                                </Avatar>
                            )}
                            <Paper 
                                sx={{ 
                                    p: 1.5, 
                                    maxWidth: '80%',
                                    bgcolor: msg.role === 'user' ? 'primary.light' : 'background.paper',
                                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary'
                                }}
                            >
                                <Typography variant="body2">
                                    {msg.content}
                                </Typography>
                            </Paper>
                        </Box>
                    ))
                )}
                {isLoadingChat && (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, mr: 1 }}>
                            <SmartToyIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                            Thinking...
                        </Typography>
                    </Box>
                )}
                <div ref={chatEndRef} />
            </Box>
            
            {/* Chat input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Ask the teacher a question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoadingChat}
                />
                <IconButton 
                    color="primary" 
                    onClick={handleSendMessage}
                    disabled={isLoadingChat || !chatInput.trim()}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
}

export default ChatTeacher; 