"use client";
import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/16/solid";

//components
import Card from "@/components/ui/Card";
import AddAssignmentForm from "@/components/assignments/AddAssignmentForm";

//types
import { Professor, Subject, Class, Program, TeachingType } from "@/types";

interface AddAssignmentCardProps {
  isAdmin: string;
  professors: Professor[];
  subjects: Subject[];
  classes: Class[];
  programs: Program[];
  teachingTypes: TeachingType[];
}

export default function AddAssignmentCard({ 
  isAdmin, 
  professors, 
  subjects, 
  classes, 
  programs, 
  teachingTypes 
}: AddAssignmentCardProps) {
  const [showAddAssignmentForm, setShowAddAssignmentForm] = useState(false);

  // Only show for admins
  if (isAdmin !== "true") {
    return null;
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlusIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Shto caktim të ri
              {showAddAssignmentForm && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Aktiv
                </span>
              )}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAddAssignmentForm(!showAddAssignmentForm)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showAddAssignmentForm ? 'Fshih' : 'Shfaq'}
          </button>
        </div>

        {showAddAssignmentForm && (
          <AddAssignmentForm
            isAdmin={isAdmin}
            professors={professors}
            subjects={subjects}
            classes={classes}
            programs={programs}
            teachingTypes={teachingTypes}
          />
        )}
      </div>
    </Card>
  );
}