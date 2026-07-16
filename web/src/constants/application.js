/** @typedef {'saved' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn'} ApplicationStatus */
/** @typedef {'onsite' | 'hybrid' | 'remote' | 'unknown'} WorkMode */
/** @typedef {'full-time' | 'part-time' | 'contract' | 'internship' | 'graduate' | 'unknown'} EmploymentType */

export const APPLICATION_STATUSES = Object.freeze([
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
]);

export const WORK_MODES = Object.freeze([
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
  { value: "unknown", label: "Unknown" },
]);

export const EMPLOYMENT_TYPES = Object.freeze([
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "graduate", label: "Graduate" },
  { value: "unknown", label: "Unknown" },
]);

export const APPLICATION_STATUS_VALUES = Object.freeze(
  APPLICATION_STATUSES.map(({ value }) => value),
);

export const DEFAULT_APPLICATION_STATUS = "applied";
export const DEFAULT_WORK_MODE = "unknown";
export const DEFAULT_EMPLOYMENT_TYPE = "unknown";

