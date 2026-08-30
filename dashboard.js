
import { auth, db } from "./firebase.js";
import { supabase } from "./supabase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ================= AUTH =================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
    }

});


// ================= NAVIGATION =================

const menuItems =
    document.querySelectorAll(".menu-item");

const sections =
    document.querySelectorAll(".dashboard-section");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        const target =
            item.getAttribute("data-section");

        menuItems.forEach(menu => {
            menu.classList.remove("active");
        });

        sections.forEach(section => {
            section.classList.remove("active-section");
        });

        item.classList.add("active");

        const targetSection =
            document.getElementById(target);

        if (targetSection) {
            targetSection.classList.add("active-section");
        }

    });

});


// =====================================================
//                    SKILLS
// =====================================================

const skillsCollection =
    collection(db, "skills");

const categoriesCollection =
    collection(db, "skillCategories");

let editingSkillId = null;


// =====================================================
//              LOAD CATEGORIES
// =====================================================

async function loadCategories() {

    const select =
        document.getElementById("skillCategory");

    if (!select) return;

    select.innerHTML =
        `<option value="">Loading...</option>`;

    try {

        const snapshot =
            await getDocs(categoriesCollection);

        select.innerHTML = "";

        // Default categories

        if (snapshot.empty) {

            const defaultCategories = [
              
            ];

            for (
                const category of defaultCategories
            ) {

                await addDoc(
                    categoriesCollection,
                    {
                        name: category,
                        createdAt: Date.now()
                    }
                );

            }

            // Load again

            return loadCategories();

        }


        const categories = [];

        snapshot.forEach(categoryDoc => {

            categories.push({
                id: categoryDoc.id,
                ...categoryDoc.data()
            });

        });

        categories.sort((a, b) =>
    a.name.localeCompare(b.name)
);


// Remove duplicate category names
const uniqueCategories = [];
const categoryNames = new Set();


categories.forEach(category => {

    const name =
        (category.name || "").trim();

    const key =
        name.toLowerCase();


    if (
        name &&
        !categoryNames.has(key)
    ) {

        categoryNames.add(key);

        uniqueCategories.push({
            ...category,
            name
        });

    }

});


uniqueCategories.forEach(category => {

    const option =
        document.createElement("option");


    option.value =
        category.name;


    option.textContent =
        category.name;


    select.appendChild(option);

});
       


    } catch (error) {

        console.error(
            "Category loading error:",
            error
        );

        select.innerHTML = `
            <option value="">
                Unable to load categories
            </option>
        `;

    }

}


// =====================================================
//              CATEGORY MODAL
// =====================================================

window.openCategoryModal = function () {

    const modal =
        document.getElementById(
            "categoryModal"
        );

    const input =
        document.getElementById(
            "newCategoryName"
        );

    if (!modal) return;

    input.value = "";

    modal.classList.add("show");

    setTimeout(() => {
        input.focus();
    }, 100);

};


window.closeCategoryModal = function () {

    const modal =
        document.getElementById(
            "categoryModal"
        );

    if (modal) {
        modal.classList.remove("show");
    }

};


// =====================================================
//              SAVE CATEGORY
// =====================================================

window.saveCategory = async function () {

    const input =
        document.getElementById(
            "newCategoryName"
        );

    const categoryName =
        input.value.trim();


    if (!categoryName) {

        alert(
            "Please enter a category name."
        );

        return;

    }


    try {

        const snapshot =
            await getDocs(
                categoriesCollection
            );


        const alreadyExists =
            snapshot.docs.some(
                categoryDoc =>
                    categoryDoc.data().name
                        .toLowerCase() ===
                    categoryName.toLowerCase()
            );


        if (alreadyExists) {

            showToast("This category already exists");
           
            return;

        }


        await addDoc(
            categoriesCollection,
            {
                name: categoryName,
                createdAt: Date.now()
            }
        );


      showToast("Category added successfully");

        closeCategoryModal();

        await loadCategories();


        document.getElementById(
            "skillCategory"
        ).value = categoryName;


    } catch (error) {

        console.error(
            "Category save error:",
            error
        );

      showToast(" Category could not be added. Check Firestore Rules.");

    }  

};

// =====================================================
//              PROJECTS
// =====================================================

const projectsCollection =
    collection(db, "projects");

let editingProjectId = null;


// =====================================================
//              OPEN PROJECT MODAL
// =====================================================

window.openProjectModal = function () {

    editingProjectId = null;


    document.getElementById(
        "projectModalTitle"
    ).innerHTML =
        'Add New <span>Project</span>';


    document.getElementById(
        "projectTitle"
    ).value = "";


    document.getElementById(
        "projectDescription"
    ).value = "";


    document.getElementById(
        "projectTechnologies"
    ).value = "";


    document.getElementById(
        "projectGithub"
    ).value = "";


    document.getElementById(
        "projectLiveDemo"
    ).value = "";


   const projectImageFile =
    document.getElementById(
        "projectImageFile"
    );

    const imageFile =
    document.getElementById(
        "projectImageFile"
    );

if (imageFile) {
    imageFile.value = "";
}

    document.getElementById(
        "projectModal"
    ).classList.add("show");

};


// =====================================================
//              CLOSE PROJECT MODAL
// =====================================================

window.closeProjectModal = function () {

    document.getElementById(
        "projectModal"
    ).classList.remove("show");

};


// =====================================================
//              SAVE PROJECT
// =====================================================
window.saveProject = async function () {

    const title =
        document.getElementById("projectTitle")
            ?.value.trim();

    const description =
        document.getElementById("projectDescription")
            ?.value.trim();

    const technologiesText =
        document.getElementById("projectTechnologies")
            ?.value.trim();

    const github =
        document.getElementById("projectGithub")
            ?.value.trim();

    const liveDemo =
        document.getElementById("projectLiveDemo")
            ?.value.trim();

    const imageFile =
        document.getElementById(
            "projectImageFile"
        )?.files[0];


    if (!title) {
        showToast("Please enter project title");
        return;
    }


    if (!description) {
        showToast("Please enter project description");
        return;
    }
    if (!imageFile && !editingProjectId) {

    showToast(
        "Please upload the project image"
    );

    return;
}


    const technologies =
        technologiesText
            ? technologiesText
                .split(",")
                .map(item => item.trim())
                .filter(Boolean)
            : [];


    try {

        let imageUrl = "";


        // ==========================================
        // IMAGE UPLOAD
        // ==========================================

        if (imageFile) {

    showToast(
        "Uploading project image..."
    );

    const filePath =
        `projects/${Date.now()}_${imageFile.name}`;

    const { error } =
        await supabase.storage
            .from("arokiya-portfolio")
            .upload(
                filePath,
                imageFile,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );

    if (error) {

        console.error(
            "Supabase project image upload error:",
            error
        );

        showToast(
            "Project image upload failed"
        );

        return;
    }

    const { data: publicData } =
        supabase.storage
            .from("arokiya-portfolio")
            .getPublicUrl(
                filePath
            );

    imageUrl =
        publicData.publicUrl;

    console.log(
        "Project image uploaded:",
        imageUrl
    );
} 


        // ==========================================
        // EDIT EXISTING PROJECT
        // ==========================================

        if (editingProjectId) {

            const updateData = {

                title,
                description,
                technologies,
                github,
                liveDemo

            };


            // New image selected-na mattum
            // image update pannum

            if (imageUrl) {

                updateData.image =
                    imageUrl;

            }


            await updateDoc(
                doc(
                    db,
                    "projects",
                    editingProjectId
                ),
                updateData
            );


            showToast(
                "Project updated successfully"
            );


        }

        // ==========================================
        // ADD NEW PROJECT
        // ==========================================

        else {

            await addDoc(
                projectsCollection,
                {

                    title,
                    description,
                    technologies,
                    github,
                    liveDemo,

                    image:
                        imageUrl,

                    createdAt:
                        Date.now()

                }
            );


            showToast(
                "Project added successfully"
            );

        }


        editingProjectId = null;


        closeProjectModal();


        await loadProjects();


    } catch (error) {

        console.error(
            "Project save error:",
            error
        );


        showToast(
            "Unable to save project"
        );

    }

};
// =====================================================
//              LOAD PROJECTS
// =====================================================

async function loadProjects() {

    const container =
        document.getElementById(
            "projectAdminGrid"
        );


    if (!container) return;


    container.innerHTML = `

        <div class="loading-message">

            <i class="fas fa-spinner fa-spin"></i>

            Loading projects...

        </div>

    `;


    try {

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

                <div class="empty-message">

                    <i class="fas fa-folder-open"></i>

                    <p>
                        No projects added yet.
                    </p>

                </div>

            `;

            return;

        }


        snapshot.forEach(
            projectDoc => {

                const project =
                    projectDoc.data();


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
                                    ${escapeHTML(tech)}
                                </span>
                            `
                        )
                        .join("");


                const image =
                    project.image ||
                    "";


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "project-admin-card";


                card.innerHTML = `

                    ${
                        image
                            ? `
                                <div class="project-admin-image">

                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(project.title)}"
                                        onerror="
                                            this.parentElement.style.display='none'
                                        "
                                    >

                                </div>
                            `
                            : `
                               <div class="project-admin-image">

    ${
        project.image
        ? `
            <img
                src="${escapeHTML(project.image)}"
                alt="${escapeHTML(project.title || "Project")}"
            >
        `
        : `
            <div class="project-admin-icon">
                <i class="fas fa-laptop-code"></i>
            </div>
        `
    }

</div>
                            `
                    }


                    <h3>
                        ${escapeHTML(
                            project.title
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            project.description
                        )}
                    </p>


                    <div class="tags">

                        ${tags}

                    </div>


                    <div class="project-links">

                        ${
                            project.github
                                ? `
                                    <a
                                        href="${escapeHTML(project.github)}"
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
                                        href="${escapeHTML(project.liveDemo)}"
                                        target="_blank"
                                        rel="noopener noreferrer">

                                        <i class="fas fa-globe"></i>
                                        Live Demo

                                    </a>
                                `
                                : ""
                        }

                    </div>


                    <div class="card-actions">

                        <button
                            type="button"
                            class="edit-btn"
                            onclick="
                                editProject(
                                    '${projectDoc.id}'
                                )
                            ">

                            <i class="fas fa-pen"></i>
                            Edit

                        </button>


                        <button
                            type="button"
                            class="delete-btn"
                            onclick="
                                deleteProject(
                                    '${projectDoc.id}'
                                )
                            ">

                            <i class="fas fa-trash"></i>
                            Delete

                        </button>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Load projects error:",
            error
        );


        container.innerHTML = `

            <div class="empty-message">

                <i class="fas fa-triangle-exclamation"></i>

                <p>
                    Unable to load projects.
                </p>

            </div>

        `;

    }

}


// =====================================================
//              EDIT PROJECT
// =====================================================

window.editProject = async function (id) {

    try {

        const projectSnap =
            await getDoc(
                doc(
                    db,
                    "projects",
                    id
                )
            );


        if (!projectSnap.exists()) {

            showToast(
                "Project not found"
            );

            return;
        }


        const project =
            projectSnap.data();


        editingProjectId = id;


        document.getElementById(
            "projectModalTitle"
        ).innerHTML =
            'Edit <span>Project</span>';


        document.getElementById(
            "projectTitle"
        ).value =
            project.title || "";


        document.getElementById(
            "projectDescription"
        ).value =
            project.description || "";


        document.getElementById(
            "projectTechnologies"
        ).value =
            Array.isArray(project.technologies)
                ? project.technologies.join(", ")
                : "";


        document.getElementById(
            "projectGithub"
        ).value =
            project.github || "";


        document.getElementById(
            "projectLiveDemo"
        ).value =
            project.liveDemo || "";


        const imageFile =
            document.getElementById(
                "projectImageFile"
            );

        if (imageFile) {
            imageFile.value = "";
        }


        document.getElementById(
            "projectModal"
        ).classList.add("show");


    } catch (error) {

        console.error(
            "Edit project error:",
            error
        );

        showToast(
            "Unable to edit project"
        );
    }

};
// =====================================================
//              DELETE PROJECT
// =====================================================

window.deleteProject = function (id) {

    // Same custom confirmation modal
    // that we use for Skills

    openProjectDeleteConfirm(id);

};


let pendingProjectDeleteId = null;


function openProjectDeleteConfirm(id) {

    pendingProjectDeleteId = id;


    const modal =
        document.getElementById(
            "confirmModal"
        );


    const title =
        document.getElementById(
            "confirmTitle"
        );


    const text =
        document.getElementById(
            "confirmText"
        );


    if (!modal) return;


    if (title) {

        title.textContent =
            "Delete Project?";

    }


    if (text) {

        text.textContent =
            "Are you sure you want to delete this project?";

    }


    modal.classList.add(
        "show"
    );

}


// =====================================================
//        PROJECT DELETE CONFIRM BUTTON
// =====================================================

const deleteConfirmBtn =
    document.getElementById(
        "deleteConfirmBtn"
    );


if (deleteConfirmBtn) {

    deleteConfirmBtn.addEventListener(
        "click",
        async function () {

            if (
                !pendingProjectDeleteId
            ) {

                return;

            }


            try {

                const projectRef = doc(
    db,
    "projects",
    pendingProjectDeleteId
);

const projectSnap =
    await getDoc(projectRef);

if (!projectSnap.exists()) {
    showToast("Project not found");
    return;
}

const project =
    projectSnap.data();


// DELETE PROJECT IMAGE FROM SUPABASE

if (project.image) {

    const imageUrl =
        new URL(project.image);

    const marker =
        "/storage/v1/object/public/arokiya-portfolio/";

    const markerIndex =
        imageUrl.pathname.indexOf(marker);

    if (markerIndex !== -1) {

        const filePath =
            decodeURIComponent(
                imageUrl.pathname.substring(
                    markerIndex + marker.length
                )
            );

        const { error } =
            await supabase.storage
                .from("arokiya-portfolio")
                .remove([filePath]);

        if (error) {

            console.error(
                "Supabase project image delete error:",
                error
            );

            showToast(
                "Project image could not be deleted"
            );

            return;
        }
    }
}


// DELETE PROJECT FROM FIRESTORE

await deleteDoc(projectRef);


                pendingProjectDeleteId =
                    null;


                document
                    .getElementById(
                        "confirmModal"
                    )
                    .classList.remove(
                        "show"
                    );


                showToast(
                    "Project deleted successfully"
                );


                await loadProjects();


            } catch (error) {

                console.error(
                    "Delete project error:",
                    error
                );


                showToast(
                    "Unable to delete project"
                );

            }

        }
    );

}


// =====================================================
//              LOAD PROJECTS
// =====================================================

loadProjects();
const certificatesCollection =
    collection(db, "certificates");

let editingCertificateId = null;

window.openCertificateModal = function () {

    editingCertificateId = null;

    document.getElementById(
        "certificateModalTitle"
    ).innerHTML =
        'Add New <span>Certificate</span>';

    document.getElementById(
        "certificateTitle"
    ).value = "";

    document.getElementById(
        "certificateOrganization"
    ).value = "";

    document.getElementById(
        "certificateGrade"
    ).value = "";

    document.getElementById(
        "certificateDate"
    ).value = "";
    document.getElementById(
    "certificateDescription"
).value = "";
const fileInput =
    document.getElementById("certificateFile");

if (fileInput) {
    fileInput.value = "";
}
    
    document.getElementById(
        "certificateModal"
    ).classList.add("show");
};
window.closeCertificateModal = function () {

    document.getElementById(
        "certificateModal"
    ).classList.remove("show");

};
window.saveCertificate = async function () {

    const title =
        document.getElementById("certificateTitle").value.trim();

    const organization =
        document.getElementById("certificateOrganization").value.trim();

    const grade =
        document.getElementById("certificateGrade").value.trim();

    const date =
        document.getElementById("certificateDate").value.trim();
    const description =
    document.getElementById("certificateDescription")
        .value.trim();

    const certFile =
        document.getElementById("certificateFile")?.files[0];


    // Validation

    if (!title) {
        showToast("Please enter certificate title");
        return;
    }

    if (!organization) {
        showToast("Please enter issuing organization");
        return;
    }
    if (!certFile && !editingCertificateId) {

    showToast(
        "Please upload the certificate file"
    );

    return;
}


    try {

        let fileURL = "";

        // ================= FILE UPLOAD =================
      if (certFile) {

    showToast(
        "Uploading certificate file..."
    );

    const filePath =
        `certificates/${Date.now()}_${certFile.name}`;

    const { data, error } =
        await supabase.storage
            .from("arokiya-portfolio")
            .upload(
                filePath,
                certFile,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );


    if (error) {

        console.error(
            "Supabase certificate upload error:",
            error
        );

        showToast(
            "Certificate upload failed"
        );

        return;
    }


    const { data: publicData } =
        supabase.storage
            .from("arokiya-portfolio")
            .getPublicUrl(
                filePath
            );


    fileURL =
        publicData.publicUrl;


    console.log(
        "Certificate uploaded:",
        fileURL
    );
}
      

        // ================= EDIT =================

        if (editingCertificateId) {

            const updateData = { title, organization, grade, date, description };

            // Only overwrite fileURL if a NEW file was chosen.
            // Otherwise the existing uploaded file stays as-is.
            if (fileURL) {
                updateData.fileURL = fileURL;
            }

            await updateDoc(
                doc(db, "certificates", editingCertificateId),
                updateData
            );

            showToast("Certificate updated successfully");

        }

        // ================= ADD =================

        else {

            await addDoc(
                certificatesCollection,
                {
                    title,
                    organization,
                    grade,
                    date,
                    description,
                    fileURL: fileURL,
                    createdAt: Date.now()
                }
            );

            showToast("Certificate added successfully");
        }


        closeCertificateModal();

        await loadCertificates();


    } catch (error) {

        console.error("Certificate save error:", error);

        showToast("Unable to save certificate");

    }

};
window.editCertificate = async function (id) {

    try {

        const certificateRef =
            doc(
                db,
                "certificates",
                id
            );

        const snapshot =
            await getDoc(
                certificateRef
            );

        if (!snapshot.exists()) {

            showToast(
                "Certificate not found"
            );

            return;
        }


        const certificate =
            snapshot.data();


        editingCertificateId = id;


        document.getElementById(
            "certificateModalTitle"
        ).innerHTML =
            'Edit <span>Certificate</span>';


        document.getElementById(
            "certificateTitle"
        ).value =
            certificate.title || "";


        document.getElementById(
            "certificateOrganization"
        ).value =
            certificate.organization || "";


        document.getElementById(
            "certificateGrade"
        ).value =
            certificate.grade || "";


        document.getElementById(
            "certificateDate"
        ).value =
            certificate.date || "";
        document.getElementById(
    "certificateDescription"
).value =
    certificate.description || "";


        const fileInput =
    document.getElementById(
        "certificateFile"
    );

if (fileInput) {
    fileInput.value = "";
}


const existingFile =
    document.getElementById(
        "existingCertificateFile"
    );


if (existingFile) {

    if (certificate.fileURL) {

        existingFile.style.display =
            "block";

        existingFile.innerHTML = `
            <i class="fas fa-file-circle-check"></i>
            Certificate file already uploaded.
            <br>
            Select a new file to replace it.
        `;

    } else {

        existingFile.style.display =
            "block";

        existingFile.innerHTML = `
            <i class="fas fa-triangle-exclamation"></i>
            No certificate file uploaded.
            Please select a certificate file.
        `;

    }

}

        document.getElementById(
            "certificateModal"
        ).classList.add("show");


    } catch (error) {

        console.error(
            "Edit certificate error:",
            error
        );

        showToast(
            "Unable to edit certificate"
        );

    }

};
// =====================================================
//              LOAD CERTIFICATES
// =====================================================

async function loadCertificates() {

    const container =
        document.getElementById(
            "certificateAdminGrid"
        );

    if (!container) return;

    container.innerHTML = `
        <div class="loading-message">
            <i class="fas fa-spinner fa-spin"></i>
            Loading certificates...
        </div>
    `;

    try {

        const snapshot =
            await getDocs(
                certificatesCollection
            );

        container.innerHTML = "";

        if (snapshot.empty) {

            container.innerHTML = `
                <div class="empty-message">

                    <i class="fas fa-certificate"></i>

                    <p>
                        No certificates added yet.
                    </p>

                </div>
            `;

            return;
        }


        snapshot.forEach(certificateDoc => {

            const certificate =
                certificateDoc.data();


            const card =
                document.createElement("div");

            card.className =
                "certificate-admin-card";


            const certificateIcon =
    getCertificateIcon(
        certificate.title,
        certificate.organization
    );
            card.innerHTML = `

               <div class="certificate-admin-icon">
    <i class="${certificateIcon}"></i>
</div>

                <div class="certificate-info">

                    <h3>
                        ${escapeHTML(
                            certificate.title || ""
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            certificate.organization || ""
                        )}
                    </p>


                    ${
                        certificate.grade
                            ? `
                                <span>
                                    ${escapeHTML(
                                        certificate.grade
                                    )}
                                </span>
                              `
                            : ""
                    }


                    ${
                        certificate.date
                            ? `
                                <small>
                                    ${escapeHTML(
                                        certificate.date
                                    )}
                                </small>
                              `
                            : ""
                    }

                </div>


                <div class="card-actions">

                    <button
                        type="button"
                        class="edit-btn"
                        onclick="
                            editCertificate(
                                '${certificateDoc.id}'
                            )
                        ">

                        <i class="fas fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                        onclick="
                            deleteCertificate(
                                '${certificateDoc.id}'
                            )
                        ">

                        <i class="fas fa-trash"></i>

                    </button>

                </div>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Load certificates error:",
            error
        );


        container.innerHTML = `

            <div class="empty-message">

                <i class="fas fa-triangle-exclamation"></i>

                <p>
                    Unable to load certificates.
                </p>

            </div>

        `;

    }

}
// =====================================================
//              DELETE CERTIFICATE
// =====================================================

let pendingCertificateDeleteId = null;

window.deleteCertificate = function (id) {

    pendingCertificateDeleteId = id;

    const modal =
        document.getElementById("confirmModal");

    const title =
    document.getElementById("confirmModalTitle");

const text =
    document.getElementById("confirmModalMessage");
    if (!modal) return;

    if (title) {
        title.textContent = "Delete Certificate?";
    }

    if (text) {
        text.textContent =
            "Are you sure you want to delete this certificate?";
    }

    modal.classList.add("show");
};


// =====================================================
//       CERTIFICATE DELETE CONFIRM
// =====================================================

document
    .getElementById("deleteConfirmBtn")
    ?.addEventListener(
        "click",
        async function () {

            if (!pendingCertificateDeleteId) {
                return;
            }

            const id =
                pendingCertificateDeleteId;

            try {

            const certificateRef = doc(
    db,
    "certificates",
    id
);

const certificateSnap =
    await getDoc(certificateRef);

if (!certificateSnap.exists()) {
    showToast("Certificate not found");
    return;
}

const certificate =
    certificateSnap.data();


// ================= SUPABASE FILE DELETE =================

if (certificate.fileURL) {

    try {

        const fileUrl =
            new URL(certificate.fileURL);

        const marker =
            "/storage/v1/object/public/arokiya-portfolio/";

        const markerIndex =
            fileUrl.pathname.indexOf(marker);

        if (markerIndex !== -1) {

            const filePath =
                decodeURIComponent(
                    fileUrl.pathname.substring(
                        markerIndex + marker.length
                    )
                );

            const { error: storageError } =
                await supabase.storage
                    .from("arokiya-portfolio")
                    .remove([filePath]);

            if (storageError) {

                console.error(
                    "Supabase file delete error:",
                    storageError
                );

                showToast(
                    "Certificate file could not be deleted"
                );

                return;
            }
        }

    } catch (storageError) {

        console.error(
            "Storage delete error:",
            storageError
        );

        showToast(
            "Certificate file could not be deleted"
        );

        return;
    }
}


// ================= FIRESTORE DELETE =================

await deleteDoc(
    certificateRef
);    
                pendingCertificateDeleteId = null;

                document
                    .getElementById("confirmModal")
                    ?.classList.remove("show");

                showToast(
                    "Certificate deleted successfully"
                );

                await loadCertificates();

            } catch (error) {

                console.error(
                    "Delete certificate error:",
                    error
                );

                showToast(
                    "Unable to delete certificate"
                );
            }
        }
    );
// =====================================================
//              OPEN SKILL MODAL
// =====================================================

window.openSkillModal = async function () {

    editingSkillId = null;

    document.getElementById(
        "skillModalTitle"
    ).innerHTML =
        'Add New <span>Skill</span>';

    document.getElementById(
        "newSkillName"
    ).value = "";

    document.getElementById(
        "newSkillPercentage"
    ).value = 80;

    updatePercentageText();

    await loadCategories();

    document.getElementById(
        "skillModal"
    ).classList.add("show");

};


// =====================================================
//              CLOSE SKILL MODAL
// =====================================================

window.closeSkillModal = function () {

    document.getElementById(
        "skillModal"
    ).classList.remove("show");

};


// =====================================================
//              PERCENTAGE
// =====================================================

const percentageSlider =
    document.getElementById(
        "newSkillPercentage"
    );

const percentageText =
    document.getElementById(
        "skillPercentageText"
    );


function updatePercentageText() {

    if (
        percentageSlider &&
        percentageText
    ) {

        percentageText.textContent =
            percentageSlider.value + "%";

    }

}


if (percentageSlider) {

    percentageSlider.addEventListener(
        "input",
        updatePercentageText
    );

}

// =====================================================
//              SAVE SKILL
// =====================================================

window.saveSkill = async function () {

    const name =
        document.getElementById("newSkillName")
            .value.trim();

    const category =
        document.getElementById("skillCategory")
            .value;

    const percentage =
        Number(
            document.getElementById(
                "newSkillPercentage"
            ).value
        );


    // Validation

    if (!name) {

        showToast("Please enter skill name");

        return;
    }


    if (!category) {

        showToast("Please select a category");

        return;
    }


    if (
        percentage < 0 ||
        percentage > 100
    ) {

        showToast(
            "Percentage must be between 0 and 100"
        );

        return;
    }


    try {

        // ================= EDIT =================

        if (editingSkillId) {

            await updateDoc(
                doc(
                    db,
                    "skills",
                    editingSkillId
                ),
                {
                    name,
                    category,
                    percentage
                }
            );

            showToast(
                "Skill updated successfully"
            );

        }


        // ================= ADD =================

        else {

            await addDoc(
                skillsCollection,
                {
                    name,
                    category,
                    percentage,
                    createdAt: Date.now()
                }
            );

            showToast(
                "Skill added successfully"
            );

        }


        closeSkillModal();

        await loadSkills();


    } catch (error) {

        console.error(
            "Skill save error:",
            error
        );

        showToast(
            "Skill could not be saved"
        );

    }

};


// =====================================================
//              LOAD SKILLS
// =====================================================

async function loadSkills() {

    const skillsList =
        document.getElementById(
            "skillsList"
        );


    if (!skillsList) return;


    skillsList.innerHTML = `

        <div class="loading-message">

            <i class="fas fa-spinner fa-spin"></i>

            Loading skills...

        </div>

    `;


    try {

        const skillsQuery =
            query(
                skillsCollection,
                orderBy(
                    "createdAt",
                    "asc"
                )
            );


        const snapshot =
            await getDocs(
                skillsQuery
            );


        skillsList.innerHTML = "";


        if (snapshot.empty) {

            skillsList.innerHTML = `

                <div class="empty-message">

                    <i class="fas fa-code"></i>

                    <p>
                        No skills added yet.
                    </p>

                </div>

            `;

            return;
        }


        snapshot.forEach(skillDoc => {

            const skill =
                skillDoc.data();


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "data-item";


            item.innerHTML = `

                <div class="item-icon">

                    <i class="fas fa-code"></i>

                </div>


                <div class="item-info">

                    <h3>
                        ${escapeHTML(skill.name)}
                    </h3>


                    <span class="skill-category">

                        ${escapeHTML(
                            skill.category || "Other"
                        )}

                    </span>


                    <div class="mini-progress">

                        <div
                            style="
                                width:${Number(
                                    skill.percentage
                                ) || 0}%
                            "
                        ></div>

                    </div>

                </div>


                <strong>
                    ${Number(
                        skill.percentage
                    ) || 0}%
                </strong>


                <button
                    type="button"
                    class="edit-btn"
                    onclick="editSkill('${skillDoc.id}')">

                    <i class="fas fa-pen"></i>

                </button>


                <button
                    type="button"
                    class="delete-btn"
                    onclick="deleteSkill('${skillDoc.id}')">

                    <i class="fas fa-trash"></i>

                </button>

            `;


            skillsList.appendChild(item);

        });


    } catch (error) {

        console.error(
            "Load skills error:",
            error
        );


        skillsList.innerHTML = `

            <div class="empty-message">

                <i class="fas fa-triangle-exclamation"></i>

                <p>
                    Unable to load skills.
                </p>

            </div>

        `;

    }

}


// =====================================================
//              EDIT SKILL
// =====================================================

window.editSkill = async function (id) {

    try {

        const snapshot =
            await getDocs(
                skillsCollection
            );


        let selectedSkill = null;


        snapshot.forEach(
            skillDoc => {

                if (
                    skillDoc.id === id
                ) {

                    selectedSkill =
                        skillDoc.data();

                }

            }
        );


        if (!selectedSkill) {

            showToast(
                "Skill not found"
            );

            return;
        }


        editingSkillId = id;


        document.getElementById(
            "skillModalTitle"
        ).innerHTML =
            'Edit <span>Skill</span>';


        document.getElementById(
            "newSkillName"
        ).value =
            selectedSkill.name || "";


        await loadCategories();


        document.getElementById(
            "skillCategory"
        ).value =
            selectedSkill.category || "";


        document.getElementById(
            "newSkillPercentage"
        ).value =
            selectedSkill.percentage || 0;


        updatePercentageText();


        document.getElementById(
            "skillModal"
        ).classList.add("show");


    } catch (error) {

        console.error(
            "Edit error:",
            error
        );

        showToast(
            "Unable to edit skill"
        );

    }

};


// =====================================================
//              DELETE SKILL
// =====================================================

window.deleteSkill = function (id) {

    openConfirmModal(id);

};
let pendingDeleteId = null;


function openConfirmModal(id) {

    pendingDeleteId = id;

    const modal =
        document.getElementById(
            "confirmModal"
        );

    if (!modal) return;

    modal.classList.add("show");

}


function closeConfirmModal() {

    pendingDeleteId = null;

    const modal =
        document.getElementById(
            "confirmModal"
        );

    if (!modal) return;

    modal.classList.remove("show");

}


document
    .getElementById("cancelConfirmBtn")
    ?.addEventListener(
        "click",
        closeConfirmModal
    );


document
    .getElementById("deleteConfirmBtn")
    ?.addEventListener(
        "click",
        async () => {

            if (!pendingDeleteId) {
                return;
            }


            const id =
                pendingDeleteId;


            try {

                await deleteDoc(
                    doc(
                        db,
                        "skills",
                        id
                    )
                );


                closeConfirmModal();


                showToast(
                    "Skill deleted successfully"
                );


                await loadSkills();


            } catch (error) {

                console.error(
                    "Delete error:",
                    error
                );


                closeConfirmModal();


                showToast(
                    "Unable to delete skill"
                );

            }

        }
    );
// =====================================================
//              HTML SAFETY
// =====================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// =====================================================
//                    LOGOUT
// =====================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            await signOut(auth);

            window.location.href =
                "login.html";

        }
    );

}
// =====================================================
//              PROFILE / ABOUT / CONTACT
// =====================================================

let selectedProfileImageFile = null;

const profileImageInput = document.getElementById("profileImage");
const profilePreviewImg = document.getElementById("profilePreview");

if (profileImageInput) {

    profileImageInput.addEventListener("change", () => {

        const file = profileImageInput.files[0];

        if (file) {
            selectedProfileImageFile = file;
            profilePreviewImg.src = URL.createObjectURL(file);
        }

    });

}


// ================= LOAD PROFILE =================

async function loadProfile() {

    try {

        const snap = await getDoc(doc(db, "content", "profile"));

        if (snap.exists()) {

            const data = snap.data();

            if (data.name) {
                document.getElementById("profileName").value = data.name;
            }

            if (data.role) {
                document.getElementById("profileRole").value = data.role;
            }

            if (data.description) {
                document.getElementById("profileDescription").value = data.description;
            }

            if (data.image) {
                profilePreviewImg.src = data.image;
            }

        }

    } catch (error) {
        console.error("Load profile error:", error);
    }

}


// ================= SAVE PROFILE =================

window.saveProfile = async function () {

    const name = document.getElementById("profileName").value.trim();
    const role = document.getElementById("profileRole").value.trim();
    const description = document.getElementById("profileDescription").value.trim();

    try {

        let imageUrl = "";

        if (selectedProfileImageFile) {

    showToast("Uploading photo...");

    const filePath =
        `profile/${Date.now()}_${selectedProfileImageFile.name}`;

    const { error } =
        await supabase.storage
            .from("arokiya-portfolio")
            .upload(
                filePath,
                selectedProfileImageFile,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );

    if (error) {

        console.error(
            "Supabase profile image upload error:",
            error
        );

        showToast(
            "Profile image upload failed"
        );

        return;
    }

    const { data: publicData } =
        supabase.storage
            .from("arokiya-portfolio")
            .getPublicUrl(
                filePath
            );

    imageUrl =
        publicData.publicUrl;

    console.log(
        "Profile image uploaded:",
        imageUrl
    );
}
        const updateData = { name, role, description };

        // Only overwrite the image field if a NEW file was chosen.
        // Otherwise the existing image URL in Firestore is left untouched.
        if (imageUrl) {
            updateData.image = imageUrl;
        }

        await setDoc(doc(db, "content", "profile"), updateData, { merge: true });
         localStorage.setItem(
             "portfolioProfile",
              JSON.stringify(updateData)
        );


        selectedProfileImageFile = null;

        showToast("Profile saved successfully");

        await loadProfile();

    } catch (error) {
        console.error("Save profile error:", error);
        showToast("Unable to save profile");
    }

};
// ================= LOAD ABOUT =================

async function loadAbout() {

    try {

        const snap = await getDoc(
            doc(db, "content", "about")
        );


        if (snap.exists()) {

            const data = snap.data();


            if (data.student) {

                document.getElementById(
                    "aboutStudent"
                ).value = data.student;

            }


            if (data.interests) {

                document.getElementById(
                    "aboutInterests"
                ).value = data.interests;

            }


            if (data.goal) {

                document.getElementById(
                    "aboutGoal"
                ).value = data.goal;

            }


            if (data.cgpa) {

                document.getElementById(
                    "aboutCgpa"
                ).value = data.cgpa;

            }

        }


    } catch (error) {

        console.error(
            "Load about error:",
            error
        );

    }

}
// ================= SAVE ABOUT =================

window.saveAbout = async function(field) {


    const textareaMap = {

        student:
            "aboutStudent",

        interests:
            "aboutInterests",

        goal:
            "aboutGoal"

    };


    const element =
        document.getElementById(
            textareaMap[field]
        );


    if (!element) return;


    const value =
        element.value.trim();


    try {

        await setDoc(

            doc(
                db,
                "content",
                "about"
            ),

            {
                [field]: value
            },

            {
                merge: true
            }

        );


        const cachedAbout =
            JSON.parse(
                localStorage.getItem(
                    "portfolioAbout"
                )
            ) || {};


        cachedAbout[field] =
            value;


        localStorage.setItem(

            "portfolioAbout",

            JSON.stringify(
                cachedAbout
            )

        );


        showToast(
            "About section saved successfully"
        );


    } catch (error) {

        console.error(
            "Save about error:",
            error
        );


        showToast(
            "Unable to save about section"
        );

    }

};

// ================= SAVE CGPA =================

window.saveAboutCgpa = async function () {

    const cgpaInput =
        document.getElementById(
            "aboutCgpa"
        );


    const cgpa =
        cgpaInput.value.trim();


    if (!cgpa) {

        showToast(
            "Please enter your CGPA"
        );

        return;

    }


    const cgpaValue =
        Number(cgpa);


    if (
        cgpaValue < 0 ||
        cgpaValue > 10
    ) {

        showToast(
            "CGPA must be between 0 and 10"
        );

        return;

    }


    try {

        await setDoc(

            doc(
                db,
                "content",
                "about"
            ),

            {
                cgpa: cgpaValue
            },

            {
                merge: true
            }

        );


        showToast(
            "CGPA saved successfully"
        );


    } catch (error) {

        console.error(
            "Save CGPA error:",
            error
        );


        showToast(
            "Unable to save CGPA"
        );

    }

};

// =====================================================
//              LOAD PROFILE STATS
// =====================================================

async function loadProfileStats() {

    try {

        // ================= PROJECT COUNT =================

        const projectsSnapshot =
            await getDocs(
                projectsCollection
            );

        const projectCount =
            projectsSnapshot.size;


        const projectCountElement =
            document.getElementById(
                "dashboardProjectCount"
            );

        if (projectCountElement) {

            projectCountElement.textContent =
                `${projectCount}+`;

        }


        // ================= CERTIFICATE COUNT =================

        const certificatesSnapshot =
            await getDocs(
                certificatesCollection
            );

        const certificateCount =
            certificatesSnapshot.size;


        const certificateCountElement =
            document.getElementById(
                "dashboardCertificateCount"
            );

        if (certificateCountElement) {

            certificateCountElement.textContent =
                `${certificateCount}+`;

        }


        // =================================================
        // SAVE COUNTS FOR PUBLIC PORTFOLIO
        // =================================================

        await setDoc(

            doc(
                db,
                "content",
                "about"
            ),

            {
                projectCount:
                    projectCount,

                certificateCount:
                    certificateCount
            },

            {
                merge: true
            }

        );


    } catch (error) {

        console.error(
            "Profile stats error:",
            error
        );

    }

}
// ================= LOAD CONTACT =================

async function loadContact() {

    try {

        const snap = await getDoc(doc(db, "content", "contact"));

        if (snap.exists()) {

            const data = snap.data();

            if (data.email) document.getElementById("email").value = data.email;
            if (data.phone) document.getElementById("phone").value = data.phone;
            if (data.location) document.getElementById("location").value = data.location;

        }

    } catch (error) {
        console.error("Load contact error:", error);
    }

}


// ================= SAVE CONTACT =================

window.saveContact = async function () {

    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const location = document.getElementById("location").value.trim();

    try {

        await setDoc(
            doc(db, "content", "contact"),
            { email, phone, location },
            { merge: true }
        );
         localStorage.setItem(
             "portfolioContact",
             JSON.stringify({
                email,
                phone,
                location
            })
        );

        showToast("Contact info saved successfully");

    } catch (error) {
        console.error("Save contact error:", error);
        showToast("Unable to save contact info");
    }

};
// =====================================================
//                    START
// =====================================================

loadCategories();
loadSkills();
loadProfile();
loadAbout();
loadContact();
function getCertificateIcon(title, organization) {

    const text =
        `${title || ""} ${organization || ""}`
            .toLowerCase();

    if (text.includes("nptel"))
        return "fas fa-graduation-cap";

    if (text.includes("intern"))
        return "fas fa-briefcase";

    if (
        text.includes("programming") ||
        text.includes("coding")
    )
        return "fas fa-code";

    if (text.includes("hackathon"))
        return "fas fa-trophy";

    if (text.includes("workshop"))
        return "fas fa-screwdriver-wrench";

    if (text.includes("cloud"))
        return "fas fa-cloud";

    if (
        text.includes("ai") ||
        text.includes("machine learning") ||
        text.includes("ml")
    )
        return "fas fa-robot";

    if (text.includes("data science"))
        return "fas fa-chart-column";

    if (text.includes("web"))
        return "fas fa-globe";

    if (
        text.includes("cyber") ||
        text.includes("security")
    )
        return "fas fa-shield-halved";

    if (text.includes("database"))
        return "fas fa-database";

    if (text.includes("java"))
        return "fas fa-mug-hot";

    if (text.includes("python"))
        return "fab fa-python";

    if (text.includes("microsoft"))
        return "fab fa-microsoft";

    if (text.includes("google"))
        return "fab fa-google";

    if (text.includes("aws"))
        return "fab fa-aws";

    if (text.includes("leadership"))
        return "fas fa-crown";

    if (text.includes("achievement"))
        return "fas fa-medal";

    if (text.includes("competition"))
        return "fas fa-award";

    return "fas fa-certificate";
}
loadCertificates();
function showToast(message) {

    const toast =
        document.getElementById(
            "toastMessage"
        );

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);

}
// ================= SOCIAL LINKS =================

window.saveSocialLinks = async function () {

    const linkedin =
        document.getElementById("socialLinkedin")
            ?.value.trim() || "";

    const github =
        document.getElementById("socialGithub")
            ?.value.trim() || "";

    const whatsapp =
        document.getElementById("socialWhatsapp")
            ?.value.trim() || "";

    try {

        await setDoc(
            doc(db, "content", "social"),
            {
                linkedin,
                github,
                whatsapp,
                updatedAt: Date.now()
            }
        );

        showToast(
            "Social links saved successfully"
        );

    } catch (error) {

        console.error(
            "Save social links error:",
            error
        );

        showToast(
            "Unable to save social links"
        );
    }
};
// ================= LOAD SOCIAL LINKS =================

async function loadSocialLinks() {

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

        const linkedin =
            document.getElementById(
                "socialLinkedin"
            );

        const github =
            document.getElementById(
                "socialGithub"
            );

        const whatsapp =
            document.getElementById(
                "socialWhatsapp"
            );

        if (linkedin) {
            linkedin.value =
                data.linkedin || "";
        }

        if (github) {
            github.value =
                data.github || "";
        }

        if (whatsapp) {
            whatsapp.value =
                data.whatsapp || "";
        }

    } catch (error) {

        console.error(
            "Load social links error:",
            error
        );

    }
}
// ================= RESUME UPLOAD (SUPABASE) =================

window.uploadResume = async function () {

    const fileInput = document.getElementById("resumeFile");
    const status = document.getElementById("resumeStatus");

    if (!fileInput || !fileInput.files.length) {
        showToast("Please choose a PDF resume");
        return;
    }

    const file = fileInput.files[0];

    if (file.type !== "application/pdf") {
        showToast("Please upload a PDF file");
        return;
    }

    try {

        status.textContent = "Uploading...";

        // ================= SUPABASE UPLOAD =================
        // Fixed path + upsert:true so re-uploading always
        // replaces the previous resume file in the same slot.
        const filePath = "resume/resume.pdf";

        const { error: uploadError } =
            await supabase.storage
                .from("arokiya-portfolio")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: true,
                        contentType: "application/pdf"
                    }
                );

        if (uploadError) {
            console.error(
                "Supabase resume upload error:",
                uploadError
            );

            status.textContent = "Upload failed";

            showToast(
                `Resume upload failed: ${uploadError.message || "please try again"}`
            );

            return;
        }

        // ================= PUBLIC URL =================
        const { data: publicData } =
            supabase.storage
                .from("arokiya-portfolio")
                .getPublicUrl(filePath);

        // Cache-buster so browsers/CDN don't keep serving
        // the old PDF after you replace it.
        const resumeUrl =
            `${publicData.publicUrl}?t=${Date.now()}`;

        console.log(
            "Resume uploaded:",
            resumeUrl
        );

        // ================= SAVE URL IN FIRESTORE (content/about) =================
        await setDoc(
            doc(db, "content", "about"),
            {
                resumeUrl: resumeUrl
            },
            {
                merge: true
            }
        );

        status.textContent =
            "Resume uploaded successfully";

        showToast(
            "Resume uploaded successfully"
        );

    } catch (error) {

        console.error(
            "Resume upload error:",
            error
        );

        status.textContent = "Upload failed";

        showToast(
            `Unable to upload resume: ${error.message || "unknown error"}`
        );
    }
};
loadSocialLinks();
loadProfileStats();