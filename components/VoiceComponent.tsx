'use client';

import React, { useEffect, useState } from 'react';
import { useConversation } from '@11labs/react';

// UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

// API
// import { sendTranscriptionsToBackend } from "@/lib/api";

const VoiceChat = () => {
    const [hasPermission, setHasPermission] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [transcriptions, setTranscriptions] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);

    const conversation = useConversation({
        onConnect: () => {
            console.log('Connected to ElevenLabs');
            setTranscriptions([]);
        },
        onDisconnect: () => {
            console.log('Disconnected from ElevenLabs');
        },
        onMessage: message => {
            console.log('Received message:', message);

            if (message.source === 'user' && message.message) {
                console.log('User said:', message.message);
                setTranscriptions(prev => [...prev, message.message]);
            }
        },
        onError: (error: string | Error) => {
            setErrorMessage(typeof error === 'string' ? error : error.message);
            console.error('Error:', error);
        },
    });

    const { status, isSpeaking } = conversation;

    useEffect(() => {
        const requestMicPermission = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                setHasPermission(true);
            } catch (error) {
                setErrorMessage('Microphone access denied');
                console.error('Error accessing microphone:', error);
            }
        };

        requestMicPermission();
    }, []);

    const handleStartConversation = async () => {
        try {
            const conversationId = await conversation.startSession({
                agentId: 'ORPPizxXWtYeSEoDoA6k',
            });
            console.log('Started conversation:', conversationId);
        } catch (error) {
            setErrorMessage('Failed to start conversation');
            console.error('Error starting conversation:', error);
        }
    };

    const handleEndConversation = async () => {
        try {
            await conversation.endSession();

            if (transcriptions.length > 0) {
                setIsSending(true);
                // // const success = await sendTranscriptionsToBackend(transcriptions);
                // if (success) {
                //   console.log("Successfully sent transcriptions to backend");
                // } else {
                //   setErrorMessage("Failed to send transcriptions to backend");
                // }
                // setIsSending(false);
            }
        } catch (error) {
            setErrorMessage('Failed to end conversation');
            console.error('Error ending conversation:', error);
        }
    };

    const toggleMute = async () => {
        try {
            await conversation.setVolume({ volume: isMuted ? 1 : 0 });
            setIsMuted(!isMuted);
        } catch (error) {
            setErrorMessage('Failed to change volume');
            console.error('Error changing volume:', error);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Voice Chat
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleMute}
                            disabled={status !== 'connected'}
                        >
                            {isMuted ? (
                                <VolumeX className="h-4 w-4" />
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-center">
                        {status === 'connected' ? (
                            <Button
                                variant="destructive"
                                onClick={handleEndConversation}
                                className="w-full"
                                disabled={isSending}
                            >
                                <MicOff className="mr-2 h-4 w-4" />
                                {isSending
                                    ? 'Sending transcription...'
                                    : 'End Conversation'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleStartConversation}
                                disabled={!hasPermission}
                                className="w-full"
                            >
                                <Mic className="mr-2 h-4 w-4" />
                                Start Conversation
                            </Button>
                        )}
                    </div>

                    <div className="text-center text-sm">
                        {status === 'connected' && (
                            <p className="text-green-600">
                                {isSpeaking
                                    ? 'Agent is speaking...'
                                    : 'Listening...'}
                            </p>
                        )}
                        {errorMessage && (
                            <p className="text-red-500">{errorMessage}</p>
                        )}
                        {!hasPermission && (
                            <p className="text-yellow-600">
                                Please allow microphone access to use voice chat
                            </p>
                        )}
                    </div>

                    {transcriptions.length > 0 && (
                        <div className="mt-4 border border-gray-200 rounded-md p-2">
                            <p className="text-sm font-medium mb-1">
                                Your Speech:
                            </p>
                            <div className="max-h-32 overflow-y-auto">
                                {transcriptions.map((text, index) => (
                                    <p
                                        key={index}
                                        className="text-sm text-gray-600"
                                    >
                                        {text}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default VoiceChat;
