import React, { useState, useEffect, useRef } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Send, 
  Shield, 
  Users, 
  Lock,
  Crown,
  User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const roleIcons = {
  lead: Crown,
  admin: Shield,
  guest: UserIcon
};

const roleColors = {
  lead: "text-amber-600",
  admin: "text-emerald-600",
  guest: "text-slate-500"
};

export default function TripChat({ tripId, currentUserRole, currentUserEmail }) {
  const [activeTab, setActiveTab] = useState("general");
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const canAccessAdminChat = ['lead', 'admin'].includes(currentUserRole);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chatMessages', tripId, activeTab],
    queryFn: async () => {
      const msgs = await base44.entities.ChatMessage.filter(
        { trip_id: tripId, channel: activeTab },
        '-created_date',
        100
      );
      return msgs.reverse(); // Show oldest first
    },
    refetchInterval: 3000 // Poll every 3 seconds
  });

  const sendMutation = useMutation({
    mutationFn: async (messageData) => {
      const user = await base44.auth.me();
      return base44.entities.ChatMessage.create({
        ...messageData,
        user_email: user.email,
        user_name: user.full_name || user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', tripId, activeTab] });
      setMessage("");
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate({
      trip_id: tripId,
      channel: activeTab,
      message: message.trim()
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="border-0 shadow-sm h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            Trip Chat
          </CardTitle>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 pt-4">
          <TabsList className="w-full bg-slate-100">
            <TabsTrigger value="general" className="flex-1 flex items-center gap-2">
              <Users className="w-4 h-4" />
              General
            </TabsTrigger>
            {canAccessAdminChat && (
              <TabsTrigger value="admin" className="flex-1 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Organizers
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="general" className="flex-1 flex flex-col mt-0">
          <ChatContent
            messages={messages}
            currentUserEmail={currentUserEmail}
            messagesEndRef={messagesEndRef}
            isLoading={isLoading}
          />
        </TabsContent>

        {canAccessAdminChat && (
          <TabsContent value="admin" className="flex-1 flex flex-col mt-0">
            <div className="px-6 py-2">
              <Badge variant="outline" className="text-xs border-emerald-200 bg-emerald-50 text-emerald-700">
                <Lock className="w-3 h-3 mr-1" />
                Private - Only leads and admins can see this
              </Badge>
            </div>
            <ChatContent
              messages={messages}
              currentUserEmail={currentUserEmail}
              messagesEndRef={messagesEndRef}
              isLoading={isLoading}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Message Input */}
      <div className="p-4 border-t bg-slate-50">
        <div className="flex gap-2">
          <Input
            placeholder={`Message ${activeTab === 'admin' ? 'organizers' : 'everyone'}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            className="flex-1 bg-white"
          />
          <Button 
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ChatContent({ messages, currentUserEmail, messagesEndRef, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        Loading messages...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6">
        <MessageCircle className="w-12 h-12 mb-3 text-slate-300" />
        <p>No messages yet</p>
        <p className="text-sm">Start the conversation!</p>
      </div>
    );
  }

  return (
    <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
      <AnimatePresence>
        {messages.map((msg) => {
          const isCurrentUser = msg.user_email === currentUserEmail;
          
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isCurrentUser 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {(msg.user_name || msg.user_email).charAt(0).toUpperCase()}
              </div>
              
              <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'items-end' : ''}`}>
                <div className={`flex items-baseline gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm font-medium text-slate-700">
                    {isCurrentUser ? 'You' : (msg.user_name || msg.user_email)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {format(new Date(msg.created_date), 'h:mm a')}
                  </span>
                </div>
                <div className={`rounded-2xl px-4 py-2.5 ${
                  isCurrentUser
                    ? 'bg-emerald-600 text-white rounded-br-md'
                    : 'bg-slate-100 text-slate-800 rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </CardContent>
  );
}