import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'login'
  | 'logout'
  | 'export'
  | 'import'
  | 'payment'
  | 'status_change'
  | 'document_upload';

export interface AuditLogEntry {
  action: AuditAction;
  entity_type: string;
  entity_id?: string;
  changes?: any;
  metadata?: any;
}

export const logAuditEvent = async ({
  action,
  entity_type,
  entity_id,
  changes,
  metadata
}: AuditLogEntry) => {
  try {
    console.log(`Logging audit event: ${action} on ${entity_type}`);
    
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    };

    const { error } = await supabase.from('audit_logs').insert({
      action,
      entity_type,
      entity_id,
      changes,
      browser_info: browserInfo,
      user_agent: navigator.userAgent,
      metadata,
      ip_address: await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => null)
    });

    if (error) {
      console.error('Error logging audit event:', error);
      throw error;
    }

    console.log('Audit event logged successfully');
  } catch (error) {
    console.error('Failed to log audit event:', error);
    toast.error('Failed to log action. Please try again.');
  }
};

// Hook to automatically log component views
export const useAuditLog = (entityType: string, entityId?: string) => {
  React.useEffect(() => {
    logAuditEvent({
      action: 'view',
      entity_type: entityType,
      entity_id: entityId,
    });
  }, [entityType, entityId]);
};