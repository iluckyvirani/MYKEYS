// components/dashboard/UserDashboard/PaymentMethods.tsx
"use client";

import { CreditCard, Banknote, Smartphone, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const paymentMethods = [
  {
    id: "PM001",
    type: "card",
    provider: "Visa",
    lastFour: "1234",
    expiry: "12/25",
    name: "John Doe",
    isDefault: true,
    added: "2023-06-15",
  },
  {
    id: "PM002",
    type: "card",
    provider: "MasterCard",
    lastFour: "5678",
    expiry: "08/24",
    name: "John Doe",
    isDefault: false,
    added: "2023-08-20",
  },
  {
    id: "PM003",
    type: "upi",
    provider: "Google Pay",
    upiId: "john.doe@okhdfcbank",
    name: "John Doe",
    isDefault: false,
    added: "2023-10-05",
  },
  {
    id: "PM004",
    type: "netbanking",
    provider: "HDFC Bank",
    accountLastFour: "7890",
    name: "John Doe",
    isDefault: false,
    added: "2023-11-12",
  },
];

export default function PaymentMethods() {
  const [methods, setMethods] = useState(paymentMethods);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSetDefault = (id: string) => {
    setMethods(methods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const handleDelete = (id: string) => {
    if (methods.find(m => m.id === id)?.isDefault) {
      alert("Cannot delete default payment method. Please set another method as default first.");
      return;
    }
    setMethods(methods.filter(method => method.id !== id));
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "card":
        return CreditCard;
      case "upi":
        return Smartphone;
      case "netbanking":
        return Banknote;
      default:
        return CreditCard;
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods List */}
      <div className="space-y-4">
        {methods.map((method) => {
          const Icon = getMethodIcon(method.type);
          
          return (
            <div
              key={method.id}
              className="p-6 border rounded-xl hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {method.provider} {method.type === "card" ? `•••• ${method.lastFour}` : ""}
                      </h4>
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {method.type === "card" 
                        ? `Expires ${method.expiry} • ${method.name}`
                        : method.type === "upi"
                        ? `UPI ID: ${method.upiId}`
                        : `Account •••• ${method.accountLastFour}`
                      }
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Added {new Date(method.added).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Set as default</span>
                    <Switch
                      checked={method.isDefault}
                      onCheckedChange={() => handleSetDefault(method.id)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(method.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Method */}
      {showAddForm ? (
        <div className="bg-white rounded-xl border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Payment Method</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="saveCard" className="rounded" defaultChecked />
              <label htmlFor="saveCard" className="text-sm text-gray-700">
                Save this card for future payments
              </label>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowAddForm(false)} variant="outline">
                Cancel
              </Button>
              <Button>Add Payment Method</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
          onClick={() => setShowAddForm(true)}>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">Add Payment Method</div>
            <div className="text-sm text-gray-500 mt-2">Add a new credit/debit card or UPI ID</div>
          </div>
        </div>
      )}

      {/* Payment Security */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h4 className="font-semibold text-gray-900 mb-3">Payment Security</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
            <span>Your payment details are encrypted and securely stored</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
            <span>We never share your full card details with property owners</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
            <span>All transactions are PCI DSS compliant</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
            <span>You can remove payment methods anytime</span>
          </li>
        </ul>
      </div>
    </div>
  );
}