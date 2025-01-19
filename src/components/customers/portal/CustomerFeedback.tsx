import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, StarOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSessionContext } from "@supabase/auth-helpers-react";

interface CustomerFeedbackProps {
  agreementId?: string;
}

export const CustomerFeedback = ({ agreementId }: CustomerFeedbackProps) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session } = useSessionContext();

  const handleSubmit = async () => {
    if (!session?.user?.id) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("customer_feedback")
        .insert({
          customer_id: session.user.id,
          agreement_id: agreementId,
          rating,
          feedback_text: feedback
        });

      if (error) throw error;

      toast.success("Thank you for your feedback!");
      setRating(0);
      setFeedback("");
    } catch (error: any) {
      toast.error("Failed to submit feedback");
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className="hover:scale-110 transition-transform"
              >
                {value <= rating ? (
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="w-8 h-8 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Share your experience with our service..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px]"
          />

          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="w-full"
          >
            Submit Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};