document.addEventListener("DOMContentLoaded", () => {
  const debatePanel = document.querySelector("[data-debate-panel]");
  if (debatePanel) {
    const progress = debatePanel.querySelector("[data-progress]");
    const status = debatePanel.querySelector("[data-status-text]");
    const action = debatePanel.querySelector("[data-toggle-debate]");
    const skip = debatePanel.querySelector("[data-skip-result]");
    let running = true;
    let current = 64;

    const tick = () => {
      if (!running) return;
      current = Math.min(current + 4, 94);
      if (progress) progress.style.width = `${current}%`;
      if (status && current > 85) status.textContent = "Consensus nearing completion";
      if (current >= 94 && status) status.textContent = "Final synthesis in progress";
    };

    const timer = setInterval(tick, 2200);

    if (action) {
      action.addEventListener("click", () => {
        running = !running;
        action.textContent = running ? "Pause Debate" : "Resume Debate";
        if (status) status.textContent = running ? "Four agents actively debating" : "Debate paused for review";
      });
    }

    if (skip) {
      skip.addEventListener("click", () => {
        window.location.href = "result.html";
      });
    }

    window.addEventListener("beforeunload", () => clearInterval(timer));
  }

  const roleChecks = document.querySelectorAll("[data-role-check]");
  const roleCount = document.querySelector("[data-role-count]");
  if (roleChecks.length && roleCount) {
    const updateCount = () => {
      const total = Array.from(roleChecks).filter((item) => item.checked).length;
      roleCount.textContent = `${total} roles selected`;
    };
    roleChecks.forEach((item) => item.addEventListener("change", updateCount));
    updateCount();
  }
});
