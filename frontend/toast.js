// ===============================
// HITAM Smart Toast Notifications
// ===============================

function showToast(message, type = "success") {

    // Remove old toast if exists
    const oldToast = document.querySelector(".toast");
    if (oldToast) {
        oldToast.remove();
    }

    // Create Toast
    const toast = document.createElement("div");

    toast.className = "toast";

    if (type === "error") {
        toast.classList.add("error");
    }

    if (type === "warning") {
        toast.classList.add("warning");
    }

    if (type === "success") {
        toast.classList.add("success");
    }

    toast.innerHTML = message;

    document.body.appendChild(toast);

    // Show Animation
    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    // Hide Animation
    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 400);

    }, 3000);

}