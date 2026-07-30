import { expect, test } from "vitest";
import { cohortKey, cohortTitle, hardwareSoftwareDetail, cohortDetail, CohortFields } from "./cohort";

test("legacy cohort key", () => {
  const cohort: CohortFields = {
    model_id: "wan-1.3b",
    gpu_type: "NVIDIA L40S",
    workload_id: null,
    variant_id: null,
    benchmark_version: null,
    recipe_fingerprint: null,
    hardware_profile_id: null,
    software_profile_id: null,
  };
  expect(cohortKey(cohort)).toBe("legacy|wan-1.3b|NVIDIA L40S|legacy|legacy|legacy|legacy|legacy|legacy");
  expect(cohortTitle(cohort)).toBe("wan-1.3b · legacy");
  expect(hardwareSoftwareDetail(cohort)).toBe("NVIDIA L40S");
});

test("v2 cohort key excludes model and gpu", () => {
  const cohort: CohortFields = {
    model_id: "wan-1.3b-new-name",
    gpu_type: "NVIDIA L40S",
    workload_id: "wan-t2v",
    variant_id: "1.3b-sp2",
    benchmark_version: 2,
    recipe_fingerprint: "recipe-abc",
    hardware_profile_id: "hw-l40s",
    software_profile_id: "sw-cu126",
    hardware_profile: { gpu_count: 2 },
    software_profile: { cuda: "12.6", pytorch: "2.5" }
  };
  expect(cohortKey(cohort)).toBe("v2|wan-t2v|1.3b-sp2|2|recipe-abc|hw-l40s|sw-cu126");
  expect(cohortTitle(cohort)).toBe("wan-t2v 1.3b-sp2 · v2");
  expect(hardwareSoftwareDetail(cohort)).toBe("2× NVIDIA L40S · CUDA 12.6 · PyTorch 2.5");
  expect(cohortDetail(cohort)).toBe("hw-hw-l40s · sw-sw-cu126 · recipe-recipe-abc");
});
