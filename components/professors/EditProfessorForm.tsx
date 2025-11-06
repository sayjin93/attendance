import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

//types
import { EditProfessorFormProps } from "@/types";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

export default function EditProfessorForm({ professor, onClose }: EditProfessorFormProps) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  //#endregion

  //#region effects
  useEffect(() => {
    if (professor) {
      setFirstName(professor.firstName);
      setLastName(professor.lastName);
      setEmail(professor.email);
      setUsername(professor.username);
      setPassword(""); // Don't pre-fill password
    }
  }, [professor]);
  //#endregion

  //#region mutations
  const mutation = useMutation({
    mutationFn: async () => {
      // Validate form data
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !username.trim()) {
        throw new Error("Emri, mbiemri, email dhe username janë të detyrueshëm!");
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error("Formati i email-it nuk është i saktë!");
      }

      // Password validation (only if provided)
      if (password.trim() && password.trim().length < 6) {
        throw new Error("Fjalëkalimi duhet të ketë së paku 6 karaktere!");
      }

      const updateData: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        username: string;
        password?: string;
      } = {
        id: professor.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase()
      };

      // Only include password if it's provided
      if (password.trim()) {
        updateData.password = password.trim();
      }

      const res = await fetch("/api/professors", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Dështoi përditësimi i profesorit!");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      showMessage("Profesori u përditësua me sukses!", "success");
      onClose();
    },
    onError: (error: Error) => {
      showMessage(error.message, "error");
    },
  });
  //#endregion

  //#region functions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };
  //#endregion

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Modifiko Profesor</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="editFirstName"
            className="block text-sm font-medium text-gray-700"
          >
            Emri *
          </label>
          <input
            type="text"
            id="editFirstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Shkruani emrin..."
            disabled={mutation.isPending}
          />
        </div>

        <div>
          <label
            htmlFor="editLastName"
            className="block text-sm font-medium text-gray-700"
          >
            Mbiemri *
          </label>
          <input
            type="text"
            id="editLastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Shkruani mbiemrin..."
            disabled={mutation.isPending}
          />
        </div>

        <div>
          <label
            htmlFor="editEmail"
            className="block text-sm font-medium text-gray-700"
          >
            Email *
          </label>
          <input
            type="email"
            id="editEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Shkruani email-in..."
            disabled={mutation.isPending}
          />
        </div>

        <div>
          <label
            htmlFor="editUsername"
            className="block text-sm font-medium text-gray-700"
          >
            Username *
          </label>
          <input
            type="text"
            id="editUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Shkruani username-in..."
            disabled={mutation.isPending}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="editPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Fjalëkalimi i ri (opsional, së paku 6 karaktere)
        </label>
        <input
          type="password"
          id="editPassword"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Lini bosh për ta mbajtur fjalëkalimin aktual..."
          disabled={mutation.isPending}
        />
        <p className="mt-1 text-xs text-gray-500">
          Lini bosh nëse nuk dëshironi ta ndryshoni fjalëkalimin
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={mutation.isPending}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anulo
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Duke përditësuar..." : "Përditëso"}
        </button>
      </div>
    </form>
  );
}