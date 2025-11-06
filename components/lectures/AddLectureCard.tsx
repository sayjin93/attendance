"use client";
import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/16/solid";

//components
import Card from "@/components/ui/Card";
import AddLectureForm from "@/components/lectures/AddLectureForm";

//types
import { AddLectureCardProps } from "@/types";

export default function AddLectureCard({ assignments, isAdmin }: AddLectureCardProps) {
  const [showAddLectureForm, setShowAddLectureForm] = useState(false);

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlusIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Shto leksion të ri
              {showAddLectureForm && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Aktiv
                </span>
              )}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAddLectureForm(!showAddLectureForm)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showAddLectureForm ? 'Fshih' : 'Shfaq'}
          </button>
        </div>

        {showAddLectureForm && (
          <AddLectureForm
            assignments={assignments}
            isAdmin={isAdmin}
            onClose={() => setShowAddLectureForm(false)}
          />
        )}
      </div>
    </Card>
  );
}