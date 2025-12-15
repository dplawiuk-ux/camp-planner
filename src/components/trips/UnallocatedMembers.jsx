import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default function UnallocatedMembers({ members = [], packingItems = [], gearItems = [] }) {
  const tents = packingItems.filter(item => item.category === 'shelter');
  const watercraft = gearItems.filter(item => item.type === 'watercraft');
  
  const tentAssignedIds = new Set(
    tents.flatMap(tent => tent.assigned_to || [])
  );
  
  const watercraftAssignedIds = new Set(
    watercraft.flatMap(w => w.assigned_to || [])
  );
  
  const unallocatedToTent = members.filter(m => !tentAssignedIds.has(m.id));
  const unallocatedToWatercraft = members.filter(m => !watercraftAssignedIds.has(m.id));
  const unallocatedToBoth = members.filter(m => 
    !tentAssignedIds.has(m.id) && !watercraftAssignedIds.has(m.id)
  );

  if (members.length === 0) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          Member Allocation Status
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {unallocatedToBoth.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="destructive" className="text-xs">
                Not Allocated
              </Badge>
              <p className="text-sm font-medium text-slate-700">
                Not assigned to tent or watercraft ({unallocatedToBoth.length})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {unallocatedToBoth.map((member) => (
                <Badge key={member.id} variant="outline" className="border-red-300 text-red-700">
                  {member.user_name || member.user_email || 'Unnamed'}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {unallocatedToTent.length > 0 && unallocatedToTent.length !== unallocatedToBoth.length && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs border-amber-300 bg-amber-50 text-amber-700">
                No Tent
              </Badge>
              <p className="text-sm font-medium text-slate-700">
                Not assigned to tent ({unallocatedToTent.length})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {unallocatedToTent.map((member) => (
                <Badge key={member.id} variant="outline" className="border-amber-300 text-amber-700">
                  {member.user_name || member.user_email || 'Unnamed'}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {unallocatedToWatercraft.length > 0 && unallocatedToWatercraft.length !== unallocatedToBoth.length && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs border-blue-300 bg-blue-50 text-blue-700">
                No Watercraft
              </Badge>
              <p className="text-sm font-medium text-slate-700">
                Not assigned to watercraft ({unallocatedToWatercraft.length})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {unallocatedToWatercraft.map((member) => (
                <Badge key={member.id} variant="outline" className="border-blue-300 text-blue-700">
                  {member.user_name || member.user_email || 'Unnamed'}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {unallocatedToBoth.length === 0 && (
          <p className="text-sm text-slate-500 italic">
            All members are allocated to at least one item
          </p>
        )}
      </CardContent>
    </Card>
  );
}