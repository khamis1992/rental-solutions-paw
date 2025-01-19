import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomerFeedbackProps {
  customerId: string;
}

export const CustomerFeedback = ({ customerId }: CustomerFeedbackProps) => {
  const [feedback, setFeedback] = useState<string>("");
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("customer_feedback")
        .select("*")
        .eq("customer_id", customerId);

      if (error) {
        toast.error("Failed to load feedback");
        console.error("Error fetching feedback:", error);
      } else {
        setFeedbackList(data);
      }
      setLoading(false);
    };

    fetchFeedback();
  }, [customerId]);

  const handleFeedbackSubmit = async () => {
    if (!feedback) return;

    const { error } = await supabase
      .from("customer_feedback")
      .insert([{ customer_id: customerId, feedback }]);

    if (error) {
      toast.error("Failed to submit feedback");
      console.error("Error submitting feedback:", error);
    } else {
      toast.success("Feedback submitted successfully");
      setFeedback("");
      // Optionally refetch feedback list
      const { data } = await supabase
        .from("customer_feedback")
        .select("*")
        .eq("customer_id", customerId);
      setFeedbackList(data);
    }
  };

  if (loading) {
    return <div>Loading feedback...</div>;
  }

  return (
    <div className="feedback-container">
      <h2 className="text-xl font-bold mb-4">Customer Feedback</h2>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Leave your feedback here..."
        className="w-full p-2 border rounded"
      />
      <button onClick={handleFeedbackSubmit} className="mt-2 btn-primary">
        Submit Feedback
      </button>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Previous Feedback</h3>
        <ul>
          {feedbackList.map((item) => (
            <li key={item.id} className="border-b py-2">
              {item.feedback}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
