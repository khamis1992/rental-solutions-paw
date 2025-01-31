import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { TemplateLayout } from "@/types/agreement.types";
import { FileUp, Layout, Type, Image } from "lucide-react";

interface TemplateLayoutControlsProps {
  layout: TemplateLayout;
  onLayoutChange: (layout: TemplateLayout) => void;
  onLogoUpload?: (file: File) => Promise<void>;
}

export const TemplateLayoutControls = ({
  layout,
  onLayoutChange,
  onLogoUpload
}: TemplateLayoutControlsProps) => {
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onLogoUpload) {
      await onLogoUpload(file);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-background-alt rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Layout Elements</h3>
        <Layout className="h-5 w-5 text-gray-500" />
      </div>

      {/* Letterhead Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="letterhead">Letterhead</Label>
          <Switch
            id="letterhead"
            checked={layout.letterhead?.enabled}
            onCheckedChange={(checked) =>
              onLayoutChange({
                ...layout,
                letterhead: { ...layout.letterhead, enabled: checked }
              })
            }
          />
        </div>
        {layout.letterhead?.enabled && (
          <div className="space-y-2">
            <Label>Height (px)</Label>
            <Slider
              value={[layout.letterhead.height]}
              min={50}
              max={200}
              step={10}
              onValueChange={([value]) =>
                onLayoutChange({
                  ...layout,
                  letterhead: { ...layout.letterhead, height: value }
                })
              }
            />
          </div>
        )}
      </div>

      {/* Logo Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="logo">Company Logo</Label>
          <Switch
            id="logo"
            checked={layout.logo?.enabled}
            onCheckedChange={(checked) =>
              onLayoutChange({
                ...layout,
                logo: { ...layout.logo, enabled: checked }
              })
            }
          />
        </div>
        {layout.logo?.enabled && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                id="logo-upload"
                onChange={handleLogoUpload}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <FileUp className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            </div>
            <Select
              value={layout.logo.position}
              onValueChange={(value: 'left' | 'center' | 'right') =>
                onLayoutChange({
                  ...layout,
                  logo: { ...layout.logo, position: value }
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Logo Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Watermark Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="watermark">Watermark</Label>
          <Switch
            id="watermark"
            checked={layout.watermark?.enabled}
            onCheckedChange={(checked) =>
              onLayoutChange({
                ...layout,
                watermark: { ...layout.watermark, enabled: checked }
              })
            }
          />
        </div>
        {layout.watermark?.enabled && (
          <div className="space-y-4">
            <Input
              value={layout.watermark.text}
              onChange={(e) =>
                onLayoutChange({
                  ...layout,
                  watermark: { ...layout.watermark, text: e.target.value }
                })
              }
              placeholder="Watermark Text"
            />
            <div className="space-y-2">
              <Label>Opacity</Label>
              <Slider
                value={[layout.watermark.opacity * 100]}
                min={10}
                max={50}
                step={5}
                onValueChange={([value]) =>
                  onLayoutChange({
                    ...layout,
                    watermark: { ...layout.watermark, opacity: value / 100 }
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Page Numbering Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="page-numbers">Page Numbers</Label>
          <Switch
            id="page-numbers"
            checked={layout.pageNumbering?.enabled}
            onCheckedChange={(checked) =>
              onLayoutChange({
                ...layout,
                pageNumbering: { ...layout.pageNumbering, enabled: checked }
              })
            }
          />
        </div>
        {layout.pageNumbering?.enabled && (
          <div className="space-y-4">
            <Select
              value={layout.pageNumbering.position}
              onValueChange={(value: 'top' | 'bottom') =>
                onLayoutChange({
                  ...layout,
                  pageNumbering: { ...layout.pageNumbering, position: value }
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={layout.pageNumbering.format}
              onValueChange={(value: 'numeric' | 'roman') =>
                onLayoutChange({
                  ...layout,
                  pageNumbering: { ...layout.pageNumbering, format: value }
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numeric">1, 2, 3...</SelectItem>
                <SelectItem value="roman">I, II, III...</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};