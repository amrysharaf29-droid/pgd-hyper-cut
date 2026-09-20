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


// BOOKING SECTION
function scrollToBooking() {
    document.getElementById("booking").scrollIntoView({
        behavior: "smooth"
    });
}


// WHATSAPP BOOKING
async function bookWhatsApp() {

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;


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

        // CREATE BOOKING
        await bookingRef.set({

            name: name,
            phone: phone,
            service: service,
            date: date,
            time: time,
            status: "booked",

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp()

        });


        // SALON WHATSAPP NUMBER
        const salonWhatsApp = "94727141343";


        // WHATSAPP MESSAGE
        const message =
            "💈 *PGD HYPER CUT*%0A%0A" +
            "👤 Name: " + encodeURIComponent(name) + "%0A" +
            "📱 Customer WhatsApp: " + encodeURIComponent(phone) + "%0A" +
            "✂️ Service: " + encodeURIComponent(service) + "%0A" +
            "📅 Date: " + encodeURIComponent(date) + "%0A" +
            "⏰ Time: " + encodeURIComponent(time);


        // WHATSAPP URL
        const whatsappURL =
            "https://wa.me/" +
            salonWhatsApp +
            "?text=" +
            message;


        // OPEN WHATSAPP
        window.open(whatsappURL, "_blank");


    } catch (error) {

        console.error(error);


        // TIME ALREADY BOOKED
        if (error.code === "already-exists") {

            alert(
                "Sorry! This time slot is already booked. Please choose another time."
            );

        } else {

            alert(
                "Booking failed. please choose another time."
            );

        }

    }

}