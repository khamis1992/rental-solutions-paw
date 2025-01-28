import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LateFeesPenaltiesFieldsProps {
  register: any;
}

export const LateFeesPenaltiesFields = ({ register }: LateFeesPenaltiesFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="dailyLateFee">Daily Late Fee (QAR)</Label>
        <Input
          id="dailyLateFee"
          type="number"
          step="0.01"
          defaultValue={120}
          {...register("dailyLateFee")}
        />
      </div>
    </>
  );
};