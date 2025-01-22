import { useParams } from "react-router-dom";
import { VehicleOverview } from "./profile/VehicleOverview";
import { VehicleDocuments } from "./profile/VehicleDocuments";
import { MaintenanceHistory } from "./profile/MaintenanceHistory";
import { DamageHistory } from "./profile/DamageHistory";
import { VehicleTimeline } from "./profile/VehicleTimeline";
import { VehicleQRCode } from "./profile/VehicleQRCode";
import { VehicleInsurance } from "./profile/VehicleInsurance";
import { DocumentExpiryNotifications } from "./profile/DocumentExpiryNotifications";

export const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <div className="space-y-6">
      <DocumentExpiryNotifications vehicleId={id} />
      <div className="grid gap-6 md:grid-cols-2">
        <VehicleOverview vehicleId={id} />
        <VehicleQRCode vehicleId={id} />
      </div>
      <VehicleInsurance vehicleId={id} />
      <VehicleDocuments vehicleId={id} />
      <MaintenanceHistory vehicleId={id} />
      <DamageHistory vehicleId={id} />
      <VehicleTimeline vehicleId={id} />
    </div>
  );
};