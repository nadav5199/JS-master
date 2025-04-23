import { Box, Typography, Divider, Paper, Avatar, TextField, IconButton, useTheme } from '@mui/material';
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
    initialMessages?: ChatMessage[];
    onMessagesChange?: (messages: ChatMessage[]) => void;
}

function ChatTeacher({ 
    code, 
    problemDescription, 
    skeletonCode, 
    solution, 
    initialMessages = [],
    onMessagesChange 
}: ChatTeacherProps) {
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();

    // Scroll to the bottom of the chat when new messages are added
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    // Notify parent component when messages change if callback is provided
    useEffect(() => {
        if (onMessagesChange) {
            onMessagesChange(chatMessages);
        }
    }, [chatMessages, onMessagesChange]);

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
            backgroundColor: 'background.paper', 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            height: '350px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
            <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 'medium',
                color: 'secondary.main'
            }}>
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
                gap: 1,
                px: 1
            }}>
                {chatMessages.length === 0 ? (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%'
                    }}>
                        <SmartToyIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            Ask the teacher any questions about this problem!
                        </Typography>
                    </Box>
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
                                <Avatar sx={{ 
                                    bgcolor: 'secondary.main', 
                                    width: 32, 
                                    height: 32, 
                                    mr: 1,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <SmartToyIcon fontSize="small" />
                                </Avatar>
                            )}
                            <Paper 
                                elevation={1}
                                sx={{ 
                                    p: 2, 
                                    maxWidth: '80%',
                                    bgcolor: msg.role === 'user' 
                                        ? `${theme.palette.primary.main}15` 
                                        : `${theme.palette.secondary.main}10`,
                                    color: 'text.primary',
                                    borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                    borderLeft: msg.role === 'assistant' ? `2px solid ${theme.palette.secondary.main}` : 'none',
                                    borderRight: msg.role === 'user' ? `2px solid ${theme.palette.primary.main}` : 'none',
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
                        <Paper sx={{ 
                            p: 2, 
                            borderRadius: '12px 12px 12px 0',
                            borderLeft: `2px solid ${theme.palette.secondary.main}`,
                            bgcolor: `${theme.palette.secondary.main}10`,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                Thinking
                                <span className="dot-animation">...</span>
                            </Typography>
                        </Paper>
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
                    InputProps={{
                        sx: {
                            borderRadius: '24px',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'divider'
                            }
                        }
                    }}
                />
                <IconButton 
                    color="secondary"
                    onClick={handleSendMessage}
                    disabled={isLoadingChat || !chatInput.trim()}
                    sx={{ 
                        backgroundColor: chatInput.trim() ? 'secondary.main' : 'action.disabledBackground',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'secondary.dark',
                        },
                        '&.Mui-disabled': {
                            backgroundColor: 'action.disabledBackground',
                            color: 'action.disabled'
                        }
                    }}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
}

export default ChatTeacher; 