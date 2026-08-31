import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
// ================= EMAILJS =================

emailjs.init({
    publicKey: "yOKbwswIx8pfCLSG0"
});
// ================= MOBILE MENU =================

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("show");
});


// Close menu after clicking a link

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("show");

    });

});


// ================= ACTIVE NAVIGATION =================

const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.clientHeight;

        if (
            scrollY >= sectionTop &&
            scrollY < sectionTop + sectionHeight
        ) {
            current = section.getAttribute("id");
        }

    });

    navItems.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }

    });

});


// ================= CONTACT FORM - EMAILJS =================

const form = document.querySelector(".contact-form");

if (form) {

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const button = form.querySelector("button[type='submit']");
        const originalText = button.innerHTML;

        button.disabled = true;
        button.innerHTML = "Sending...";

        try {

            await emailjs.sendForm(
                "service_q16l1sf",
                "template_r12j6m7",
                form
            );

         form.reset();

const successMessage = document.createElement("p");
successMessage.textContent = "✓ Message sent successfully! I'll get back to you soon.";
successMessage.className = "form-success";

form.appendChild(successMessage);

setTimeout(() => {
    successMessage.remove();
}, 5000);   

        } catch (error) {

            console.error("EmailJS Error:", error);

            alert("Message failed to send. Please try again.");

        } finally {

            button.disabled = false;
            button.innerHTML = originalText;

        }

    });

}
// =====================================================
//              DYNAMIC FIREBASE SKILLS
// =====================================================



const dynamicSkillsContainer =
    document.getElementById("dynamicSkillsContainer");


// ================= CATEGORY ICON =================

function getCategoryIcon(category) {

    const name = category.toLowerCase();

    if (
        name.includes("program")
        || name.includes("language")
    ) {
        return "fa-code";
    }

    if (
        name.includes("frontend")
        || name.includes("web")
    ) {
        return "fa-laptop-code";
    }

    if (
        name.includes("backend")
        || name.includes("server")
    ) {
        return "fa-server";
    }

    if (
        name.includes("database")
        || name.includes("sql")
    ) {
        return "fa-database";
    }

    if (
        name.includes("framework")
    ) {
        return "fa-layer-group";
    }

    if (
        name.includes("tool")
        || name.includes("technology")
    ) {
        return "fa-screwdriver-wrench";
    }

    if (
        name.includes("ai")
        || name.includes("machine")
    ) {
        return "fa-brain";
    }

    if (
        name.includes("cloud")
       ) {
         return "fa-cloud";
     }


     return "fa-code";

}


// ================= SAFE HTML =================

function escapeSkillHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;

}

// ================= LOAD SKILLS =================

async function loadPortfolioSkills() {

    if (!dynamicSkillsContainer) {
        return;
    }

    try {

        const snapshot =
            await getDocs(
                collection(db, "skills")
            );

        const skills = [];

        snapshot.forEach(skillDoc => {

            const data = skillDoc.data();

            skills.push({

                id: skillDoc.id,

                name:
                    data.name || "Skill",

                category:
                    data.category || "Other",

                percentage:
                    Math.max(
                        0,
                        Math.min(
                            100,
                            Number(
                                data.percentage
                            ) || 0
                        )
                    )

            });

        });


        // ================= EMPTY =================

        if (skills.length === 0) {

            dynamicSkillsContainer.innerHTML = `

                <div class="skills-empty">

                    <i class="fas fa-code"></i>

                    <h3>
                        Skills coming soon
                    </h3>

                    <p>
                        Skills will appear here once they
                        are added from the dashboard.
                    </p>

                </div>

            `;

            return;
        }


        // ================= GROUP BY CATEGORY =================

        const groupedSkills = {};


        skills.forEach(skill => {

            if (
                !groupedSkills[
                    skill.category
                ]
            ) {

                groupedSkills[
                    skill.category
                ] = [];

            }


            groupedSkills[
                skill.category
            ].push(skill);

        });


        dynamicSkillsContainer.innerHTML = "";


        // ================= CREATE CATEGORY CARDS =================

        Object.entries(
            groupedSkills
        ).forEach(
            ([category, categorySkills]) => {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "skill-category-card";


                const icon =
                    getCategoryIcon(
                        category
                    );


                const visibleSkills =
                    categorySkills.slice(
                        0,
                        3
                    );


                const hiddenSkills =
                    categorySkills.slice(
                        3
                    );


                // ================= TECHNOLOGY PILLS =================

                const pills =
                    categorySkills
                        .map(skill => {

                            return `

                                <span class="skill-pill">

                                    ${escapeSkillHTML(
                                        skill.name
                                    )}

                                </span>

                            `;

                        })
                        .join("");


                // ================= SKILL ROWS =================

                const skillRows =
                    categorySkills
                        .map(
                            (
                                skill,
                                index
                            ) => {

                                const hiddenClass =
                                    index >= 3
                                        ? "extra-skill"
                                        : "";


                                return `

                                    <div
                                        class="
                                            portfolio-skill-row
                                            ${hiddenClass}
                                        "
                                    >

                                        <div class="skill-row-top">

                                            <span>
                                                ${escapeSkillHTML(
                                                    skill.name
                                                )}
                                            </span>


                                            <strong>
                                                ${skill.percentage}%
                                            </strong>

                                        </div>


                                        <div class="portfolio-progress">

                                            <div
                                                class="portfolio-progress-bar"
                                                data-width="${skill.percentage}"
                                            ></div>

                                        </div>

                                    </div>

                                `;

                            }
                        )
                        .join("");


                // ================= SHOW MORE BUTTON =================

                const moreButton =
                    hiddenSkills.length > 0
                        ? `

                            <button
                                type="button"
                                class="skill-more-btn"
                                aria-expanded="false"
                            >

                                <span>
                                    Show More
                                </span>

                                <i class="fas fa-chevron-down"></i>

                            </button>

                        `
                        : "";


                // ================= CARD HTML =================

                card.innerHTML = `

                    <div class="skill-card-header">

                        <div class="skill-category-icon">

                            <i class="fas ${icon}"></i>

                        </div>


                        <div>

                            <h3>
                                ${escapeSkillHTML(
                                    category
                                )}
                            </h3>


                            <span class="skill-count">

                                ${categorySkills.length}

                                ${
                                    categorySkills.length === 1
                                        ? "skill"
                                        : "skills"
                                }

                            </span>

                        </div>

                    </div>


                    <div class="skill-pills">

                        ${pills}

                    </div>


                    <div class="portfolio-skills-list">

                        ${skillRows}

                    </div>


                    ${moreButton}

                `;


                dynamicSkillsContainer.appendChild(
                    card
                );


                // ================= MORE BUTTON =================

                const moreBtn =
                    card.querySelector(
                        ".skill-more-btn"
                    );


                if (moreBtn) {

                    moreBtn.addEventListener(
                        "click",
                        () => {

                            const expanded =
                                card.classList.toggle(
                                    "skills-expanded"
                                );


                            moreBtn.setAttribute(
                                "aria-expanded",
                                expanded
                            );


                            const text =
                                moreBtn.querySelector(
                                    "span"
                                );


                            const arrow =
                                moreBtn.querySelector(
                                    "i"
                                );


                            if (expanded) {

                                text.textContent =
                                    "Show Less";


                                arrow.className =
                                    "fas fa-chevron-up";

                            } else {

                                text.textContent =
                                    "Show More";


                                arrow.className =
                                    "fas fa-chevron-down";

                            }

                        }
                    );

                }


                // ================= PROGRESS ANIMATION =================
               // ================= SKILLS SCROLL ANIMATION =================

function animateSkillBars() {

    const bars = document.querySelectorAll(
        ".portfolio-progress-bar"
    );

    bars.forEach(bar => {

        const target =
            parseInt(bar.dataset.width || "0", 10);

        // Start from 0
        bar.style.width = "0%";

        const startTime = performance.now();
        const duration = 1500;

        function animate(currentTime) {

            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            const eased =
                1 - Math.pow(1 - progress, 3);

            const current =
                Math.round(target * eased);

            bar.style.width =
                current + "%";

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                bar.style.width =
                    target + "%";
            }
        }

        requestAnimationFrame(animate);
    });
}


// ================= SKILLS SECTION OBSERVER =================

const skillsSection =
    document.getElementById("skills");

if (skillsSection) {

    const skillsObserver =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        animateSkillBars();

                    } else {

                        // Reset when leaving Skills
                        const bars =
                            document.querySelectorAll(
                                ".portfolio-progress-bar"
                            );

                        bars.forEach(bar => {
                            bar.style.width = "0%";
                        });
                    }

                });

            },
            {
                threshold: 0.25
            }
        );

    skillsObserver.observe(skillsSection);
}
            }
        );


    } catch (error) {

        console.error(
            "Portfolio skills error:",
            error
        );


        dynamicSkillsContainer.innerHTML = `

            <div class="skills-error">

                <i class="fas fa-triangle-exclamation"></i>

                <h3>
                    Unable to load skills
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}



// ================= START =================

loadPortfolioSkills();


// =====================================================
//              LOAD PROJECTS TO INDEX PAGE
// =====================================================

async function loadPublicProjects() {

    const container =
        document.getElementById(
            "projectsContainer"
        );


    if (!container) return;


    try {

        const projectsCollection =
            collection(
                db,
                "projects"
            );


        const projectsQuery =
            query(
                projectsCollection,
                orderBy(
                    "createdAt",
                    "asc"
                )
            );


        const snapshot =
            await getDocs(
                projectsQuery
            );


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML = `

                <div class="project-loading">

                    <i class="fas fa-folder-open"></i>

                    <p>
                        No projects available.
                    </p>

                </div>

            `;

            return;
        }


        const projects = [];


        snapshot.forEach(
            projectDoc => {

                projects.push({

                    id: projectDoc.id,

                    ...projectDoc.data()

                });

            }
        );


        // ==========================================
        // SHOW FIRST 3 PROJECTS
        // ==========================================

        projects.forEach(
            (project, index) => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "public-project-card";
                const projectGlowColors = [
                    "project-blue",
                    "project-red",
                    "project-pink",
                    "project-green",
                    "project-violet",
                    "project-orange",
                  
                ];

card.classList.add(
    projectGlowColors[
        index % projectGlowColors.length
    ]
);
                


                if (index >= 3) {

                    card.classList.add(
                        "project-hidden"
                    );

                }


                const technologies =
                    Array.isArray(
                        project.technologies
                    )
                        ? project.technologies
                        : [];


                const tags =
                    technologies
                        .map(
                            tech => `

                                <span>
                                    ${escapeSkillHTML(
                                        tech
                                    )}
                                </span>

                            `
                        )
                        .join("");


                const image =
                    project.image || "";


                card.innerHTML = `

                    <div class="public-project-image">

                        ${
                            image
                                ? `

                                    <img
                                        src="${escapeSkillHTML(
                                            image
                                        )}"
                                        alt="${escapeSkillHTML(
                                            project.title ||
                                            "Project"
                                        )}"
                                        loading="lazy"
                                    >

                                  `
                                : `

                                    <div class="public-project-placeholder">

                                        <i class="fas fa-laptop-code"></i>

                                    </div>

                                  `
                        }

                    </div>


                    <div class="public-project-content">

                        <h3>
                            ${escapeSkillHTML(
                                project.title ||
                                "Untitled Project"
                            )}
                        </h3>


                        <p>
                            ${escapeSkillHTML(
                                project.description ||
                                ""
                            )}
                        </p>


                        <div class="public-project-tech">

                            ${tags}

                        </div>


                        <div class="public-project-links">

                            ${
                                project.github
                                    ? `

                                        <a
                                            href="${escapeSkillHTML(
                                                project.github
                                            )}"
                                            target="_blank"
                                            rel="noopener noreferrer">

                                            <i class="fab fa-github"></i>

                                            GitHub

                                        </a>

                                      `
                                    : ""
                            }


                            ${
                                project.liveDemo
                                    ? `

                                        <a
                                            href="${escapeSkillHTML(
                                                project.liveDemo
                                            )}"
                                            target="_blank"
                                            rel="noopener noreferrer">

                                            <i class="fas fa-arrow-up-right-from-square"></i>

                                            Live Demo

                                        </a>

                                      `
                                    : ""
                            }

                        </div>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );


        // ==========================================
        // SHOW MORE BUTTON
        // ==========================================

        const moreWrap =
            document.getElementById(
                "projectsMoreWrap"
            );


        const moreBtn =
            document.getElementById(
                "projectsMoreBtn"
            );


        if (
            projects.length > 3 &&
            moreWrap &&
            moreBtn
        ) {

            moreWrap.style.display =
                "flex";


            moreBtn.onclick =
                function () {

                    const hiddenProjects =
                        document.querySelectorAll(
                            ".project-hidden"
                        );


                    const isExpanded =
                        moreBtn.classList.contains(
                            "expanded"
                        );


                    hiddenProjects.forEach(
                        project => {

                            project.style.display =
                                isExpanded
                                    ? "none"
                                    : "block";

                        }
                    );


                    moreBtn.classList.toggle(
                        "expanded"
                    );


                    if (
                        moreBtn.classList.contains(
                            "expanded"
                        )
                    ) {

                        moreBtn.innerHTML = `

                            Show Less

                            <i class="fas fa-chevron-up"></i>

                        `;

                    } else {

                        moreBtn.innerHTML = `

                            Show More

                            <i class="fas fa-chevron-down"></i>

                        `;

                    }

                };

        }
// =====================================================
//              END PROJECT LOADING
// =====================================================

    } catch (error) {

        console.error(
            "Public projects loading error:",
            error
        );


        container.innerHTML = `

            <div class="project-loading">

                <i class="fas fa-triangle-exclamation"></i>

                <p>
                    Unable to load projects.
                </p>

            </div>

        `;

    }

}


// =====================================================
//              START PROJECT LOADING
// =====================================================

loadPublicProjects();


// =====================================================
//           CERTIFICATE ICON SELECTOR
// =====================================================

function getCertificateIcon(
    title = "",
    organization = ""
) {

    const text =
        `${title} ${organization}`.toLowerCase();


    if (text.includes("nptel")) {
        return "fas fa-graduation-cap";
    }

    if (
        text.includes("internship") ||
        text.includes("intern")
    ) {
        return "fas fa-briefcase";
    }

    if (
        text.includes("programming") ||
        text.includes("coding")
    ) {
        return "fas fa-code";
    }

    if (text.includes("hackathon")) {
        return "fas fa-trophy";
    }

    if (text.includes("workshop")) {
        return "fas fa-screwdriver-wrench";
    }

    if (text.includes("cloud")) {
        return "fas fa-cloud";
    }

    if (
        text.includes("ai") ||
        text.includes("machine learning") ||
        text.includes("ml")
    ) {
        return "fas fa-robot";
    }

    if (text.includes("data science")) {
        return "fas fa-chart-column";
    }

    if (
        text.includes("web development") ||
        text.includes("web")
    ) {
        return "fas fa-globe";
    }

    if (
        text.includes("cyber") ||
        text.includes("security")
    ) {
        return "fas fa-shield-halved";
    }

    if (
        text.includes("database") ||
        text.includes("sql")
    ) {
        return "fas fa-database";
    }

    if (text.includes("java")) {
        return "fas fa-mug-hot";
    }

    if (text.includes("python")) {
        return "fab fa-python";
    }

    if (text.includes("microsoft")) {
        return "fab fa-microsoft";
    }

    if (text.includes("google")) {
        return "fab fa-google";
    }

    if (text.includes("aws")) {
        return "fab fa-aws";
    }

    if (text.includes("leadership")) {
        return "fas fa-crown";
    }

    if (
        text.includes("achievement") ||
        text.includes("award")
    ) {
        return "fas fa-medal";
    }

    if (text.includes("competition")) {
        return "fas fa-award";
    }

    return "fas fa-certificate";
}


// =====================================================
//           LOAD PUBLIC CERTIFICATES
// =====================================================

async function loadPublicCertificates() {

    const container =
        document.getElementById(
            "certificateGrid"
        );

    if (!container) return;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "certificates"
                )
            );


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML = `

                <div class="project-loading">

                    <i class="fas fa-certificate"></i>

                    <p>
                        No certificates available.
                    </p>

                </div>

            `;

            return;
        }


        const certificates = [];


        snapshot.forEach(
            certificateDoc => {

                certificates.push({

                    id: certificateDoc.id,

                    ...certificateDoc.data()

                });

            }
        );


        certificates.forEach(
            (certificate, index) => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "public-certificate-card";
                const certificateGlowColors = [
                   "certificate-blue",
                   "certificate-red",
                   "certificate-pink",
                   "certificate-green",
                   "certificate-violet",
                   "certificate-orange",
                   "certificate-deeppink",
                   "certificate-cyan",
                   "certificate-yellow"
                   
               ];


card.classList.add(
    certificateGlowColors[
        index %
        certificateGlowColors.length
    ]
);
                


                if (index >= 3) {

                    card.classList.add(
                        "certificate-hidden"
                    );

                }


                const icon =
                    getCertificateIcon(
                        certificate.title,
                        certificate.organization
                    );


                card.innerHTML = `
    <div class="public-certificate-icon">
        <i class="${icon}"></i>
    </div>

    ${
        certificate.grade
        ? `<span class="certificate-grade">
            ${escapeSkillHTML(certificate.grade)}
           </span>`
        : ""
    }

    <div class="public-certificate-info">
        <h3>${escapeSkillHTML(certificate.title || "Certificate")}</h3>

        <p class="certificate-organization">
            ${escapeSkillHTML(certificate.organization || "")}
        </p>

        ${
            certificate.date
            ? `
                <div class="certificate-date">
                    <i class="fas fa-calendar-days"></i>
                    <span>${escapeSkillHTML(certificate.date)}</span>
                </div>
            `
            : ""
        }
    </div>

    ${
        certificate.description
        ? `
            <p class="certificate-description">
                ${escapeSkillHTML(certificate.description)}
            </p>
        `
        : ""
    }

    ${
        certificate.fileURL
        ? `
            <div class="public-certificate-actions">

                <a
                    href="${escapeSkillHTML(certificate.fileURL)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="certificate-action view-action"
                    title="View Certificate">

                    <i class="fas fa-eye"></i>
                    <span>View Certificate</span>
                </a>

                <a
                    href="${escapeSkillHTML(certificate.fileURL)}"
                    download
                    class="certificate-action download-action"
                    title="Download Certificate">

                    <i class="fas fa-download"></i>
                    <span>Download</span>
                </a>

            </div>
        `
        : ""
    }
`;
                container.appendChild(
                    card
                );

            }
        );


     // ==========================================
//          CERTIFICATE SHOW MORE
// ==========================================

const moreWrap =
    document.getElementById(
        "certificatesMoreWrap"
    );


const moreBtn =
    document.getElementById(
        "certificatesMoreBtn"
    );


if (
    moreWrap &&
    moreBtn
) {

    if (certificates.length > 3) {

        moreWrap.style.display =
            "flex";


        moreBtn.classList.remove(
            "expanded"
        );


        moreBtn.innerHTML = `

            Show More

            <i class="fas fa-chevron-down"></i>

        `;


        moreBtn.onclick =
            function () {

                let hiddenCertificates =
                    document.querySelectorAll(
                        ".certificate-hidden"
                    );


                const isExpanded =
                    moreBtn.classList.contains(
                        "expanded"
                    );


                if (!isExpanded) {

                    // SHOW remaining certificates

                    hiddenCertificates.forEach(
                        certificate => {

                            certificate.classList.remove(
                                "certificate-hidden"
                            );

                        }
                    );


                    moreBtn.classList.add(
                        "expanded"
                    );


                    moreBtn.innerHTML = `

                        Show Less

                        <i class="fas fa-chevron-up"></i>

                    `;

                } else {

                    // HIDE remaining certificates

                    hiddenCertificates =
                        document.querySelectorAll(
                            ".public-certificate-card"
                        );


                    hiddenCertificates.forEach(
                        (certificate, index) => {

                            if (index >= 3) {

                                certificate.classList.add(
                                    "certificate-hidden"
                                );

                            }

                        }
                    );


                    moreBtn.classList.remove(
                        "expanded"
                    );


                    moreBtn.innerHTML = `

                        Show More

                        <i class="fas fa-chevron-down"></i>

                    `;

                }

            };

    } else {

        moreWrap.style.display =
            "none";

    }

}
       
    } catch (error) {

        console.error(
            "Public certificates loading error:",
            error
        );


        container.innerHTML = `

            <div class="project-loading">

                <i class="fas fa-triangle-exclamation"></i>

                <p>
                    Unable to load certificates.
                </p>

            </div>

        `;

    }

}
loadPublicCertificates()
// =====================================================
//        LOAD PUBLIC PROFILE / ABOUT / CONTACT
// =====================================================
async function loadPublicProfile() {

    const heroH1 =
        document.querySelector(".hero-content h1");

    const heroH2 =
        document.querySelector(".hero-content h2");

    const heroDesc =
        document.querySelector(".hero-description");

    const heroImg =
    document.querySelector(".profile-frame img");


    // ================= CACHE FIRST =================

    try {

        const cached =
            JSON.parse(
                localStorage.getItem(
                    "portfolioProfile"
                )
            );


        if (cached) {

            if (
                cached.name &&
                heroH1
            ) {

                const parts =
                    cached.name
                        .trim()
                        .split(/\s+/);

                const last =
                    parts.pop();

                const first =
                    parts.join(" ");

                heroH1.innerHTML =
                    `${escapeSkillHTML(first)}
                    <span>
                        ${escapeSkillHTML(last)}
                    </span>`;

            }


            if (
                cached.role &&
                heroH2
            ) {

                heroH2.textContent =
                    cached.role;

            }


            if (
                cached.description &&
                heroDesc
            ) {

                heroDesc.textContent =
                    cached.description;

            }
            if (
    cached.image &&
    heroImg
) {
    heroImg.src = cached.image;
}

        }

    } catch (error) {

        console.error(
            "Profile cache error:",
            error
        );

    }


    // ================= FIREBASE =================

    try {

        const snap =
            await getDoc(
                doc(
                    db,
                    "content",
                    "profile"
                )
            );


        if (!snap.exists()) {
            return;
        }


        const data =
            snap.data();


        // Keep latest Firebase data cached
        localStorage.setItem(
            "portfolioProfile",
            JSON.stringify(data)
        );


        if (
    data.name &&
    heroH1
) {

    const parts =
        data.name
            .split("//");

    if (parts.length > 1) {

        const firstPart =
            parts[0].trim();

        const bluePart =
            parts.slice(1)
                .join("//")
                .trim();

        heroH1.innerHTML =
            `${escapeSkillHTML(firstPart)}
            <span>
                ${escapeSkillHTML(bluePart)}
            </span>`;

    } else {

        heroH1.textContent =
            data.name.trim();

    }
}

      if (
    data.role &&
    heroH2
) {

    const parts =
        data.role
            .split("//");

    if (parts.length > 1) {

        const firstPart =
            parts[0].trim();

        const bluePart =
            parts.slice(1)
                .join("//")
                .trim();

        heroH2.innerHTML =
            `${escapeSkillHTML(firstPart)}
            <span>
                ${escapeSkillHTML(bluePart)}
            </span>`;

    } else {

        heroH2.textContent =
            data.role.trim();

    }
}  


        if (
            data.description &&
            heroDesc
        ) {

            heroDesc.textContent =
                data.description;

        }
        if (
    data.image &&
    heroImg
) {
    heroImg.src = data.image;
}


    } catch (error) {

        console.error(
            "Public profile loading error:",
            error
        );

    }

}
async function loadPublicAbout() {

    try {

        const snap =
            await getDoc(
                doc(db, "content", "about")
            );

        if (!snap.exists()) return;

        const data = snap.data();

        const paragraphs =
            document.querySelectorAll(
                ".about-card p"
            );

        if (data.student && paragraphs[0]) {
            paragraphs[0].textContent =
                data.student;
        }

        if (data.interests && paragraphs[1]) {
            paragraphs[1].textContent =
                data.interests;
        }

        if (data.goal && paragraphs[2]) {
            paragraphs[2].textContent =
                data.goal;
        }

    } catch (error) {

        console.error(
            "Public about loading error:",
            error
        );

    }

}


async function loadPublicContact() {

    try {

        const snap = await getDoc(doc(db, "content", "contact"));

        if (!snap.exists()) return;

        const data = snap.data();

        const values = document.querySelectorAll(".contact-item p");

        if (data.email && values[0]) values[0].textContent = data.email;
        if (data.phone && values[1]) values[1].textContent = data.phone;
        if (data.location && values[2]) values[2].textContent = data.location;

    } catch (error) {
        console.error("Public contact loading error:", error);
    }

}
// ================= LOAD SOCIAL LINKS =================
// ================= LOAD PUBLIC SOCIAL LINKS =================

async function loadPublicSocialLinks() {

    try {

        const snap =
            await getDoc(
                doc(db, "content", "social")
            );

        if (!snap.exists()) {
            return;
        }

        const data =
            snap.data();


        // ================= HOME / PROFILE SOCIAL =================

        const homeLinks =
            document.querySelectorAll(
                ".social-icons a"
            );

        if (homeLinks.length >= 3) {

            homeLinks[0].href =
                data.linkedin || "#";

            homeLinks[1].href =
                data.github || "#";

            homeLinks[2].href =
                data.whatsapp || "#";


            homeLinks.forEach(link => {

                if (link.href !== "#") {
                    link.target = "_blank";
                    link.rel =
                        "noopener noreferrer";
                }

            });

        }


        // ================= FOOTER SOCIAL =================

        const footerLinks =
            document.querySelectorAll(
                ".footer-social a"
            );

        if (footerLinks.length >= 3) {

            footerLinks[0].href =
                data.linkedin || "#";

            footerLinks[1].href =
                data.github || "#";

            footerLinks[2].href =
                data.whatsapp || "#";


            footerLinks.forEach(link => {

                if (link.href !== "#") {
                    link.target = "_blank";
                    link.rel =
                        "noopener noreferrer";
                }

            });

        }

    } catch (error) {

        console.error(
            "Load public social links error:",
            error
        );

    }
}
// =====================================================
//              ABOUT STATS - PUBLIC INDEX
// =====================================================

async function loadAboutStats() {

    try {

        // ================= PROJECT COUNT (live) =================
        const projectsSnapshot = await getDocs(collection(db, "projects"));
        const projectCount = projectsSnapshot.size;

        // ================= CERTIFICATE COUNT (live) =================
        const certificatesSnapshot = await getDocs(collection(db, "certificates"));
        const certificateCount = certificatesSnapshot.size;

        // ================= CGPA + RESUME (content/about) =================
        const aboutSnapshot = await getDoc(doc(db, "content", "about"));
        const aboutData = aboutSnapshot.exists() ? aboutSnapshot.data() : {};
        const cgpa = Number(aboutData.cgpa) || 0;
        const resumeUrl = aboutData.resumeUrl || "";
        const heroResumeBtn =
    document.getElementById("heroResumeBtn");

if (resumeUrl && heroResumeBtn) {

    heroResumeBtn.href = resumeUrl;

    heroResumeBtn.style.display = "inline-flex";

}

        // ================= ELEMENTS =================
        const projectElement = document.getElementById("projectCount");
        const certificateElement = document.getElementById("certificateCount");
        const cgpaElement = document.getElementById("cgpaValue");
        const aboutStats = document.getElementById("aboutStats");

        // ================= STORE TARGETS FOR SCROLL ANIMATION =================
        if (aboutStats) {
            aboutStats.dataset.projects = projectCount;
            aboutStats.dataset.certificates = certificateCount;
            aboutStats.dataset.cgpa = cgpa;
        }

        // ================= INITIAL VALUES =================
        if (projectElement) projectElement.textContent = "0";
        if (certificateElement) certificateElement.textContent = "0";
        if (cgpaElement) cgpaElement.textContent = "0.00";

        // ================= RESUME =================
const resumeButton = document.getElementById("resumeDownloadBtn");
const resumeStatus = document.getElementById("resumeStatus");

if (resumeUrl && resumeButton) {

    resumeButton.style.display = "inline-flex";

    if (resumeStatus) {
        resumeStatus.textContent = "Download my latest resume";
    }

    resumeButton.onclick = async function (e) {

        e.preventDefault();

        try {

            resumeButton.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> Downloading...';

            const response = await fetch(resumeUrl);

            if (!response.ok) {
                throw new Error("Unable to download resume");
            }

            const blob = await response.blob();

            const blobUrl = window.URL.createObjectURL(blob);

            const downloadLink = document.createElement("a");

            downloadLink.href = blobUrl;
            downloadLink.download = "Arokiya-Vinoliya-Resume.pdf";

            document.body.appendChild(downloadLink);

            downloadLink.click();

            downloadLink.remove();

            window.URL.revokeObjectURL(blobUrl);

            resumeButton.innerHTML =
                '<i class="fas fa-download"></i> Download Resume';

        } catch (error) {

            console.error("Resume download error:", error);

            showToast("Unable to download resume");

            resumeButton.innerHTML =
                '<i class="fas fa-download"></i> Download Resume';
        }
    };

} else {

    if (resumeButton) {
        resumeButton.style.display = "none";
    }

    if (resumeStatus) {
        resumeStatus.textContent = "Resume not available";
    }
}
    } catch (error) {
        console.error("About stats loading error:", error);
    }

}


// =====================================================
//              NUMBER ANIMATION (Projects/Certificates)
// =====================================================

function animateNumber(element, target) {

    if (!element) return;

    target = Number(target) || 0;

    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);

        element.textContent = value;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }

    }

    requestAnimationFrame(update);

}


// =====================================================
//              CGPA ANIMATION (decimal, no Math.floor)
// =====================================================
function animateCGPA(element, target) {

    const whole = Math.floor(target);
    const decimal = target - whole;

    // Phase 1: 1 → 2 → 3 → ... → 8
    let current = 1;

    const wholeInterval = setInterval(() => {

        element.textContent = current;

        if (current >= whole) {

            clearInterval(wholeInterval);

            // Phase 2: 8.01 → 8.02 → ... → 8.23
            let decimalValue = 0.01;

            const decimalInterval = setInterval(() => {

                element.textContent = (whole + decimalValue).toFixed(2);

                decimalValue += 0.01;

                if (decimalValue > decimal + 0.001) {

                    clearInterval(decimalInterval);

                    element.textContent = target.toFixed(2);
                }

            }, 30); // decimal speed

        } else {
            current++;
        }

    }, 80); // whole number speed
}
// =====================================================
//          ABOUT STATS SCROLL ANIMATION (single observer)
// =====================================================

function initAboutStatsAnimation() {

    const aboutStats = document.getElementById("aboutStats");

    if (!aboutStats) return;

    let animated = false;

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting && !animated) {

                animated = true;

                const projectElement = document.getElementById("projectCount");
                const certificateElement = document.getElementById("certificateCount");
                const cgpaElement = document.getElementById("cgpaValue");

                const projectTarget = Number(aboutStats.dataset.projects) || 0;
                const certificateTarget = Number(aboutStats.dataset.certificates) || 0;
                const cgpaTarget = Number(aboutStats.dataset.cgpa) || 0;

                // Reset before animating
                if (projectElement) projectElement.textContent = "0";
                if (certificateElement) certificateElement.textContent = "0";
                if (cgpaElement) cgpaElement.textContent = "0.00";

                animateNumber(projectElement, projectTarget);
                animateNumber(certificateElement, certificateTarget);
                animateCGPA(cgpaElement, cgpaTarget);

            } else if (!entry.isIntersecting) {

                // Allow re-animation on next scroll-into-view
                animated = false;

            }

        });

    }, { threshold: 0.30 });

    observer.observe(aboutStats);

}


// =====================================================
//                    START
// =====================================================

async function startAboutStats() {
    await loadAboutStats();
    initAboutStatsAnimation();
}

startAboutStats();
loadPublicProfile(),
loadPublicAbout(),
loadPublicContact(),
loadPublicSocialLinks();


