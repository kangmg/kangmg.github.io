document.addEventListener("DOMContentLoaded", function () {
    const repo = "kangmg/kangmg.github.io"; // Hardcoded for now, or could be injected via Liquid if this was a .js file processed by Jekyll
    const container = document.getElementById("shortlog-feed");

    fetch(`https://api.github.com/repos/${repo}/issues?labels=shortlog&state=open&sort=created&direction=desc`)
        .then(response => response.json())
        .then(data => {
            container.innerHTML = "";
            if (data.length === 0) {
                container.innerHTML = "<p>No ShortLogs yet.</p>";
                return;
            }

            // Function to render a single card (issue or comment)
            function createCard(author, dateStr, bodyContent, avatarUrl, htmlUrl, isReply = false) {
                const card = document.createElement("div");
                card.className = isReply ? "shortlog-card reply" : "shortlog-card";
                card.style.border = isReply ? "none" : "1px solid #e2e8f0";
                if (isReply) {
                    card.style.borderLeft = "2px solid #cbd5e1";
                    card.style.paddingLeft = "16px";
                    card.style.marginLeft = "20px";
                    card.style.marginTop = "10px";
                } else {
                    card.style.borderRadius = "8px";
                    card.style.padding = "16px";
                    card.style.marginBottom = "16px";
                    card.style.backgroundColor = "#fff";
                }

                const htmlContent = DOMPurify.sanitize(marked.parse(bodyContent));

                card.innerHTML = `
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <img src="${avatarUrl}" alt="${author}" style="width: ${isReply ? '24px' : '32px'}; height: ${isReply ? '24px' : '32px'}; border-radius: 50%; margin-right: 10px;">
            <div>
              <strong style="font-size: ${isReply ? '0.85em' : '0.9em'};">${author}</strong>
              <span style="color: #64748b; font-size: 0.8em; margin-left: 5px;">• ${dateStr}</span>
            </div>
            <a href="${htmlUrl}" target="_blank" style="margin-left: auto; color: #64748b; font-size: 0.8em;">
              <i class="fab fa-github"></i>
            </a>
          </div>
        `;

                const body = `<div class="shortlog-body" style="font-size: 0.95em; line-height: 1.6;">${htmlContent}</div>`;
                card.innerHTML += body;
                return card;
            }

            // Process each issue
            const processIssues = async () => {
                // Filter issues by author (only show issues created by the repo owner)
                // Note: Replace 'kangmg' with your actual GitHub username if different
                const repoOwner = "kangmg";
                const filteredData = data.filter(issue => issue.user.login === repoOwner);

                if (filteredData.length === 0) {
                    container.innerHTML = "<p>No ShortLogs yet.</p>";
                    return;
                }

                for (const issue of filteredData) {
                    const date = new Date(issue.created_at).toLocaleDateString("en-US", {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    // Main Issue Card
                    const issueCard = createCard(issue.user.login, date, issue.body || "", issue.user.avatar_url, issue.html_url);
                    container.appendChild(issueCard);

                    // If there are comments, fetch and render them as replies
                    if (issue.comments > 0) {
                        try {
                            const commentsRes = await fetch(issue.comments_url);
                            const commentsData = await commentsRes.json();

                            commentsData.forEach(comment => {
                                // Optional: Filter comments by author too if you only want your own replies to be visible
                                // if (comment.user.login !== repoOwner) return;

                                const commentDate = new Date(comment.created_at).toLocaleDateString("en-US", {
                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                });
                                const replyCard = createCard(comment.user.login, commentDate, comment.body || "", comment.user.avatar_url, comment.html_url, true);
                                container.appendChild(replyCard);
                            });
                        } catch (err) {
                            console.error("Error fetching comments for issue " + issue.number, err);
                        }
                    }
                }
            };

            processIssues();

        })
        .catch(error => {
            console.error("Error fetching ShortLogs:", error);
            container.innerHTML = "<p style='color: red;'>Failed to load ShortLogs. Please try again later.</p>";
        });
});
