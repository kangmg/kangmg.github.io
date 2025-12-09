document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "theme-toggle";
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    toggleBtn.setAttribute("aria-label", "Toggle Dark Mode");

    // Insert button into masthead
    const searchToggle = document.querySelector(".search__toggle");
    if (searchToggle) {
        searchToggle.parentNode.insertBefore(toggleBtn, searchToggle);
    } else {
        // Fallback if search is disabled
        const nav = document.querySelector(".greedy-nav");
        if (nav) nav.appendChild(toggleBtn);
    }

    // Check preference
    const currentTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (currentTheme === "dark" || (!currentTheme && systemPrefersDark)) {
        document.body.classList.add("dark");
        toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Toggle logic
    toggleBtn.addEventListener("click", function () {
        document.body.classList.toggle("dark");
        let theme = "light";
        if (document.body.classList.contains("dark")) {
            theme = "dark";
            toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
        localStorage.setItem("theme", theme);
    });
});
