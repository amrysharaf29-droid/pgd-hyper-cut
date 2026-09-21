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
// BOOKING SECTION
// =========================

function scrollToBooking() {

    document.getElementById("booking").scrollIntoView({
        behavior: "smooth"
    });

}
const dateInput = document.getElementById("date");

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

dateInput.min = `${year}-${month}-${day}`;


// =========================
// LOAD BOOKED TIMES
// =========================

async function loadBookedTimes() {

    const dateInput = document.getElementById("date");
    const timeSelect = document.getElementById("time");

    const selectedDate = dateInput.value;

    // RESET ALL TIME SLOTS
Array.from(timeSelect.options).forEach(function(option) {

    if (!option.value) {
        return;
    }

    option.disabled = false;
    option.textContent = option.value;

});

    if (!selectedDate) {
        return;
    }

    try {

        // Get bookings for selected date
        const snapshot = await db
            .collection("bookings")
            .where("date", "==", selectedDate)
            .get();


        // Store booked times
        const bookedTimes = new Set();

        snapshot.forEach(function(doc) {

            const booking = doc.data();

            if (booking.time) {
                bookedTimes.add(booking.time);
            }

        });


        // Update time options
        Array.from(timeSelect.options).forEach(function(option) {

            if (!option.value) {
                return;
            }

            const isBooked =
                bookedTimes.has(option.value);


            if (isBooked) {

                option.disabled = true;

                option.textContent =
                    option.value + " — UNAVAILABLE";

            } else {

                option.disabled = false;

                // Restore original text
                option.textContent =
                    option.value;

            }

        });


        // Reset selected time
        timeSelect.value = "";


    } catch (error) {

        console.error(
            "Could not load booked times:",
            error
        );

    }

}


// =========================
// DATE CHANGE
// =========================

document
    .getElementById("date")
    .addEventListener("change", loadBookedTimes);


// =========================
// WHATSAPP BOOKING
// =========================

async function bookWhatsApp() {

    const name =
        document.getElementById("name").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const service =
        document.getElementById("service").value;

    const date =
        document.getElementById("date").value;

    const time =
        document.getElementById("time").value;


    // CHECK ALL DETAILS
    if (!name || !phone || !service || !date || !time) {

        alert("Please fill all details.");

        return;
    }


    // CREATE UNIQUE BOOKING ID
    const bookingId =
        date + "_" + time.replace(/[: ]/g, "-");


    const bookingRef =
        db.collection("bookings").doc(bookingId);


    try {

        // CREATE ONLY IF SLOT DOES NOT EXIST
        await bookingRef.set({

            name: name,
            phone: phone,
            service: service,
            date: date,
            time: time,
            status: "pending",

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp()

        });


        // SALON WHATSAPP NUMBER
        const salonWhatsApp = "94756221224";


        // WHATSAPP MESSAGE
        const message =
            "💈 *PGD HYPER CUT*%0A%0A" +
            "👤 Name: " +
            encodeURIComponent(name) +
            "%0A" +

            "📱 Customer WhatsApp: " +
            encodeURIComponent(phone) +
            "%0A" +

            "✂️ Service: " +
            encodeURIComponent(service) +
            "%0A" +

            "📅 Date: " +
            encodeURIComponent(date) +
            "%0A" +

            "⏰ Time: " +
            encodeURIComponent(time);


        // WHATSAPP URL
        const whatsappURL =
            "https://wa.me/" +
            salonWhatsApp +
            "?text=" +
            message;

            // SHOW SUCCESS SCREEN
document.getElementById("successName").textContent = name;
document.getElementById("successService").textContent = service;
document.getElementById("successDate").textContent = date;
document.getElementById("successTime").textContent = time;

document.getElementById("successModal").classList.add("show");


        // OPEN WHATSAPP
        window.open(
            whatsappURL,
            "_blank"
        );


        // Refresh booked times
        await loadBookedTimes();


    } catch (error) {

        console.error(error);


        // SLOT ALREADY EXISTS
        if (error.code === "already-exists") {

            alert(
                "Sorry! This time slot is already booked. Please choose another time."
            );

            // Refresh unavailable times
            await loadBookedTimes();

        } else {

            alert(
                "Booking failed. Please try again."
            );

        }function closeSuccess() {
    document.getElementById("successModal").classList.remove("show");
}

    }

}

