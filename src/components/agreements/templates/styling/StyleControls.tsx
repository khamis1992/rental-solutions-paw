import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TextStyle } from "@/types/agreement.types";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface StyleControlsProps {
  style: TextStyle;
  onStyleChange: (style: TextStyle) => void;
}

export const StyleControls: React.FC<StyleControlsProps> = ({ style, onStyleChange }) => {
  const handleToggle = (property: keyof TextStyle) => {
    if (property === 'bold' || property === 'italic' || property === 'underline') {
      onStyleChange({ ...style, [property]: !style[property] });
    }
  };

  const handleAlignment = (alignment: TextStyle['alignment']) => {
    onStyleChange({ ...style, alignment });
  };

  const handleFontSizeChange = (value: number[]) => {
    onStyleChange({ ...style, fontSize: value[0] });
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background">
      <div className="flex gap-1">
        <Button
          variant={style.bold ? "default" : "outline"}
          size="sm"
          onClick={() => handleToggle('bold')}
          className="w-8 h-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={style.italic ? "default" : "outline"}
          size="sm"
          onClick={() => handleToggle('italic')}
          className="w-8 h-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={style.underline ? "default" : "outline"}
          size="sm"
          onClick={() => handleToggle('underline')}
          className="w-8 h-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1">
        <Button
          variant={style.alignment === 'left' ? "default" : "outline"}
          size="sm"
          onClick={() => handleAlignment('left')}
          className="w-8 h-8 p-0"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={style.alignment === 'center' ? "default" : "outline"}
          size="sm"
          onClick={() => handleAlignment('center')}
          className="w-8 h-8 p-0"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={style.alignment === 'right' ? "default" : "outline"}
          size="sm"
          onClick={() => handleAlignment('right')}
          className="w-8 h-8 p-0"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant={style.alignment === 'justify' ? "default" : "outline"}
          size="sm"
          onClick={() => handleAlignment('justify')}
          className="w-8 h-8 p-0"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 min-w-[200px]">
        <span className="text-sm">Size:</span>
        <Slider
          value={[style.fontSize]}
          onValueChange={handleFontSizeChange}
          min={8}
          max={32}
          step={1}
          className="w-32"
        />
        <span className="text-sm w-8">{style.fontSize}px</span>
      </div>
    </div>
  );
};