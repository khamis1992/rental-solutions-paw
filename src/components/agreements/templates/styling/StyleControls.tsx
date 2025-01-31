import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TextStyle } from "@/types/agreement.types";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface StyleControlsProps {
  style: TextStyle;
  onStyleChange: (style: TextStyle) => void;
}

export const StyleControls = ({ style, onStyleChange }: StyleControlsProps) => {
  const toggleStyle = (property: keyof TextStyle) => {
    if (typeof style[property] === 'boolean') {
      onStyleChange({ ...style, [property]: !style[property] });
    }
  };

  const alignmentButtons = [
    { value: 'left', icon: AlignLeft },
    { value: 'center', icon: AlignCenter },
    { value: 'right', icon: AlignRight },
    { value: 'justify', icon: AlignJustify },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-background border rounded-md">
      <div className="flex gap-1">
        <Button
          variant={style.bold ? "default" : "outline"}
          size="icon"
          onClick={() => toggleStyle('bold')}
          className="w-8 h-8"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={style.italic ? "default" : "outline"}
          size="icon"
          onClick={() => toggleStyle('italic')}
          className="w-8 h-8"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={style.underline ? "default" : "outline"}
          size="icon"
          onClick={() => toggleStyle('underline')}
          className="w-8 h-8"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1">
        {alignmentButtons.map(({ value, icon: Icon }) => (
          <Button
            key={value}
            variant={style.alignment === value ? "default" : "outline"}
            size="icon"
            onClick={() => onStyleChange({ ...style, alignment: value as TextStyle['alignment'] })}
            className="w-8 h-8"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2 min-w-[200px]">
        <span className="text-sm">Size:</span>
        <Slider
          value={[style.fontSize]}
          min={8}
          max={24}
          step={1}
          onValueChange={([value]) => onStyleChange({ ...style, fontSize: value })}
          className="flex-1"
        />
        <span className="text-sm w-8">{style.fontSize}px</span>
      </div>
    </div>
  );
};