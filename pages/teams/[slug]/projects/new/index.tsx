"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONSTANTS } from "@/config/constants";

export default function AddProject() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleCreate = () => {
    if (!name.trim()) return;

    // Mock adding to DB (Replace this with actual API call later)
    console.log("Adding project:", name);

    // Redirect back to project list
    router.push("/");
  };

  return (
    <div className="mt-10 flex w-full justify-center">
      <div className="w-full rounded-lg border bg-white p-6 shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 md:w-1/3">
        <h2 className="mb-4 text-xl font-medium dark:text-gray-100">
          {CONSTANTS.PROJECT.ADD_NEW_PROJECT}
        </h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
        />
        <button
          onClick={handleCreate}
          className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800"
        >
          {CONSTANTS.PROJECT.CREATE}
        </button>
      </div>
    </div>
  );
}
