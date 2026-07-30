import { CohortValue, ComparisonCohort } from "./api";

export type CohortFields = {
  model_id: string;
  gpu_type: string;
} & ComparisonCohort;

function cohortValue(value: CohortValue) {
  if (value === null || value === undefined || value === "") {
    return "legacy";
  }
  return String(value);
}

function shortCohortValue(value: CohortValue) {
  const text = cohortValue(value);
  if (text === "legacy" || text.length <= 14) {
    return text;
  }
  return text.slice(0, 12);
}

function hasCompleteV2Identity(cohort: CohortFields) {
  return (
    cohortValue(cohort.workload_id) !== "legacy" &&
    cohortValue(cohort.variant_id) !== "legacy" &&
    cohortValue(cohort.benchmark_version) !== "legacy" &&
    cohortValue(cohort.recipe_fingerprint) !== "legacy" &&
    cohortValue(cohort.hardware_profile_id) !== "legacy" &&
    cohortValue(cohort.software_profile_id) !== "legacy"
  );
}

export function cohortKey(cohort: CohortFields) {
  if (hasCompleteV2Identity(cohort)) {
    return [
      "v2",
      cohortValue(cohort.workload_id),
      cohortValue(cohort.variant_id),
      cohortValue(cohort.benchmark_version),
      cohortValue(cohort.recipe_fingerprint),
      cohortValue(cohort.hardware_profile_id),
      cohortValue(cohort.software_profile_id)
    ].join("|");
  }
  return [
    "legacy",
    cohort.model_id || "unknown",
    cohort.gpu_type || "unknown",
    cohortValue(cohort.workload_id),
    cohortValue(cohort.variant_id),
    cohortValue(cohort.benchmark_version),
    cohortValue(cohort.recipe_fingerprint),
    cohortValue(cohort.hardware_profile_id),
    cohortValue(cohort.software_profile_id)
  ].join("|");
}

export function cohortTitle(cohort: CohortFields) {
  if (!hasCompleteV2Identity(cohort)) {
    return `${cohort.model_id} · legacy`;
  }
  const workload = cohortValue(cohort.workload_id);
  const variant = cohortValue(cohort.variant_id);
  const version = cohortValue(cohort.benchmark_version);
  const versionLabel = version === "legacy" ? version : `v${version}`;
  return `${workload} ${variant} · ${versionLabel}`;
}

export function hardwareSoftwareDetail(cohort: CohortFields) {
  const parts: string[] = [];
  
  if (cohort.hardware_profile) {
    const hw = cohort.hardware_profile;
    const gpuCount = hw.gpu_count;
    if (gpuCount) {
      parts.push(`${gpuCount}× ${cohort.gpu_type}`);
    } else {
      parts.push(cohort.gpu_type);
    }
  } else {
    parts.push(cohort.gpu_type);
  }

  if (cohort.software_profile) {
    const sw = cohort.software_profile;
    if (sw.cuda) {
      parts.push(`CUDA ${sw.cuda}`);
    }
    if (sw.pytorch) {
      parts.push(`PyTorch ${sw.pytorch}`);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : cohort.gpu_type;
}

export function cohortDetail(cohort: CohortFields) {
  return [
    hasCompleteV2Identity(cohort) ? `hw-${shortCohortValue(cohort.hardware_profile_id)}` : "",
    hasCompleteV2Identity(cohort) ? `sw-${shortCohortValue(cohort.software_profile_id)}` : "",
    `recipe-${shortCohortValue(cohort.recipe_fingerprint)}`
  ].filter(Boolean).join(" · ");
}
