// Minimal browser test runner. Test files call test(); tests/index.html calls run().
const tests = [];
const loadErrors = [];

export function test(name, fn) {
  tests.push({ name, fn });
}

export function eq(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label ? label + ': ' : ''}expected ${e}, got ${a}`);
}

export function ok(cond, label) {
  if (!cond) throw new Error(label ? `not ok: ${label}` : 'not ok');
}

export function loadFailed(file, error) {
  loadErrors.push(`${file} failed to load: ${error && error.message ? error.message : error}`);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

export async function run() {
  const failures = [...loadErrors];
  let passed = 0;
  for (const t of tests) {
    try {
      await t.fn();
      passed += 1;
    } catch (error) {
      failures.push(`${t.name}: ${error && error.message ? error.message : error}`);
    }
  }
  const results = { passed, failed: failures.length, failures };
  window.__results = results;
  const el = document.getElementById('results');
  if (el) {
    el.innerHTML = `<p>${passed} passed, ${failures.length} failed</p><ul>`
      + failures.map((f) => `<li class="fail">${escapeHtml(f)}</li>`).join('') + '</ul>';
    el.dataset.passed = String(passed);
    el.dataset.failed = String(failures.length);
  }
  // Opened with ?report: send the results to tools/serve.py so tools/check_results.py can read them.
  if (new URLSearchParams(location.search).has('report')) {
    try {
      await fetch('/__report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: location.pathname, ...results }),
      });
    } catch (error) {
      // No dev server to report to; the page itself still shows the results.
    }
  }
  return results;
}
