/**
 * Test Record Tracker
 * Keeps an explicit set of ObjectIds created during test execution.
 * Ensures cleanup is strictly limited to test-owned records.
 */

const trackedProjectIds = new Set();
const trackedTaskIds = new Set();

function trackProject(id) {
  if (id) trackedProjectIds.add(String(id));
}

function trackTask(id) {
  if (id) trackedTaskIds.add(String(id));
}

function getTrackedProjectIds() {
  return Array.from(trackedProjectIds);
}

function getTrackedTaskIds() {
  return Array.from(trackedTaskIds);
}

function clearTrackers() {
  trackedProjectIds.clear();
  trackedTaskIds.clear();
}

module.exports = {
  trackProject,
  trackTask,
  getTrackedProjectIds,
  getTrackedTaskIds,
  clearTrackers
};

