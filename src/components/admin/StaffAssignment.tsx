import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, X } from 'lucide-react';

// Predefined staff members
const STAFF_MEMBERS = ['Baran', 'Mario', 'Marcel', 'Martin'];

interface StaffAssignmentProps {
  selectedStaff: string[];
  customStaff: string;
  onStaffChange: (staff: string[]) => void;
  onCustomStaffChange: (custom: string) => void;
  compact?: boolean;
}

export function StaffAssignment({
  selectedStaff,
  customStaff,
  onStaffChange,
  onCustomStaffChange,
  compact = false,
}: StaffAssignmentProps) {
  const [showCustomInput, setShowCustomInput] = useState(!!customStaff);

  const toggleStaff = (name: string) => {
    if (selectedStaff.includes(name)) {
      onStaffChange(selectedStaff.filter(s => s !== name));
    } else {
      onStaffChange([...selectedStaff, name]);
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          Zugewiesene Mitarbeiter
        </Label>
        <div className="flex flex-wrap gap-2">
          {selectedStaff.length > 0 ? (
            selectedStaff.map(name => (
              <Badge key={name} variant="secondary">
                {name}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">Keine zugewiesen</span>
          )}
          {customStaff && (
            <Badge variant="outline">{customStaff}</Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        Mitarbeiter zuweisen
      </Label>
      
      <div className="grid grid-cols-2 gap-2">
        {STAFF_MEMBERS.map(name => (
          <div
            key={name}
            className="flex items-center space-x-2"
          >
            <Checkbox
              id={`staff-${name}`}
              checked={selectedStaff.includes(name)}
              onCheckedChange={() => toggleStaff(name)}
            />
            <label
              htmlFor={`staff-${name}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {name}
            </label>
          </div>
        ))}
      </div>

      {/* Custom staff input */}
      <div className="pt-2 border-t">
        {showCustomInput ? (
          <div className="flex gap-2">
            <Input
              value={customStaff}
              onChange={(e) => onCustomStaffChange(e.target.value)}
              placeholder="Anderen Namen eingeben..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowCustomInput(false);
                onCustomStaffChange('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInput(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Andere Person hinzufügen
          </Button>
        )}
      </div>

      {/* Preview of selected staff */}
      {(selectedStaff.length > 0 || customStaff) && (
        <div className="flex flex-wrap gap-1 pt-2">
          {selectedStaff.map(name => (
            <Badge 
              key={name} 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleStaff(name)}
            >
              {name}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {customStaff && (
            <Badge 
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setShowCustomInput(false);
                onCustomStaffChange('');
              }}
            >
              {customStaff}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
