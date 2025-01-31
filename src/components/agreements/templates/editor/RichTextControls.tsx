import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Table } from "lucide-react";
import { TextStyle } from "@/types/agreement.types";

interface RichTextControlsProps {
  style: TextStyle;
  onStyleChange: (style: TextStyle) => void;
  onInsertTable: () => void;
}

export const RichTextControls = ({ style, onStyleChange, onInsertTable }: RichTextControlsProps) => {
  const toggleStyle = (property: keyof TextStyle) => {
    if (property === 'bold' || property === 'italic' || property === 'underline') {
      onStyleChange({ ...style, [property]: !style[property] });
    }
  };

  const setAlignment = (alignment: TextStyle['alignment']) => {
    onStyleChange({ ...style, alignment });
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background">
      <div className="flex gap-1">
        <Button
          variant={style.bold ? "default" : "outline"}
          size="sm"
          onClick={() => toggleStyle('bold')}
          className="w-8 h-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={style.italic ? "default" : "outline"}
          size="sm"
          onClick={() => toggleStyle('italic')}
          className="w-8 h-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={style.underline ? "default" : "outline"}
          size="sm"
          onClick={() => toggleStyle('underline')}
          className="w-8 h-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1">
        <Button
          variant={style.alignment === 'left' ? "default" : "outline"}
          size="sm"
          onClick={() => setAlignment('left')}
          className="w-8 h-8 p-0"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={style.alignment === 'center' ? "default" : "outline"}
          size="sm"
          onClick={() => setAlignment('center')}
          className="w-8 h-8 p-0"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={style.alignment === 'right' ? "default" : "outline"}
          size="sm"
          onClick={() => setAlignment('right')}
          className="w-8 h-8 p-0"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant={style.alignment === 'justify' ? "default" : "outline"}
          size="sm"
          onClick={() => setAlignment('justify')}
          className="w-8 h-8 p-0"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onInsertTable}
        className="w-8 h-8 p-0"
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );
};