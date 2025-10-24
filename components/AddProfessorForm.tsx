import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

export default function AddProfessorForm() {
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

  //#region mutations
  const mutation = useMutation({
    mutationFn: async () => {
      // Validate form data
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !username.trim() || !password.trim()) {
        throw new Error("Të gjitha fushat janë të detyrueshme!");
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error("Formati i email-it nuk është i saktë!");
      }

      // Password validation (minimum 6 characters)
      if (password.trim().length < 6) {
        throw new Error("Fjalëkalimi duhet të ketë së paku 6 karaktere!");
      }

      const res = await fetch("/api/professors", {
        method: "POST",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          username: username.trim().toLowerCase(),
          password: password.trim()
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Dështoi krijimi i profesorit!");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      showMessage("Profesori u krijua me sukses! Një email me të dhënat e hyrjes është dërguar.", "success");
      
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setUsername("");
      setPassword("");
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
      <h3 className="text-lg font-medium text-gray-900">Shto Profesor të Ri</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            Emri *
          </label>
          <input
            type="text"
            id="firstName"
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
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Mbiemri *
          </label>
          <input
            type="text"
            id="lastName"
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
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
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
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username *
          </label>
          <input
            type="text"
            id="username"
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
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Fjalëkalimi * (së paku 6 karaktere)
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Shkruani fjalëkalimin..."
          disabled={mutation.isPending}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Duke shtuar..." : "Shto Profesor"}
        </button>
      </div>
    </form>
  );
}