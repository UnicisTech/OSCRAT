"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { CONSTANTS } from "@/config/constants";

interface Project {
  id: number;
  name: string;
  craApplicability: string;
  craAssessment: string;
  sbomState?: string;
  vulnerabilityState?: string;
}

export default function ProjectDashboard() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch the project data from an API
    // This is a mock implementation
    if (projectId) {
      setProject({
        id: Number(projectId),
        name: `Project ${projectId}`,
        craApplicability: "<rich info>",
        craAssessment: "",
        sbomState: "",
        vulnerabilityState: "",
      });
      setLoading(false);
    }
  }, [projectId]);

  const navigateToReport = () => {
    if (project) {
      router.push(`/project-report/${project.id}`);
    }
  };

  const navigateToProjectList = () => {
    router.push("/projects");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center dark:bg-gray-900 dark:text-gray-200">
        <p>{CONSTANTS.PROJECT.LOADING_PROJECT_DETAILS}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen w-full items-center justify-center dark:bg-gray-900 dark:text-gray-200">
        <div className="text-center">
          <p className="mb-4 text-red-500 dark:text-red-400">
            {CONSTANTS.PROJECT.PROJECT_NOT_FOUND}
          </p>
          <button
            onClick={navigateToProjectList}
            className="rounded bg-blue-500 p-2 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800"
          >
            {CONSTANTS.PROJECT.BACK_TO_PROJECTS}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flex w-full justify-center dark:text-gray-200">
      <div className="w-3/4 max-w-4xl">
        {/* Project Name Header */}
        <div className="mb-8 rounded-lg border-2 bg-white p-4 text-center shadow-md dark:border-gray-600 dark:bg-gray-800">
          <h1 className="text-xl font-medium">{project.name}</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* CRA Applicability Box */}
          <div className="rounded-lg border-2 bg-white p-4 shadow-md dark:border-gray-600 dark:bg-gray-800">
            <h2 className="mb-4 text-sm font-bold uppercase">
              {CONSTANTS.CRA.CRA_APPLICABILITY}
            </h2>
            <p className="mb-4">{project.craApplicability}</p>
            <button
              onClick={navigateToReport}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {CONSTANTS.CRA.CHECK_CRA_APPLICABILITY}
            </button>
          </div>

          {/* CRA Assessment Box */}
          <div className="rounded-lg border-2 bg-white p-4 shadow-md dark:border-gray-600 dark:bg-gray-800">
            <h2 className="mb-4 text-sm font-bold uppercase">
              {CONSTANTS.CRA.CRA_ASSESSMENT}
            </h2>
            <p>{project.craAssessment || "No assessment available"}</p>
            <button
              onClick={navigateToReport}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {CONSTANTS.CRA.DO_CRA_ASSESSMENT}
            </button>
          </div>

          {/* SBOM State Box */}
          <div className="rounded-lg border-2 bg-white p-4 shadow-md dark:border-gray-600 dark:bg-gray-800">
            <h2 className="mb-4 text-sm font-bold uppercase">
              {CONSTANTS.SBOM.SBOM_STATE}
            </h2>
            <p>{project.sbomState || "No SBOM uploaded"}</p>
            <button
              onClick={navigateToReport}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {CONSTANTS.SBOM.UPLOAD_SBOM}
            </button>
          </div>

          {/* Vulnerability State Box */}
          <div className="rounded-lg border-2 bg-white p-4 shadow-md dark:border-gray-600 dark:bg-gray-800">
            <h2 className="mb-4 text-sm font-bold uppercase">
              {CONSTANTS.VULNERABILITY.VULNERABILITY_STATE}
            </h2>
            <p>{project.vulnerabilityState || "No vulnerabilities checked"}</p>
            <button
              onClick={navigateToReport}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {CONSTANTS.VULNERABILITY.CHECK_VULNERABILITIES}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
