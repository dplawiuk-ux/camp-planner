import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TopNavBar({ 
  title, 
  showBack = false, 
  backTo = null,
  rightActions = null,
  transparent = false 
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(createPageUrl(backTo));
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-40 safe-area-pt",
      transparent 
        ? "bg-transparent" 
        : "bg-white/95 backdrop-blur-md border-b border-slate-200"
    )}>
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className={cn(
                "flex-shrink-0",
                transparent ? "text-white hover:bg-white/10" : ""
              )}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {title && (
            <h1 className={cn(
              "text-lg font-semibold truncate",
              transparent ? "text-white" : "text-slate-900"
            )}>
              {title}
            </h1>
          )}
        </div>
        
        {rightActions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {rightActions}
          </div>
        )}
      </div>
    </div>
  );
}