
import { supabase } from "@/integrations/supabase/client";

export interface ElementStyle {
  fontSize?: string;
  lineHeight?: string;
  fontWeight?: string;
  marginBottom?: string;
  color?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  border?: string;
  backgroundColor?: string;
  boxShadow?: string;
  width?: string;
  height?: string;
  hover?: {
    opacity?: string;
  };
}

export async function getElementStyles(category: string, elementType: string): Promise<ElementStyle | null> {
  const { data, error } = await supabase
    .from('element_styles')
    .select('style_properties')
    .eq('category', category)
    .eq('element_type', elementType)
    .single();

  if (error || !data) {
    console.error('Error fetching element styles:', error);
    return null;
  }

  return data.style_properties as ElementStyle;
}

export function generateTailwindClasses(styles: ElementStyle): string {
  const classMap: Record<string, string> = {
    fontSize: 'text',
    lineHeight: 'leading',
    fontWeight: 'font',
    marginBottom: 'mb',
    padding: 'p',
    margin: 'm',
    borderRadius: 'rounded',
    backgroundColor: 'bg',
    width: 'w',
    height: 'h'
  };

  return Object.entries(styles)
    .filter(([key]) => key in classMap)
    .map(([key, value]) => `${classMap[key]}-[${value}]`)
    .join(' ');
}
