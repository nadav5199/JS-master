import { Card, CardContent, Typography, Box, Chip, Button, TextField, IconButton, Divider, Paper, Avatar } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import type { Schema } from "../../amplify/data/resource";
import { Role, updateViewerSolvedStatus, checkSolution } from "../utils/codeBlockManager";
import { useEffect, useState, useRef } from 'react';
import { getHint, getChatResponse } from '../utils/openAiService.js';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface StudentViewProps {
    codeBlock: Schema["CodeBlock"]["type"];
    code: string;
    role: Role;
    onCodeChange: (value: string) => void;
    viewerId?: string;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

function StudentView({ codeBlock, code, role, onCodeChange, viewerId }: StudentViewProps) {
    const [isSolved, setIsSolved] = useState(false);
    const [hint, setHint] = useState<string | null>(null);
    const [isLoadingHint, setIsLoadingHint] = useState(false);
    const [showChat, setShowChat] = useState(false);
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

    // Check if code matches solution whenever code or codeBlock changes
    useEffect(() => {
        if (codeBlock?.solution && code) {
            const solved = checkSolution(code, codeBlock.solution);
            setIsSolved(solved);
            
            // Update solved status in the database if viewerId is provided
            if (viewerId) {
                updateViewerSolvedStatus(viewerId, solved);
            }
        }
    }, [code, codeBlock, viewerId]);

    const handleGetHint = async () => {
        if (!code || !codeBlock || !codeBlock.solution || !codeBlock.description || !codeBlock.skeletonCode) return;
        
        setIsLoadingHint(true);
        try {
            const hintText = await getHint(
                code, 
                codeBlock.description, 
                codeBlock.skeletonCode,
                codeBlock.solution
            );
            setHint(hintText);
        } catch (error) {
            console.error('Error getting hint:', error);
            setHint('Sorry, unable to generate a hint at this time.');
        } finally {
            setIsLoadingHint(false);
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || !code || !codeBlock || !codeBlock.solution || !codeBlock.description || !codeBlock.skeletonCode) return;
        
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
                codeBlock.description,
                codeBlock.skeletonCode,
                codeBlock.solution,
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
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">
                        {codeBlock.title}
                    </Typography>
                    <Box>
                        <Chip
                            label={`${codeBlock.signed} viewer${codeBlock.signed !== 1 ? 's' : ''}`}
                            color="secondary"
                            sx={{ fontWeight: 'bold', mr: 1 }}
                        />
                        <Chip
                            label={role.toUpperCase()}
                            color="default"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
                </Box>
                <Typography variant="body1" paragraph>
                    {codeBlock.description}
                </Typography>

                {/* Show big smiley face when solution is correct */}
                {isSolved && (
                    <Box 
                        sx={{ 
                            textAlign: 'center', 
                            my: 2, 
                            p: 2, 
                            backgroundColor: 'success.light',
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="h1" sx={{ fontSize: '80px' }}>
                            😊
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'success.dark', fontWeight: 'bold' }}>
                            Great job! Your solution is correct!
                        </Typography>
                    </Box>
                )}

                {/* Hint and Chat buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={handleGetHint}
                        disabled={isLoadingHint || isSolved}
                    >
                        {isLoadingHint ? 'Getting Hint...' : 'Get Hint'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setShowChat(!showChat)}
                        startIcon={<SmartToyIcon />}
                    >
                        {showChat ? 'Hide Teacher' : 'Ask Teacher'}
                    </Button>
                </Box>
                
                {hint && (
                    <Box sx={{ 
                        my: 2, 
                        p: 2, 
                        backgroundColor: 'info.light', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'info.main'
                    }}>
                        <Typography variant="h6" gutterBottom>
                            Hint:
                        </Typography>
                        <Typography variant="body1">
                            {hint}
                        </Typography>
                    </Box>
                )}

                {/* Teacher Chat Section */}
                {showChat && (
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
                )}

                {/* Code Editor */}
                <Box sx={{ my: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Your Code:
                    </Typography>
                    <CodeMirror
                        value={code}
                        height="200px"
                        theme={oneDark}
                        extensions={[javascript({ jsx: true })]}
                        onChange={onCodeChange}
                        style={{
                            fontSize: '14px',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
}

export default StudentView; 