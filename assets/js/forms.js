// ===== EmailJS Config (v4 SDK) =====
const EMAILJS_PUBLIC_KEY  = "pULR5aMgeeyDtbJQB";
const EMAILJS_SERVICE_ID  = "service_f38hb1r";
const EMAILJS_TEMPLATE_ID = "template_4nvlmlc";

emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY,
});

// ===== Toast Notification =====
function showToast(message, type = "success") {
    let toast = document.getElementById("jhToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "jhToast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `jh-toast jh-toast--${type} jh-toast--show`;

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.classList.remove("jh-toast--show");
    }, 3500);
}

// ===== Footer Feedback Form =====
function sendMail(e) {
    e.preventDefault();

    const form   = document.getElementById("footerFeedbackForm");
    const btn    = document.getElementById("footerFormSubmit");
    const status = document.getElementById("footerFormStatus");

    const parms = {
        name    : document.getElementById("fbName").value,
        email   : document.getElementById("fbEmail").value,
        phone   : document.getElementById("fbPhone").value,
        subject : document.getElementById("fbSubject").value,
        message : document.getElementById("fbMessage").value,
    };

    btn.disabled = true;
    status.textContent = "Sending...";
    status.style.color = "";

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, parms)
        .then(function () {
            status.textContent = "Message sent! We'll get back to you soon.";
            status.style.color = "green";
            showToast("Message sent successfully!", "success");
            form.reset();
        })
        .catch(function (error) {
            status.textContent = "Failed to send. Please try again.";
            status.style.color = "red";
            showToast("Failed to send message. Please try again.", "error");
            console.error("EmailJS error:", error);
        })
        .finally(function () {
            btn.disabled = false;
        });
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("footerFeedbackForm");
    if (form) {
        form.addEventListener("submit", sendMail);
    }
});