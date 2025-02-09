
import { Table, TableBody } from "@/components/ui/table";
import { AgreementTableHeader } from "../table/AgreementTableHeader";
import { AgreementTableRow } from "../table/AgreementTableRow";
import { VehicleTablePagination } from "../../vehicles/table/VehicleTablePagination";
import { AgreementMobileCard } from "../AgreementMobileCard";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Agreement } from "../hooks/useAgreements";
import { cn } from "@/lib/utils";

interface AgreementListContentProps {
  agreements: Agreement[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewContract: (id: string) => void;
  onPrintContract: (id: string) => void;
  onAgreementClick: (id: string) => void;
  onNameClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
  onDeleted: () => void;
}

export const AgreementListContent = ({
  agreements,
  currentPage,
  totalPages,
  onPageChange,
  onViewContract,
  onPrintContract,
  onAgreementClick,
  onNameClick,
  onDeleteClick,
  onDeleted,
}: AgreementListContentProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        <div className="space-y-3 px-4 pb-20">
          {agreements.map((agreement) => (
            <AgreementMobileCard
              key={agreement.id}
              agreement={agreement}
              onViewContract={onViewContract}
              onAgreementClick={onAgreementClick}
              onNameClick={onNameClick}
              onDeleted={onDeleted}
              onDeleteClick={() => onDeleteClick(agreement.id)}
            />
          ))}
          
          <div className="fixed bottom-4 left-0 right-0 px-4 z-10">
            <Card className="w-full p-4 shadow-lg bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
              <VehicleTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  onPageChange(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (navigator.vibrate) {
                    navigator.vibrate(50);
                  }
                }}
              />
            </Card>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <Table>
              <AgreementTableHeader />
              <TableBody>
                {agreements.map((agreement) => (
                  <AgreementTableRow
                    key={agreement.id}
                    agreement={agreement}
                    onViewContract={onViewContract}
                    onPrintContract={onPrintContract}
                    onAgreementClick={onAgreementClick}
                    onNameClick={onNameClick}
                    onDeleted={onDeleted}
                    onDeleteClick={() => onDeleteClick(agreement.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-center mt-6">
            <VehicleTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </>
      )}
    </>
  );
};
