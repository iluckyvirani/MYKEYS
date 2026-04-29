// components/dashboard/OwnerDashboard/InquiryInbox.tsx
"use client";

import { Inbox, User, Search, MessageSquare, Phone, Mail, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  priority: string;
  type: string;
  duration?: string;
  budget?: number;
  notes?: Note[];
  response?: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  read: "bg-gray-100 text-gray-800",
  replied: "bg-green-100 text-green-800",
  closed: "bg-purple-100 text-purple-800",
  converted: "bg-indigo-100 text-indigo-800",
  NEW: "bg-blue-100 text-blue-800",
  READ: "bg-gray-100 text-gray-800",
  REPLIED: "bg-green-100 text-green-800",
  CLOSED: "bg-purple-100 text-purple-800",
  CONVERTED: "bg-indigo-100 text-indigo-800",
};

interface InquiryInboxProps {
  filters?: { status?: string; priority?: string; type?: string };
}

export default function InquiryInbox({ filters = {} }: InquiryInboxProps) {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/inquiries?forOwner=true&pageSize=100");
      if (response.data?.success && response.data.data?.items) {
        const inquiriesList = response.data.data.items.map((inq: any) => ({
          id: inq.id,
          propertyId: inq.propertyId,
          propertyTitle: inq.propertyTitle,
          guestName: inq.guestName,
          guestEmail: inq.guestEmail,
          guestPhone: inq.guestPhone,
          message: inq.message,
          createdAt: inq.createdAt,
          updatedAt: inq.updatedAt,
          status: (inq.status || "NEW").toLowerCase(),
          priority: inq.priority || "medium",
          type: inq.type,
          duration: inq.type === "long_term" ? `${inq.desiredDurationMonths || 12} months` : inq.desiredDurationMonths,
          budget: inq.budget || inq.pricePerMonth,
          response: inq.response || null,
        }));
        setInquiries(inquiriesList);
        if (inquiriesList.length > 0) {
          setSelectedInquiry(inquiriesList[0]);
          // Mark first inquiry as read
          if (inquiriesList[0].status === "new") {
            handleStatusChange(inquiriesList[0].id, "read");
          }
        }
      }
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      setError("Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      setUpdatingId(inquiryId);
      await api.patch(`/inquiries/${inquiryId}`, { status: newStatus.toUpperCase() });

      setInquiries(
        inquiries.map((inq) =>
          inq.id === inquiryId ? { ...inq, status: newStatus } : inq
        )
      );

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
      toast({ title: "Success", description: "Inquiry status updated." });
    } catch (err) {
      console.error("Error updating inquiry status:", err);
      toast({ title: "Error", description: "Failed to update inquiry status.", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePriorityChange = async (inquiryId: string, newPriority: string) => {
    try {
      setUpdatingId(inquiryId);
      await api.patch(`/inquiries/${inquiryId}`, { priority: newPriority });

      setInquiries(
        inquiries.map((inq) =>
          inq.id === inquiryId ? { ...inq, priority: newPriority } : inq
        )
      );

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, priority: newPriority });
      }
      toast({ title: "Success", description: "Priority updated." });
    } catch (err) {
      console.error("Error updating inquiry priority:", err);
      toast({ title: "Error", description: "Failed to update inquiry priority.", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveResponse = async () => {
    if (!selectedInquiry || !responseMessage.trim()) {
      toast({ title: "Validation", description: "Please enter a response message.", variant: "destructive" });
      return;
    }

    try {
      setUpdatingId(selectedInquiry.id);
      // Save response to Inquiry.response field ONLY
      await api.patch(`/inquiries/${selectedInquiry.id}`, { 
        status: "REPLIED",
        response: responseMessage 
      });

      // Update local state
      setInquiries(
        inquiries.map((inq) =>
          inq.id === selectedInquiry.id ? { ...inq, status: "replied", response: responseMessage } : inq
        )
      );

      setSelectedInquiry({ ...selectedInquiry, status: "replied", response: responseMessage });
      setResponseMessage("");
      setIsEditingResponse(false);
      toast({
        title: "Success",
        description: "Response sent to user successfully!",
      });
    } catch (err) {
      console.error("Error saving response:", err);
      toast({
        title: "Error",
        description: "Failed to save response",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddNote = async () => {
    if (!selectedInquiry || !newNote.trim()) {
      toast({ title: "Validation", description: "Please enter a note.", variant: "destructive" });
      return;
    }

    try {
      setUpdatingId(selectedInquiry.id);
      // Save as internal note
      await api.post(`/inquiries/${selectedInquiry.id}/notes`, { content: newNote });

      setNewNote("");
      toast({
        title: "Success",
        description: "Note added successfully!",
      });
      
      // Refresh notes
      fetchNotes(selectedInquiry.id);
    } catch (err) {
      console.error("Error adding note:", err);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchNotes = async (inquiryId: string) => {
    try {
      setNotesLoading(true);
      const response = await api.get(`/inquiries/${inquiryId}/notes`);
      if (response.data?.success && response.data.data) {
        setInquiries(
          inquiries.map((inq) =>
            inq.id === inquiryId ? { ...inq, notes: response.data.data } : inq
          )
        );

        if (selectedInquiry?.id === inquiryId) {
          setSelectedInquiry({ ...selectedInquiry, notes: response.data.data });
        }
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleDeleteNote = async (inquiryId: string, noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/inquiries/${inquiryId}/notes/${noteId}`);
      
      // Update local state
      const updatedInquiries = inquiries.map((inq) => {
        if (inq.id === inquiryId) {
          return {
            ...inq,
            notes: inq.notes?.filter((note) => note.id !== noteId),
          };
        }
        return inq;
      });

      setInquiries(updatedInquiries);

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({
          ...selectedInquiry,
          notes: selectedInquiry.notes?.filter((note) => note.id !== noteId),
        });
      }
      toast({ title: "Success", description: "Note deleted." });
    } catch (err) {
      console.error("Error deleting note:", err);
      toast({ title: "Error", description: "Failed to delete note.", variant: "destructive" });
    }
  };

  const handleMarkClosed = async () => {
    if (!selectedInquiry) return;

    try {
      setUpdatingId(selectedInquiry.id);
      await api.patch(`/inquiries/${selectedInquiry.id}`, { status: "CLOSED" });

      setInquiries(
        inquiries.map((inq) =>
          inq.id === selectedInquiry.id ? { ...inq, status: "closed" } : inq
        )
      );

      setSelectedInquiry({ ...selectedInquiry, status: "closed" });
      toast({ title: "Success", description: "Inquiry marked as closed." });
    } catch (err) {
      console.error("Error marking as closed:", err);
      toast({ title: "Error", description: "Failed to mark as closed.", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkConverted = async () => {
    if (!selectedInquiry) return;

    try {
      setUpdatingId(selectedInquiry.id);
      await api.patch(`/inquiries/${selectedInquiry.id}`, { status: "CONVERTED" });

      setInquiries(
        inquiries.map((inq) =>
          inq.id === selectedInquiry.id ? { ...inq, status: "converted" } : inq
        )
      );

      setSelectedInquiry({ ...selectedInquiry, status: "converted" });
      toast({ title: "Success", description: "Inquiry marked as converted." });
    } catch (err) {
      console.error("Error marking as converted:", err);
      toast({ title: "Error", description: "Failed to mark as converted.", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (filter !== "all" && inq.status !== filter) return false;
    if (search && !inq.guestName.toLowerCase().includes(search.toLowerCase()) && 
        !inq.propertyTitle.toLowerCase().includes(search.toLowerCase())) return false;
    // Apply advanced filters
    if (filters.status && inq.status.toUpperCase() !== filters.status) return false;
    if (filters.priority && inq.priority !== filters.priority) return false;
    if (filters.type && inq.type !== filters.type) return false;
    return true;
  });

  const unreadCount = inquiries.filter((inq) => inq.status === "new").length;
  const newCount = inquiries.filter((inq) => inq.status === "new").length;

  return (
    <div className="bg-white rounded-[5px] shadow-sm border">
      <div className="p-5 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Inbox className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Inquiry Inbox</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">
                  {inquiries.length} total inquiries
                </span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {unreadCount} unread
                  </Badge>
                )}
                {newCount > 0 && (
                  <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {newCount} new
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {/* <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Quick Reply Templates
            </Button>
          </div> */}
        </div>

        {/* Filters and Search */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search inquiries by guest or property..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["all", "new", "replied", "closed", "converted"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === "new" && newCount > 0 && (
                  <span className="ml-2 bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full">
                    {newCount}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Inquiry List */}
        <div className="lg:col-span-1 border-r max-h-150 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-spin" />
                <p className="text-gray-500 text-sm">Loading inquiries...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 text-red-600 text-sm">{error}</div>
          ) : filteredInquiries.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm text-center py-8">No inquiries found</div>
          ) : (
            filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`
                  p-4 border-b cursor-pointer transition-colors hover:bg-gray-50
                  ${selectedInquiry?.id === inquiry.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
                  ${inquiry.status === "new" ? "bg-blue-50/50" : ""}
                `}
                onClick={() => {
                  setSelectedInquiry(inquiry);
                  if (inquiry.status === "new") {
                    handleStatusChange(inquiry.id, "read");
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{inquiry.guestName}</span>
                    {inquiry.status === "new" && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[inquiry.priority as keyof typeof priorityColors]}`}>
                    {inquiry.priority}
                  </span>
                </div>

                <h4 className="font-semibold text-gray-900 mb-1">{inquiry.propertyTitle}</h4>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{inquiry.message}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[inquiry.status as keyof typeof statusColors]}`}>
                      {inquiry.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(inquiry.createdAt)}
                    </span>
                  </div>
                  {inquiry.budget && (
                    <div className="text-xs font-medium text-gray-900">
                      ₹{inquiry.budget.toLocaleString()}
                      <span className="text-gray-500 ml-1">
                        {inquiry.type === "purchase" ? "" : "/" + (inquiry.type === "long_term" ? "month" : "night")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Inquiry Details */}
        <div className="lg:col-span-2 p-6">
          {selectedInquiry ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedInquiry.propertyTitle}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-gray-600">
                      <User className="w-4 h-4" />
                      {selectedInquiry.guestName}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedInquiry.createdAt)}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[selectedInquiry.priority as keyof typeof priorityColors]}`}>
                      {selectedInquiry.priority} priority
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNotesModal(true);
                      fetchNotes(selectedInquiry.id);
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Notes
                  </Button>
                </div>
              </div>

              {/* Guest Info */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Guest Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{selectedInquiry.guestEmail}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium">{selectedInquiry.guestPhone || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Inquiry Details</h4>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Message</div>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      {selectedInquiry.message}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-sm text-gray-500">Type</div>
                      <div className="font-medium">{selectedInquiry.type.replace("_", " ")}</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="font-medium">{selectedInquiry.duration || "N/A"}</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-sm text-gray-500">Budget</div>
                      <div className="font-medium">{selectedInquiry.budget ? `₹${selectedInquiry.budget.toLocaleString()}` : "N/A"}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-sm text-gray-500 mb-2">Status</div>
                      <div className="font-medium text-lg">{selectedInquiry.status.toUpperCase()}</div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-sm text-gray-500 mb-2">Priority</div>
                      <select 
                        value={selectedInquiry.priority}
                        onChange={(e) => handlePriorityChange(selectedInquiry.id, e.target.value)}
                        disabled={updatingId === selectedInquiry.id}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Box */}
              <div className="mb-6 border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Response to User</h4>
                
                {selectedInquiry.response && !isEditingResponse ? (
                  // Show existing response with edit button
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900">Your Response (Visible to User)</span>
                      <button
                        onClick={() => {
                          setIsEditingResponse(true);
                          setResponseMessage(selectedInquiry.response || "");
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-gray-700 text-sm">{selectedInquiry.response}</p>
                  </div>
                ) : (
                  // Show input for new or editing response
                  <div className="space-y-4">
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Type your response message to be sent to the user..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                    <div className="flex gap-3">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleSaveResponse}
                        disabled={updatingId === selectedInquiry.id || !responseMessage.trim()}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Response
                      </Button>
                      {isEditingResponse && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setIsEditingResponse(false);
                            setResponseMessage("");
                          }}
                          disabled={updatingId === selectedInquiry.id}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedInquiry.response && !isEditingResponse && (
                  <div className="flex gap-3 mt-4">
                    <Button 
                      variant="outline"
                      onClick={handleMarkClosed}
                      disabled={updatingId === selectedInquiry.id}
                    >
                      Close Inquiry
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleMarkConverted}
                      disabled={updatingId === selectedInquiry.id}
                    >
                      Mark Converted
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Select an inquiry</h4>
              <p className="text-gray-500">Choose an inquiry from the list to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="border-b p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Private Notes - {selectedInquiry.propertyTitle}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Internal notes (not visible to user)</p>
              </div>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notesLoading ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-500 text-sm">Loading notes...</p>
                </div>
              ) : selectedInquiry.notes && selectedInquiry.notes.length > 0 ? (
                selectedInquiry.notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(note.createdAt)}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(selectedInquiry.id, note.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-gray-700 text-sm">{note.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No notes yet</p>
                </div>
              )}
            </div>

            {/* Modal Footer - Add New Note Section */}
            <div className="border-t p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Add New Note</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type your internal note..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddNote}
                  disabled={updatingId === selectedInquiry.id || !newNote.trim()}
                >
                  Save Note
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNotesModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}