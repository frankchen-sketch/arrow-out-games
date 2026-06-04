document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-play-demo]").forEach((button) => {
    button.addEventListener("click", () => {
      const placeholder = button
        .closest(".play-panel")
        ?.querySelector(".play-placeholder");

      if (!placeholder) return;

      placeholder.innerHTML = `
        <strong>Playable source goes here</strong>
        <p>
          The site structure is live and ready. Connect a verified game source or
          replace this area with a self-hosted prototype during the next build step.
        </p>
      `;
    });
  });
});
