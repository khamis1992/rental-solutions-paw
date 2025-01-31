export interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
}

export interface Table {
  rows: {
    cells: {
      content: string;
      style: TextStyle;
    }[];
  }[];
  style: {
    width: string;
    borderCollapse: string;
    borderSpacing: string;
  };
}

export interface TemplateLayout {
  letterhead?: {
    enabled: boolean;
    height: number;
    content?: string;
  };
  logo?: {
    enabled: boolean;
    position: 'left' | 'center' | 'right';
    size: number;
    url?: string;
  };
  watermark?: {
    enabled: boolean;
    text: string;
    opacity: number;
  };
  pageNumbering?: {
    enabled: boolean;
    position: 'top' | 'bottom';
    format: 'numeric' | 'roman';
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  language: string;
  agreement_type: 'short_term' | 'lease_to_own';
  rent_amount?: number;
  final_price?: number;
  agreement_duration: string;
  daily_late_fee?: number;
  damage_penalty_rate?: number;
  late_return_fee?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  template_structure: {
    textStyle: TextStyle;
    tables: Table[];
    layout: TemplateLayout;
  };
  template_sections: any[];
  variable_mappings: Record<string, any>;
}
