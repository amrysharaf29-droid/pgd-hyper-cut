const firebaseConfig = {
    apiKey: "AIzaSyClDEBdaDgY0-MwbRvmqWt91-gohrSNnBM",
    authDomain: "salonbooking-81fe3.firebaseapp.com",
    projectId: "salonbooking-81fe3",
    storageBucket: "salonbooking-81fe3.firebasestorage.app",
    messagingSenderId: "45699636609",
    appId: "1:45699636609:web:db693345fee79e84549c80",
    measurementId: "G-3V1R0T0M7L"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


// =========================
// ADMIN LOGIN
// =========================

function adminLogin() {

    const email =
        document.getElementById("adminEmail").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    const errorBox =
        document.getElementById("loginError");

    if (!email || !password) {

        errorBox.textContent =
            "Please enter email and password.";

        return;
    }

    firebase.auth()
        .signInWithEmailAndPassword(email, password)

        .then(() => {

            document.getElementById("loginBox").style.display =
                "none";

            document.getElementById("adminPanel").style.display =
                "block";

            loadBookings();

        })

        .catch((error) => {

            console.error(error);

            errorBox.textContent =
                "Invalid email or password.";

        });

}


// =========================
// LOAD BOOKINGS
// =========================

function loadBookings() {

    db.collection("bookings")
        .onSnapshot(

            (snapshot) => {

                const bookingsDiv =
                    document.getElementById("bookings");

                bookingsDiv.innerHTML = "";

                const visibleBookingCount =
    document.getElementById("visibleBookingCount");

if (visibleBookingCount) {
    visibleBookingCount.textContent =
        snapshot.size;
}

                if (snapshot.empty) {

                    bookingsDiv.innerHTML = `
                        <div class="empty-bookings">

                            <div class="empty-icon">
                                📭
                            </div>

                            <h3>
                                No Bookings Yet
                            </h3>

                            <p>
                                Customer appointments will appear here.
                            </p>

                        </div>
                    `;

                    return;
                }

                snapshot.forEach((doc) => {

                    const booking = doc.data();

                    const today = new Date();

                    const todayString =
                        today.getFullYear() + "-" +
                        String(today.getMonth() + 1).padStart(2, "0") + "-" +
                        String(today.getDate()).padStart(2, "0");

                    let bookingDayLabel =
                        "UPCOMING";

                    if (booking.date === todayString) {
                        bookingDayLabel = "TODAY";
                    }

                    const card =
                        document.createElement("div");

                    card.className =
                        "booking-card";

                    let customerPhone =
                        (booking.phone || "")
                            .replace(/\D/g, "");

                    if (customerPhone.startsWith("0")) {
                        customerPhone =
                            "94" +
                            customerPhone.substring(1);
                    }

                    if (!customerPhone.startsWith("94")) {
                        customerPhone =
                            "94" +
                            customerPhone;
                    }

                    card.innerHTML = `

                        <small class="booking-reference">
                            REF: ${doc.id}
                        </small>

                        <h2>
                            ${booking.name || ""}
                        </h2>

                        <p class="customer-phone">

                            📱

                            <a
                                href="https://wa.me/${customerPhone}"
                                target="_blank"
                            >
                                ${booking.phone || ""}
                            </a>

                        </p>

                        <div class="service-badge">
                            ✂️ ${booking.service || ""}
                        </div>

                        <span class="booking-day-label">
                            ${bookingDayLabel}
                        </span>

                        <div class="booking-date-time">

                            <div>

                                <small>
                                    DATE
                                </small>

                                <strong>
                                    ${booking.date || ""}
                                </strong>

                            </div>

                            <div>

                                <small>
                                    TIME
                                </small>

                                <strong>
                                    ${booking.time || ""}
                                </strong>

                            </div>

                        </div>

                        <span class="status status-${booking.status || "pending"}">
                            ${booking.status || "pending"}
                        </span>
                        ${
    booking.createdAt
        ? `
            <small class="booking-created-time">
                BOOKED ON:
                ${booking.createdAt.toDate().toLocaleString()}
            </small>
        `
        : ""
}

                        ${
                            booking.status === "pending"
                                ? `

                                    <div class="booking-actions">

                                        <button
                                            onclick="acceptBooking('${doc.id}')"
                                        >
                                            ACCEPT
                                        </button>

                                        <button
                                            onclick="rejectBooking('${doc.id}')"
                                        >
                                            REJECT
                                        </button>

                                    </div>

                                `
                                : ""
                        }

                    `;

                    bookingsDiv.appendChild(card);

                });

            },

            (error) => {

                console.error(
                    "Could not load bookings:",
                    error
                );

                document.getElementById("bookings").innerHTML = `
                    <p style="color:#ff6666;">
                        Could not load bookings.
                    </p>
                `;

            }

        );

}


// =========================
// ACCEPT BOOKING
// =========================

async function acceptBooking(bookingId) {

    try {

        const doc =
            await db
                .collection("bookings")
                .doc(bookingId)
                .get();

        const booking =
            doc.data();

        await db
            .collection("bookings")
            .doc(bookingId)
            .update({
                status: "accepted"
            });

        const message =
            "✅ *PGD HYPER CUT – BOOKING CONFIRMED*%0A%0A" +
            "👤 Name: " +
            encodeURIComponent(booking.name) +
            "%0A" +
            "✂️ Service: " +
            encodeURIComponent(booking.service) +
            "%0A" +
            "📅 Date: " +
            encodeURIComponent(booking.date) +
            "%0A" +
            "⏰ Time: " +
            encodeURIComponent(booking.time) +
            "%0A%0A" +
            "Your appointment has been confirmed. ❤️";

        let customerPhone =
            booking.phone.replace(/\D/g, "");

        if (customerPhone.startsWith("0")) {

            customerPhone =
                "94" +
                customerPhone.substring(1);

        }

        if (!customerPhone.startsWith("94")) {

            customerPhone =
                "94" +
                customerPhone;

        }

        const whatsappURL =
            "https://wa.me/" +
            customerPhone +
            "?text=" +
            message;

        window.location.href =
            whatsappURL;

    } catch (error) {

        console.error(error);

        alert(
            "Could not accept booking."
        );

    }

}


// =========================
// REJECT BOOKING
// =========================

async function rejectBooking(bookingId) {

    try {

        const doc =
            await db
                .collection("bookings")
                .doc(bookingId)
                .get();

        const booking =
            doc.data();

        await db
            .collection("bookings")
            .doc(bookingId)
            .update({
                status: "rejected"
            });

        let customerPhone =
            booking.phone.replace(/\D/g, "");

        if (customerPhone.startsWith("0")) {

            customerPhone =
                "94" +
                customerPhone.substring(1);

        }

        if (!customerPhone.startsWith("94")) {

            customerPhone =
                "94" +
                customerPhone;

        }

        const message =
            "❌ *PGD HYPER CUT – BOOKING UPDATE*%0A%0A" +
            "👤 Name: " +
            encodeURIComponent(booking.name) +
            "%0A" +
            "✂️ Service: " +
            encodeURIComponent(booking.service) +
            "%0A" +
            "📅 Date: " +
            encodeURIComponent(booking.date) +
            "%0A" +
            "⏰ Time: " +
            encodeURIComponent(booking.time) +
            "%0A%0A" +
            "Sorry, your requested appointment could not be accepted.%0A" +
            "Please contact us to choose another available time.";

        const whatsappURL =
            "https://wa.me/" +
            customerPhone +
            "?text=" +
            message;

        window.location.href =
            whatsappURL;

    } catch (error) {

        console.error(error);

        alert(
            "Could not reject booking."
        );

    }

}


// =========================
// LOGOUT
// =========================

function adminLogout() {
    if (!confirm("Are you sure you want to logout?")) {
    return;
}

    firebase.auth()
        .signOut()

        .then(() => {

            document.getElementById("adminPanel").style.display =
                "none";

            document.getElementById("loginBox").style.display =
                "block";

            document.getElementById("adminEmail").value =
                "";

            document.getElementById("adminPassword").value =
                "";

        })

        .catch((error) => {

            console.error(error);

            alert(
                "Logout failed."
            );

        });

}


// =========================
// INITIAL DISPLAY
// =========================

document.getElementById("adminPanel").style.display =
    "none";

document.getElementById("loginBox").style.display =
    "block";


// =========================
// TODAY'S BOOKINGS
// =========================

async function updateTodayBookingCount() {

    const today =
        new Date();

    const todayDate =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    try {

        const snapshot =
            await db
                .collection("bookings")
                .where("date", "==", todayDate)
                .get();

        document.getElementById(
            "todayBookingCount"
        ).textContent =
            snapshot.size;

    } catch (error) {

        console.error(
            "Could not load today's bookings:",
            error
        );

    }

}


// =========================
// BOOKING STATS
// =========================

async function updateBookingStats() {

    try {

        const snapshot =
            await db
                .collection("bookings")
                .get();

        document.getElementById(
            "totalBookingCount"
        ).textContent =
            snapshot.size;

        const today =
            new Date();

        const todayDate =
            today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");

        const todayBookings =
            snapshot.docs.filter(function(doc) {

                return doc.data().date === todayDate;

            });

        document.getElementById(
            "todaySlotCount"
        ).textContent =
            todayBookings.length;

    } catch (error) {

        console.error(
            "Could not load booking stats:",
            error
        );

    }

}

updateTodayBookingCount();

updateBookingStats();


// =========================
// LIVE STATS
// =========================

db.collection("bookings")
    .onSnapshot(() => {

        updateTodayBookingCount();

        updateBookingStats();

    });


// =========================
// FILTER SYSTEM
// =========================

let activeStatusFilter =
    "all";


function applyBookingFilters() {

    const searchText =
        document
            .getElementById("bookingSearch")
            .value
            .trim()
            .toLowerCase();

    const selectedDate =
        document
            .getElementById("bookingDateFilter")
            .value;

    document
        .querySelectorAll(".booking-card")
        .forEach(function(card) {

            const cardText =
                card.textContent.toLowerCase();

            const statusElement =
                card.querySelector(".status");

            const currentStatus =
                statusElement
                    ? statusElement.textContent
                        .trim()
                        .toLowerCase()
                    : "";

            const matchesSearch =
                cardText.includes(searchText);

            const matchesDate =
                !selectedDate ||
                cardText.includes(selectedDate);

            const matchesStatus =
                activeStatusFilter === "all" ||
                currentStatus === activeStatusFilter;

            if (
                matchesSearch &&
                matchesDate &&
                matchesStatus
            ) {

                card.style.display =
                    "";

            } else {

                card.style.display =
                    "none";

            }

        });
        const visibleCards =
        Array.from(
            document.querySelectorAll(".booking-card")
        ).filter(function(card) {
            return card.style.display !== "none";
        });
const count =
    document.getElementById("visibleBookingCount");

if (count) {
    count.textContent = visibleCards.length;
}
    let noResults =
        document.getElementById("noFilterResults");

    if (!visibleCards.length) {

        if (!noResults) {

            noResults =
                document.createElement("div");

            noResults.id =
                "noFilterResults";

            noResults.className =
                "empty-bookings";

            noResults.innerHTML = `
                <div class="empty-icon">🔎</div>

                <h3>No Matching Bookings</h3>

                <p>
                    Try another search, date or status.
                </p>
            `;

            document
                .getElementById("bookings")
                .appendChild(noResults);
        }

    } else if (noResults) {

        noResults.remove();

    }

}


// =========================
// STATUS FILTER
// =========================

function filterBookings(status) {

    activeStatusFilter = status;

    applyBookingFilters();

    document
        .querySelectorAll(".booking-filters button")
        .forEach(function(button) {

            button.classList.remove("active");

        });

    const activeButton =
        document.querySelector(
            `.booking-filters button[onclick="filterBookings('${status}')"]`
        );

    if (activeButton) {
        activeButton.classList.add("active");
    }

}


// =========================
// SEARCH
// =========================

document
    .getElementById("bookingSearch")
    .addEventListener(
        "input",
        function() {

            applyBookingFilters();

        }
    );


// =========================
// DATE FILTER
// =========================

document
    .getElementById("bookingDateFilter")
    .addEventListener(
        "change",
        function() {

            applyBookingFilters();

        }
    );


// =========================
// CLEAR DATE
// =========================

function clearDateFilter() {

    document
        .getElementById("bookingDateFilter")
        .value =
        "";

    applyBookingFilters();

}


// =========================
// RESET FILTERS
// =========================

function resetAllFilters() {

    document
        .getElementById("bookingSearch")
        .value =
        "";

    document
        .getElementById("bookingDateFilter")
        .value =
        "";

    activeStatusFilter =
        "all";

    document
        .querySelectorAll(".booking-card")
        .forEach(function(card) {

            card.style.display =
                "";

        });

    document
        .querySelectorAll(".booking-filters button")
        .forEach(function(button) {

            button.classList.remove(
                "active"
            );

        });

    const allButton =
        document.querySelector(
            '.booking-filters button[onclick="filterBookings(\'all\')"]'
        );

    if (allButton) {

        allButton.classList.add(
            "active"
        );

    }

}
firebase.auth().onAuthStateChanged(function(user) {

    if (user) {

        document.getElementById("loginBox").style.display =
            "none";

        document.getElementById("adminPanel").style.display =
            "block";

        loadBookings();

    } else {

        document.getElementById("loginBox").style.display =
            "block";

        document.getElementById("adminPanel").style.display =
            "none";

    }

});
// =========================
// NEW BOOKING ALERT
// =========================

let firstBookingLoad = true;

db.collection("bookings")
    .onSnapshot((snapshot) => {

        // First load-ல் notification காட்ட வேண்டாம்
        if (firstBookingLoad) {
            firstBookingLoad = false;
            return;
        }

        snapshot.docChanges().forEach((change) => {

            if (change.type === "added") {

                const booking = change.doc.data();
const sound =
    document.getElementById("bookingNotificationSound");

if (sound) {
    sound.currentTime = 0;
    sound.play().catch(function(error) {
        console.log("Notification sound blocked:", error);
    });
}

                const alertBox =
                    document.getElementById("newBookingAlert");

                const alertText =
                    document.getElementById("newBookingAlertText");

                if (!alertBox || !alertText) {
                    return;
                }

                alertText.textContent =
                    (booking.name || "Customer") +
                    " booked " +
                    (booking.time || "a time slot");

                alertBox.classList.add("show");

                // 5 seconds பிறகு தானாக மறையும்
                setTimeout(() => {
                    alertBox.classList.remove("show");
                }, 5000);
            }

        });

    });


function closeBookingAlert() {

    const alertBox =
        document.getElementById("newBookingAlert");

    if (alertBox) {
        alertBox.classList.remove("show");
    }

}


// =========================
// CALENDAR DATE VIEW
// =========================

function useCalendarDate() {

    const calendarDate =
        document.getElementById("calendarDate").value;

    if (!calendarDate) {
        alert("Please select a date.");
        return;
    }

    const dateFilter =
        document.getElementById("bookingDateFilter");

    if (dateFilter) {
        dateFilter.value = calendarDate;
    }

    applyBookingFilters();

    loadTimeTimeline();

}
// =========================
// TIME SLOT TIMELINE
// =========================

const timelineTimes = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM"
];

async function loadTimeTimeline() {

    const timeline =
        document.getElementById("timeTimeline");

    const date =
        document.getElementById("calendarDate").value;

    if (!date) {
        timeline.innerHTML =
            "Select a date to view slots.";
        return;
    }

    timeline.innerHTML =
        "Loading...";

    try {

        const snapshot =
            await db
                .collection("bookings")
                .where("date", "==", date)
                .get();

        const bookedTimes =
            new Set();

        snapshot.forEach(function(doc) {

            const booking = doc.data();

            if (booking.time) {
                bookedTimes.add(booking.time);
            }

        });

        timeline.innerHTML = "";

        timelineTimes.forEach(function(time) {

            const isBooked =
                bookedTimes.has(time);

            const slot =
                document.createElement("div");

            slot.className =
                "timeline-slot" +
                (isBooked ? " booked" : "");

            slot.innerHTML = `
                <small>${time}</small>
                <strong>
                    ${isBooked ? "BOOKED" : "AVAILABLE"}
                </strong>
            `;

            timeline.appendChild(slot);

        });

    } catch (error) {

        console.error(
            "Could not load timeline:",
            error
        );

        timeline.innerHTML =
            "Could not load schedule.";

    }

}
document
    .getElementById("calendarDate")
    .addEventListener(
        "change",
        function() {

            loadTimeTimeline();

        }
    );
    // =========================
// BOOKING ANALYTICS
// =========================

async function updateAnalytics() {

    try {

        const snapshot =
            await db
                .collection("bookings")
                .get();

        const bookings =
            snapshot.docs.map(function(doc) {
                return doc.data();
            });

        const now = new Date();

        const todayString =
            now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, "0") + "-" +
            String(now.getDate()).padStart(2, "0");

        const startOfWeek =
            new Date(now);

        const day =
            startOfWeek.getDay();

        startOfWeek.setDate(
            now.getDate() - day
        );

        startOfWeek.setHours(
            0, 0, 0, 0
        );

        const startOfMonth =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        const todayCount =
            bookings.filter(function(booking) {

                return booking.date === todayString;

            }).length;

        const weekCount =
            bookings.filter(function(booking) {

                const bookingDate =
                    new Date(
                        booking.date + "T00:00:00"
                    );

                return (
                    bookingDate >= startOfWeek &&
                    bookingDate <= now
                );

            }).length;

        const monthCount =
            bookings.filter(function(booking) {

                const bookingDate =
                    new Date(
                        booking.date + "T00:00:00"
                    );

                return (
                    bookingDate >= startOfMonth &&
                    bookingDate <= now
                );

            }).length;

        document.getElementById(
            "analyticsToday"
        ).textContent = todayCount;

        document.getElementById(
            "analyticsWeek"
        ).textContent = weekCount;

        document.getElementById(
            "analyticsMonth"
        ).textContent = monthCount;

    } catch (error) {

        console.error(
            "Could not load analytics:",
            error
        );

    }

}

updateAnalytics();
// =========================
// LIVE ANALYTICS UPDATE
// =========================

db.collection("bookings")
    .onSnapshot(function() {

        updateAnalytics();

    });
    // =========================
// ADMIN SESSION PERSISTENCE
// =========================

firebase.auth().onAuthStateChanged(function(user) {

    if (user) {

        document.getElementById("loginBox").style.display =
            "none";

        document.getElementById("adminPanel").style.display =
            "block";

        loadBookings();

    } else {

        document.getElementById("loginBox").style.display =
            "block";

        document.getElementById("adminPanel").style.display =
            "none";

    }

});