import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getRequiredHeaders, suggestHeaderMapping, normalizeHeader } from '../utils/headerMapping';
import type { HeaderMapping } from '../utils/headerMapping';

interface HeaderMappingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  onSaveMapping: (mapping: Record<string, string>) => void;
}

export const HeaderMappingDialog = ({
  isOpen,
  onClose,
  headers,
  onSaveMapping
}: HeaderMappingDialogProps) => {
  const [mappings, setMappings] = useState<HeaderMapping[]>([]);
  const [mappingName, setMappingName] = useState('');
  const requiredHeaders = getRequiredHeaders();

  useEffect(() => {
    if (isOpen) {
      const initialMappings = headers.map(header => ({
        originalHeader: header,
        mappedHeader: suggestHeaderMapping(header, requiredHeaders)[0] || ''
      }));
      setMappings(initialMappings);
    }
  }, [isOpen, headers]);

  const handleSave = async () => {
    const mappingObject = mappings.reduce((acc, { originalHeader, mappedHeader }) => {
      if (mappedHeader) {
        acc[normalizeHeader(originalHeader)] = normalizeHeader(mappedHeader);
      }
      return acc;
    }, {} as Record<string, string>);

    try {
      // Save mapping to database if name is provided
      if (mappingName.trim()) {
        await supabase.from('csv_import_mappings').insert({
          mapping_name: mappingName,
          field_mappings: mappingObject
        });
      }

      onSaveMapping(mappingObject);
      onClose();
    } catch (error) {
      console.error('Error saving mapping:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Map CSV Headers</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            {mappings.map(({ originalHeader, mappedHeader }, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{originalHeader}</Label>
                </div>
                <Select
                  value={mappedHeader}
                  onValueChange={(value) => {
                    const newMappings = [...mappings];
                    newMappings[index].mappedHeader = value;
                    setMappings(newMappings);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {requiredHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Save Mapping (Optional)</Label>
            <input
              type="text"
              placeholder="Mapping name"
              className="w-full px-3 py-2 border rounded"
              value={mappingName}
              onChange={(e) => setMappingName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Apply Mapping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};