import { useState } from "react";
import type { LLMAccount } from "../types";
import { AccountForm } from "./AccountForm";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface AccountManagerProps {
  accounts: LLMAccount[];
  onAdd: (account: Omit<LLMAccount, "id" | "createdAt">) => void;
  onUpdate: (id: string, account: Partial<LLMAccount>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function AccountManager({
  accounts,
  onAdd,
  onUpdate,
  onDelete,
  onToggleActive,
}: AccountManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<LLMAccount | null>(null);

  const handleSave = (account: Omit<LLMAccount, "id" | "createdAt">) => {
    if (editingAccount) {
      onUpdate(editingAccount.id, account);
    } else {
      onAdd(account);
    }
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleEdit = (account: LLMAccount) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  if (showForm) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editingAccount ? "Edit Account" : "Add New Account"}
        </h3>
        <AccountForm
          account={editingAccount || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">LLM Accounts</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No accounts configured</p>
          <p className="text-sm">Add an LLM account to start translating</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`p-4 rounded-lg border ${
                account.isActive
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-800">{account.name}</h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        account.isActive
                          ? "bg-green-200 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {account.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {account.baseUrl}
                  </p>
                  <p className="text-sm text-gray-500">
                    Model: {account.model}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleActive(account.id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title={account.isActive ? "Deactivate" : "Activate"}
                  >
                    {account.isActive ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(account)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(account.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
