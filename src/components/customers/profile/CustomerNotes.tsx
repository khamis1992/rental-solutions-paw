import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { StickyNote, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface CustomerNotesProps {
  customerId: string;
}

export const CustomerNotes = ({ customerId }: CustomerNotesProps) => {
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["customer-notes", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_notes")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async () => {
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("customer_notes").insert([
        {
          customer_id: customerId,
          note: newNote.trim(),
        },
      ]);

      if (error) throw error;

      setNewNote("");
      queryClient.invalidateQueries({ queryKey: ["customer-notes", customerId] });
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("customer_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["customer-notes", customerId] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a new note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !newNote.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>

          <div className="space-y-3">
            {notes?.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-lg border bg-card relative group"
              >
                <div className="text-sm">{note.note}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(note.created_at), "PPp")}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {notes?.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No notes yet
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};