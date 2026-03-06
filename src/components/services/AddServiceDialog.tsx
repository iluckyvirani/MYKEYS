"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface AddServiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function AddServiceDialog({ open, onOpenChange, onSuccess }: AddServiceDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        basePrice: "",
        image: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleClose = () => {
        setFormData({
            name: "",
            description: "",
            basePrice: "",
            image: "",
        });
        onOpenChange(false);
    };

    const canSubmit = () => {
        return formData.name && formData.basePrice && parseFloat(formData.basePrice) > 0;
    };

    const handleSubmit = async () => {
        if (!canSubmit()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                description: formData.description || "",
                basePrice: parseFloat(formData.basePrice),
                image: formData.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
                status: "active",
            };

            const response = await api.post("/service/services", payload);

            if (response.data?.success) {
                toast({
                    title: "Success! 🎉",
                    description: "Service added successfully!",
                    variant: "default",
                });

                handleClose();
                onSuccess?.();
            } else {
                throw new Error(response.data?.message || "Failed to add service");
            }
        } catch (error: any) {
            console.error("Add service error:", error);

            toast({
                title: "Failed to Add Service",
                description: error.response?.data?.message || error.message || "Failed to add service. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Add New Service
                    </DialogTitle>
                    <p className="text-gray-600">
                        Create a new service listing for your customers
                    </p>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    {/* Service Name */}
                    <div>
                        <Label htmlFor="name">Service Name *</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="e.g., Residential Plumbing Repair"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="mt-2"
                        />
                    </div>

                    {/* Description */
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                placeholder="Describe your service, what's included, and any special features..."
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                className="mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 resize-none h-24"
                            />
                        </div>
                    }

                    {/* Base Price */}
                    <div>
                        <Label htmlFor="basePrice">Base Price (₹) *</Label>
                        <Input
                            id="basePrice"
                            type="number"
                            placeholder="500"
                            value={formData.basePrice}
                            onChange={(e) => handleInputChange("basePrice", e.target.value)}
                            className="mt-2"
                            min="0"
                            step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">Starting price for this service</p>
                    </div>

                    {/* Image URL (Optional) */}
                    <div>
                        <Label htmlFor="image">Service Image URL (Optional)</Label>
                        <Input
                            id="image"
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={formData.image}
                            onChange={(e) => handleInputChange("image", e.target.value)}
                            className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Leave empty to use default image
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit() || isSubmitting}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="inline-block animate-spin mr-2">⏳</span>
                                    Adding...
                                </>
                            ) : (
                                "Add Service"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
