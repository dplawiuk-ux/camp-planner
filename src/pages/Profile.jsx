import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, LogOut, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AlternateEmails from '@/components/profile/AlternateEmails';
import TopNavBar from '@/components/layout/TopNavBar';

export default function Profile() {
  const [showEmailSettings, setShowEmailSettings] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <TopNavBar title="Profile" />
      
      <div className="pt-20 px-4 max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{user.full_name || 'User'}</h2>
          <p className="text-slate-500">{user.email}</p>
          {user.role === 'admin' && (
            <Badge className="mt-2 bg-amber-100 text-amber-800 border-amber-200">
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setShowEmailSettings(true)}
              >
                <Mail className="w-5 h-5 mr-3 text-slate-500" />
                <span>Email Addresses</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => base44.auth.logout()}
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlternateEmails 
        open={showEmailSettings} 
        onClose={() => setShowEmailSettings(false)} 
      />
    </div>
  );
}