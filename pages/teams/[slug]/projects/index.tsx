"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CONSTANTS } from "@/config/constants";

interface Project {
  id: number;
  name: string;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, name: "Project 1" },
    { id: 2, name: "Project 2" },
    { id: 3, name: "Project 3" },
  ]);
  const router = useRouter();
  const pathname = usePathname();

  const deleteProject = (id: number) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  const navigateToAddPage = () => {
    router.push(`${pathname}/new`);
  };

  const navigateToProject = (id: number) => {
    router.push(`${pathname}/${id}`);
  };
  return (
    <div className="mt-8 flex w-full justify-center">
      <div className="w-full rounded-lg border bg-white p-4 shadow-lg dark:border-gray-600 dark:bg-gray-800 md:w-2/3">
        <h1 className="mb-4 text-center text-xl font-medium dark:text-gray-100">
          {CONSTANTS.PROJECT.PROJECTS}
        </h1>

        {projects.length === 0 ? (
          <p className="py-4 text-center dark:text-gray-300">
            {CONSTANTS.PROJECT.NO_PROJECTS_FOUND}
          </p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="mb-2 flex items-center justify-between rounded border bg-gray-100 p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              <span
                className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => navigateToProject(project.id)}
              >
                {project.name}
              </span>
              <button
                onClick={() => deleteProject(project.id)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
                aria-label="Delete project"
              >
                ❌
              </button>
            </div>
          ))
        )}

        <button
          onClick={navigateToAddPage}
          className="mt-4 w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800"
        >
          {CONSTANTS.PROJECT.ADD_NEW_PROJECT}
        </button>
      </div>
    </div>
  );
}
