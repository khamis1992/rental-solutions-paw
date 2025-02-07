
import { MoreVertical, Mail, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import type { Customer } from "./types/customer";

interface CustomerCardProps {
  customer: Customer;
  onDelete?: () => void;
  onEdit?: () => void;
  onClick?: () => void;
}

export const CustomerCard = ({ customer, onDelete, onEdit, onClick }: CustomerCardProps) => {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="p-6 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{customer.full_name}</h3>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`${getStatusColor(customer.status)}`}
          >
            {customer.status?.replace('_', ' ') || 'N/A'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="space-y-2 text-gray-600">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>{customer.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>{customer.phone_number}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{customer.address}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium">{customer.total_orders || 0} orders</span>
        <span>·</span>
        <span>
          Last order: {
            customer.last_order_date 
              ? formatDistanceToNow(new Date(customer.last_order_date), { addSuffix: true })
              : 'Never'
          }
        </span>
      </div>
    </div>
  );
};
